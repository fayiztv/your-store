const FAVOURITES_KEY = 'thread_favourites';

export function getFavourites() {
  try {
    const stored = localStorage.getItem(FAVOURITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveFavourites(arr) {
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(arr));
}

export function clearFavourites() {
  localStorage.removeItem(FAVOURITES_KEY);
}
