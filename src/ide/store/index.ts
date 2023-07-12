import create from 'zustand';
import { editorStore, EditorStore } from './editorStore';
import { IdeStatusStore, ideStatusStore } from './ideStatusStore';
import { StyleDataStore, styleDataStore } from './styleStore';

export type IdeStore =
  EditorStore &
  IdeStatusStore&
  StyleDataStore;

export const useIdeStore = create<IdeStore>((...param) => ({
  ...editorStore(...param),
  ...ideStatusStore(...param),
  ...styleDataStore(...param)
}));
