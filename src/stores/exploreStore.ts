import { create } from 'zustand'
import type { HeritageSiteProperties, SubcomponentFeature } from '@/features/map/types'

interface ExploreState {
  selectedSite: HeritageSiteProperties | null
  selectedSubcomponent: SubcomponentFeature | null
  fullScreenImageIndex: number | null
  fullScreenViewerContext: 'site' | 'subcomponent' | null
  selectedCategory: 'All' | 'Cultural' | 'Natural'
  selectedEras: string[]
  actions: {
    setSelectedSite: (site: HeritageSiteProperties | null) => void
    setSelectedSubcomponent: (feature: SubcomponentFeature | null) => void
    setFullScreenImageIndex: (index: number | null, context?: 'site' | 'subcomponent' | null) => void
    setSelectedCategory: (category: 'All' | 'Cultural' | 'Natural') => void
    toggleEra: (era: string) => void
    clearFilters: () => void
  }
}

export const useExploreStore = create<ExploreState>((set) => ({
  selectedSite: null,
  selectedSubcomponent: null,
  fullScreenImageIndex: null,
  fullScreenViewerContext: null,
  selectedCategory: 'All',
  selectedEras: [],
  actions: {
    setSelectedSite: (site) => set({ selectedSite: site }),
    setSelectedSubcomponent: (feature) => set({ selectedSubcomponent: feature }),
    setFullScreenImageIndex: (index, context = null) => set({ 
      fullScreenImageIndex: index,
      fullScreenViewerContext: context || (index === null ? null : 'site')
    }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    toggleEra: (era) => set((state) => ({
      selectedEras: state.selectedEras.includes(era)
        ? state.selectedEras.filter((e) => e !== era)
        : [...state.selectedEras, era]
    })),
    clearFilters: () => set({ selectedCategory: 'All', selectedEras: [] })
  }
}))

export const useExploreActions = () => useExploreStore((state) => state.actions)
