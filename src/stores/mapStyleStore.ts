import type { StyleSpecification } from 'react-map-gl/maplibre'
import { create } from 'zustand'

interface MapStyleState {
  mapStyle: StyleSpecification | null
  isStyleLoading: boolean
  actions: {
    setMapStyle: (style: StyleSpecification) => void
    setIsStyleLoading: (loading: boolean) => void
  }
}

export const useMapStyleStore = create<MapStyleState>((set) => ({
  mapStyle: null,
  isStyleLoading: true,
  actions: {
    setMapStyle: (style) => set({ mapStyle: style }),
    setIsStyleLoading: (loading) => set({ isStyleLoading: loading }),
  }
}))

export const useMapStyleActions = () => useMapStyleStore((state) => state.actions)
