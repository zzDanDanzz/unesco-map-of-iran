import type { Feature, Point } from "geojson"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Protocol } from "pmtiles"
import { useEffect, useState } from "react"
import Map, { Marker } from "react-map-gl/maplibre"

const protocol = new Protocol()
maplibregl.addProtocol("pmtiles", protocol.tile)

const INITIAL_VIEW_STATE = {
  longitude: 54.03,
  latitude: 33.03,
  zoom: 4.5,
}

interface HeritageSiteProperties {
  name_en: string
  short_description_en: string
  category: string
  main_image_url: string
  id_no: string
}

type HeritageSite = Feature<Point, HeritageSiteProperties>

export function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const [sites, setSites] = useState<HeritageSite[]>([])

  useEffect(() => {
    fetch("/data/unesco_top_level.geojson")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.features) {
          setSites(data.features)
        }
      })
      .catch((err) => console.error("Failed to load GeoJSON:", err))
  }, [])

  return (
    <div className="relative h-screen">
      <Map
        {...viewState}
        hash
        onMove={({ viewState }) => setViewState(viewState)}
        mapStyle="/style.json"
        style={{ width: "100%", height: "100%" }}
        maxZoom={19}
      >
        {sites.map((site) => {
          const imageUrl = site.properties.main_image_url.replace(
            "{size}",
            "thumb"
          )

          return (
            <Marker
              key={site.properties.id_no}
              longitude={site.geometry.coordinates[0]}
              latitude={site.geometry.coordinates[1]}
              anchor="bottom"
            >
              <button
                className="group flex flex-col items-center outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log("Clicked site:", site.properties.name_en)
                }}
              >
                <div className="h-14 w-14 overflow-hidden rounded-xl border-[3px] border-background shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:border-primary group-focus-visible:ring-4 group-focus-visible:ring-ring">
                  <img
                    src={imageUrl}
                    alt={site.properties.name_en}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="h-0 w-0 border-t-10 border-r-8 border-l-8 border-t-background border-r-transparent border-l-transparent transition-transform duration-200 group-hover:translate-y-1 group-hover:border-t-primary"></div>
              </button>
            </Marker>
          )
        })}
      </Map>
    </div>
  )
}

export default App
