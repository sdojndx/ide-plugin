import create from 'zustand';
import { ActionDataStore, actionStore } from './actionStore';
import { ContractDataStore, contractStore } from './contractStore';
import { editorStore, EditorStore } from './editorStore';
import { eventDataStore, EventDataStore } from './eventDataStore';
import { OutputStore, outputStore } from './outputStore';
import { IdeServerStore, serverStore } from './serverStore';
import { IdeSettingStore, settingStore } from './settingStore';
import { WorldStateStore, worldStateStore } from './worldStateStore';

export type IdeStore =
  ActionDataStore &
  ContractDataStore &
  EditorStore &
  EventDataStore &
  OutputStore &
  IdeServerStore &
  IdeSettingStore &
  WorldStateStore;

const useIdeStore = create<IdeStore>((...param) => ({
  ...actionStore(...param),
  ...contractStore(...param),
  ...editorStore(...param),
  ...eventDataStore(...param),
  ...outputStore(...param),
  ...serverStore(...param),
  ...settingStore(...param),
  ...worldStateStore(...param)
}));
export default useIdeStore;
