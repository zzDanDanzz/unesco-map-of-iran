import { useRef, useState } from "react"
import Map, { type MapRef, AttributionControl } from "react-map-gl/maplibre"
import Supercluster from "supercluster"
import { useExploreStore } from "@/stores/exploreStore"
import { useMapClustering } from "../hooks/useMapClustering"
import { useSiteSelection } from "../hooks/useSiteSelection"
import { useFilteredSites } from "../hooks/useFilteredSites"
import { useHeritageStore } from "@/stores/heritageStore"
import { useMapStyleStore } from "@/stores/mapStyleStore"
import { ClusterMarker } from "./ClusterMarker"
import { SubcomponentMarkers } from "./SubcomponentMarkers"
import { SiteMarker } from "./SiteMarker"
import { type HeritageSiteProperties, type ClusterProps } from "../types"
import { SiteLabels } from "./SiteLabels"
import { useMediaQuery } from "../hooks/useMediaQuery"

import { MapControls } from "./MapControls"
import { getInitialViewState } from "../utils"

export function MapCanvas() {
  const mapRef = useRef<MapRef>(null)
  const [zoom, setZoom] = useState(getInitialViewState().zoom)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const mapStyle = useMapStyleStore((state) => state.mapStyle)
  const selectedSite = useExploreStore((state) => state.selectedSite)

  const subcomponentsData = useHeritageStore((state) => state.subcomponentsData)

  const filteredSites = useFilteredSites()

  const { clusters, supercluster } = useMapClustering(filteredSites, zoom)

  const { handleSiteSelect } = useSiteSelection()

  const handleSiteClick = (site: HeritageSiteProperties) => {
    handleSiteSelect(site, subcomponentsData)
  }

  return (
    <div className="relative h-safe-screen bg-background">
      {mapStyle && (
        <Map
          id="main-map"
          ref={mapRef}
          initialViewState={getInitialViewState()}
          onZoom={(e) => setZoom(e.viewState.zoom)}
          mapStyle={mapStyle}
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
          <MapControls />
          <AttributionControl 
            compact={true} 
            position="bottom-right" 
            style={{ 
              marginRight: isDesktop ? undefined : "4rem", 
              marginBottom: isDesktop ? undefined : "calc(2rem + env(safe-area-inset-bottom))" 
            }} 
          />
        </Map>
      )}
    </div>
  )
}
