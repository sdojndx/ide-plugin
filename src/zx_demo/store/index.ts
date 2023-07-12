import create from 'zustand';
import { ContractDataStore, contractStore } from './contractStore';
import { CommonActionDataStore, commonActionStore } from './commonActionStore';
import { EventDataStore, eventDataStore } from './eventDataStore';
import { OutputStore, outputStore } from './outputStore';
import { IdeSettingStore, settingStore } from './settingStore';
import { WorldStateStore, worldStateStore } from './worldStateStore';
import { OutlineStore, outlineStore } from './outlineStore';

export type AppStore =
  CommonActionDataStore&
  EventDataStore&
  OutputStore&
  IdeSettingStore&
  WorldStateStore&
  ContractDataStore&
  OutlineStore;

const useAppStore = create<AppStore>((...param) => ({
  ...commonActionStore(...param),
  ...contractStore(...param),
  ...eventDataStore(...param),
  ...outputStore(...param),
  ...worldStateStore(...param),
  ...settingStore(...param),
  ...outlineStore(...param)
}));
export default useAppStore;
