import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { FeatureCollection, Point } from "geojson"
import type { HeritageSite, SubcomponentProperties } from "../types"

export function useHeritageData() {
  const [sites, setSites] = useState<HeritageSite[]>([])
  const [subcomponentsData, setSubcomponentsData] = useState<
    Record<string, FeatureCollection<Point, SubcomponentProperties>>
  >({})
  const [isLoading, setIsLoading] = useState(true)

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
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return { sites, subcomponentsData, isLoading }
}
