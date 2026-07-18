import { useEffect, useMemo } from "react"
import {
  Source,
  Layer,
  useMap,
  type SymbolLayerSpecification,
} from "react-map-gl/maplibre"
import { useExploreStore } from "@/stores/exploreStore"
import { useHeritageData } from "../hooks/useHeritageData"

import Supercluster from "supercluster"
import type { ClusterProps, HeritageSiteProperties } from "../types"

const bgSvg = `<svg width="48" height="24" viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="48" height="24" rx="12" ry="12" fill="rgba(0,0,0,0.65)"/></svg>`
const bgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(bgSvg)}`

type MapFeature =
  | Supercluster.ClusterFeature<ClusterProps>
  | Supercluster.PointFeature<HeritageSiteProperties>

interface SiteLabelsProps {
  clusters: MapFeature[]
}

export function SiteLabels({ clusters }: SiteLabelsProps) {
  const { current: map } = useMap()
  const selectedSite = useExploreStore((state) => state.selectedSite)
  const { subcomponentsData } = useHeritageData()

  useEffect(() => {
    if (!map) return

    const addBgImage = () => {
      const maplibreMap = map.getMap()
      if (maplibreMap.hasImage("label-bg")) return

      const img = new Image()
      img.onload = () => {
        if (!maplibreMap.hasImage("label-bg")) {
          maplibreMap.addImage("label-bg", img, {
            stretchX: [[12, 36]],
            stretchY: [[11, 13]],
            content: [8, 4, 40, 20],
            pixelRatio: 2,
          })
        }
      }
      img.src = bgDataUrl
    }

    if (map.getMap().loaded()) {
      addBgImage()
    } else {
      map.on("load", addBgImage)
    }

    return () => {
      map.off("load", addBgImage)
    }
  }, [map])

  const labelData = useMemo(() => {
    if (selectedSite && subcomponentsData[selectedSite.id_no]) {
      return subcomponentsData[selectedSite.id_no]
    }

    const unclusteredFeatures = clusters.filter(
      (c) => !("cluster" in c.properties && c.properties.cluster)
    )

    return {
      type: "FeatureCollection" as const,
      features: unclusteredFeatures,
    }
  }, [selectedSite, subcomponentsData, clusters])

  const labelLayer: SymbolLayerSpecification = {
    id: "site-labels",
    type: "symbol",
    source: "site-labels-source",
    minzoom: 5,
    layout: {
      "text-field": selectedSite ? ["get", "name"] : ["get", "name_en"],
      "text-size": 13,
      "text-anchor": "top",
      "text-offset": [0, 2.75],
      "text-allow-overlap": false,
      "icon-image": "label-bg",
      "icon-text-fit": "both",
    },
    paint: {
      "text-color": "#ffffff",
    },
  }

  return (
    <Source id="site-labels-source" type="geojson" data={labelData}>
      <Layer {...labelLayer} />
    </Source>
  )
}
