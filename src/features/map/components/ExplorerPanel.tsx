import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useExploreStore } from "@/stores/exploreStore"
import {
  IconChevronDown,
  IconChevronRight,
  IconFolderFilled,
  IconMapPinFilled,
} from "@tabler/icons-react"
import { useState } from "react"
import { useHeritageData } from "../hooks/useHeritageData"
import { useSiteSelection } from "../hooks/useSiteSelection"

export function ExplorerPanel() {
  const { sites, subcomponentsData } = useHeritageData()
  const selectedSite = useExploreStore((state) => state.selectedSite)
  const { handleSiteSelect, handleSiteDeselect } = useSiteSelection()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectSite = (site: (typeof sites)[0]) => {
    if (selectedSite?.id_no === site.properties.id_no) {
      handleSiteDeselect()
    } else {
      handleSiteSelect(site.properties, subcomponentsData)
    }
  }

  // Sort by subcomponent count (descending)
  const sortedSites = [...sites].sort((a, b) => {
    const countA = subcomponentsData[a.properties.id_no]?.features.length || 0
    const countB = subcomponentsData[b.properties.id_no]?.features.length || 0
    return countB - countA
  })

  return (
    <div className="absolute top-4 left-4 z-10 hidden w-80 flex-col overflow-hidden rounded-xl border bg-background/80 shadow-xl backdrop-blur-md md:flex">
      <div className="border-b bg-muted/20 p-3">
        <h2 className="px-2 text-sm font-semibold tracking-tight">Explorer</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="py-2">
          <ul className="flex flex-col gap-0.5 px-2">
            {sortedSites.map((site) => {
              const props = site.properties
              const subcomponents =
                subcomponentsData[props.id_no]?.features || []
              const isMulti = subcomponents.length > 1
              const isSelected = selectedSite?.id_no === props.id_no
              const isExpanded = expandedFolders.has(props.id_no)

              return (
                <li key={props.id_no} className="flex w-full flex-col">
                  {/* Parent Node */}
                  <div
                    data-selected={isSelected}
                    onClick={() => selectSite(site)}
                    className="group flex w-full min-w-0 cursor-pointer items-center gap-1 rounded-md px-1 py-1.5 text-sm transition-colors select-none hover:bg-muted/60 data-[selected=true]:bg-blue-500 data-[selected=true]:text-white"
                  >
                    {isMulti ? (
                      <button
                        onClick={(e) => toggleFolder(props.id_no, e)}
                        data-selected={isSelected}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground data-[selected=true]:text-white/80 data-[selected=true]:hover:bg-white/20 data-[selected=true]:hover:text-white"
                      >
                        {isExpanded ? (
                          <IconChevronDown size={14} />
                        ) : (
                          <IconChevronRight size={14} />
                        )}
                      </button>
                    ) : (
                      <div className="w-5 shrink-0" />
                    )}
                    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden pr-2">
                      {isMulti ? (
                        <IconFolderFilled
                          size={16}
                          className="shrink-0 text-blue-500 data-[selected=true]:text-white"
                          data-selected={isSelected}
                        />
                      ) : (
                        <IconMapPinFilled
                          size={16}
                          className="shrink-0 text-muted-foreground data-[selected=true]:text-white/90"
                          data-selected={isSelected}
                        />
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block min-w-0 flex-1 truncate font-medium tracking-tight">
                            {props.name_en}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align="start"
                          className="max-w-64 text-center"
                        >
                          <p>{props.name_en}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Children Nodes */}
                  {isMulti && isExpanded && (
                    <ul className="mt-0.5 flex w-full flex-col gap-0.5 pl-6.5">
                      {subcomponents.map((sub, i) => {
                        const subName =
                          sub.properties?.name || `Component ${i + 1}`
                        return (
                          <li key={i} className="w-full">
                            <div
                              onClick={() => selectSite(site)}
                              className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-xs text-muted-foreground transition-colors select-none hover:bg-muted/60"
                            >
                              <IconMapPinFilled
                                size={14}
                                className="shrink-0 text-muted-foreground/60"
                              />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="block min-w-0 flex-1 truncate">
                                    {subName}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="start"
                                  className="max-w-64 text-center"
                                >
                                  <p>{subName}</p>
                                </TooltipContent>
                              </Tooltip>
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
      </ScrollArea>
    </div>
  )
}
