import {
  AutocomplateRequest,
  BuildContractParam,
  BuildParam,
  CompileContractParam,
  DeclParam,
  FmtParam,
  IdeServer,
  PreferenceRequest,
  RenameFileParam,
  RunContractParam,
  SaveParam,
} from '@ide/types/ideServer';
import { TreeItem } from '@ide/types/tree';
import {
  autocomplete,
  build,
  contractCompile,
  contractHasBuild,
  contractInvokeAll,
  contractMethod,
  contractNames,
  contractRunBuild,
  decl,
  deployContract,
  deployContractList,
  exportFile,
  file,
  files,
  fmt,
  getContractFile,
  goModuleFiles,
  hasDeployContractList,
  importFiles,
  index,
  newContract,
  newFile,
  outline,
  preference,
  pullnotify,
  removeFile,
  renameFile,
  saveFile,
} from '../api';

function formatTree(files: any[]): TreeItem[] {
  return files.map((item) => {
    const { name, type, children, path, isGOAPI } = item;
    return {
      id: name + path,
      name: name ?? 'root',
      content: name ?? 'root',
      type: type === 'f' ? 'file' : 'folder',
      path,
      editable: !isGOAPI,
      children: children.length ? formatTree(children) : undefined,
    };
  });
}

const config = {
  pluginDownloadPage:
    'https://zxchain-wallet-1258344699.cos.ap-nanjing.myqcloud.com/chrome-extensions/debug/zxchain_wallet_chrome_extension_http.zip',
  requestPath: import.meta.env.VITE_API_HOST,
};

const timer: {
  [key: string]: any;
} = {
  output: undefined,
};

const server: IdeServer = {
  ...config,
  getInitData: async () => {
    const data = await index({});
    if (data.retCode === 0 && data?.data) {
      return data.data;
    } else {
      throw new Error(data.retMsg);
    }
    // return Promise.all([index({}),files({"hash":"","contractName":"nft"})])
  },
  getContractFiles: async (params: {
    contractName?: string;
    includeApi: boolean;
  }) => {
    const data = await files(params);
    if (data.retCode === 0 && data?.data) {
      return formatTree(data.data.children);
    } else {
      throw Error(data.message);
    }
  },
  goModuleFiles: async (contractName?: string) => {
    const data = await goModuleFiles({ contractName, includeApi: true });
    if (data.retCode === 0 && data?.data) {
      return formatTree([data.data]);
    } else {
      throw Error(data.message);
    }
  },
  getContractHasBuild: async (contractName?: string) => {
    const data = await contractHasBuild({ contractNames: [contractName] });
    if (data.retCode === 0 && data?.data) {
      return data.data[0];
    } else {
      throw new Error(data.retMsg);
    }
  },
  newFile: async (param: { path?: string; fileType?: 'd' | 'f' }) => {
    const data = await newFile(param);
    if (data.retCode === 0) {
      return data.data;
    }
    throw Error(data.retMsg);
  },
  getFileContent: async (path: string) => {
    const data = await file({ path });
    if (data.retCode === 0) {
      return data.data;
    }
    throw Error(data.retMsg);
  },
  saveFile: async (param: SaveParam) => {
    const data = await saveFile(param);
    if (data.retCode === 0) {
      return data.data;
    }
    throw Error(data.retMsg);
  },
  fileOutline: async (code: string) => {
    const data = await outline({ code });
    if (data.retCode === 0) {
      return data.data;
    }
    throw Error(data.retMsg);
  },
  removeFile: async (path: string) => {
    const data = await removeFile({
      path,
    });
    if (data.retCode === 0) {
      return data.data;
    }
    throw Error(data.retMsg);
  },
  renameFile: async (param: RenameFileParam) => {
    const data = await renameFile(param);
    if (data.retCode === 0) {
      return data.data;
    }
    throw Error(data.retMsg);
  },
  importFiles: async (param: FormData) => {
    const { retCode, data, retMsg } = await importFiles(param);
    if (retCode === 0) {
      return data;
    }
    throw Error(retMsg);
  },
  exportFile: async (path: string) => {
    const { retCode, data, retMsg } = await exportFile({ path });
    if (retCode === 0) {
      return data;
    }
    throw Error(retMsg);
  },
  queryDeployContractList: async () => {
    const data = await deployContractList({});
    if (data.retCode === 0 && data?.data) {
      return data.data;
    } else {
      throw new Error(data.retMsg);
    }
  },
  getContractNames: async () => {
    const { retCode, data } = await contractNames({});
    if (retCode === 0 && data?.length !== 0) {
      return data;
    } else {
      throw Error(data.message);
    }
  },
  getContractMethod: async (path: string) => {
    const { retCode, data } = await contractMethod({ path });
    if (retCode === 0 && data?.length !== 0) {
      return data;
    } else {
      throw Error(data.message);
    }
  },
  postContractRunBuild: async (param: BuildContractParam) => {
    const { retCode, data, retMsg } = await contractRunBuild(param);
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data;
    }
  },
  postContractInvokeAll: async (param: RunContractParam) => {
    const { retCode, data, retMsg } = await contractInvokeAll(param);
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data;
    }
  },
  postContractCompile: async (param: CompileContractParam) => {
    const { retCode, data, retMsg } = await contractCompile(param);
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data;
    }
  },
  getContractFile: async (path: string, needFile = true) => {
    const data = await getContractFile({ path });
    if (needFile) {
      const file = new File([data], path.match(/[^\\/]+$/)?.[0] ?? '-');
      return file;
    }
    return data;
  },
  deployContract: async (contractName: string) => {
    const { retCode, retMsg, data } = await deployContract({ contractName });
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data;
    }
  },
  hasDeployContractList: async () => {
    const { retCode, retMsg, data } = await hasDeployContractList({});
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data;
    }
  },
  preference: async (params: PreferenceRequest) => {
    const { retCode, retMsg, data } = await preference(params);
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data;
    }
  },
  pullnotify: async () => {
    const { retCode, retMsg, data } = await pullnotify({});
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data;
    }
  },
  addOutputListener: (output) => {
    clearTimeout(timer.output);
    const listen = () => {
      pullnotify({}).then(({ retCode, retMsg, data }) => {
        if (retCode !== 0) {
          throw new Error(retMsg);
        } else {
          output(data);
        }
      });
      timer.output = setTimeout(listen, 6000);
    };
    listen();
  },
  removeOutputListener: () => {
    clearTimeout(timer.output);
  },
  autocomplete: async (param: AutocomplateRequest) => {
    const options = await autocomplete(param);
    if (options && options[0] && options[1]) {
      return options[1].map((item: any) => ({
        type: item.type || 'constant',
        label: item.name,
        detail: item.class,
        info: item.package,
      }));
    }
    return [];
  },
  newContract: async (contractName: string) => {
    const { retCode, retMsg, data } = await newContract({ contractName });
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data;
    }
  },
  build: async (param: BuildParam) => {
    return await build(param);
  },
  fmt: async (param: FmtParam) => {
    const { retCode, retMsg, data } = await fmt(param);
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data.code;
    }
  },
  pluginIsReady: async () => {
    return Boolean((window as any).zxChain);
  },
  pluginRequest: async (param: any) => {
    return (window as any).zxChain.request(param);
  },
  pluginIsConnected: () => {
    return !!(window as any).zxChain.selectedAddress;
  },
  decl: async (param: DeclParam) => {
    const { retCode, retMsg, data } = await decl(param);
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data;
    }
  },
  getDownloadPath: async (name: string) => {
    return `${
      import.meta.env.VITE_API_HOST
    }api/v1/ide/file/getContractFile?path=${name}`;
  },
};
export default server;
