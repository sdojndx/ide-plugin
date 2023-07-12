import { StateCreator } from 'zustand';

export type OutputStore = {
  outputText: string[],
  originOutputText: string[],
  setOutputText: (text: string) => void;
  setOriginOutputText: (text: string) => void;
  clearOutputText: () => void;
};

export const outputStore: StateCreator<OutputStore> = (set) => ({
  outputText: [],
  originOutputText: [],
  setOutputText: (text) => set((state) => ({ outputText: [...state.outputText, text] })),
  clearOutputText: () => set(() => ({ outputText: [] })),
  setOriginOutputText: (text) => set((state) => ({ originOutputText: [...state.originOutputText, text], outputText: [...state.outputText, text] }))
});
