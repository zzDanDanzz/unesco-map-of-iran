import { Badge } from "@/components/ui/badge"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getAssetUrl, cn } from "@/lib/utils"
import { useExploreActions, useExploreStore } from "@/stores/exploreStore"
import { IconMaximize, IconX } from "@tabler/icons-react"
import { useState, useSyncExternalStore } from "react"
import { useSiteSelection } from "../hooks/useSiteSelection"
import { useMediaQuery } from "../hooks/useMediaQuery"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"

export function SiteDetailsPanel() {
  const selectedSite = useExploreStore((state) => state.selectedSite)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (!selectedSite) {
    return null
  }

  return (
    <>
      {isDesktop ? (
        <SiteDetailsDesktop key={selectedSite.id_no} />
      ) : (
        <SiteDetailsMobile key={selectedSite.id_no} />
      )}
    </>
  )
}

function SiteDetailsMobile() {
  const selectedSite = useExploreStore((state) => state.selectedSite)!
  const { handleSiteDeselect } = useSiteSelection()
  const [snap, setSnap] = useState<number | string | null>(0.4)

  return (
    <Drawer
      open={true}
      onOpenChange={(open) => {
        if (!open) handleSiteDeselect()
      }}
      snapPoints={[0.4, 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      modal={false}
    >
      <DrawerContent className="max-h-[96vh]">
        <div className="sr-only">
          <DrawerTitle>{selectedSite.name_en}</DrawerTitle>
        </div>
        <div className="flex h-full flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
          <SiteDetailsCard isMobile={true} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function SiteDetailsDesktop() {
  return (
    <div className="absolute top-4 right-4 z-10 flex w-80 flex-col rounded-xl border bg-background/80 shadow-xl backdrop-blur-md">
      <SiteDetailsCard isMobile={false} />
    </div>
  )
}

function SiteDetailsCard({ isMobile }: { isMobile: boolean }) {
  const selectedSite = useExploreStore((state) => state.selectedSite)!
  const { setFullScreenImageIndex } = useExploreActions()
  const { handleSiteDeselect } = useSiteSelection()

  const [api, setApi] = useState<CarouselApi>()
  const [isExpanded, setIsExpanded] = useState(false)

  const current = useSyncExternalStore(
    (callback) => {
      if (!api) return () => {}
      api.on("select", callback)
      return () => {
        api.off("select", callback)
      }
    },
    () => (api ? api.selectedScrollSnap() + 1 : 1)
  )

  const carouselImages = Array.from(
    new Set([selectedSite.main_image_url, ...(selectedSite.images_urls || [])])
  )

  const count = carouselImages.length

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (useExploreStore.getState().fullScreenImageIndex !== null) return

    if (e.key === "ArrowLeft") {
      e.preventDefault()
      e.stopPropagation()
      api?.scrollPrev()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      e.stopPropagation()
      api?.scrollNext()
    }
  }

  return (
    <div
      className="flex h-full flex-col gap-3 overflow-hidden p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative shrink-0 outline-none">
        <h2 className="pr-7 text-lg leading-tight font-semibold tracking-tighter">
          {selectedSite.name_en}
        </h2>
        <button
          onClick={handleSiteDeselect}
          className="absolute top-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          <IconX size={16} />
        </button>
      </div>

      <Badge
        className={`${
          selectedSite.category === "Natural"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        } shrink-0 self-start px-2 py-1 text-xs font-medium`}
      >
        {selectedSite.category}
      </Badge>

      <div className="shrink-0 overflow-hidden rounded-xl">
        <Carousel opts={{ loop: true }} setApi={setApi}>
          <CarouselContent>
            {carouselImages.map((url, i) => (
              <CarouselItem key={url}>
                <div
                  className="group relative aspect-video w-full cursor-pointer overflow-hidden"
                  onClick={() => setFullScreenImageIndex(i)}
                >
                  <img
                    src={getAssetUrl(url.replace("{size}", "large"))}
                    alt={`${selectedSite.name_en} - Image ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                      <IconMaximize size={16} />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {carouselImages.length > 1 && (
            <>
              <CarouselPrevious
                className="left-2 hidden h-7 w-7 border-0 sm:flex"
                size="icon-panel"
              />
              <CarouselNext
                className="right-2 hidden h-7 w-7 border-0 sm:flex"
                size="icon-panel"
              />

              <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
                {current} / {count}
              </div>
            </>
          )}
        </Carousel>
      </div>

      <div className="flex min-h-0 flex-col gap-1 overflow-hidden">
        <div
          className={cn(
            "text-sm leading-relaxed text-neutral-700 transition-all",
            !isMobile && !isExpanded ? "line-clamp-3" : "",
            isMobile
              ? "custom-scrollbar h-full overflow-y-auto pb-4"
              : "custom-scrollbar max-h-[40vh] overflow-y-auto pr-2"
          )}
        >
          {selectedSite.short_description_en}
        </div>

        {!isMobile &&
          (selectedSite.short_description_en?.length || 0) > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 shrink-0 cursor-pointer self-start text-xs font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
      </div>
    </div>
  )
}
