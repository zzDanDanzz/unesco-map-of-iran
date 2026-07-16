import { useEffect, useRef, useState } from "react"
import Map, { type MapRef } from "react-map-gl/maplibre"
import bbox from "@turf/bbox"
import { featureCollection } from "@turf/helpers"
import Supercluster from "supercluster"
import { useExploreStore, useExploreActions } from "@/stores/exploreStore"
import { useMapClustering } from "../hooks/useMapClustering"
import { useHeritageData } from "../hooks/useHeritageData"
import { ClusterMarker } from "./ClusterMarker"
import { SubcomponentMarkers } from "./SubcomponentMarkers"
import { SiteMarker } from "./SiteMarker"
import { type HeritageSiteProperties, type ClusterProps } from "../types"

const getInitialViewState = () => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  return {
    longitude: 54.03,
    latitude: 33.03,
    zoom: isMobile ? 3.8 : 4.5,
  }
}

export function MapCanvas() {
  const mapRef = useRef<MapRef>(null)
  const [viewState, setViewState] = useState(getInitialViewState)
  const previousViewState = useRef<{
    longitude: number
    latitude: number
    zoom: number
  } | null>(null)

  const selectedSite = useExploreStore((state) => state.selectedSite)
  const { setSelectedSite } = useExploreActions()
  const { sites, subcomponentsData, isLoading } = useHeritageData()
  const { clusters, supercluster } = useMapClustering(sites, viewState.zoom)

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
          ] as [[number, number], [number, number]]

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

  if (isLoading) {
    // Optional: add a subtle loading state overlay instead of returning null
  }

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
        {selectedSite ? (
          <SubcomponentMarkers
            features={subcomponentsData[selectedSite.id_no]?.features || []}
            mainImageUrl={selectedSite.main_image_url}
          />
        ) : (
          clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates
            const { cluster: isCluster, id_no } = cluster.properties

            if (isCluster && supercluster) {
              return (
                <ClusterMarker
                  key={`cluster-${cluster.id}`}
                  cluster={cluster as Supercluster.ClusterFeature<ClusterProps>}
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
              )
            }

            return (
              <SiteMarker
                key={`site-${id_no}`}
                site={cluster.properties as HeritageSiteProperties}
                longitude={longitude}
                latitude={latitude}
                onClick={handleSiteClick}
              />
            )
          })
        )}
      </Map>
    </div>
  )
}
