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
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
    >
      <button
        className="group flex flex-col items-center outline-none"
        onClick={(e) => {
          e.stopPropagation()
          onClick(site)
        }}
      >
        <div className="h-14 w-14 overflow-hidden rounded-xl border-[3px] border-background shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:border-primary group-focus-visible:ring-4 group-focus-visible:ring-ring">
          <img
            src={imageUrl}
            alt={site.name_en}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </button>
    </Marker>
  )
}
