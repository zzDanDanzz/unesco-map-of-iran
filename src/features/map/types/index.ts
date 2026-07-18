import type { Feature, Point } from "geojson"
import Supercluster from "supercluster"

export interface HeritageSiteProperties {
  name_en: string
  short_description_en: string
  category: string
  main_image_url: string
  images_urls: string[]
  id_no: string
  main_image_author?: string
}

export type HeritageSite = Feature<Point, HeritageSiteProperties>
export type PointProperties = HeritageSiteProperties & { cluster: false }
export type ClusterProps = Supercluster.AnyProps

export interface ClusterMarkerProps {
  cluster: Supercluster.ClusterFeature<ClusterProps>
  supercluster: Supercluster<PointProperties, ClusterProps>
  onClick: () => void
}

export interface SubcomponentProperties {
  img?: string
  name?: string
  img_original?: string
}

export type SubcomponentFeature = Feature<Point, SubcomponentProperties>
