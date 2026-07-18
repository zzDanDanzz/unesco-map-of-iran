import { useRef, useState } from "react"
import Map, { type MapRef, AttributionControl } from "react-map-gl/maplibre"
import Supercluster from "supercluster"
import { useExploreStore } from "@/stores/exploreStore"
import { useMapClustering } from "../hooks/useMapClustering"
import { useSiteSelection } from "../hooks/useSiteSelection"
import { useFilteredSites } from "../hooks/useFilteredSites"
import { useHeritageStore } from "@/stores/heritageStore"
import { ClusterMarker } from "./ClusterMarker"
import { SubcomponentMarkers } from "./SubcomponentMarkers"
import { SiteMarker } from "./SiteMarker"
import { type HeritageSiteProperties, type ClusterProps } from "../types"
import { SiteLabels } from "./SiteLabels"

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
  const [zoom, setZoom] = useState(getInitialViewState().zoom)

  const selectedSite = useExploreStore((state) => state.selectedSite)

  const subcomponentsData = useHeritageStore((state) => state.subcomponentsData)

  const filteredSites = useFilteredSites()

  const { clusters, supercluster } = useMapClustering(filteredSites, zoom)

  const { handleSiteSelect } = useSiteSelection()

  const handleSiteClick = (site: HeritageSiteProperties) => {
    handleSiteSelect(site, subcomponentsData)
  }

  return (
    <div className="relative h-screen">
      <Map
        id="main-map"
        ref={mapRef}
        initialViewState={getInitialViewState()}
        onZoom={(e) => setZoom(e.viewState.zoom)}
        mapStyle="/style.json"
        style={{ width: "100%", height: "100%" }}
        maxZoom={19}
        attributionControl={false}
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

        <SiteLabels clusters={clusters} />
        <AttributionControl compact={true} position="bottom-right" />
      </Map>
    </div>
  )
}
