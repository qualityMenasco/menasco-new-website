/**
 * Placeholder photography only — no real MENASCO project or facility images
 * exist in this repository yet. These are generic construction/engineering
 * stock photos used purely to make layouts reviewable; every usage site is a
 * single prop, so swapping in real photography later is a one-line change
 * per component. See docs asset inventory before shipping to production.
 */
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`;

export const placeholderImages = {
  industrialPipes: img('photo-1541888946425-d81bb19240f5'),
  engineerAtWork: img('photo-1581091226825-a6a2a5aee158'),
  architecture: img('photo-1487958449943-2429e8be8625'),
  controlRoom: img('photo-1504307651254-35680f356dfd'),
  constructionSite: img('photo-1517245386807-bb43f82c33c4'),
  towerFacade: img('photo-1503387762-592deb58ef4e'),
  factoryFloor: img('photo-1541976590-713941681591'),
  siteTeam: img('photo-1565608087341-404b25492fee'),
  fabrication: img('photo-1581092160562-40aa08e78837'),
  dubaiSkylineDay: img('photo-1590959651373-a3db0f38a961'),
  dubaiSkylineWide: img('photo-1486406146926-c627a92ad1ab'),
  dubaiSkylineNight: img('photo-1568605114967-8130f3a36994'),
  blueprintReview: img('photo-1503387837-b154d5074bd2'),
  glassFacade: img('photo-1486718448742-163732cd1544'),
  nightSkyline: img('photo-1518684079-3c830dcef090'),
};

/**
 * Deterministic fallback so project cards never render a broken image while
 * real photography is pending. Requested at a card-appropriate width rather
 * than the 1600px used elsewhere (hero banners, full-bleed sections) —
 * Unsplash's own resize API, not a new dependency — since these render at
 * ~300-400px in the project grid.
 */
const projectFallbackPool = [
  placeholderImages.towerFacade,
  placeholderImages.dubaiSkylineDay,
  placeholderImages.glassFacade,
  placeholderImages.constructionSite,
  placeholderImages.nightSkyline,
  placeholderImages.dubaiSkylineWide,
].map((url) => url.replace('w=1600', 'w=800'));

export function getProjectImage(providedImage: string | undefined, seedKey: string): string {
  if (providedImage) return providedImage;
  const index = Array.from(seedKey).reduce((sum, char) => sum + char.charCodeAt(0), 0) % projectFallbackPool.length;
  return projectFallbackPool[index];
}
