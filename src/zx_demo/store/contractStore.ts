import { TreeItem } from '@/zx_demo/types/tree';
import { StateCreator } from 'zustand';
import { AppStore } from '.';
import { AppServer } from '../types/appServer';
import appServer from '../api/appServer';

/**
 * 存储合约信息
 */
interface ContractData {
  hasBuild?: boolean;
  contract: {
    contractName?: string;
    path?: string;
    projectName?: string;
  };
  // action?: number;
  refreshFiles: boolean;
  // 合约本身的文件目录
  files: TreeItem[];
  // 合约依赖的文件目录
  modelFiles: TreeItem[];
  fileTree: TreeItem[];
  user: {
    id?: string | number;
    name?:string
  };
  activeTreeNode?: TreeItem;
}

const initDate = {
  hasBuild: false,
  contract: {},
  refreshFiles: false,
  files: [],
  modelFiles: [],
  fileTree: [],
  user: {}
};
function getTotalTree(files: TreeItem[], modelFiles: TreeItem[]) {
  const tree = files?.slice();
  const lib = tree?.find((item) => (item.name === 'External Libraries'));
  if (lib?.children && modelFiles?.[0]) {
    lib.children[1] = modelFiles[0];
  }
  return tree;
}
export type ContractDataStore = ContractData & {
  setHasBuild: (type?: boolean) => void;
  setContract: (contract: ContractData['contract']) => void;
  getHasBuild: (api: AppServer['getContractHasBuild'], param?: string) => void;
  getFiles: () => Promise<any>;
  getGoModuleFiles: () => void;
  setUser: (user:ContractData['user']) => void;
  /**
   * 设置当前选中的目录树节点
   * @param item 选中节点信息
   * @returns
   */
  setActiveTreeNode: (item: TreeItem) => void;
  getTreeNode:(path: string) => TreeItem|undefined;
};

const getTreeNode = (path: string, tree: TreeItem[]): TreeItem | undefined => {
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
  return undefined;
};

export const contractStore: StateCreator<ContractDataStore> = (set, get) => ({
  ...initDate,
  setHasBuild: (type) => set((state) => ({
    ...state,
    hasBuild: type
  })),
  setContract: (contract) => set((state) => ({
    ...state,
    contract
  })),
  getHasBuild: async (api, param) => {
    const stat = get();
    const cName = stat.contract.contractName || param;
    if (!cName) {
      return;
    }
    const res = await api?.(cName);
    if (typeof res === 'boolean') {
      set({
        hasBuild: res
      });
    }
  },
  getFiles: async () => {
    const stat = get() as AppStore;
    if (!stat.contract.contractName) {
      return;
    }
    const res = await appServer.getContractFiles?.({ contractName: stat.contract.contractName, includeApi: true });
    if (res) {
      const obj: any = { files: res };
      if (stat.modelFiles) {
        obj.fileTree = getTotalTree(res, stat.modelFiles);
      }
      if (res[0]?.children?.[0]?.id && stat.contract.path !== res[0].path) {
        const newContract = {
          ...stat.contract,
          path: res[0].path
        };
        if (res[0].name) {
          newContract.projectName = res[0].name;
        }
        obj.contract = newContract;
      }
      set(obj);
    }
  },
  getGoModuleFiles: async () => {
    const stat = get() as AppStore;
    if (!stat.contract.contractName) {
      return;
    }
    const res = await appServer.goModuleFiles?.(stat.contract.contractName);
    if (res) {
      const obj: any = { modelFiles: res };
      if (stat.files) {
        obj.fileTree = getTotalTree(get().files, res);
      }
      set(obj);
    }
  },
  setUser: (user) => set(() => ({
    user
  })),
  setActiveTreeNode: (item) => set(() => {
    return { activeTreeNode: item };
  }),
  getTreeNode: (path) => {
    const stat = get() as AppStore;
    const node = getTreeNode(path, stat.files);
    return node;
  }
});
