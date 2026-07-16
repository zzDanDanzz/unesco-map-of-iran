import { Badge } from "@/components/ui/badge"
import {
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
import { useExploreStore } from "@/stores/exploreStore"

export function SiteDetailsPanel() {
  const { selectedSite, setSelectedSite, setFullScreenImageIndex } =
    useExploreStore()

  const carouselImages = selectedSite
    ? Array.from(
        new Set([
          selectedSite.main_image_url,
          ...(selectedSite.images_urls || []),
        ])
      )
    : []

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
                <Carousel opts={{ loop: true }}>
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
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
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
