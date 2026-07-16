import { Badge } from "@/components/ui/badge"
import { useState, useSyncExternalStore } from "react"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { IconMaximize } from "@tabler/icons-react"
import { useExploreStore, useExploreActions } from "@/stores/exploreStore"

export function SiteDetailsPanel() {
  const selectedSite = useExploreStore((state) => state.selectedSite)
  const { setSelectedSite, setFullScreenImageIndex } = useExploreActions()

  const [api, setApi] = useState<CarouselApi>()

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

  const carouselImages = selectedSite
    ? Array.from(
        new Set([
          selectedSite.main_image_url,
          ...(selectedSite.images_urls || []),
        ])
      )
    : []

  const count = carouselImages.length

  return (
    <Sheet
      modal={false}
      open={!!selectedSite}
      onOpenChange={(isOpen) => {
        if (!isOpen) setSelectedSite(null)
      }}
    >
      <SheetContent
        hasOverlay={false}
        className="w-100 overflow-y-auto sm:w-135"
        onKeyDown={(e) => {
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
        }}
        onInteractOutside={(e) => {
          if (useExploreStore.getState().fullScreenImageIndex !== null) {
            e.preventDefault()
          }
        }}
      >
        {selectedSite && (
          <>
            <SheetHeader>
              <SheetTitle>{selectedSite.name_en}</SheetTitle>
              <SheetDescription className="mt-1 flex items-center gap-2">
                <Badge
                  variant={
                    selectedSite.category === "Natural"
                      ? "secondary"
                      : selectedSite.category === "Mixed"
                        ? "outline"
                        : "default"
                  }
                >
                  {selectedSite.category}
                </Badge>
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-6 pb-6">
              <div className="overflow-hidden rounded-xl">
                <Carousel opts={{ loop: true }} setApi={setApi}>
                  <CarouselContent>
                    {carouselImages.map((url, i) => (
                      <CarouselItem key={i}>
                        <div
                          className="group relative aspect-video w-full cursor-pointer overflow-hidden"
                          onClick={() => setFullScreenImageIndex(i)}
                        >
                          <img
                            src={url.replace("{size}", "large")}
                            alt={`${selectedSite.name_en} - Image ${i + 1}`}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                          <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm">
                              <IconMaximize className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {carouselImages.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2 hidden sm:flex" />
                      <CarouselNext className="right-2 hidden sm:flex" />

                      <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
                        {current} / {count}
                      </div>
                    </>
                  )}
                </Carousel>
              </div>
              <div className="text-sm text-foreground">
                {selectedSite.short_description_en}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
