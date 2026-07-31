import { lazy, Suspense } from "react"
import { usePwaUpdate } from "@/hooks/usePwaUpdate"
import { MapProvider } from "react-map-gl/maplibre"
import { Toaster } from "@/components/ui/sonner"
import { MapCanvas, ExplorerPanel } from "@/features/map"
import { useHeritageData } from "@/features/map/hooks/useHeritageData"

const SiteDetailsPanel = lazy(() =>
  import("@/features/map/components/SiteDetailsPanel").then((m) => ({
    default: m.SiteDetailsPanel,
  }))
)
const FullScreenViewer = lazy(() =>
  import("@/features/map/components/FullScreenViewer").then((m) => ({
    default: m.FullScreenViewer,
  }))
)

export function App() {
  useHeritageData()
  usePwaUpdate()

  return (
    <>
      <MapProvider>
        <MapCanvas />
        <ExplorerPanel />
        <Suspense fallback={null}>
          <SiteDetailsPanel />
          <FullScreenViewer />
        </Suspense>
      </MapProvider>
      <Toaster position="top-center" />
    </>
  )
}

export default App
