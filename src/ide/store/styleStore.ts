import React from 'react';
import { StateCreator } from 'zustand';
// import { IdeStore } from '.';

/**
 * 存储合约信息
 */
interface StyleData {
  // 合约本身的文件目录
  ideStyle:React.CSSProperties;
  editorTheme: string;
  ideTheme: string;
  canChangeFontSize: boolean;
}

const initDate = {
  ideStyle: {},
  ideTheme: 'dark',
  editorTheme: 'abcdef',
  canChangeFontSize: true
};
export type StyleDataStore = StyleData & {
  // getFiles: () => Promise<any>;
  setIdeStyle:(style:React.CSSProperties)=> void;
  updateIdeStyle:(style:React.CSSProperties)=> void;
  setIdeTheme: (theme:string)=>void;
  setCanChangeFontSize:(can:boolean)=>void;
};

export const styleDataStore: StateCreator<StyleDataStore> = (set) => ({
  ...initDate,
  setIdeStyle: (style) => {
    set({
      ideStyle: style
    });
  },
  updateIdeStyle: (style) => set((state) => {
    const orgStyle = state.ideStyle;
    return {
      ideStyle: {
        ...orgStyle,
        ...style
      }
    };
  }),
  setIdeTheme: (theme) => {
    set({
      ideTheme: theme
    });
  },
  setCanChangeFontSize: (can) => {
    set({
      canChangeFontSize: can
    });
  }
});
