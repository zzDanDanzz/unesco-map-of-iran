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
import { getAssetUrl } from "@/lib/utils"

interface FullScreenViewerUIProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  startIndex: number
  title: string | null
  creditUrl: string | null
  creditText: string | null
}

export function FullScreenViewerUI({
  isOpen,
  onClose,
  images,
  startIndex,
  title,
  creditUrl,
  creditText,
}: FullScreenViewerUIProps) {
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

  const count = images.length

  return (
    <RadixDialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <RadixDialog.Content
          className="fixed inset-0 z-100 flex flex-col focus:outline-none"
          aria-describedby={undefined}
          onClick={onClose}
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

          {isOpen && count > 0 && (
            <>
              <div className="absolute top-4 left-4 z-110 flex max-w-[70vw] flex-col items-start gap-2">
                {title && (
                  <div className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                    {title}
                  </div>
                )}

                {creditUrl ? (
                  <div className="rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/80 shadow-sm backdrop-blur-sm">
                    Credit:{" "}
                    <a
                      href={creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-white"
                    >
                      Image Source
                    </a>
                  </div>
                ) : creditText ? (
                  <div className="rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/80 shadow-sm backdrop-blur-sm">
                    Credit: {creditText}
                  </div>
                ) : null}
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
                    startIndex,
                  }}
                  className="relative w-full max-w-6xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CarouselContent>
                    {images.map((url, i) => (
                      <CarouselItem key={i}>
                        <div className="relative flex h-[85vh] w-full items-center justify-center">
                          <img
                            src={getAssetUrl(url.replace("{size}", "large"))}
                            alt={`${title || "Image"} - ${i + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {count > 1 && (
                    <>
                      <CarouselPrevious className="left-4 z-50 hidden border-0 bg-black/50 text-white hover:bg-black/80 hover:text-white sm:flex" />
                      <CarouselNext className="right-4 z-50 hidden border-0 bg-black/50 text-white hover:bg-black/80 hover:text-white sm:flex" />

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

export function FullScreenViewer() {
  const {
    selectedSite,
    fullScreenImageIndex,
    selectedSubcomponent,
    fullScreenViewerContext,
  } = useExploreStore(
    useShallow((state) => ({
      selectedSite: state.selectedSite,
      fullScreenImageIndex: state.fullScreenImageIndex,
      selectedSubcomponent: state.selectedSubcomponent,
      fullScreenViewerContext: state.fullScreenViewerContext,
    }))
  )
  const { setFullScreenImageIndex } = useExploreActions()

  if (!selectedSite || fullScreenImageIndex === null) return null

  const isSubcomponent = fullScreenViewerContext === "subcomponent"

  const images =
    isSubcomponent && selectedSubcomponent?.properties?.img
      ? [selectedSubcomponent.properties.img]
      : Array.from(
          new Set([
            selectedSite.main_image_url,
            ...(selectedSite.images_urls || []),
          ])
        ).filter(Boolean)

  const title =
    isSubcomponent && selectedSubcomponent?.properties?.name
      ? `${selectedSite.name_en} > ${selectedSubcomponent.properties.name}`
      : selectedSite.name_en

  const creditUrl = isSubcomponent
    ? selectedSubcomponent?.properties?.img_original || null
    : null

  const creditText = !isSubcomponent
    ? selectedSite.main_image_author || null
    : null

  return (
    <FullScreenViewerUI
      isOpen={fullScreenImageIndex !== null}
      onClose={() => setFullScreenImageIndex(null)}
      images={images as string[]}
      startIndex={fullScreenImageIndex}
      title={title}
      creditUrl={creditUrl}
      creditText={creditText}
    />
  )
}
