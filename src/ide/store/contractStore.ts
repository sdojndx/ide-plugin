import { IdeServer } from '@ide/types/ideServer';
import { TreeItem } from '@ide/types/tree';
import { StateCreator } from 'zustand';
import { IdeStore } from '.';

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
  files: TreeItem[];
  modelFiles: TreeItem[];
  fileTree: TreeItem[];
  userId: string | number;
}

const initDate = {
  hasBuild: false,
  contract: {},
  refreshFiles: false,
  files: [],
  modelFiles: [],
  fileTree: [],
  userId: ''
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
  getHasBuild: (api: IdeServer['getContractHasBuild'], param?: string) => void;
  getFiles: () => Promise<any>;
  getGoModuleFiles: () => void;
  setUserId: (id: string | number) => void;
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
    const stat = get() as IdeStore;
    if (!stat.contract.contractName) {
      return;
    }
    const res = await stat.server?.getContractFiles?.({ contractName: stat.contract.contractName, includeApi: true });
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
    const stat = get() as IdeStore;
    if (!stat.contract.contractName) {
      return;
    }
    const res = await stat.server?.goModuleFiles?.(stat.contract.contractName);
    if (res) {
      const obj: any = { modelFiles: res };
      if (stat.files) {
        obj.fileTree = getTotalTree(get().files, res);
      }
      set(obj);
    }
  },
  setUserId: (id) => set(() => ({
    userId: id
  }))
});
