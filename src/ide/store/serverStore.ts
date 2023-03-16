import { IdeServer } from '@ide/types/ideServer';
import { StateCreator } from 'zustand';

// 定义ide server的接入方式

export type IdeServerStore = {
  server: IdeServer | undefined;
  setServer: (server: IdeServer) => void;
};

export const serverStore: StateCreator<IdeServerStore> = (set) => ({
  server: undefined,
  setServer: (server) => set(() => ({
    server
  }))
});
