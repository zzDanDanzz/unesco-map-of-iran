import { create } from 'zustand'
import type { FeatureCollection, Point } from 'geojson'
import type { HeritageSite, SubcomponentProperties } from '@/features/map/types'

interface HeritageState {
  isLoading: boolean
  sites: HeritageSite[]
  subcomponentsData: Record<string, FeatureCollection<Point, SubcomponentProperties>>
  actions: {
    setHeritageData: (
      sites: HeritageSite[],
      subcomponents: Record<string, FeatureCollection<Point, SubcomponentProperties>>
    ) => void
    setIsLoading: (loading: boolean) => void
  }
}

export const useHeritageStore = create<HeritageState>((set) => ({
  isLoading: true,
  sites: [],
  subcomponentsData: {},
  actions: {
    setHeritageData: (sites, subcomponents) => set({
      sites,
      subcomponentsData: subcomponents,
      isLoading: false,
    }),
    setIsLoading: (loading) => set({ isLoading: loading }),
  }
}))

export const useHeritageActions = () => useHeritageStore((state) => state.actions)
