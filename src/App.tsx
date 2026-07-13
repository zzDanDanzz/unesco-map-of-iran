import { useState } from "react"
import Map from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import type { StyleSpecification } from "maplibre-gl"

const INITIAL_VIEW_STATE = {
  longitude: 57.03,
  latitude: 33.03,
  zoom: 4.56,
}

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
}

export function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)

  return (
    <div className="relative h-screen">
      <Map
        {...viewState}
        hash
        onMove={({ viewState }) => setViewState(viewState)}
        mapStyle={OSM_STYLE as StyleSpecification}
        style={{ width: "100%", height: "100%" }}
        maxZoom={19}
      />
    </div>
  )
}

export default App
