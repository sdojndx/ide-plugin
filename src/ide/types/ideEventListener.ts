import theme from '@ide/components/codeEditor/theme';
import { EditorItem } from '@ide/store/editorStore';

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
  nextCmd: '';
  contractName: string;
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
export interface DeclParam {
  path: string;
  code: string;
  cursorLine: number;
  cursorCh: number;
}
export interface AutocompleteData{
  type: string;
  label: string;
  detail: string;
  info: string;
}

export interface IdeEventListener {
  /**
   * 保存文件
   * @param editorTab  当前编辑tab信息
   * @param doc 保存文件内容
   * @returns
   */
  onFileSave?: (editorTab:EditorItem, doc: string, cursorLine?: number, cursorCh?: number) => Promise<string|undefined>;
  /**
   * 自动保存文件，不设置则不自动保存
   * @param editorTab  当前编辑tab信息
   * @param doc 保存文件内容
   * @returns
   */
  onFileAutoSave?: (editorTab:EditorItem, doc: string, cursorLine?: number, cursorCh?: number) => Promise<string|undefined>;
  /**
   * 接入自动补全
   */
  autocomplete?: (editorTab:EditorItem, doc: string, cursorLine: number, cursorCh: number) => Promise<AutocompleteData[]>;
  /**
   * 美化代码
   * @param param
   * @returns
   */
  fmt?: (param: FmtParam) => Promise<any>;
  /**
   * 接入切换到引用文件位置快捷键， tab+鼠标左键点击调用位置触发
   * @param param
   * @returns
   */
  decl?: (editorTab:EditorItem, doc: string, cursorLine: number, cursorCh: number) => Promise<any>;
  /**
   * 获取当前编辑页面的代码内容
   * @param editorTab  当前编辑tab信息
   * @returns  当前编辑文件内容
   */
  onGetFileContent:(editorTab: EditorItem) => Promise<string>;
  /**
   * 当文件内容（不包括未报错） 变化时触发
   * @param editorTab  当前编辑tab信息
   * @param orgDoc 文件内容
   * @returns
   */
  onFileContentUpdate: (editorTab:EditorItem, orgDoc: string) => void;
  /**
   * 点击字体扩大按钮
   * @returns
   */
  onAddFontSize?: ()=>void;
  /**
   * 点击字体缩小按钮
   * @returns
   */
  onReduceFontSize?: ()=>void;
}
