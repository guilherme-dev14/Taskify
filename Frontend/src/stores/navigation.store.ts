import { create } from "zustand";
import type { ViewType } from "../components/Dock";

interface NavigationState {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: "home",
  setCurrentView: (view) => set({ currentView: view }),
}));
