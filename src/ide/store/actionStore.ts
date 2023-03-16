// import create from 'zustand'

import { StateCreator } from 'zustand';

/**
 * 存储全局动作状态,比如拖拽中。
 */
interface ActionData {
  // 拖拽类型
  dragType?: string;
  addFileInfo: {
    // 是否打开新建文件
    addFileType?: 'file' | 'folder' | 'rename';
    // 是否打开新建文件
    isOpenAddFile?: boolean;
    // 新建文件名称
    newFileName?: string;
    // 新建文件的路径
    newFilePath?: string;
  }
  // 是否隐藏导航栏
  isHideNav?: boolean;
  // 是否显示set框
  setVisible: boolean;
  isHideFunc: boolean;
  isHideBottom: boolean;
  activeTab: string;
  currentTab: string;
  modalStatus: {
    modalShow: boolean; modalContent: string
  }
}

const initData = {
  dragType: undefined,
  addFileInfo: {
    addFileType: undefined,
    isOpenAddFile: false,
    newFileName: '',
    newFilePath: ''
  },
  isHideNav: false,
  setVisible: false,
  isHideFunc: false,
  isHideBottom: false,
  activeTab: 'fileTree',
  currentTab: 'output',
  modalStatus: {
    modalShow: false,
    modalContent: ''
  }
};

export type ActionDataStore = ActionData & {
  setDragType: (type?: string) => void;
  setAddFileInfo: (info?: ActionData['addFileInfo']) => void;
  setIsHideNav: (isHide?: boolean) => void;
  setIsHideFunc: (isHide?: boolean) => void;
  setIsHideBottom: (visible: boolean) => void;
  setModalVisible: (visible: boolean) => void;
  setActiveTab: (tab: string) => void;
  setCurrentTab: (tab: string) => void;
  setModalStatus: (statue: ActionData['modalStatus']) => void;
};
export const actionStore: StateCreator<ActionDataStore> = (set) => ({
  ...initData,
  setDragType: (type) => set(() => ({
    dragType: type
  })),
  setAddFileInfo: (info) => set((state) => ({
    addFileInfo: {
      ...state.addFileInfo,
      ...info
    }
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
  setModalVisible: (visible) => set(() => ({
    setVisible: visible
  })),
  setActiveTab: (tab) => set(() => ({
    activeTab: tab
  })),
  setCurrentTab: (tab) => set(() => ({
    currentTab: tab
  })),
  setModalStatus: (status) => set(() => ({
    modalStatus: status
  }))
});
