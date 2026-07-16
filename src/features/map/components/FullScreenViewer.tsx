import {
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
  const { selectedSite, fullScreenImageIndex } = useExploreStore(
    useShallow((state) => ({
      selectedSite: state.selectedSite,
      fullScreenImageIndex: state.fullScreenImageIndex,
    }))
  )
  const { setFullScreenImageIndex } = useExploreActions()

  const carouselImages = selectedSite
    ? Array.from(
        new Set([
          selectedSite.main_image_url,
          ...(selectedSite.images_urls || []),
        ])
      )
    : []

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
        >
          <RadixDialog.Title className="sr-only">
            Full Screen Viewer
          </RadixDialog.Title>

          {selectedSite && fullScreenImageIndex !== null && (
            <>
              <div className="absolute top-4 right-4 z-110">
                <RadixDialog.Close asChild>
                  <button className="cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
                    <IconX className="h-6 w-6" />
                  </button>
                </RadixDialog.Close>
              </div>
              <div className="flex h-full w-full items-center justify-center p-4 sm:p-8">
                <Carousel
                  opts={{
                    loop: true,
                    startIndex: fullScreenImageIndex,
                  }}
                  className="w-full max-w-6xl"
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
                      <CarouselPrevious className="left-4 z-50 border-0 bg-black/50 text-white hover:bg-black/80 hover:text-white" />
                      <CarouselNext className="right-4 z-50 border-0 bg-black/50 text-white hover:bg-black/80 hover:text-white" />
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
