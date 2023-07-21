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
  // 自动保存检测时间间隔 毫秒
  autoSaveSpace: number;
}

const initData = {
  dragType: undefined,
  isHideNav: false,
  isHideFunc: false,
  isHideBottom: false,
  autoSaveSpace: 10000
};

export type IdeStatusStore = IdeStatus & {
  /**
   * 设置拖拽窗口大小的类型
   * @param type
   * @returns
   */
  setDragType: (type?: string) => void;
  /**
   * 设置是否隐藏左边自定义内容
   * @param isHide
   * @returns
   */
  setIsHideNav: (isHide?: boolean) => void;
  /**
   * 设置是否隐藏右边自定义内容
   * @param isHide
   * @returns
   */
  setIsHideFunc: (isHide?: boolean) => void;
  /**
   * 设置是否隐藏底部自定义内容
   * @param visible
   * @returns
   */
  setIsHideBottom: (visible: boolean) => void;
  /**
   * 设置自动保存时间间隔
   * @param time 时间间隔
   * @returns
   */
  setAutoSaveSpace: (time: number) => void;
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
  setAutoSaveSpace: (time) => set(() => ({
    autoSaveSpace: time
  }))
});
