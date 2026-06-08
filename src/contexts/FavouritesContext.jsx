import { createContext, useContext, useEffect, useState } from 'react';
import { getFavourites, saveFavourites } from '../utils/localStorage';

const FavouritesContext = createContext(null);

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState(() => getFavourites());

  useEffect(() => {
    saveFavourites(favourites);
  }, [favourites]);

  function addFavourite(product) {
    setFavourites((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }

  function removeFavourite(productId) {
    setFavourites((prev) => prev.filter((p) => p.id !== productId));
  }

  function isFavourite(productId) {
    return favourites.some((p) => p.id === productId);
  }

  function clearAllFavourites() {
    setFavourites([]);
  }

  const count = favourites.length;

  const value = {
    favourites,
    count,
    addFavourite,
    removeFavourite,
    isFavourite,
    clearAllFavourites,
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}
