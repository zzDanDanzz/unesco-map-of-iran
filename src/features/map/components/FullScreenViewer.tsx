import { useState, useSyncExternalStore } from "react"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { IconX } from "@tabler/icons-react"
import { Dialog as RadixDialog } from "radix-ui"
import { useShallow } from "zustand/react/shallow"
import { useExploreStore, useExploreActions } from "@/stores/exploreStore"

export function FullScreenViewer() {
  const { selectedSite, fullScreenImageIndex, selectedSubcomponent, fullScreenViewerContext } = useExploreStore(
    useShallow((state) => ({
      selectedSite: state.selectedSite,
      fullScreenImageIndex: state.fullScreenImageIndex,
      selectedSubcomponent: state.selectedSubcomponent,
      fullScreenViewerContext: state.fullScreenViewerContext,
    }))
  )
  const { setFullScreenImageIndex } = useExploreActions()

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

  const carouselImages = (() => {
    if (fullScreenViewerContext === 'subcomponent' && selectedSubcomponent?.properties?.img) {
      return [selectedSubcomponent.properties.img];
    }
    return selectedSite
      ? Array.from(
          new Set([
            selectedSite.main_image_url,
            ...(selectedSite.images_urls || []),
          ])
        ).filter(Boolean)
      : [];
  })();

  const count = carouselImages.length

  return (
    <RadixDialog.Root
      open={fullScreenImageIndex !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setFullScreenImageIndex(null)
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <RadixDialog.Content
          className="fixed inset-0 z-100 flex flex-col focus:outline-none"
          aria-describedby={undefined}
          onClick={() => setFullScreenImageIndex(null)}
          onKeyDown={(e) => {
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
        >
          <RadixDialog.Title className="sr-only">
            Full Screen Viewer
          </RadixDialog.Title>

          {selectedSite && fullScreenImageIndex !== null && (
            <>
              <div className="absolute top-4 left-4 z-110 flex flex-col items-start gap-2 max-w-[70vw]">
                <div className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm shadow-sm">
                  {fullScreenViewerContext === 'subcomponent' && selectedSubcomponent?.properties?.name
                    ? `${selectedSite.name_en} > ${selectedSubcomponent.properties.name}`
                    : selectedSite.name_en}
                </div>
                {(() => {
                  const sourceUrl = fullScreenViewerContext === 'subcomponent' ? selectedSubcomponent?.properties?.img_original : null;
                  const authorText = fullScreenViewerContext === 'site' ? selectedSite.main_image_author : null;

                  if (sourceUrl) {
                    return (
                      <div className="rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/80 backdrop-blur-sm shadow-sm">
                        Credit:{" "}
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white underline underline-offset-2"
                        >
                          Image Source
                        </a>
                      </div>
                    );
                  }
                  if (authorText) {
                    return (
                      <div className="rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/80 backdrop-blur-sm shadow-sm">
                        Credit: {authorText}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="absolute top-4 right-4 z-110">
                <RadixDialog.Close asChild>
                  <button className="cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
                    <IconX className="h-6 w-6" />
                  </button>
                </RadixDialog.Close>
              </div>
              <div className="flex h-full w-full items-center justify-center p-4 sm:p-8">
                <Carousel
                  setApi={setApi}
                  opts={{
                    loop: true,
                    startIndex: fullScreenImageIndex,
                  }}
                  className="w-full max-w-6xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CarouselContent>
                    {carouselImages.map((url, i) => (
                      <CarouselItem key={i}>
                        <div className="relative flex h-[85vh] w-full items-center justify-center">
                          <img
                            src={url.replace("{size}", "large")}
                            alt={`${selectedSite.name_en} - Image ${i + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {carouselImages.length > 1 && (
                    <>
                      <CarouselPrevious className="hidden sm:flex left-4 z-50 border-0 bg-black/50 text-white hover:bg-black/80 hover:text-white" />
                      <CarouselNext className="hidden sm:flex right-4 z-50 border-0 bg-black/50 text-white hover:bg-black/80 hover:text-white" />
                      
                      <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                        {current} / {count}
                      </div>
                    </>
                  )}
                </Carousel>
              </div>
            </>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
