import { create } from 'zustand'
import type { HeritageSiteProperties, SubcomponentFeature } from '@/features/map/types'

interface ExploreState {
  selectedSite: HeritageSiteProperties | null
  selectedSubcomponent: SubcomponentFeature | null
  fullScreenImageIndex: number | null
  actions: {
    setSelectedSite: (site: HeritageSiteProperties | null) => void
    setSelectedSubcomponent: (feature: SubcomponentFeature | null) => void
    setFullScreenImageIndex: (index: number | null) => void
  }
}

export const useExploreStore = create<ExploreState>((set) => ({
  selectedSite: null,
  selectedSubcomponent: null,
  fullScreenImageIndex: null,
  actions: {
    setSelectedSite: (site) => set({ selectedSite: site }),
    setSelectedSubcomponent: (feature) => set({ selectedSubcomponent: feature }),
    setFullScreenImageIndex: (index) => set({ fullScreenImageIndex: index }),
  }
}))

export const useExploreActions = () => useExploreStore((state) => state.actions)
