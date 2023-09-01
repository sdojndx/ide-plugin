import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorState, Compartment, EditorSelection } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { StreamLanguage } from '@codemirror/language';
import { BASIC_SETUP } from './basicSetup';

// import { javascript } from '@codemirror/lang-javascript'
import { javascript } from '@codemirror/legacy-modes/mode/javascript';
import { go } from './go';
import { EditorItem } from '@ide/store/editorStore';
// import { oneDarkTheme } from '@codemirror/theme-one-dark'
import theme from './theme';
import { autocompletion } from '@codemirror/autocomplete';
import { linter, lintGutter } from '@codemirror/lint';
// import { foldGutter } from '@codemirror/fold'
import keyMap from './keyMap';
import completionSource from './autoCompletion';
import { getLineAndChByPos, getPostByLineAndCh } from './tools';
import { outLint } from './lint';
import { useIdeStore } from '@ide/store';
import { useServerStore } from '@ide/store/serverStore';

export const FILE_TYPES: string[] = [
  'go', 'txt', 'md', 'mod', 'sum', 'java', 'sol', 'crt', 'pem', 'key', 'yml'
];
const fileTypeMap: any = {};
FILE_TYPES.forEach(item => {
  fileTypeMap[item] = javascript;
});

export default function CodeMirrorEditor({
  editor,
  className,
  style
}: {
  editor: EditorItem;
  className?: string;
  style?: React.CSSProperties;
}) {
  const dom = useRef<HTMLDivElement | null>(null);
  const editorView = useRef<EditorView | null>(null);
  const [hasLoadFile, setHasLoadFile] = useState<boolean>(false);
  const { editorTheme, removeEditor, updateEditor, autoSaveSpace } = useIdeStore();
  const { ideEventListener } = useServerStore();
  // 服务器端代码缓存
  const [orgDoc, setOrgDoc] = useState<string>('');
  const themeConfig = useRef<Compartment>(new Compartment());
  const keyConfig = useRef<Compartment>(new Compartment());
  const autocompleteConfig = useRef<Compartment>(new Compartment());
  const lintsConfig = useRef<Compartment>(new Compartment());
  const langConfig = useRef<Compartment>(new Compartment());
  const { ideStyle } = useIdeStore();
  const [typeMap] = useState({
    ...fileTypeMap,
    go
  });
  const editorStyle: React.CSSProperties = useMemo(() => {
    return {
      ...style,
      ...ideStyle
    };
  }, [style, ideStyle]);
  const updateConfig = useRef<Compartment>(new Compartment());
  const editorableConfig = useRef<Compartment>(new Compartment());
  useEffect(() => {
    const state = EditorState.create({
      doc: '',
      extensions: [
        ...BASIC_SETUP,
        lintGutter(),
        updateConfig.current.of(EditorView.updateListener.of(() => {
        })),
        editorableConfig.current.of(EditorView.editable.of(true)),
        EditorState.allowMultipleSelections.of(false),
        autocompleteConfig.current.of(autocompletion(ideEventListener?.autocomplete
          ? {
            override: [completionSource({
              getAutoComplate: ideEventListener.autocomplete,
              editor
            })]
          }
          : undefined)),
        langConfig.current.of(StreamLanguage.define(typeMap[(editor.fileType as keyof typeof typeMap)])),
        keyConfig.current.of(keyMap(editor)),
        themeConfig.current.of((theme as any)[editorTheme] || theme.vscodeDark),
        lintsConfig.current.of(linter(() => ([])))]
    });
    const view = new EditorView({
      state,
      parent: dom.current || undefined
    });
    editorView.current = view;
    return () => {
      view.destroy();
    };
  }, []);
  // 检测是否可编辑
  useEffect(() => {
    getFile();
    if (editorView.current && editor.editable !== undefined) {
      editorView.current?.dispatch({
        effects: editorableConfig.current.reconfigure(EditorView.editable.of(editor.editable))
      });
    }
  }, [editorView, editor.editable]);
  // 更新主题
  useEffect(() => {
    if (editorView.current) {
      editorView.current?.dispatch({
        effects: themeConfig.current.reconfigure((theme as any)[editorTheme])
      });
    }
  }, [editorTheme]);
  // 获取文件方法函数目录
  // const updateOutline = useCallback((code: string) => {
  //   if (code) {
  //     ideEventListener?.onGoFileOpen?.(code).then(res => {
  //       updateEditor(editor.path, {
  //         outline: res
  //       });
  //     });
  //   } else {
  //     updateEditor(editor.path, {
  //       outline: undefined
  //     });
  //   }
  // }, []);
  // 获取文件内容和目录
  const getFile = useCallback(() => {
    if (!editorView.current || !ideEventListener) {
      return;
    }
    ideEventListener?.onGetFileContent?.(editor).then(res => {
      setOrgDoc(res);
      editorView.current?.dispatch({
        changes: { from: 0, to: editorView.current.state.doc.length, insert: res }
      });
      setHasLoadFile(true);
    }).catch(() => {
      removeEditor(editor.path);
    });
  }, [editor.path]);
  const close = useCallback(() => {
    removeEditor(editor.path);
  }, [editor.path]);
  // 自动保存函数
  const saveFile = useCallback(async () => {
    if (!editorView.current || !ideEventListener?.onFileAutoSave || !editor.hasUnSave) {
      return;
    }
    const code = editorView.current.state.doc.toString() || '';
    const pos = editorView.current.state.selection.ranges[0].from;
    const { line, ch } = getLineAndChByPos(code, pos);
    const newCode = await ideEventListener.onFileAutoSave?.(editor, code, line, ch);
    if (newCode && newCode !== code) {
      editorView.current?.dispatch({
        changes: { from: 0, to: editorView.current.state.doc.length, insert: newCode }
      });
    }
    setOrgDoc(newCode || code);
  }, [editor.hasUnSave, editorView]);
  /**
   * 保存文件函数
   *
   * doNotCheck 是否校验是否有修改 true 为不校验，默认未校验
   *   */
  const save = useCallback(async () => {
    if (!editorView.current || !ideEventListener?.onFileSave || !editor.hasUnSave) {
      return;
    }
    const code = editorView.current.state.doc.toString() || '';
    const pos = editorView.current.state.selection.ranges[0].from;
    const { line, ch } = getLineAndChByPos(code, pos);

    // ideEventListener?.onFileSave?.(editor, code, line, ch);
    const newCode = await ideEventListener.onFileSave?.(editor, code, line, ch);
    // console.log(newCode);
    if (newCode && newCode !== code) {
      editorView.current?.dispatch({
        changes: { from: 0, to: editorView.current.state.doc.length, insert: newCode }
      });
    }
    setOrgDoc(newCode || code);
  }, [editor.hasUnSave]);

  // 更新文件是否修改过校验
  useEffect(() => {
    if (!editorView.current) {
      return;
    }
    editorView?.current?.dispatch({
      effects: updateConfig.current.reconfigure(EditorView.updateListener.of((info) => {
        const { state, docChanged } = info;
        if (docChanged) {
          updateEditor(editor.path, {
            hasUnSave: state.doc.toString() !== orgDoc
          });
        }
      }))
    });
    updateEditor(editor.path, {
      hasUnSave: editorView.current.state.doc.toString() !== orgDoc
    });
  }, [orgDoc]);
  // 更新文件目录和构建
  useEffect(() => {
    if (!hasLoadFile) {
      return;
    }
    ideEventListener?.onFileContentUpdate?.(editor, orgDoc);
  }, [orgDoc, hasLoadFile, editor.id]);
  // 更新校验
  const decl = useCallback((event?: MouseEvent) => {
    if (!event || !editorView.current || !ideEventListener?.decl) {
      return;
    }
    const code = editorView.current.state.doc.toString() || '';
    const pos = editorView.current.posAtCoords({ x: event.clientX, y: event.clientY });
    if (!pos) {
      return;
    }
    const word = code.slice(pos - 1, pos);
    if (!/[a-z|A-Z]/.test(word)) {
      return;
    }
    const { line, ch } = getLineAndChByPos(code, pos || 0);
    ideEventListener.decl(editor, code, line, ch);
  }, [editorView, editor.path]);
  // 绑定热键函数
  useEffect(() => {
    if (!editorView.current) {
      return;
    }
    const option = {
      save,
      decl,
      close
    };
    editorView.current.dispatch({
      effects: keyConfig.current.reconfigure(keyMap(editor, option))
    });
  }, [save, decl, close, editorView]);

  // 更新错误提示行信息
  // const editorLints = useMemo(() => {
  //   return lints[editor.path];
  // }, [editor.path, lints]);

  useEffect(() => {
    if (!editorView.current) {
      return;
    }
    // const select = editorView.current.state.selection
    editorView.current.dispatch({
      // selection: editorView.current.state.selection,
      effects: lintsConfig.current.reconfigure(outLint(editor.lints || []))
    });
  }, [editorView, editor.lints]);

  useEffect(() => {
    // console.log([getFile, hasLoadFile, editor.action]);
    if (!hasLoadFile || !editor.action) {
      return;
    }
    const code = editorView.current?.state.doc.toString() || '';
    switch (editor.action.type) {
      case 'cursor':
        editorView.current?.dispatch({
          // selection: { anchor: 100, head: 100 }
          selection: EditorSelection.cursor(getPostByLineAndCh(code, editor.action.Line, editor.action.Ch)),
          scrollIntoView: true
        });
        editorView.current?.focus();
        break;
      case 'updateCode':
        getFile();
        break;
      case 'saveFile':
        save();
        break;
      default:
        break;
    }
  }, [hasLoadFile, editor.action]);

  useEffect(() => {
    if (!ideEventListener?.onFileAutoSave) {
      return;
    }
    const timer = setTimeout(() => {
      saveFile();
    }, autoSaveSpace);
    return () => clearTimeout(timer);
  }, [saveFile, ideEventListener?.onFileAutoSave]);

  // useImperativeHandle(refs, () => ({
  //   save
  // }));

  return (
    <div style={editorStyle} className={className} ref={dom}></div>
  );
};
