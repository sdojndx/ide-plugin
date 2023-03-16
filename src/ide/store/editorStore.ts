// import { Pick } from '@ide/types/common'
import { TreeItem } from '@ide/types/tree';
import { StateCreator } from 'zustand';
import { IdeStore } from '.';
import { v4 as uuidv4 } from 'uuid';

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

export interface Lint {
  lineNo: string;
  file: string;
  severity: 'info' | 'warning' | 'error';
  msg: string;
}

/**
 * 存储编辑文件信息
 */
export interface EditorItemProp {
  /**
     * 手动添加一个本地的编辑文件唯一标识，防止重命名时编辑区数据丢失
     */
  id: string;
  editable?: boolean;
  path: string;
  isVisible?: boolean;
  action?: {
    Line: number,
    Ch: number,
    type: 'cursor';
  } | {
    v: number,
    type: 'update'
  };
  lints?: Lint[],
  name?: string;
  fileType?: string;
  hasUnSave?: boolean;
  outline?: OutlineResponse;
}
export type EditorItem = Omit<EditorItemProp, 'id'> & {
  id?: string;
};

type EditorItemPartial = Partial<EditorItem>;

interface EditorData {
  editors: EditorItemProp[];
  lints: {
    [key: string]: Lint[]
  };
  history: string[];
  activeTreeNode?: EditorItem;
}

const initDate = {
  editors: [],
  history: [],
  lints: {}
};

export type EditorStore = EditorData & {
  setEditors: (ls: EditorItemProp[]) => void;
  updateEditor: (path: string, item: EditorItemPartial) => void;
  updateAllEditor: (item: Pick<EditorItem, 'lints'>) => void;
  openEditor: (item: EditorItem) => void;
  removeEditor: (path: string) => void;
  setActiveTreeNode: (item: EditorItem) => void;
  updateLints: (item: EditorData['lints']) => void;
};

const getTreeNode = (path: string, tree: TreeItem[]): TreeItem | null => {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (item.path === path) {
      return item;
    }
    if (item.children) {
      const node = getTreeNode(path, item.children);
      if (node) {
        return node;
      }
    }
  }
  return null;
};

export const editorStore: StateCreator<EditorStore> = (set) => ({
  ...initDate,
  setEditors: (ls) => set((state) => ({
    ...state,
    editors: ls
  })),
  // 打开并切换当前编辑文件
  openEditor: (item) => set((state) => {
    const editorlist = state.editors;
    const history = state.history.slice();
    let hasOpen = false;
    const name = item.name || item.path.match(/[^/]+$/)?.[0];
    item.fileType = item.path.match(/[^.]+$/)?.[0];
    const stat = state as IdeStore;
    // 获取文件对应节点属性
    const node = getTreeNode(item.path, stat.files);
    const editors = editorlist.map(editor => {
      if (editor.path === item.path) {
        hasOpen = true;
        return {
          ...editor,
          ...item,
          name: editor.name || name,
          isVisible: true,
          editable: node?.editable
        };
      }
      editor.isVisible = false;
      return editor;
    });
    if (!hasOpen) {
      editors.push({
        ...item,
        name,
        isVisible: true,
        editable: node?.editable,
        id: uuidv4()
      });
    }

    history.push(item.path);
    return { editors, history };
  }),
  // 移除编辑文件
  removeEditor: (path) => set((state) => {
    const editors = state.editors.slice();
    const history = state.history.slice();
    const index = editors.findIndex(editor => editor.path === path);
    if (index === -1) {
      return {
        editors, history
      };
    }
    editors.splice(index, 1);
    for (let i = history.length; i >= 0; i--) {
      if (path === history[i]) {
        history.splice(i, 1);
      }
    }
    const editor = editors.find(editor => editor.isVisible);
    if (!editor) {
      const p = history[history.length - 1];
      const edit = editors.find(editor => editor.path === p);
      if (edit) {
        edit.isVisible = true;
      }
    }
    return { editors, history };
  }),
  // 文件名变化情况下 更新编辑文件
  updateEditor: (path, item) => set((state) => {
    const editorlist = state.editors;
    if (item.path) {
      item.fileType = item.path.match(/[^.]+$/)?.[0];
      item.name = item.name || item.path.match(/[^/]+$/)?.[0];
    }
    const editors = editorlist.map(editor => {
      if (editor.path === path) {
        return {
          ...editor,
          ...item
        };
      }
      return editor;
    });
    return { editors };
  }),
  // 批量更新所以在编辑文件
  updateAllEditor: (item) => set((state) => {
    const editorlist = state.editors;
    const editors = editorlist.map(editor => {
      return {
        ...editor,
        ...item
      };
    });
    return { editors };
  }),
  setActiveTreeNode: (item) => set(() => {
    return { activeTreeNode: item };
  }),
  updateLints: (item) => set(() => ({
    lints: item
  }))
});
