import { MapProvider } from "react-map-gl/maplibre"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MapCanvas, SiteDetailsPanel, FullScreenViewer, ExplorerPanel } from "@/features/map"

export function App() {
  return (
    <>
      <TooltipProvider>
        <MapProvider>
          <MapCanvas />
          <ExplorerPanel />
          <SiteDetailsPanel />
          <FullScreenViewer />
        </MapProvider>
      </TooltipProvider>
      <Toaster position="top-center" />
    </>
  )
}

export default App
