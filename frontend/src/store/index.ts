import { create } from 'zustand';
import { AnalysisResult, UserProfile } from '../types';

interface AppState {
  currentResult: AnalysisResult | null;
  setCurrentResult: (result: AnalysisResult | null) => void;

  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  currentResult: null,
  setCurrentResult: (result) => set({ currentResult: result }),

  user: null,
  setUser: (user) => set({ user }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  activeCaseId: null,
  setActiveCaseId: (activeCaseId) => set({ activeCaseId }),
}));
