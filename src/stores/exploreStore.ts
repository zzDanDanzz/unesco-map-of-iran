import { create } from 'zustand'
import type { HeritageSiteProperties } from '@/features/map/types'

interface ExploreState {
  selectedSite: HeritageSiteProperties | null
  activeMode: 'atlas' | 'timeline'
  fullScreenImageIndex: number | null
  actions: {
    setSelectedSite: (site: HeritageSiteProperties | null) => void
    setActiveMode: (mode: 'atlas' | 'timeline') => void
    setFullScreenImageIndex: (index: number | null) => void
  }
}

export const useExploreStore = create<ExploreState>((set) => ({
  selectedSite: null,
  activeMode: 'atlas',
  fullScreenImageIndex: null,
  actions: {
    setSelectedSite: (site) => set({ selectedSite: site }),
    setActiveMode: (mode) => set({ activeMode: mode }),
    setFullScreenImageIndex: (index) => set({ fullScreenImageIndex: index }),
  }
}))

export const useExploreActions = () => useExploreStore((state) => state.actions)
