// import create from 'zustand'

import { StateCreator } from 'zustand';

/**
 * 存储全局动作状态,比如拖拽中。
 */
interface CommonActionData {
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
  // 左边选中tab页id
  setVisible: boolean;
  activeTab: string;
  currentTab: string;
  modalStatus: {
    modalShow: boolean; modalContent: string
  }
}

const initData = {
  addFileInfo: {
    addFileType: undefined,
    isOpenAddFile: false,
    newFileName: '',
    newFilePath: ''
  },
  setVisible: false,
  activeTab: 'fileTree',
  currentTab: 'output',
  modalStatus: {
    modalShow: false,
    modalContent: ''
  }
};

export type CommonActionDataStore = CommonActionData & {
  setAddFileInfo: (info?: CommonActionData['addFileInfo']) => void;
  setModalVisible: (visible: boolean) => void;
  setActiveTab: (tab: string) => void;
  setCurrentTab: (tab: string) => void;
  setModalStatus: (statue: CommonActionData['modalStatus']) => void;
  setAlartModalContent:(content:string)=>void;
};
export const commonActionStore: StateCreator<CommonActionDataStore> = (set) => ({
  ...initData,
  setAddFileInfo: (info) => set((state) => ({
    addFileInfo: {
      ...state.addFileInfo,
      ...info
    }
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
  })),
  setAlartModalContent: (content) => set(() => ({
    modalStatus: {
      modalShow: true,
      modalContent: content
    }
  }))
});
