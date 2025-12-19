import { create } from 'zustand';
import { SimulationState, TeamMember, Epic } from '../types';

interface SimulationStore extends SimulationState {
  setCurrentScreen: (screen: 'team' | 'epic' | 'sprint') => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  setEpic: (epic: Epic) => void;
  reset: () => void;
}

const initialState: SimulationState = {
  currentScreen: 'team',
  team: [],
  epic: null,
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  ...initialState,
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  addTeamMember: (member) => set((state) => ({
    team: [...state.team, member],
  })),
  updateTeamMember: (id, updates) => set((state) => ({
    team: state.team.map((m) => (m.id === id ? { ...m, ...updates } : m)),
  })),
  removeTeamMember: (id) => set((state) => ({
    team: state.team.filter((m) => m.id !== id),
  })),
  setEpic: (epic) => set({ epic }),
  reset: () => set(initialState),
}));




