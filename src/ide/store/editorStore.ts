// import { Pick } from '@ide/types/common'
import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Lint {
  lineNo: string;
  file: string;
  fromCol?: string;
  toCol?: string;
  severity: 'info' | 'warning' | 'error';
  msg: string;
}

/**
 * 存储编辑文件信息
 */
export interface IdeFileTabItemProp {
  /**
   * ide组件添加一个本地的编辑文件唯一标识，防止重命名时编辑区数据丢失。常用语用户更新状态。
   */
  id: string;
  /**
   * 是否可以编辑,不设置默认可编辑。
   */
  editable?: boolean;
  /**
   * 文件路径，有时候path是可变得，比如编辑文件名后。
   */
  path: string;
  /**
   * 是否为可见的
   */
  isVisible?: boolean;
  /**
   * 驱动编辑区行为数据
   * cursor 鼠标聚焦指定位置
   * updateCode 更新代码到最新
   * saveFile 保存代码
   */
  action?: {
    Line: number,
    Ch: number,
    type: 'cursor';
  } | {
    type: 'updateCode'
  } | {
    type: 'saveFile'
  };
  /**
   * 文件警告信息
   */
  lints?: Lint[],
  /**
   * tab显示的名称,默认会根据路径path 计算最后一个/符号后面内容
   */
  name?: string;
  /**
   * 文件类型，默认会根据path计算
   */
  fileType?: string;
  /**
   * 是否存在未保存的代码
   */
  hasUnSave?: boolean;
}
export type EditorItem = Omit<IdeFileTabItemProp, 'id'> & {
  id?: string;
};

type EditorItemPartial = Partial<EditorItem>;

interface EditorData {
  /**
   * ide在编辑的文件列表
   */
  ideFileTabs: IdeFileTabItemProp[];
  /**
   * 文件提醒信息。
   */
  // lints: {
  //   [key: string]: Lint[]
  // };

  /**
   * 当前打开的选项卡
   */
  currentFileTab?: IdeFileTabItemProp;
  /**
   * 文件打开记录
   */
  history: string[];
}

const initDate = {
  ideFileTabs: [],
  history: []
  // lints: {}
};

export type EditorStore = EditorData & {
  /**
   * 设置在编辑的文件列表
   * @param ls 在编辑的文件列表
   * @returns
   */
  setEditors: (ls: IdeFileTabItemProp[]) => void;
  /**
   * 更新单个在编辑文件
   * @param path 要更新的文件路径
   * @param item 更新的tab内容
   * @returns
   */
  updateEditor: (path: string, item: EditorItemPartial) => void;
  /**
   * 更新单个在编辑文件
   * @param id 要更新的文件路径
   * @param item 更新的tab内容
   * @returns
   */
  updateEditorById: (id: string, item: EditorItemPartial) => void;
  /**
   * 更新所有在编辑文件
   * @param item 更新的tab内容
   * @returns
   */
  updateAllEditor: (item: Pick<EditorItem, 'lints'>) => void;
  /**
   * 打开并切换当前编辑文件
   * @param item 节点信息
   * @returns
   */
  openEditor: (item: EditorItem) => void;
  /**
   * 移除编辑中的某个文件节点tab
   * @param path 要移除项的Path
   * @returns
   */
  removeEditor: (path: string) => void;
  /**
   * 移除编辑中的某个文件节点tab
   * @param id 要移除项的Id
   * @returns
   */
  removeEditorById: (id: string) => void;
  /**
   * 清空所有编辑文件节点tab
   */
  clearEditor:()=>void;
  // updateLints: (item: EditorData['lints']) => void;
};

export const editorStore: StateCreator<EditorStore> = (set) => ({
  ...initDate,
  setEditors: (ls) => set((state) => {
    const currentFileTab = ls.find(item => item.isVisible);
    const history = state.history.slice();
    if (currentFileTab?.path && history[history.length - 1] !== currentFileTab?.path) {
      history.push(currentFileTab.path);
    }
    // (state as IdeStore).getGoModuleFiles(ls.find(item => item.isVisible)?.path);
    return {
      ideFileTabs: ls,
      currentFileTab,
      history
    };
  }),
  openEditor: (item) => set((state) => {
    const editorlist = state.ideFileTabs;
    const history = state.history.slice();
    let hasOpen = false;
    const name = item.name || item.path.match(/[^/]+$/)?.[0];
    item.fileType = item.fileType || item.path.match(/[^.]+$/)?.[0];

    let currentFileTab;
    const ideFileTabs = editorlist.map(editor => {
      if (editor.path === item.path) {
        hasOpen = true;
        currentFileTab = {
          ...editor,
          ...item,
          name: editor.name || name,
          isVisible: true
        };
        return currentFileTab;
      }
      editor.isVisible = false;
      return editor;
    });
    if (!hasOpen) {
      currentFileTab = {
        ...item,
        name,
        isVisible: true,
        id: uuidv4()
      };
      ideFileTabs.push(currentFileTab);
    }

    history.push(item.path);
    return { ideFileTabs, currentFileTab, history };
  }),
  // 移除编辑文件
  removeEditor: (path) => set((state) => {
    let currentFileTab;
    const ideFileTabs = state.ideFileTabs.slice();
    const history = state.history.slice();
    const index = ideFileTabs.findIndex(editor => editor.path === path);
    if (index === -1) {
      return {
        ideFileTabs, history
      };
    }
    ideFileTabs.splice(index, 1);
    for (let i = history.length; i >= 0; i--) {
      if (path === history[i]) {
        history.splice(i, 1);
      }
    }
    const editor = ideFileTabs.find(editor => editor.isVisible);
    if (!editor) {
      const p = history[history.length - 1];
      const currentFileTab = ideFileTabs.find(editor => editor.path === p);
      if (currentFileTab) {
        currentFileTab.isVisible = true;
      }
    }
    return { ideFileTabs, history, currentFileTab };
  }),
  // 移除编辑文件
  removeEditorById: (id) => set((state) => {
    const ideFileTabs = state.ideFileTabs.slice();
    const history = state.history.slice();
    const index = ideFileTabs.findIndex(editor => editor.id === id);
    const path = ideFileTabs[index].path;
    if (index === -1) {
      return {
        ideFileTabs, history
      };
    }
    ideFileTabs.splice(index, 1);
    for (let i = history.length; i >= 0; i--) {
      if (path === history[i]) {
        history.splice(i, 1);
      }
    }
    const editor = ideFileTabs.find(editor => editor.isVisible);
    if (!editor) {
      const p = history[history.length - 1];
      const edit = ideFileTabs.find(editor => editor.path === p);
      if (edit) {
        edit.isVisible = true;
      }
    }
    return { ideFileTabs, history };
  }),
  // 文件名变化情况下 更新编辑文件
  updateEditor: (path, item) => set((state) => {
    const editorlist = state.ideFileTabs;
    if (item.path) {
      item.fileType = item.fileType || item.path.match(/[^.]+$/)?.[0];
      item.name = item.name || item.path.match(/[^/]+$/)?.[0];
    }
    const ideFileTabs = editorlist.map(editor => {
      if (editor.path === path) {
        return {
          ...editor,
          ...item
        };
      }
      return editor;
    });
    return { ideFileTabs };
  }),
  // 文件名变化情况下 更新编辑文件
  updateEditorById: (id, item) => set((state) => {
    const editorlist = state.ideFileTabs;
    if (item.path) {
      item.fileType = item.fileType || item.path.match(/[^.]+$/)?.[0];
      item.name = item.name || item.path.match(/[^/]+$/)?.[0];
    }
    const ideFileTabs = editorlist.map(editor => {
      if (editor.id === id) {
        return {
          ...editor,
          ...item
        };
      }
      return editor;
    });
    return { ideFileTabs };
  }),
  // 批量更新所以在编辑文件
  updateAllEditor: (item) => set((state) => {
    const editorlist = state.ideFileTabs;
    const ideFileTabs = editorlist.map(editor => {
      return {
        ...editor,
        ...item
      };
    });
    return { ideFileTabs };
  }),
  clearEditor: () => set(() => ({
    ideFileTabs: []
  }))
  // updateLints: (item) => set(() => ({
  //   lints: item
  // }))
});
