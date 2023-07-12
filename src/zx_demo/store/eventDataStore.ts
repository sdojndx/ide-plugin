import { StateCreator } from 'zustand';

type EventItem = {
  topic: string;
  contractName: string;
  contractVersion: string;
  data: string[];
};

export type EventDataStore = {
  eventData: EventItem[];
  setEventData: (items: EventItem[]) => void;
  appendEventData: (items: EventItem[]) => void;
  getEventData: () => EventItem[];
  clearEventData: () => void;
};

export const eventDataStore: StateCreator<EventDataStore> = (set, get) => ({
  eventData: [],
  setEventData: (item) => set(() => ({ eventData: item })),
  appendEventData: (items) => set((state) => ({ eventData: [...state.eventData, ...items] })),
  getEventData: () => get().eventData,
  clearEventData: () => set(() => ({ eventData: [] }))
});
