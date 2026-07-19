import { Popup } from "react-map-gl/maplibre"
import { type SubcomponentFeature } from "../types"
import { IconInfoCircle, IconLoader2 } from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useExploreActions } from "@/stores/exploreStore"
import { getAssetUrl, cn } from "@/lib/utils"
import { useState } from "react"

interface SubcomponentPopupProps {
  activeFeature: SubcomponentFeature
  mainImageUrl: string
  isSingleSubcomponent: boolean
  onClose: () => void
}

export function SubcomponentPopup({
  activeFeature,
  mainImageUrl,
  isSingleSubcomponent,
  onClose,
}: SubcomponentPopupProps) {
  const { setFullScreenImageIndex } = useExploreActions()
  const [longitude, latitude] = activeFeature.geometry.coordinates
  let activeImgUrl = activeFeature.properties?.img
    ? getAssetUrl(activeFeature.properties.img.replace("{size}", "large"))
    : null

  if (!activeImgUrl && isSingleSubcomponent && mainImageUrl) {
    activeImgUrl = getAssetUrl(mainImageUrl.replace("{size}", "large"))
  }

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      offset={{
        'center': [0, 0],
        'top': [0, 36],
        'bottom': [0, -36],
        'left': [36, 0],
        'right': [-36, 0],
        'top-left': [0, 36],
        'top-right': [0, 36],
        'bottom-left': [0, -36],
        'bottom-right': [0, -36],
      }}
      onClose={onClose}
      closeButton={false}
      closeOnClick={true}
      className="custom-marker-popup z-0"
    >
      <div className="flex w-48 flex-col overflow-hidden rounded-xl bg-background border border-border shadow-lg">
        {activeImgUrl && (
          <button 
            type="button"
            onClick={() => setFullScreenImageIndex(0, 'subcomponent')}
            className="group relative h-32 w-full overflow-hidden bg-muted cursor-pointer"
          >
            <PopupImage
              key={activeImgUrl}
              src={activeImgUrl}
              alt={activeFeature.properties?.name || "Image"}
            />
          </button>
        )}
        {activeFeature.properties?.name && (
          <div className="p-3">
            <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
              {activeFeature.properties.name}
            </h4>
            <div className="mt-2 flex items-center gap-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Open in Google Maps
              </a>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="hidden md:block text-muted-foreground hover:text-foreground">
                      <IconInfoCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Approximate location based on UNESCO data.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="md:hidden text-muted-foreground hover:text-foreground">
                    <IconInfoCircle className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 text-xs">
                  <p>Approximate location based on UNESCO data.</p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>
    </Popup>
  )
}

function PopupImage({ src, alt }: { src: string; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
          <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground/70" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105",
          isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md scale-110"
        )}
      />
    </>
  )
}
