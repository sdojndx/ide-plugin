zxchain-ide

# 支持主题切换

对于需要支持主题切换的样式，书写在了 src/pages/ide/theme.less 内，主题改变的颜色设计成参数。

# 功能列表

## 顶部导航栏
## 侧面功能栏及目录树对应功能
## 底部日志控制台、事件列表、世界态开发
## 编辑器，热键及多标签
## 方法列表

#### mac系统

* ctrl + q ：关闭当前编译器
* command + c：复制选中内容
* command+ v：粘贴所复制到内容
* command + f：查找替换功能
* command + e：删除当前行
* command + s：格式化并保存当前编译器文件
* command + shift + left ：向左选中本行
* command + shift + right ：向左选中本行
* command + shift + up ：向上方选择
* command + shift + down ：向下方选择
* command + shift + f ：格式化
* ctrl + 鼠标左键：跳转到函数方法详情
* pageup ：向上翻页
* pagedown : 向下翻页
* command + a: 全选
* command + [: 缩小选中行缩进
* command + ]: 放大选中行缩进
* command + /: 注释选中行
* ctrl+b: 光标左移
* ctrl+f: 光标右移
* ctrl+p: 光标上移
* ctrl+n: 光标下移
* ctrl+a： 光标移至最左边
* ctrl+e： 光标移至最右边
* ctrl+d： 向右删除
* ctrl+h： 向左删除
* ctrl+k： 删除光标右侧本行内容
* ctrl+o： 光标后方内容拆分到新行

#### windows系统


* ctrl + q ：关闭当前编译器
* command + c：复制选中内容
* command+ v：粘贴所复制到内容
* command + f：查找替换功能
* command + e：删除当前行
* command + s：格式化并保存当前编译器文件
* command + shift + left ：向左选中本行
* command + shift + right ：向左选中本行
* command + shift + up ：向上方选择
* command + shift + down ：向下方选择
* command + shift + f ：格式化
* ctrl + 鼠标左键：跳转到函数方法详情
* pageup ：向上翻页
* pagedown : 向下翻页
* ctrl + a: 全选
* ctrl + [: 缩小选中行缩进
* ctrl + ]: 放大选中行缩进
* ctrl + /: 注释选中行
* ctrl+b: 光标左移
* ctrl+f: 光标右移
* ctrl+p: 光标上移
* ctrl+n: 光标下移
* ctrl+a： 光标移至最左边
* ctrl+e： 光标移至最右边
* ctrl+d： 向右删除
* ctrl+h： 向左删除
* ctrl+k： 删除光标右侧本行内容
* ctrl+o： 光标后方内容拆分到新行

## CI配置

``` shell

# 构建包 
$ npm run build

# 运行至信链测试环境
# 至信链测试环境需要配置whistle
# zxchain-ide-test-8fs5zjh23d8ab25-1258344699.tcloudbaseapp.com localhost:5176
#
$ npm run test

# 启动文档开发
$ npm run storybook


# 打包文档
$ npm run build-storybook

```

## 引入方式

``` javascript

import {IdeComponent} from 'ide-plugin-component';

<IdeComponent
  rightContentWidth={400}
  headerContent={<IdeHeader/>} 
  leftContent={<FileNav/>}
  rightContent={<IdeGuide/>}
  bottomContent={<BottomConsole />}
  ideEventListener={ideEventListener}/>

// 参数说明

{
  /**
   * ide顶部模块
   */
  headerContent?: React.ReactNode;
  /**
   * ide组件的事件监听函数
   * @returns
   */
  ideEventListener: IdeEventListener,
  userId?: string | number;
  /**
   * 左导航模块,如果不传则页面不展示这个模块 （可切换的导航）
   */
  leftNavMenuContent?: React.ReactNode;
  /**
   * 左导航功能区模块 （一般为随左导航切换的功能区域）
   */
  leftContent?: React.ReactNode;
  /**
   * 左导航功能区模块默认宽度
   */
  leftNavContentWidth?: number;
  /**
   * 编辑区右侧区域模块
   */
  rightContent?: React.ReactNode;
  /**
   * 编辑区右侧区域模块宽度
   */
  rightContentWidth?: number;
  /**
   *  底部日志区域模块，不传则不展示
   */
  bottomContent?: React.ReactNode;
  /**
   * 底部日志区域模块默认高度
   */
  bottomContentHeight?: number;
  /**
   * 自动保存的时间间隔
   */
  autoSaveSpace?: number;
}

// IdeEventListener 结构

{
  /**
   * 保存文件
   * @param editorTab  当前编辑tab信息
   * @param doc 保存文件内容
   * @returns 空或者保存的文件内容（中间可能发生了代码各式化,返回空则编辑区域保持原来保存内容，如果返回字符串将覆盖编辑区内容）
   */
  onFileSave?: (editorTab:EditorItem, doc: string, cursorLine?: number, cursorCh?: number) => Promise<string|undefined>;
  /**
   * 自动保存文件，不设置则不自动保存
   * @param editorTab  当前编辑tab信息
   * @param doc 保存文件内容
   * @returns 空或者保存的文件内容（中间可能发生了代码各式化,返回空则编辑区域保持原来保存内容，如果返回字符串将覆盖编辑区内容）
   */
  onFileAutoSave?: (editorTab:EditorItem, doc: string, cursorLine?: number, cursorCh?: number) => Promise<string|undefined>;
  /**
   * 接入自动补全
   * @param editorTab  当前编辑tab信息
   * @param cursorLine 光标所在的行
   * @param cursorCh 光标所在行的具体位置
   * @param doc 保存文件内容
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
   * @param editorTab  当前编辑tab信息
   * @param cursorLine 光标所在的行
   * @param cursorCh 光标所在行的具体位置
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
   * 当文件内容保存时触发
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

// ide数据通过 引入useIdeStore 的方法操作

// 例如

import {useIdeStore} from 'ide-plugin-component';
const ideStore = useIdeStore();
ideStore.clearEditor();

```
