import type { Feature, Point } from "geojson"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Protocol } from "pmtiles"
import { useEffect, useState, useMemo } from "react"
import Map, { Marker, MapProvider, useMap } from "react-map-gl/maplibre"
import useSupercluster from "use-supercluster"
import Supercluster from "supercluster"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

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
  setSelectedSite,
}: {
  setSelectedSite: (site: HeritageSiteProperties | null) => void
}) {
  const { current: map } = useMap()
  const [viewState, setViewState] = useState(getInitialViewState)
  const [sites, setSites] = useState<HeritageSite[]>([])

  useEffect(() => {
    fetch("/data/unesco_top_level.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch map data")
        return res.json()
      })
      .then((data) => {
        if (data && data.features) {
          setSites(data.features)
        }
      })
      .catch(() => {
        toast.error("Failed to load map data. Please try again later.")
      })
  }, [])

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
        {...viewState}
        hash
        onMove={(e) => setViewState(e.viewState)}
        mapStyle="/style.json"
        style={{ width: "100%", height: "100%" }}
        maxZoom={19}
      >
        {clusters.map((cluster) => {
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
                  cluster={cluster as Supercluster.ClusterFeature<ClusterProps>}
                  supercluster={supercluster}
                  onClick={() => {
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
                  setSelectedSite(cluster.properties as HeritageSiteProperties)
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

  return (
    <>
      <MapProvider>
        <MapComponent setSelectedSite={setSelectedSite} />
      </MapProvider>
      <Sheet
        open={!!selectedSite}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedSite(null)
        }}
      >
        <SheetContent className="w-100 overflow-y-auto sm:w-135">
          {selectedSite && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedSite.name_en}</SheetTitle>
                <SheetDescription className="mt-1 flex items-center gap-2">
                  <Badge variant={selectedSite.category === "Natural" ? "secondary" : selectedSite.category === "Mixed" ? "outline" : "default"}>
                    {selectedSite.category}
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-6 pb-6">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={selectedSite.main_image_url.replace("{size}", "large")}
                    alt={selectedSite.name_en}
                    className="h-auto w-full object-cover"
                  />
                </div>
                <div className="text-sm text-foreground">
                  {selectedSite.short_description_en}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Toaster position="top-center" />
    </>
  )
}

export default App
