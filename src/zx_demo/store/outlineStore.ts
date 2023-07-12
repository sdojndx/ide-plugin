import { StateCreator } from 'zustand';
export interface OutlineDetail {
  Name: string;
  Line: number;
  Ch: number;
}
export interface OutlineResponse {
  constDecls: OutlineDetail[];
  funcDecls: OutlineDetail[];
  imports: OutlineDetail[];
  interfaceDecls: OutlineDetail[];
  package: OutlineDetail[];
  structDecls: OutlineDetail[];
  typeDecls: OutlineDetail[];
  varDecls: OutlineDetail[];
}

export type EditorOutLine = {
  [key in string]: OutlineResponse;
};

export type OutlineStore = {
  editorOutLine: EditorOutLine;
  setOutline:(outline:EditorOutLine)=> void;
  updateOutLine:(outline:EditorOutLine)=> void;
  removeOutLine:(key:string)=> void;
};

export const outlineStore: StateCreator<OutlineStore> = (set) => ({
  editorOutLine: {},
  setOutline: (outline) => set(() => ({ editorOutLine: outline })),
  updateOutLine: (outline) => set((state) => ({
    editorOutLine: { ...state.editorOutLine, ...outline }
  })),
  removeOutLine: (key) => set((state) => {
    const newOutline = Object.assign(state.editorOutLine);
    delete newOutline[key];
    return ({
      editorOutLine: newOutline
    });
  })
});
