import {
  saveFile, autocomplete,
  fmt, decl, file, build, outline
} from '../api';
import { Base64 } from 'js-base64';
import { IdeStore } from '@ide/store';
import { FmtParam, IdeEventListener } from '@ide/types/ideEventListener';
import { AppStore } from '../store';
import { EditorOutLine } from '../store/outlineStore';
import { message } from 'tea-component';
const { encode } = Base64;

const ideEventListenerCreater = (ideStore:IdeStore, appStore: AppStore):IdeEventListener => ({
  onFileSave: async (editorTab, code, line, ch) => {
    let newCode = code;
    if (editorTab.fileType === 'go' && line && ch) {
      ideStore.updateAllEditor({
        lints: undefined
      });
      try {
        const fmtCode = await fmt?.({
          file: editorTab.path,
          code: encode(code),
          cursorLine: line - 1,
          cursorCh: ch
        });
        newCode = fmtCode.data.code || newCode;
      } catch (e: any) {
        message.error({ content: e.message });
      }
    }
    const data = await saveFile({ file: editorTab.path, code: encode(newCode) });
    if (data.retCode === 0) {
      build({
        file: editorTab.path,
        code: encode(newCode),
        nextCmd: '',
        contractName: appStore.contract.contractName || ''
      });
      return newCode;
    }
    throw Error(data.retMsg);
  },
  onFileAutoSave: async (editorTab, code) => {
    const data = await saveFile({ file: editorTab.path, code: encode(code) });
    if (data.retCode === 0) {
      build({
        file: editorTab.path,
        code: encode(code),
        nextCmd: '',
        contractName: appStore.contract.contractName || ''
      });
      return code;
    }
    throw Error(data.retMsg);
  },
  autocomplete: async (editor, code, line, ch) => {
    const options = await autocomplete({
      path: editor.path,
      code: encode(code),
      cursorLine: line - 1,
      cursorCh: ch
    });
    if (options && options[0] && options[1]) {
      return options[1].map((item: any) => ({
        type: item.type || 'constant',
        label: item.name,
        detail: item.class,
        info: item.package
      }));
    }
    return [];
  },
  fmt: async (param: FmtParam) => {
    const { retCode, retMsg, data } = await fmt({ ...param, code: encode(param.code) });
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      return data.code;
    }
  },
  decl: async (editor, code, line, ch) => {
    const { retCode, retMsg, data } = await decl({
      path: editor.path,
      code: encode(code),
      cursorLine: line - 1,
      cursorCh: ch
    });
    if (retCode !== 0) {
      throw new Error(retMsg);
    } else {
      if (data) {
        const nodeInfo = appStore.getTreeNode(data.path);
        ideStore.openEditor({
          path: data.path,
          name: data.path.match(/[^/]+$/)?.[0],
          editable: nodeInfo?.editable,
          action: {
            Line: data.cursorLine,
            Ch: data.cursorCh,
            type: 'cursor'
          }
        });
      }
    }
  },
  onGetFileContent: async (editorTab) => {
    const data = await file({ path: editorTab.path });
    if (data.retCode === 0 && data.data) {
      return data.data.content;
    }
    throw Error(data.retMsg);
  },
  onFileContentUpdate: async (editorTab, orgDoc) => {
    if (editorTab.fileType === 'go' && editorTab.id) {
      if (orgDoc) {
        const data = await outline({ code: encode(orgDoc) });
        const outlineInfo: EditorOutLine = {};
        outlineInfo[editorTab.id] = data.data;
        appStore.updateOutLine(outlineInfo);
      }
    }
  },
  onAddFontSize: async () => {
    if (appStore.fontSizes.length && ideStore.ideStyle.fontSize) {
      const index = appStore.fontSizes.indexOf(ideStore.ideStyle.fontSize as string);
      if (index !== -1 && index < appStore.fontSizes.length - 1) {
        ideStore.updateIdeStyle({
          fontSize: appStore.fontSizes[index + 1]
        });
      }
    }
  },
  onReduceFontSize: async () => {
    if (appStore.fontSizes.length && ideStore.ideStyle.fontSize) {
      const index = appStore.fontSizes.indexOf(ideStore.ideStyle.fontSize as string);
      if (index > 0) {
        ideStore.updateIdeStyle({
          fontSize: appStore.fontSizes[index - 1]
        });
      }
    }
  }
});
export default ideEventListenerCreater;
