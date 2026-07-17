import { useExploreStore } from "@/stores/exploreStore"
import { useHeritageData } from "../hooks/useHeritageData"
import { useSiteSelection } from "../hooks/useSiteSelection"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ExplorerPanel() {
  const { sites, subcomponentsData } = useHeritageData()
  const selectedSite = useExploreStore((state) => state.selectedSite)
  const { handleSiteSelect, handleSiteDeselect } = useSiteSelection()

  // Sort by subcomponent count (descending)
  const sortedSites = [...sites].sort((a, b) => {
    const countA = subcomponentsData[a.properties.id_no]?.features.length || 0
    const countB = subcomponentsData[b.properties.id_no]?.features.length || 0
    return countB - countA
  })

  return (
    <div className="absolute top-4 left-4 z-10 flex hidden max-h-[calc(100vh-2rem)] w-80 flex-col overflow-hidden rounded-xl border bg-background/95 shadow-xl backdrop-blur-md md:flex">
      <div className="border-b bg-muted/20 p-4">
        <h2 className="text-sm font-semibold tracking-tight">Explorer</h2>
      </div>
      <ScrollArea className="flex-1">
        <Accordion
          type="single"
          collapsible
          value={selectedSite?.id_no || ""}
          onValueChange={(val) => {
            const site = sites.find((s) => s.properties.id_no === val)
            if (site) {
              handleSiteSelect(site.properties, subcomponentsData)
            } else {
              handleSiteDeselect()
            }
          }}
          className="w-full"
        >
          {sortedSites.map((site) => {
            const props = site.properties
            const subcomponents = subcomponentsData[props.id_no]?.features || []
            const isMulti = subcomponents.length > 1

            if (isMulti) {
              return (
                <AccordionItem
                  value={props.id_no}
                  key={props.id_no}
                  className="border-b-0 px-3"
                >
                  <AccordionTrigger className="py-2.5 text-sm hover:no-underline data-[state=open]:text-primary">
                    <div className="flex w-full items-center justify-between pr-2 text-left">
                      <span className="mr-2 line-clamp-1 font-medium">
                        {props.name_en}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {subcomponents.length} items
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-3">
                    <ul className="mt-1 ml-2 flex flex-col gap-1 border-l pl-6">
                      {subcomponents.map((sub, i) => (
                        <li
                          key={i}
                          className="line-clamp-1 py-1 text-xs text-muted-foreground"
                        >
                          {sub.properties?.name || `Component ${i + 1}`}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )
            } else {
              const isSelected = selectedSite?.id_no === props.id_no
              return (
                <div key={props.id_no} className="px-3 py-1">
                  <div
                    onClick={() => {
                      if (isSelected) {
                        handleSiteDeselect()
                      } else {
                        handleSiteSelect(props, subcomponentsData)
                      }
                    }}
                    className={`cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"}`}
                  >
                    <span className="line-clamp-1">{props.name_en}</span>
                  </div>
                </div>
              )
            }
          })}
        </Accordion>
      </ScrollArea>
    </div>
  )
}
