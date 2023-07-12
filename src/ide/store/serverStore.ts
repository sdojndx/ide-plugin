import { IdeEventListener } from '@ide/types/ideEventListener';
import create, { StateCreator } from 'zustand';

// 定义ide server的接入方式

export type IdeServerStore = {
  ideEventListener: IdeEventListener | undefined;
  setIdeEventListener: (ideEventListener: IdeEventListener) => void;
};

export const serverStore: StateCreator<IdeServerStore> = (set) => ({
  ideEventListener: undefined,
  setIdeEventListener: (ideEventListener) => set(() => ({
    ideEventListener
  }))
});

export const useServerStore = create(serverStore);
