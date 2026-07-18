import { useMemo } from "react"
import { useHeritageStore } from "@/stores/heritageStore"
import { useExploreStore } from "@/stores/exploreStore"

export function useFilteredSites() {
  const sites = useHeritageStore((state) => state.sites)
  const selectedCategory = useExploreStore((state) => state.selectedCategory)
  const selectedEras = useExploreStore((state) => state.selectedEras)

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const props = site.properties

      if (selectedCategory !== "All" && props.category !== selectedCategory) {
        return false
      }

      if (selectedEras.length > 0) {
        const siteEras = props.eras || []
        const hasMatchingEra = siteEras.some((era) => selectedEras.includes(era))
        if (!hasMatchingEra) return false
      }

      return true
    })
  }, [sites, selectedCategory, selectedEras])

  return filteredSites
}
