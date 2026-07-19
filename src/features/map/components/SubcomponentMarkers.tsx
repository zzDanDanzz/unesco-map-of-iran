import { Marker } from "react-map-gl/maplibre"
import { SubcomponentPopup } from "./SubcomponentPopup"
import { IconPhotoOff } from "@tabler/icons-react"
import { type SubcomponentFeature } from "../types"
import { useExploreStore, useExploreActions } from "@/stores/exploreStore"
import { useSiteSelection } from "../hooks/useSiteSelection"
import { getAssetUrl } from "@/lib/utils"

interface SubcomponentMarkersProps {
  features: SubcomponentFeature[]
  mainImageUrl: string
}

export function SubcomponentMarkers({
  features,
  mainImageUrl,
}: SubcomponentMarkersProps) {
  const isSingleSubcomponent = features.length === 1
  const activeFeature = useExploreStore((state) => state.selectedSubcomponent)
  const { setSelectedSubcomponent } = useExploreActions()

  const { handleSubcomponentSelect } = useSiteSelection()

  return (
    <>
      {features.map((feature, idx) => {
        const [longitude, latitude] = feature.geometry.coordinates
        let imgUrl = feature.properties?.img
          ? getAssetUrl(feature.properties.img.replace("{size}", "thumb"))
          : null

        if (!imgUrl && isSingleSubcomponent && mainImageUrl) {
          imgUrl = getAssetUrl(mainImageUrl.replace("{size}", "thumb"))
        }

        return (
          <Marker
            key={`sub-${idx}`}
            longitude={longitude}
            latitude={latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              handleSubcomponentSelect(feature)
            }}
          >
            <button className="group flex cursor-pointer flex-col items-center outline-none">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl border-[3px] border-primary bg-muted shadow-lg transition-transform duration-200 group-hover:scale-110">
                {imgUrl ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-medium tracking-tighter text-muted-foreground/60 uppercase">
                      loading
                    </div>
                    <img
                      src={imgUrl}
                      alt={feature.properties?.name || "Image"}
                      className="absolute inset-0 z-10 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </>
                ) : (
                  <div className="relative z-10 flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
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
          onClose={() => setSelectedSubcomponent(null)}
        />
      )}
    </>
  )
}
