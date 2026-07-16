import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"
import { IconMaximize, IconPhotoOff, IconX } from "@tabler/icons-react"
import type { Feature, FeatureCollection, Point } from "geojson"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Protocol } from "pmtiles"
import { Dialog as RadixDialog } from "radix-ui"
import { useEffect, useMemo, useRef, useState } from "react"
import Map, { MapProvider, Marker, type MapRef } from "react-map-gl/maplibre"
import { toast } from "sonner"
import Supercluster from "supercluster"
import useSupercluster from "use-supercluster"
import bbox from "@turf/bbox"
import { featureCollection } from "@turf/helpers"

const protocol = new Protocol()
maplibregl.addProtocol("pmtiles", protocol.tile)

const getInitialViewState = () => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  return {
    longitude: 54.03,
    latitude: 33.03,
    zoom: isMobile ? 3.8 : 4.5,
  }
}

interface HeritageSiteProperties {
  name_en: string
  short_description_en: string
  category: string
  main_image_url: string
  images_urls: string[]
  id_no: string
}

type HeritageSite = Feature<Point, HeritageSiteProperties>

type PointProperties = HeritageSiteProperties & { cluster: false }
type ClusterProps = Supercluster.AnyProps

interface ClusterMarkerProps {
  cluster: Supercluster.ClusterFeature<ClusterProps>
  supercluster: Supercluster<PointProperties, ClusterProps>
  onClick: () => void
}

export function ClusterMarker({
  cluster,
  supercluster,
  onClick,
}: ClusterMarkerProps) {
  const { cluster_id, point_count } = cluster.properties

  const leaves = supercluster.getLeaves(cluster_id, 4)

  return (
    <button
      className="group flex flex-col items-center outline-none"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <div className="relative h-14 w-14 overflow-hidden rounded-xl border-[3px] border-background shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:border-primary group-focus-visible:ring-4 group-focus-visible:ring-ring">
        <div
          className={`grid h-full w-full gap-0.5 bg-background ${leaves.length === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"}`}
        >
          {leaves.map((leaf, i) => {
            const imgUrl = leaf.properties.main_image_url.replace(
              "{size}",
              "thumb"
            )
            return (
              <div
                key={leaf.properties.id_no}
                className={`relative h-full w-full overflow-hidden ${leaves.length === 3 && i === 0 ? "col-span-2" : ""}`}
              >
                <img
                  src={imgUrl}
                  alt={leaf.properties.name_en}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            )
          })}
        </div>

        <div className="absolute bottom-0 left-0 flex items-center rounded-tr-md border-t border-r border-background/50 bg-background/90 px-1 text-[10px] font-bold backdrop-blur-sm">
          {point_count}
        </div>
      </div>
    </button>
  )
}

function MapComponent({
  selectedSite,
  setSelectedSite,
}: {
  selectedSite: HeritageSiteProperties | null
  setSelectedSite: (site: HeritageSiteProperties | null) => void
}) {
  const mapRef = useRef<MapRef>(null)
  const [viewState, setViewState] = useState(getInitialViewState)
  const [sites, setSites] = useState<HeritageSite[]>([])
  const [subcomponentsData, setSubcomponentsData] = useState<
    Record<string, FeatureCollection>
  >({})
  const previousViewState = useRef<{
    longitude: number
    latitude: number
    zoom: number
  } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/data/unesco_top_level.geojson").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch map data")
        return res.json()
      }),
      fetch("/data/unesco_subcomponents.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch subcomponents")
        return res.json()
      }),
    ])
      .then(([topLevelData, subData]) => {
        if (topLevelData && topLevelData.features) {
          setSites(topLevelData.features)
        }
        if (subData) {
          setSubcomponentsData(subData)
        }
      })
      .catch(() => {
        toast.error("Failed to load map data. Please try again later.")
      })
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!selectedSite && map && previousViewState.current) {
      map.getMap().flyTo({
        center: [
          previousViewState.current.longitude,
          previousViewState.current.latitude,
        ],
        zoom: previousViewState.current.zoom,
        duration: 1000,
      })
      previousViewState.current = null
    }
  }, [selectedSite])

  const handleSiteClick = (site: HeritageSiteProperties) => {
    setSelectedSite(site)

    const map = mapRef.current
    if (!map) return
    const mapInstance = map.getMap()

    if (!previousViewState.current) {
      const center = mapInstance.getCenter()
      previousViewState.current = {
        longitude: center.lng,
        latitude: center.lat,
        zoom: mapInstance.getZoom(),
      }
    }

    const features = subcomponentsData[site.id_no]?.features
    if (features && features.length > 0) {
      const container = mapInstance.getContainer()
      const cw = container.clientWidth || 800
      const ch = container.clientHeight || 600

      const isMobile = typeof window !== "undefined" && window.innerWidth < 768

      const featuresCollection = featureCollection(features)
      const [minLng, minLat, maxLng, maxLat] = bbox(featuresCollection)

      if (features.length === 1) {
        const safeRight = isMobile ? 0 : Math.max(0, Math.min(540, cw / 2 - 20))
        mapInstance.flyTo({
          center: [minLng, minLat],
          zoom: 12,
          duration: 1000,
          padding: { right: safeRight },
        })
      } else {
        const safeRight = isMobile
          ? 100
          : Math.max(0, Math.min(600, cw / 2 - 20))
        const safeLeft = Math.max(0, Math.min(100, cw / 4))
        const safeTop = Math.max(0, Math.min(100, ch / 4))
        const safeBottom = Math.max(0, Math.min(100, ch / 4))

        try {
          const bounds = [
            [minLng, minLat],
            [maxLng, maxLat],
          ]

          const camera = mapInstance.cameraForBounds(bounds, {
            padding: {
              top: safeTop,
              bottom: safeBottom,
              left: safeLeft,
              right: safeRight,
            },
          })

          if (camera) {
            mapInstance.flyTo({
              ...camera,
              duration: 1000,
            })
          } else {
            mapInstance.flyTo({
              center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
              zoom: 10,
              duration: 1000,
            })
          }
        } catch (e) {
          console.error("Map bounds calculation failed:", e)
        }
      }
    }
  }

  const points = useMemo(
    () =>
      sites.map((site) => ({
        type: "Feature" as const,
        properties: {
          cluster: false as const,
          ...site.properties,
        },
        geometry: {
          type: "Point" as const,
          coordinates: site.geometry.coordinates,
        },
      })),
    [sites]
  )

  // Use global bounds so markers outside the current viewport are still clustered and mounted
  const GLOBAL_BOUNDS: [number, number, number, number] = [-180, -90, 180, 90]

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: GLOBAL_BOUNDS,
    zoom: viewState.zoom,
    options: { radius: 72, maxZoom: 17 },
  })

  return (
    <div className="relative h-screen">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapStyle="/style.json"
        style={{ width: "100%", height: "100%" }}
        maxZoom={19}
      >
        {selectedSite
          ? subcomponentsData[selectedSite.id_no]?.features.map(
              (feature: any, idx: number) => {
                const [longitude, latitude] = feature.geometry.coordinates
                const imgUrl = feature.properties.img
                  ? feature.properties.img.replace("{size}", "thumb")
                  : null

                return (
                  <Marker
                    key={`sub-${idx}`}
                    longitude={longitude}
                    latitude={latitude}
                    anchor="center"
                  >
                    <div className="group flex flex-col items-center outline-none">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border-[3px] border-primary shadow-lg transition-transform duration-200 group-hover:scale-110">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={feature.properties.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                            <IconPhotoOff className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Marker>
                )
              }
            )
          : clusters.map((cluster) => {
              const [longitude, latitude] = cluster.geometry.coordinates
              const {
                cluster: isCluster,
                id_no,
                name_en,
                main_image_url,
              } = cluster.properties

              if (isCluster && supercluster) {
                return (
                  <Marker
                    key={`cluster-${cluster.id}`}
                    longitude={longitude}
                    latitude={latitude}
                    anchor="center"
                  >
                    <ClusterMarker
                      cluster={
                        cluster as Supercluster.ClusterFeature<ClusterProps>
                      }
                      supercluster={supercluster}
                      onClick={() => {
                        const map = mapRef.current
                        const expansionZoom = Math.min(
                          supercluster.getClusterExpansionZoom(
                            cluster.id as number
                          ),
                          19
                        )
                        map?.flyTo({
                          center: [longitude, latitude],
                          zoom: expansionZoom,
                          duration: 500,
                        })
                      }}
                    />
                  </Marker>
                )
              }

              const imageUrl = main_image_url.replace("{size}", "thumb")

              return (
                <Marker
                  key={`site-${id_no}`}
                  longitude={longitude}
                  latitude={latitude}
                  anchor="center"
                >
                  <button
                    className="group flex flex-col items-center outline-none"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSiteClick(
                        cluster.properties as HeritageSiteProperties
                      )
                    }}
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-xl border-[3px] border-background shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:border-primary group-focus-visible:ring-4 group-focus-visible:ring-ring">
                      <img
                        src={imageUrl}
                        alt={name_en}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </button>
                </Marker>
              )
            })}
      </Map>
    </div>
  )
}

export function App() {
  const [selectedSite, setSelectedSite] =
    useState<HeritageSiteProperties | null>(null)
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState<
    number | null
  >(null)

  const carouselImages = selectedSite
    ? Array.from(
        new Set([
          selectedSite.main_image_url,
          ...(selectedSite.images_urls || []),
        ])
      )
    : []

  return (
    <>
      <MapProvider>
        <MapComponent
          selectedSite={selectedSite}
          setSelectedSite={setSelectedSite}
        />
      </MapProvider>
      <Sheet
        modal={false}
        open={!!selectedSite}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedSite(null)
        }}
      >
        <SheetContent
          hasOverlay={false}
          className="w-100 overflow-y-auto sm:w-135"
        >
          {selectedSite && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedSite.name_en}</SheetTitle>
                <SheetDescription className="mt-1 flex items-center gap-2">
                  <Badge
                    variant={
                      selectedSite.category === "Natural"
                        ? "secondary"
                        : selectedSite.category === "Mixed"
                          ? "outline"
                          : "default"
                    }
                  >
                    {selectedSite.category}
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-6 pb-6">
                <div className="overflow-hidden rounded-xl">
                  <Carousel opts={{ loop: true }}>
                    <CarouselContent>
                      {carouselImages.map((url, i) => (
                        <CarouselItem key={i}>
                          <div
                            className="group relative aspect-video w-full cursor-pointer overflow-hidden"
                            onClick={() => setFullScreenImageIndex(i)}
                          >
                            <img
                              src={url.replace("{size}", "large")}
                              alt={`${selectedSite.name_en} - Image ${i + 1}`}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                            <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <div className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm">
                                <IconMaximize className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {carouselImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </>
                    )}
                  </Carousel>
                </div>
                <div className="text-sm text-foreground">
                  {selectedSite.short_description_en}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <RadixDialog.Root
        open={fullScreenImageIndex !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setFullScreenImageIndex(null)
        }}
      >
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <RadixDialog.Content
            className="fixed inset-0 z-100 flex flex-col focus:outline-none"
            aria-describedby={undefined}
            onClick={() => setFullScreenImageIndex(null)}
          >
            <RadixDialog.Title className="sr-only">
              Full Screen Viewer
            </RadixDialog.Title>

            {selectedSite && fullScreenImageIndex !== null && (
              <>
                <div className="absolute top-4 right-4 z-110">
                  <RadixDialog.Close asChild>
                    <button className="cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
                      <IconX className="h-6 w-6" />
                    </button>
                  </RadixDialog.Close>
                </div>
                <div className="flex h-full w-full items-center justify-center p-4 sm:p-8">
                  <Carousel
                    opts={{
                      loop: true,
                      startIndex: fullScreenImageIndex,
                    }}
                    className="w-full max-w-6xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CarouselContent>
                      {carouselImages.map((url, i) => (
                        <CarouselItem key={i}>
                          <div className="relative flex h-[85vh] w-full items-center justify-center">
                            <img
                              src={url.replace("{size}", "large")}
                              alt={`${selectedSite.name_en} - Image ${i + 1}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {carouselImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-4 z-50 border-0 bg-black/50 text-white hover:bg-black/80 hover:text-white" />
                        <CarouselNext className="right-4 z-50 border-0 bg-black/50 text-white hover:bg-black/80 hover:text-white" />
                      </>
                    )}
                  </Carousel>
                </div>
              </>
            )}
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>

      <Toaster position="top-center" />
    </>
  )
}

export default App
