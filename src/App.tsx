import { MapProvider } from "react-map-gl/maplibre"
import { Toaster } from "@/components/ui/sonner"
import { MapCanvas, SiteDetailsPanel, FullScreenViewer, ExplorerPanel } from "@/features/map"
import { useHeritageData } from "@/features/map/hooks/useHeritageData"

export function App() {
  useHeritageData()
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
