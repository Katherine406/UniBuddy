import { createContext, useContext, useState, type ReactNode } from "react";

export interface SavedRoute {
  id: string;
  title: string;
  emoji: string;
  type: "recommended" | "mystery" | "custom";
  duration?: string;
  stops: string[];
  bg: string;
  tagBg: string;
  tagLabel: string;
}

interface FavoritesCtx {
  favorites: SavedRoute[];
  addFavorite: (r: SavedRoute) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (r: SavedRoute) => void;
}

const FavoritesContext = createContext<FavoritesCtx>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  toggleFavorite: () => {},
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<SavedRoute[]>([
    {
      id: "freshman",
      title: "新生入门路线",
      emoji: "🌱",
      type: "recommended",
      duration: "30 min",
      stops: ["东门入口", "行政楼", "图书馆", "中心广场"],
      bg: "#A8D4FF",
      tagBg: "#4B9EF7",
      tagLabel: "推荐",
    },
  ]);

  const addFavorite = (r: SavedRoute) =>
    setFavorites((prev) => (prev.find((f) => f.id === r.id) ? prev : [...prev, r]));

  const removeFavorite = (id: string) =>
    setFavorites((prev) => prev.filter((f) => f.id !== id));

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  const toggleFavorite = (r: SavedRoute) =>
    isFavorite(r.id) ? removeFavorite(r.id) : addFavorite(r);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
