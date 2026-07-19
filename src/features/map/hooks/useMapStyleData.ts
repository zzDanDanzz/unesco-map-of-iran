import { useEffect } from "react"
import { toast } from "sonner"
import { useMapStyleActions } from "@/stores/mapStyleStore"
import { getAssetUrl } from "@/lib/utils"

export function useMapStyleData() {
  const { setMapStyle, setIsStyleLoading } = useMapStyleActions()

  useEffect(() => {
    fetch(getAssetUrl("/style.json"))
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch map style")
        return res.json()
      })
      .then((style) => {
        if (style && style.sources) {
          for (const key in style.sources) {
            const source = style.sources[key]
            if (source.url && source.url.startsWith("pmtiles:///")) {
              const filename = source.url.replace("pmtiles:///", "/")
              source.url = `pmtiles://${getAssetUrl(filename)}`
            }
          }
        }
        setMapStyle(style)
        setIsStyleLoading(false)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load map style.")
        setIsStyleLoading(false)
      })
  }, [setMapStyle, setIsStyleLoading])
}
