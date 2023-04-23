import theme from '@ide/components/codeEditor/theme';

export interface BuildContractParam {
  contractName: string;
  crossInvoke: boolean;
  crossInvokeContractNameList: string[];
}

export interface RunContractParam extends BuildContractParam {
  contractMethod: string;
  args?: { [key: string]: string };
  globalStates?: { [key: string]: string };
}

export interface CompileContractParam {
  path: string;
  platform: 'linux_amd64'
}

export interface DeployContractListResponse {
  buildTime: string;
  contractName: string;
  path: string;
  projectName: string;
  hash: string;
}

export interface HasDeployContractListResponse {
  contractName: string;
  date: string;
  methods: Array<string>;
  projectName: string;
  contractAddr: string;
}

export interface PreferenceRequest {
  locale?: string;
  go_format?: string;
  go_build_args?: string;
  font_family?: string;
  font_size?: string;
  theme?: string;
  keymap?: string;
  editor_font_family?: string;
  editor_font_size?: string;
  line_height?: string;
  editor_theme?: keyof typeof theme;
  tab_size?: string;
}

export interface AutocomplateRequest {
  path: string;
  code: string;
  cursorLine: number;
  cursorCh: number;
}

export interface SaveParam {
  file: string;
  code: string;
}

export type BuildParam = SaveParam & {
  nextCmd: ''
};

export interface FmtParam {
  file: string;
  code: string;
  cursorLine: number;
  cursorCh: number;
}
export interface NewFileParam {
  path?: string;
  fileType?: 'd' | 'f';
}
export interface RenameFileParam {
  oldPath: string, newPath: string
}
export interface SaveFileParam {
  file: string;
  code: string
}

export interface NotifyMsg {
  timestamp: number;
  info: string;
  uuid: string;
}
export interface OutputResponse {
  msgList: NotifyMsg[];
  lastTimestamp: number;
}

export type DeclParam = AutocomplateRequest;

export interface IdeServer {
  /**
   * 获取ide初始化数据,用户配置信息
   */
  getInitData?: () => Promise<any>;
  /**
   * 获取合约的文件目录数据
   */
  getContractFiles?: (param: { contractName: string; includeApi: boolean; }) => Promise<any>;
  /**
   * 获取文件7z
   * @param path
   * @param needFile
   * @returns
   */
  getContractFile?: (path: string, needFile?: boolean) => Promise<any>;
  /**
   * 合约deploy
   * @param contractName
   * @returns
   */
  deployContract?: (param: { contractName: string; hash: string }) => Promise<any>;
  /**
   * 拉取信息
   * @returns
   */
  pullnotify?: () => Promise<any>;
  /**
   * 添加消息监听
   * @param fn
   * @returns
   */
  addOutputListener?: (fn: (param: OutputResponse) => void) => void;
  /**
   * 清除消息监听
   * @returns
   */
  removeOutputListener?: () => void;
  /**
   * 获取合约的依赖目录数据
   */
  goModuleFiles?: (contractName: string) => Promise<any>;
  /**
   * 获取文件内容
   * @param path 文件路径
   * @returns
   */
  getFileContent?: (path: string) => Promise<any>;
  /**
   * 获取合约是否build
   */
  getContractHasBuild?: (contractName: string) => Promise<any>;
  /**
   * 新建文件和文件夹
   */
  newFile?: (param: NewFileParam) => Promise<any>;
  /**
   * 删除文件和文件夹
   */
  removeFile?: (path: string) => Promise<any>;
  /**
   * 重命名
   */
  renameFile?: (param: RenameFileParam) => Promise<any>;
  /**
   * 保存文件
   */
  saveFile?: (param: SaveFileParam) => Promise<any>;
  /**
   * 导入文件
   */
  importFiles?: (param: FormData) => Promise<any>;
  exportFile?: (path: string) => Promise<any>;
  /**
   * 获取文件目录
   */
  fileOutline?: (code: string) => Promise<any>;
  // 已编译合约列表查询
  queryDeployContractList?: () => Promise<any>;
  /**
   * 自动补全
   */
  autocomplete?: (param: AutocomplateRequest) => Promise<any>;
  /**
   * 构建文件
   * @param param
   * @returns
   */
  build?: (param: BuildParam) => Promise<any>;
  /**
   * 美化代码
   * @param param
   * @returns
   */
  fmt?: (param: FmtParam) => Promise<any>;
  /**
   * 检查是否安装插件
   * @returns
   */
  pluginIsReady: () => Promise<boolean>;
  /**
   * 插件调用
   * @param param
   * @returns
   */
  pluginRequest: (param: any) => Promise<any>;
  /**
   * 检测插件是否已连接
   * @returns 插件是否已连接
   */
  pluginIsConnected: () => boolean;
  /**
   * 获取已部署合约
   * @returns
   */
  hasDeployContractList: () => Promise<any>;
  /**
   * 合约编译
   * @param param
   * @returns
   */
  postContractCompile: (param: CompileContractParam) => Promise<any>;
  /**
   * 获取项目名称列表
   * @returns
   */
  getContractNames: () => Promise<any>;
  /**
   * 获取合约方法列表
   * @param path
   * @returns
   */
  getContractMethod: (path: string) => Promise<any>;
  /**
   * 构建合约
   * @param param
   * @returns
   */
  postContractRunBuild: (param: BuildContractParam) => Promise<any>;
  /**
   * 执行合约
   * @param param
   * @returns
   */
  postContractInvokeAll: (param: RunContractParam) => Promise<any>;
  /**
   * 切换到引用
   * @param param
   * @returns
   */
  decl: (param: DeclParam) => Promise<any>;
  /**
   * 更新设置
   * @param params
   * @returns
   */
  preference?: (params: PreferenceRequest) => Promise<any>;
  /**
   * 新建合约
   */
  newContract?: (contractName: string) => Promise<any>;
  /**
   * 获取用户信息
   * @param name
   * @returns
   */
  getDownloadPath?: (name: string) => Promise<string>;
  checkEditorAble?: (path: string) => Promise<boolean>;
  /**
   * 插件下载地址
   */
  pluginDownloadPage?: string;
  /**
   * 请求地址
   */
  requestPath?: string;
}
