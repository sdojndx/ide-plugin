// import create from 'zustand'

import { StateCreator } from 'zustand';

/**
 * 存储全局动作状态,比如拖拽中。
 */
interface IdeStatus {
  // 拖拽类型
  dragType?: string;
  // 是否隐藏导航栏
  isHideLeftContent?: boolean;
  isHideRightContent?: boolean;
  isHideBottomContent?: boolean;
  // 是否隐藏导航栏
  hasLeftContent?: boolean;
  hasRightContent?: boolean;
  hasBottomContent?: boolean;
  // 模块尺寸管理
  leftContentSize?: number;
  rightContentSize?: number;
  bottomContentSize?: number;
  // 自动保存检测时间间隔 毫秒
  autoSaveSpace: number;
}

const initData = {
  dragType: undefined,
  isHideLeftContent: false,
  isHideRightContent: false,
  isHideBottomContent: false,
  hasLeftContent: false,
  hasRightContent: false,
  hasBottomContent: false,
  leftContentSize: 300,
  rightContentSize: 240,
  bottomContentSize: 200,
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
  setIsHideLeftContent: (isHide?: boolean) => void;
  /**
   * 设置是否隐藏右边自定义内容
   * @param isHide
   * @returns
   */
  setIsHideRightContent: (isHide?: boolean) => void;
  /**
   * 设置是否隐藏底部自定义内容
   * @param visible
   * @returns
   */
  setIsHideBottomContent: (visible: boolean) => void;

  /**
   * 设置是否隐藏左边自定义内容
   * @param has
   * @returns
   */
  setHasLeftContent: (has?: boolean) => void;
  /**
   * 设置是否隐藏右边自定义内容
   * @param has
   * @returns
   */
  setHasRightContent: (has?: boolean) => void;
  /**
   * 设置是否隐藏底部自定义内容
   * @param has
   * @returns
   */
  setHasBottomContent: (has: boolean) => void;
  /**
   * 设置左边自定义内容区域尺寸
   * @param size
   * @returns
   */
  setLeftContentSize: (size: number)=>void;
  /**
   * 设置右边自定义内容区域尺寸
   * @param size
   * @returns
   */
  setRightContentSize: (size: number)=>void;
  /**
   * 设置底部自定义内容区域尺寸
   * @param size
   * @returns
   */
  setBottomContentSize: (size: number)=>void;
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
  setIsHideLeftContent: (isHide) => set((state) => {
    return {
      isHideLeftContent: state.hasLeftContent ? isHide : true
    };
  }),
  setIsHideRightContent: (isHide) => set((state) => {
    return {
      isHideRightContent: state.hasRightContent ? isHide : true
    };
  }),
  setIsHideBottomContent: (isHide) => set((state) => {
    return {
      isHideBottomContent: state.hasBottomContent ? isHide : true
    };
  }),
  setAutoSaveSpace: (time) => set(() => ({
    autoSaveSpace: time
  })),
  setHasLeftContent: (has) => set(() => ({
    hasLeftContent: has
  })),
  setHasRightContent: (has) => set(() => ({
    hasRightContent: has
  })),
  setHasBottomContent: (has) => set(() => ({
    hasBottomContent: has
  })),
  setLeftContentSize: (size) => set(() => ({
    leftContentSize: size
  })),
  setRightContentSize: (size) => set(() => ({
    rightContentSize: size
  })),
  setBottomContentSize: (size) => set(() => ({
    bottomContentSize: size
  }))
});
