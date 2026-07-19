import { MapProvider } from "react-map-gl/maplibre"
import { Toaster } from "@/components/ui/sonner"
import { MapCanvas, SiteDetailsPanel, FullScreenViewer, ExplorerPanel } from "@/features/map"
import { useHeritageData } from "@/features/map/hooks/useHeritageData"
import { useMapStyleData } from "@/features/map/hooks/useMapStyleData"

export function App() {
  useHeritageData()
  useMapStyleData()
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
