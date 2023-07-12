// import create from 'zustand'

import { StateCreator } from 'zustand';

/**
 * 存储全局动作状态,比如拖拽中。
 */
interface IdeStatus {
  // 拖拽类型
  dragType?: string;
  // 是否隐藏导航栏
  isHideNav?: boolean;
  isHideFunc: boolean;
  isHideBottom: boolean;
  // 左边选中tab页id
  activeTab: string;
  currentTab: string;
}

const initData = {
  dragType: undefined,
  isHideNav: false,
  isHideFunc: false,
  isHideBottom: false,
  activeTab: 'fileTree',
  currentTab: 'output'
};

export type IdeStatusStore = IdeStatus & {
  setDragType: (type?: string) => void;
  setIsHideNav: (isHide?: boolean) => void;
  setIsHideFunc: (isHide?: boolean) => void;
  setIsHideBottom: (visible: boolean) => void;
  setActiveTab: (tab: string) => void;
  setCurrentTab: (tab: string) => void;
};
export const ideStatusStore: StateCreator<IdeStatusStore> = (set) => ({
  ...initData,
  setDragType: (type) => set(() => ({
    dragType: type
  })),
  setIsHideNav: (isHide) => set(() => ({
    isHideNav: isHide
  })),
  setIsHideFunc: (isHide) => set(() => ({
    isHideFunc: isHide
  })),
  setIsHideBottom: (isHide) => set(() => ({
    isHideBottom: isHide
  })),
  setActiveTab: (tab) => set(() => ({
    activeTab: tab
  })),
  setCurrentTab: (tab) => set(() => ({
    currentTab: tab
  }))
});
