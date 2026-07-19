import { useEffect } from "react"
import { useMap } from "react-map-gl/maplibre"
import bbox from "@turf/bbox"
import { featureCollection } from "@turf/helpers"
import { useExploreActions } from "@/stores/exploreStore"
import { type HeritageSiteProperties } from "../types"
import type { FeatureCollection, Point } from "geojson"
import type { SubcomponentProperties, SubcomponentFeature } from "../types"
import type { MapLibreEvent } from "maplibre-gl"
import { useMediaQuery } from "./useMediaQuery"

let previousViewState: {
  longitude: number
  latitude: number
  zoom: number
} | null = null

export const clearSavedViewState = () => {
  previousViewState = null
}

export function useSiteSelection() {
  const { setSelectedSite, setSelectedSubcomponent } = useExploreActions()
  const { "main-map": mapInstance } = useMap()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  useEffect(() => {
    if (!mapInstance) return

    const handleMoveStart = (e: MapLibreEvent) => {
      if (e.originalEvent) {
        clearSavedViewState()
      }
    }

    mapInstance.on("movestart", handleMoveStart)

    return () => {
      mapInstance.off("movestart", handleMoveStart)
    }
  }, [mapInstance])

  const handleSiteSelect = (
    site: HeritageSiteProperties,
    subcomponentsData: Record<string, FeatureCollection<Point, SubcomponentProperties>>,
    saveState: boolean = true
  ) => {
    setSelectedSite(site)
    setSelectedSubcomponent(null)

    if (!mapInstance) return

    if (saveState) {
      if (!previousViewState) {
        const center = mapInstance.getCenter()
        previousViewState = {
          longitude: center.lng,
          latitude: center.lat,
          zoom: mapInstance.getZoom(),
        }
      }
    } else {
      previousViewState = null
    }

    const features = subcomponentsData[site.id_no]?.features
    if (features && features.length > 0) {
      const padding = isDesktop
        ? {
          left: 450,
          right: 450,
        }
        : {
          top: 100,
          bottom: window.innerHeight * 0.4,
          left: 100,
          right: 100,
        }

      const featuresCollection = featureCollection(features)
      const [minLng, minLat, maxLng, maxLat] = bbox(featuresCollection)

      if (features.length === 1) {
        mapInstance.flyTo({
          center: [minLng, minLat],
          zoom: 12,
          duration: 1000,
          padding,
        })
      } else {
        try {
          const bounds = [
            [minLng, minLat],
            [maxLng, maxLat],
          ] as [[number, number], [number, number]]

          mapInstance.fitBounds(bounds, {
            padding,
            duration: 1000,
          })
        } catch (e) {
          console.error("Map bounds calculation failed:", e)
        }
      }
    }
  }

  const handleSiteDeselect = () => {
    setSelectedSite(null)
    setSelectedSubcomponent(null)

    if (mapInstance && previousViewState) {
      mapInstance.flyTo({
        center: [previousViewState.longitude, previousViewState.latitude],
        zoom: previousViewState.zoom,
        duration: 1000,
      })
      previousViewState = null
    }
  }

  const handleSubcomponentSelect = (feature: SubcomponentFeature) => {
    setSelectedSubcomponent(feature)

    if (!mapInstance) return

    const [longitude, latitude] = feature.geometry.coordinates

    mapInstance.flyTo({
      center: [longitude, latitude],
      zoom: Math.max(mapInstance.getZoom(), 12),
      duration: 1000,
    })
  }

  return { handleSiteSelect, handleSiteDeselect, handleSubcomponentSelect }
}
