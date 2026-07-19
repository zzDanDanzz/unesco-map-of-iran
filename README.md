# 🗺️ UNESCO World Heritage Sites of Iran

[View Live Deployment on GitHub Pages](https://zzdandanzz.github.io/unesco-map-of-iran/)

An interactive web mapping application visualizing the UNESCO World Heritage Sites in Iran.

## 📖 Data Curation

The application's UX relies on custom, image-based map markers, but the original UNESCO dataset didn't specify images for each heritage site's subcomponents.

To bridge the gap, I manually matched photos from UNESCO's official website and Wikimedia with the subcomponents. It's not perfect. Some may be wrong matches, and some are still missing.

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Mapping**: MapLibre GL JS + React Map GL
- **Basemap**: PMTiles (OSM)
- **State Management**: Zustand
- **Styling**: Tailwind + shadcn/ui

## 📜 License

**Source Code:** The source code is licensed under the MIT License.

**Data & Assets:** The geographical data, descriptions, and primary images are sourced from UNESCO. Supplemental images are sourced from Wikimedia Commons. Original attribution URLs and authors are preserved within the dataset properties (`img_original`, `main_image_author`). These assets remain subject to their respective licenses (primarily CC BY-SA and CC0) and are used here for educational and demonstrative purposes.
