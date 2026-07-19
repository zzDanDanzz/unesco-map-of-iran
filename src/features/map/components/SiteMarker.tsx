import { Marker } from "react-map-gl/maplibre"
import { type HeritageSiteProperties } from "../types"
import { getAssetUrl } from "@/lib/utils"

interface SiteMarkerProps {
  site: HeritageSiteProperties
  longitude: number
  latitude: number
  onClick: (site: HeritageSiteProperties) => void
}

export function SiteMarker({
  site,
  longitude,
  latitude,
  onClick,
}: SiteMarkerProps) {
  const imageUrl = getAssetUrl(site.main_image_url.replace("{size}", "thumb"))

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <button
        className="group flex flex-col items-center outline-none"
        onClick={(e) => {
          e.stopPropagation()
          onClick(site)
        }}
      >
        <div className="relative h-14 w-14 overflow-hidden rounded-xl border-[3px] border-background bg-muted shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:border-primary group-focus-visible:ring-4 group-focus-visible:ring-ring">
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-medium tracking-tighter text-muted-foreground/60 uppercase">
            loading
          </div>
          <img
            src={imageUrl}
            alt={site.name_en}
            className="absolute inset-0 z-10 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </button>
    </Marker>
  )
}
