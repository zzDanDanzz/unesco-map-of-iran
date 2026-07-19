import { useMap } from "react-map-gl/maplibre"
import { IconPlus, IconMinus, IconHome } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getInitialViewState } from "../utils"

export function MapControls() {
  const { current: map } = useMap()

  const handleZoomIn = () => {
    map?.zoomIn({ duration: 300 })
  }

  const handleZoomOut = () => {
    map?.zoomOut({ duration: 300 })
  }

  const handleReset = () => {
    const { longitude, latitude, zoom } = getInitialViewState()
    map?.flyTo({
      center: [longitude, latitude],
      zoom,
      duration: 800,
    })
  }

  return (
    <div className="absolute z-10 flex rounded-xl border bg-background/80 shadow-xl backdrop-blur-md overflow-hidden bottom-8 right-4 mb-[env(safe-area-inset-bottom)] flex-col-reverse divide-y divide-y-reverse divide-border md:right-auto md:left-1/2 md:-translate-x-1/2 md:mb-0 md:flex-row md:divide-y-0 md:divide-x">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleZoomOut} 
        className="rounded-none h-9 w-9" 
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <IconMinus className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleReset} 
        className="rounded-none h-9 w-9" 
        title="Reset View"
        aria-label="Reset View"
      >
        <IconHome className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleZoomIn} 
        className="rounded-none h-9 w-9" 
        title="Zoom In"
        aria-label="Zoom In"
      >
        <IconPlus className="h-4 w-4" />
      </Button>
    </div>
  )
}
