import { useEffect, useRef, useState } from "react"
import { IconBrandGithub, IconInfoCircle } from "@tabler/icons-react"
import Map, { type MapRef } from "react-map-gl/maplibre"
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
import { useMediaQuery } from "../hooks/useMediaQuery"

import { MapControls } from "./MapControls"
import { getInitialViewState } from "../utils"
import { getAssetUrl } from "@/lib/utils"

export function MapCanvas() {
  const mapRef = useRef<MapRef>(null)
  const [zoom, setZoom] = useState(getInitialViewState().zoom)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const selectedSite = useExploreStore((state) => state.selectedSite)

  const subcomponentsData = useHeritageStore((state) => state.subcomponentsData)

  const filteredSites = useFilteredSites()

  const { clusters, supercluster } = useMapClustering(filteredSites, zoom)

  const { handleSiteSelect } = useSiteSelection()

  const handleSiteClick = (site: HeritageSiteProperties) => {
    handleSiteSelect(site, subcomponentsData)
  }

  return (
    <div className="h-safe-screen relative bg-background">
      <Map
        id="main-map"
        ref={mapRef}
        initialViewState={getInitialViewState()}
        onZoom={(e) => setZoom(e.viewState.zoom)}
        mapStyle={getAssetUrl("/style.json")}
        transformRequest={(url, resourceType) => {
          if (resourceType === "Source" && url.startsWith("pmtiles:///")) {
            const filename = url.replace("pmtiles:///", "/")
            return { url: `pmtiles://${getAssetUrl(filename)}` }
          }
          if (url.startsWith("asset://")) {
            const path = url.replace("asset://", "")
            return { url: window.location.origin + getAssetUrl(path) }
          }
          return { url }
        }}
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
      </Map>

      <CustomAttribution isDesktop={isDesktop} />
    </div>
  )
}

function CustomAttribution({ isDesktop }: { isDesktop: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!isExpanded || isDesktop) return
    const handleDocumentClick = () => setIsExpanded(false)
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleDocumentClick)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("click", handleDocumentClick)
    }
  }, [isExpanded, isDesktop])

  if (isDesktop) {
    return (
      <div className="pointer-events-auto absolute right-4 bottom-4 z-10 flex flex-col items-end gap-1.5 rounded-xl border bg-background/80 px-3 py-2 text-xs text-muted-foreground shadow-xl backdrop-blur-md transition-all">
        <a
          href="https://github.com/zzdandanzz/unesco-map-of-iran"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-medium transition-colors hover:text-foreground"
        >
          <IconBrandGithub size={14} />
          <span>GitHub Repo</span>
        </a>

        <div className="flex items-center gap-1">
          <span>&copy;</span>
          <a
            href="https://openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            OpenStreetMap
          </a>
        </div>
      </div>
    )
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="pointer-events-auto absolute right-[4rem] bottom-[calc(2rem+env(safe-area-inset-bottom))] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background/60 text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background/80"
        aria-label="Show attribution"
      >
        <IconInfoCircle size={16} stroke={1.5} />
      </button>
    )
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="pointer-events-auto absolute right-[4rem] bottom-[calc(2rem+env(safe-area-inset-bottom))] z-10 flex flex-row items-center gap-3 rounded-lg border border-border/50 bg-background/60 px-2 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur-md transition-all sm:text-xs"
    >
      <a
        href="https://github.com/zzdandanzz/unesco-map-of-iran"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 font-medium transition-colors hover:text-foreground"
      >
        <IconBrandGithub size={12} />
        <span>GitHub Repo</span>
      </a>

      <div className="flex items-center gap-1">
        <span>&copy;</span>
        <a
          href="https://openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          OpenStreetMap
        </a>
      </div>
    </div>
  )
}
