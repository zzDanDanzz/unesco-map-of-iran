import { useEffect } from "react"
import { toast } from "sonner"
import { useHeritageActions } from "@/stores/heritageStore"
import { getAssetUrl } from "@/lib/utils"

export function useHeritageData() {
  const { setHeritageData, setIsLoading } = useHeritageActions()

  useEffect(() => {
    Promise.all([
      fetch(getAssetUrl("/data/unesco_top_level.geojson")).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch map data")
        return res.json()
      }),
      fetch(getAssetUrl("/data/unesco_subcomponents.json")).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch subcomponents")
        return res.json()
      }),
    ])
      .then(([topLevelData, subData]) => {
        const sites = topLevelData?.features || []
        const subcomponents = subData || {}
        setHeritageData(sites, subcomponents)
        setIsLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load map data. Please try again later.")
        setIsLoading(false)
      })
  }, [setHeritageData, setIsLoading])
}
