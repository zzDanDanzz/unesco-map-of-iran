import { MapProvider } from "react-map-gl/maplibre"
import { Toaster } from "@/components/ui/sonner"
import { MapCanvas, SiteDetailsPanel, FullScreenViewer } from "@/features/map"


export function App() {
  // const activeMode = useExploreStore((state) => state.activeMode)

  return (
    <>
      <MapProvider>
        <MapCanvas />
        {/* Placeholder for future sidebar/timeline logic based on activeMode */}
        {/* {activeMode === 'atlas' ? <LayersSidebar /> : <TimelineScrubber />} */}
      </MapProvider>
      
      <SiteDetailsPanel />
      <FullScreenViewer />
      <Toaster position="top-center" />
    </>
  )
}

export default App
