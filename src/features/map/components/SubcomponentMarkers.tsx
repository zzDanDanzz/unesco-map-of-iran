import { useState } from "react"
import { Marker } from "react-map-gl/maplibre"
import { SubcomponentPopup } from "./SubcomponentPopup"
import { IconPhotoOff } from "@tabler/icons-react"
import { type SubcomponentFeature } from "../types"

interface SubcomponentMarkersProps {
  features: SubcomponentFeature[]
  mainImageUrl: string
}

export function SubcomponentMarkers({ features, mainImageUrl }: SubcomponentMarkersProps) {
  const isSingleSubcomponent = features.length === 1
  const [activeFeature, setActiveFeature] = useState<SubcomponentFeature | null>(null)

  return (
    <>
      {features.map((feature, idx) => {
        const [longitude, latitude] = feature.geometry.coordinates
        let imgUrl = feature.properties?.img
          ? feature.properties.img.replace("{size}", "thumb")
          : null

        if (!imgUrl && isSingleSubcomponent && mainImageUrl) {
          imgUrl = mainImageUrl.replace("{size}", "thumb")
        }

        return (
          <Marker
            key={`sub-${idx}`}
            longitude={longitude}
            latitude={latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setActiveFeature(feature)
            }}
          >
            <button className="group flex flex-col items-center outline-none cursor-pointer">
              <div className="h-14 w-14 overflow-hidden rounded-xl border-[3px] border-primary shadow-lg transition-transform duration-200 group-hover:scale-110">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={feature.properties?.name || "Image"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    <IconPhotoOff className="h-6 w-6" />
                  </div>
                )}
              </div>
            </button>
          </Marker>
        )
      })}

      {activeFeature && (
        <SubcomponentPopup
          activeFeature={activeFeature}
          mainImageUrl={mainImageUrl}
          isSingleSubcomponent={isSingleSubcomponent}
          onClose={() => setActiveFeature(null)}
        />
      )}
    </>
  )
}
