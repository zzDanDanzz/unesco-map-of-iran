import { useMap } from "react-map-gl/maplibre"
import { IconPlus, IconMinus, IconHome } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getInitialViewState } from "../utils"
import { clearSavedViewState } from "../hooks/useSiteSelection"

export function MapControls() {
  const { current: map } = useMap()

  const handleZoomIn = () => {
    clearSavedViewState()
    map?.zoomIn({ duration: 300 })
  }

  const handleZoomOut = () => {
    clearSavedViewState()
    map?.zoomOut({ duration: 300 })
  }

  const handleReset = () => {
    clearSavedViewState()
    const { longitude, latitude, zoom } = getInitialViewState()
    map?.flyTo({
      center: [longitude, latitude],
      zoom,
    })
  }

  return (
    <div className="absolute right-4 bottom-8 z-10 mb-[env(safe-area-inset-bottom)] flex flex-col-reverse divide-y divide-y-reverse divide-border overflow-hidden rounded-xl border bg-background/80 shadow-xl backdrop-blur-md md:right-auto md:left-1/2 md:mb-0 md:-translate-x-1/2 md:flex-row md:divide-x md:divide-y-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomOut}
        className="h-9 w-9 rounded-none"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <IconMinus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleReset}
        className="h-9 w-9 rounded-none"
        title="Reset View"
        aria-label="Reset View"
      >
        <IconHome className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomIn}
        className="h-9 w-9 rounded-none"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <IconPlus className="h-4 w-4" />
      </Button>
    </div>
  )
}
