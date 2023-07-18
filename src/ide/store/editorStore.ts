// import { Pick } from '@ide/types/common'
import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Lint {
  lineNo: string;
  file: string;
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
   */
  action?: {
    Line: number,
    Ch: number,
    type: 'cursor';
  } | {
    v: number,
    type: 'updateCode'
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
  // updateLints: (item: EditorData['lints']) => void;
};

export const editorStore: StateCreator<EditorStore> = (set) => ({
  ...initDate,
  setEditors: (ls) => set((state) => ({
    ...state,
    ideFileTabs: ls
  })),
  openEditor: (item) => set((state) => {
    const editorlist = state.ideFileTabs;
    const history = state.history.slice();
    let hasOpen = false;
    const name = item.name || item.path.match(/[^/]+$/)?.[0];
    item.fileType = item.fileType || item.path.match(/[^.]+$/)?.[0];
    const ideFileTabs = editorlist.map(editor => {
      if (editor.path === item.path) {
        hasOpen = true;
        return {
          ...editor,
          ...item,
          isVisible: true
        };
      }
      editor.isVisible = false;
      return editor;
    });
    if (!hasOpen) {
      ideFileTabs.push({
        ...item,
        name,
        isVisible: true,
        id: uuidv4()
      });
    }

    history.push(item.path);
    return { ideFileTabs, history };
  }),
  // 移除编辑文件
  removeEditor: (path) => set((state) => {
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
      const edit = ideFileTabs.find(editor => editor.path === p);
      if (edit) {
        edit.isVisible = true;
      }
    }
    return { ideFileTabs, history };
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
  })
  // updateLints: (item) => set(() => ({
  //   lints: item
  // }))
});
