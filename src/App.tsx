import { MapProvider } from "react-map-gl/maplibre"
import { Toaster } from "@/components/ui/sonner"
import { MapCanvas, SiteDetailsPanel, FullScreenViewer } from "@/features/map"

export function App() {
  return (
    <>
      <MapProvider>
        <MapCanvas />
      </MapProvider>

      <SiteDetailsPanel />
      <FullScreenViewer />
      <Toaster position="top-center" />
    </>
  )
}

export default App
