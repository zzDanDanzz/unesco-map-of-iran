import { MapProvider } from "react-map-gl/maplibre"
import { Toaster } from "@/components/ui/sonner"
import { MapCanvas, SiteDetailsPanel, FullScreenViewer, ExplorerPanel } from "@/features/map"

export function App() {
  return (
    <>
        <MapProvider>
          <MapCanvas />
          <ExplorerPanel />
          <SiteDetailsPanel />
          <FullScreenViewer />
        </MapProvider>
      <Toaster position="top-center" />
    </>
  )
}

export default App
