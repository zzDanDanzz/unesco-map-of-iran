export const getInitialViewState = () => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false
  return {
    longitude: 54.03,
    latitude: 33.03,
    zoom: isMobile ? 3.8 : 4.5,
  }
}
