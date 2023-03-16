import { StateCreator } from 'zustand';

type WorldStateItem = {
  key: string;
  value: string;
};

export type WorldStateStore = {
  worldState: WorldStateItem[];
  setWorldState: (item: WorldStateItem[]) => void;
  appendWorldState: (item: WorldStateItem) => void;
  unshiftWorldState: (item: WorldStateItem) => void;
  getWorldState: () => WorldStateItem[];
  clearWorldState: () => void;
};

export const worldStateStore: StateCreator<WorldStateStore> = (set, get) => ({
  worldState: [],
  setWorldState: (item) => set(() => ({ worldState: item })),
  appendWorldState: (item) => set((state) => ({ worldState: [...state.worldState, item] })),
  unshiftWorldState: (item) => set((state) => ({ worldState: [item, ...state.worldState] })),
  getWorldState: () => get().worldState,
  clearWorldState: () => set(() => ({ worldState: [] }))
});
