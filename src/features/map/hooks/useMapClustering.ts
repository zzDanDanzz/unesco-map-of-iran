import { useMemo } from "react"
import useSupercluster from "use-supercluster"
import type { HeritageSite } from "../types"

const GLOBAL_BOUNDS: [number, number, number, number] = [-180, -90, 180, 90]

export function useMapClustering(sites: HeritageSite[], zoom: number) {
  const points = useMemo(
    () =>
      sites.map((site) => ({
        type: "Feature" as const,
        properties: {
          cluster: false as const,
          ...site.properties,
        },
        geometry: {
          type: "Point" as const,
          coordinates: site.geometry.coordinates,
        },
      })),
    [sites]
  )

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: GLOBAL_BOUNDS,
    zoom,
    options: { radius: 72, maxZoom: 17 },
  })

  return { clusters, supercluster, points }
}
