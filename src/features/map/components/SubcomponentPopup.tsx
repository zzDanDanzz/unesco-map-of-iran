import { Popup } from "react-map-gl/maplibre"
import { type SubcomponentFeature } from "../types"

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
  const [longitude, latitude] = activeFeature.geometry.coordinates
  let activeImgUrl = activeFeature.properties?.img
    ? activeFeature.properties.img.replace("{size}", "large")
    : null

  if (!activeImgUrl && isSingleSubcomponent && mainImageUrl) {
    activeImgUrl = mainImageUrl.replace("{size}", "large")
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
      className="custom-marker-popup z-50"
    >
      <div className="flex w-48 flex-col overflow-hidden rounded-xl bg-background border border-border shadow-lg">
        {activeImgUrl && (
          <div className="h-32 w-full overflow-hidden bg-muted">
            <img
              src={activeImgUrl}
              alt={activeFeature.properties?.name || "Image"}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {activeFeature.properties?.name && (
          <div className="p-3">
            <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
              {activeFeature.properties.name}
            </h4>
          </div>
        )}
      </div>
    </Popup>
  )
}
