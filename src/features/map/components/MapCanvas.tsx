import { useRef, useState } from "react"
import Map, { type MapRef } from "react-map-gl/maplibre"
import Supercluster from "supercluster"
import { useExploreStore } from "@/stores/exploreStore"
import { useMapClustering } from "../hooks/useMapClustering"
import { useSiteSelection } from "../hooks/useSiteSelection"
import { useHeritageData } from "../hooks/useHeritageData"
import { ClusterMarker } from "./ClusterMarker"
import { SubcomponentMarkers } from "./SubcomponentMarkers"
import { SiteMarker } from "./SiteMarker"
import { type HeritageSiteProperties, type ClusterProps } from "../types"

const getInitialViewState = () => {
  const isMobile = window.innerWidth < 768
  return {
    longitude: 54.03,
    latitude: 33.03,
    zoom: isMobile ? 3.8 : 4.5,
  }
}

export function MapCanvas() {
  const mapRef = useRef<MapRef>(null)
  const [viewState, setViewState] = useState(getInitialViewState)

  const selectedSite = useExploreStore((state) => state.selectedSite)
  const { sites, subcomponentsData, isLoading } = useHeritageData()
  const { clusters, supercluster } = useMapClustering(sites, viewState.zoom)
  const { handleSiteSelect } = useSiteSelection()

  const handleSiteClick = (site: HeritageSiteProperties) => {
    handleSiteSelect(site, subcomponentsData)
  }

  if (isLoading) {
    // Optional: add a subtle loading state overlay instead of returning null
  }

  return (
    <div className="relative h-screen">
      <Map
        id="main-map"
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
