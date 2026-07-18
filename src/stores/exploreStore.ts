import { create } from 'zustand'
import type { HeritageSiteProperties, SubcomponentFeature } from '@/features/map/types'

interface ExploreState {
  selectedSite: HeritageSiteProperties | null
  selectedSubcomponent: SubcomponentFeature | null
  fullScreenImageIndex: number | null
  fullScreenViewerContext: 'site' | 'subcomponent' | null
  actions: {
    setSelectedSite: (site: HeritageSiteProperties | null) => void
    setSelectedSubcomponent: (feature: SubcomponentFeature | null) => void
    setFullScreenImageIndex: (index: number | null, context?: 'site' | 'subcomponent' | null) => void
  }
}

export const useExploreStore = create<ExploreState>((set) => ({
  selectedSite: null,
  selectedSubcomponent: null,
  fullScreenImageIndex: null,
  fullScreenViewerContext: null,
  actions: {
    setSelectedSite: (site) => set({ selectedSite: site }),
    setSelectedSubcomponent: (feature) => set({ selectedSubcomponent: feature }),
    setFullScreenImageIndex: (index, context = null) => set({ 
      fullScreenImageIndex: index,
      fullScreenViewerContext: context || (index === null ? null : 'site')
    }),
  }
}))

export const useExploreActions = () => useExploreStore((state) => state.actions)
