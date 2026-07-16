import { Marker } from "react-map-gl/maplibre"
import type { ClusterMarkerProps } from "../types"

export function ClusterMarker({
  cluster,
  supercluster,
  onClick,
}: ClusterMarkerProps) {
  const { cluster_id, point_count } = cluster.properties
  const [longitude, latitude] = cluster.geometry.coordinates

  const leaves = supercluster.getLeaves(cluster_id as number, 4)

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
    >
      <button
        className="group flex flex-col items-center outline-none"
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <div className="relative h-14 w-14 overflow-hidden rounded-xl border-[3px] border-background shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:border-primary group-focus-visible:ring-4 group-focus-visible:ring-ring">
          <div
            className={`grid h-full w-full gap-0.5 bg-background ${leaves.length === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"}`}
          >
            {leaves.map((leaf, i) => {
              const imgUrl = leaf.properties.main_image_url.replace(
                "{size}",
                "thumb"
              )
              return (
                <div
                  key={leaf.properties.id_no}
                  className={`relative h-full w-full overflow-hidden ${leaves.length === 3 && i === 0 ? "col-span-2" : ""}`}
                >
                  <img
                    src={imgUrl}
                    alt={leaf.properties.name_en}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )
            })}
          </div>

          <div className="absolute bottom-0 left-0 flex items-center rounded-tr-md border-t border-r border-background/50 bg-background/90 px-1 text-[10px] font-bold backdrop-blur-sm">
            {point_count}
          </div>
        </div>
      </button>
    </Marker>
  )
}

