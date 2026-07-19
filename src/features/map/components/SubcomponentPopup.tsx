import { Popup } from "react-map-gl/maplibre"
import { type SubcomponentFeature } from "../types"
import { IconInfoCircle } from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useExploreActions } from "@/stores/exploreStore"
import { getAssetUrl } from "@/lib/utils"
import { useMediaQuery } from "../hooks/useMediaQuery"

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
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { setFullScreenImageIndex } = useExploreActions()
  const [longitude, latitude] = activeFeature.geometry.coordinates
  let activeImgUrl = activeFeature.properties?.img
    ? getAssetUrl(activeFeature.properties.img.replace("{size}", "large"))
    : null

  if (!activeImgUrl && isSingleSubcomponent && mainImageUrl) {
    activeImgUrl = getAssetUrl(mainImageUrl.replace("{size}", "large"))
  }

  if (!isDesktop) return null;

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
            className="h-32 w-full overflow-hidden bg-muted cursor-pointer"
          >
            <img
              key={activeImgUrl}
              src={activeImgUrl}
              alt={activeFeature.properties?.name || "Image"}
              className="h-full w-full object-cover transition-transform hover:scale-105"
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
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <IconInfoCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Approximate location based on UNESCO data.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
    </Popup>
  )
}
