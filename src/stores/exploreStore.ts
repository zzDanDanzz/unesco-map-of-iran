import { create } from 'zustand'
import type { HeritageSiteProperties } from '@/features/map/types'

interface ExploreState {
  selectedSite: HeritageSiteProperties | null
  fullScreenImageIndex: number | null
  actions: {
    setSelectedSite: (site: HeritageSiteProperties | null) => void
    setFullScreenImageIndex: (index: number | null) => void
  }
}

export const useExploreStore = create<ExploreState>((set) => ({
  selectedSite: null,
  fullScreenImageIndex: null,
  actions: {
    setSelectedSite: (site) => set({ selectedSite: site }),
    setFullScreenImageIndex: (index) => set({ fullScreenImageIndex: index }),
  }
}))

export const useExploreActions = () => useExploreStore((state) => state.actions)
