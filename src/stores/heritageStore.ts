import { create } from 'zustand'
import type { FeatureCollection, Point } from 'geojson'
import type { HeritageSite, SubcomponentProperties } from '@/features/map/types'

interface HeritageState {
  sites: HeritageSite[]
  subcomponentsData: Record<string, FeatureCollection<Point, SubcomponentProperties>>
  actions: {
    setHeritageData: (
      sites: HeritageSite[],
      subcomponents: Record<string, FeatureCollection<Point, SubcomponentProperties>>
    ) => void
  }
}

export const useHeritageStore = create<HeritageState>((set) => ({
  sites: [],
  subcomponentsData: {},
  actions: {
    setHeritageData: (sites, subcomponents) => set({
      sites,
      subcomponentsData: subcomponents,
    }),
  }
}))

export const useHeritageActions = () => useHeritageStore((state) => state.actions)
