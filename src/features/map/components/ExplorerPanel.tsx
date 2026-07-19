import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"

import { useExploreStore, useExploreActions } from "@/stores/exploreStore"
import { useHeritageStore } from "@/stores/heritageStore"
import { useFilteredSites } from "../hooks/useFilteredSites"
import {
  IconChevronDown,
  IconChevronRight,
  IconFolderFilled,
  IconMapPinFilled,
  IconFilterOff,
} from "@tabler/icons-react"
import { useSiteSelection } from "../hooks/useSiteSelection"

const AVAILABLE_ERAS = [
  "Prehistoric",
  "Elamite",
  "Achaemenid",
  "Parthian",
  "Sasanian",
  "Early Islamic",
  "Seljuk/Ilkhanid",
  "Safavid",
  "Qajar",
  "Modern",
]

export function ExplorerPanel() {
  const filteredSites = useFilteredSites()
  const subcomponentsData = useHeritageStore((state) => state.subcomponentsData)
  const isLoading = useHeritageStore((state) => state.isLoading)

  const selectedSite = useExploreStore((state) => state.selectedSite)
  const selectedCategory = useExploreStore((state) => state.selectedCategory)
  const selectedEras = useExploreStore((state) => state.selectedEras)
  const { setSelectedCategory, toggleEra, clearFilters } = useExploreActions()

  const { handleSiteSelect, handleSiteDeselect, handleSubcomponentSelect } =
    useSiteSelection()
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())

  const selectSite = (site: (typeof filteredSites)[0]) => {
    if (selectedSite?.id_no === site.properties.id_no) {
      handleSiteDeselect()
    } else {
      handleSiteSelect(site.properties, subcomponentsData, false)
    }
  }

  useEffect(() => {
    if (selectedSite?.id_no) {
      const element = itemRefs.current.get(selectedSite.id_no)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [selectedSite?.id_no])

  // Sort by subcomponent count (descending)
  const sortedSites = [...filteredSites].sort((a, b) => {
    const countA = subcomponentsData[a.properties.id_no]?.features.length || 0
    const countB = subcomponentsData[b.properties.id_no]?.features.length || 0
    return countB - countA
  })

  return (
    <div className="absolute top-4 left-4 z-10 hidden w-80 flex-col overflow-hidden rounded-xl border bg-background/80 shadow-xl backdrop-blur-md md:flex">
      {/* Header & Clear Button */}
      <div className="flex items-center justify-between border-b bg-muted/20 p-3">
        <h2 className="px-2 text-sm font-semibold tracking-tight">Explorer</h2>
        {(selectedCategory !== "All" || selectedEras.length > 0) && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Category Segmented Control */}
      <div className="p-3 pb-2">
        <div className="relative flex rounded-lg border border-border/30 bg-muted/50 p-1">
          {(["All", "Cultural", "Natural"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-1 rounded-md py-1 text-center text-xs font-medium transition-all duration-200 select-none ${
                selectedCategory === cat
                  ? "bg-background font-semibold text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Eras Horizontal Scrollable Chips */}
      <div className="border-b border-border/40">
        <div className="flex w-full space-x-1.5 overflow-x-auto whitespace-nowrap px-3 pb-2 pt-1 custom-scrollbar-horizontal">
          {AVAILABLE_ERAS.map((era) => {
            const isSelected = selectedEras.includes(era)
            return (
              <Badge
                key={era}
                variant={isSelected ? "default" : "outline"}
                onClick={() => toggleEra(era)}
                className={`cursor-pointer shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                  isSelected
                    ? "scale-[1.02] border-transparent bg-primary text-primary-foreground shadow-xs"
                    : "border-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                {era}
              </Badge>
            )
          })}
        </div>
      </div>

      <div className="h-[calc(100vh-11rem)] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex h-48 flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-medium text-foreground">
              Loading data...
            </p>
          </div>
        ) : sortedSites.length === 0 ? (
          /* Empty State */
          <div className="flex h-48 flex-col items-center justify-center px-4 text-center">
            <IconFilterOff
              size={28}
              className="mb-2 text-muted-foreground/60"
            />
            <p className="text-sm font-medium text-foreground">
              No matching sites found
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="py-2">
            <ul className="flex flex-col gap-1 px-2">
              {sortedSites.map((site) => {
                const props = site.properties
                const subcomponents =
                  subcomponentsData[props.id_no]?.features || []
                const isMulti = subcomponents.length > 1
                const isSelected = selectedSite?.id_no === props.id_no
                const isExpanded = isSelected

                return (
                  <li
                    key={props.id_no}
                    ref={(node) => {
                      if (node) {
                        itemRefs.current.set(props.id_no, node)
                      } else {
                        itemRefs.current.delete(props.id_no)
                      }
                    }}
                    className="flex w-full flex-col"
                  >
                    {/* Parent Node */}
                    <div
                      data-selected={isSelected}
                      onClick={() => selectSite(site)}
                      className="group flex w-full min-w-0 cursor-pointer items-start gap-1 rounded-md px-1.5 py-2 text-sm transition-colors select-none hover:bg-muted/60 data-[selected=true]:bg-blue-500 data-[selected=true]:text-white"
                    >
                      {isMulti ? (
                        <div
                          data-selected={isSelected}
                          className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground group-hover:text-foreground data-[selected=true]:text-white/80 data-[selected=true]:group-hover:text-white"
                        >
                          {isExpanded ? (
                            <IconChevronDown size={14} />
                          ) : (
                            <IconChevronRight size={14} />
                          )}
                        </div>
                      ) : (
                        <div className="w-5 shrink-0" />
                      )}
                      <div className="flex min-w-0 flex-1 items-start gap-2 overflow-hidden pr-2">
                        {isMulti ? (
                          <IconFolderFilled
                            size={16}
                            className="mt-0.5 shrink-0 text-blue-500 data-[selected=true]:text-white"
                            data-selected={isSelected}
                          />
                        ) : (
                          <IconMapPinFilled
                            size={16}
                            className="mt-0.5 shrink-0 text-muted-foreground data-[selected=true]:text-white/90"
                            data-selected={isSelected}
                          />
                        )}
                        <span
                          title={props.name_en}
                          className="line-clamp-2 block min-w-0 flex-1 font-medium tracking-tight"
                        >
                          {props.name_en}
                        </span>

                        {isMulti && (
                          <span
                            className="mt-0.5 ml-auto shrink-0 text-xs font-medium text-muted-foreground/70 data-[selected=true]:text-white/70"
                            data-selected={isSelected}
                          >
                            {subcomponents.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Children Nodes */}
                    {isMulti && isExpanded && (
                      <ul className="mt-1 flex w-full flex-col gap-1 pl-6.5">
                        {subcomponents.map((sub, i) => {
                          const subName =
                            sub.properties?.name || `Component ${i + 1}`
                          return (
                            <li key={i} className="w-full">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (selectedSite?.id_no !== props.id_no) {
                                    handleSiteSelect(
                                      site.properties,
                                      subcomponentsData,
                                      false
                                    )
                                  }
                                  handleSubcomponentSelect(sub)
                                }}
                                className="flex w-full min-w-0 cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground transition-colors select-none hover:bg-muted/60"
                              >
                                <IconMapPinFilled
                                  size={14}
                                  className="mt-0.5 shrink-0 text-muted-foreground/60"
                                />
                                <span
                                  title={subName}
                                  className="line-clamp-2 block min-w-0 flex-1"
                                >
                                  {subName}
                                </span>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
