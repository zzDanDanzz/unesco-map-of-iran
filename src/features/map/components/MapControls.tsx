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
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-row rounded-xl border bg-background/80 shadow-xl backdrop-blur-md overflow-hidden">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleZoomOut} 
        className="rounded-none border-r h-9 w-9" 
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <IconMinus className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleReset} 
        className="rounded-none border-r h-9 w-9" 
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
