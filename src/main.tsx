import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"

registerSW({ immediate: true })

import "./index.css"
import "maplibre-gl/dist/maplibre-gl.css"
import maplibregl from "maplibre-gl"
import { Protocol } from "pmtiles"

const protocol = new Protocol()
maplibregl.addProtocol("pmtiles", protocol.tile)

import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <App />
    </ThemeProvider>
  </StrictMode>
)
