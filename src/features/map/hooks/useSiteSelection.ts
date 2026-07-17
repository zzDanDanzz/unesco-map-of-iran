import type { MapRef } from "react-map-gl/maplibre"
import type { RefObject } from "react"
import bbox from "@turf/bbox"
import { featureCollection } from "@turf/helpers"
import { useExploreActions } from "@/stores/exploreStore"
import { type HeritageSiteProperties } from "../types"
import type { FeatureCollection, Point } from "geojson"
import type { SubcomponentProperties } from "../types"

let previousViewState: {
  longitude: number
  latitude: number
  zoom: number
} | null = null

export function useSiteSelection(mapRef: RefObject<MapRef | null>) {
  const { setSelectedSite } = useExploreActions()

  const handleSiteSelect = (
    site: HeritageSiteProperties,
    subcomponentsData: Record<string, FeatureCollection<Point, SubcomponentProperties>>
  ) => {
    setSelectedSite(site)

    if (!mapRef.current) return
    const mapInstance = mapRef.current.getMap()

    if (!previousViewState) {
      const center = mapInstance.getCenter()
      previousViewState = {
        longitude: center.lng,
        latitude: center.lat,
        zoom: mapInstance.getZoom(),
      }
    }

    const features = subcomponentsData[site.id_no]?.features
    if (features && features.length > 0) {
      const EXPLORER_PANEL_WIDTH = 340 // ~320px (w-80) + margin
      const DETAILS_PANEL_WIDTH = 540 // sm:w-135 is ~540px
      const VERTICAL_PADDING = 100

      const padding = {
        top: VERTICAL_PADDING,
        bottom: VERTICAL_PADDING,
        left: EXPLORER_PANEL_WIDTH,
        right: DETAILS_PANEL_WIDTH,
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

    if (mapRef.current && previousViewState) {
      mapRef.current.getMap().flyTo({
        center: [previousViewState.longitude, previousViewState.latitude],
        zoom: previousViewState.zoom,
        duration: 1000,
      })
      previousViewState = null
    }
  }

  return { handleSiteSelect, handleSiteDeselect }
}
