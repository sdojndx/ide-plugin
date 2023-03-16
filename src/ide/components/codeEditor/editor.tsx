import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { EditorState, Compartment, EditorSelection } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { StreamLanguage } from '@codemirror/language';
import { basicSetup } from 'codemirror';

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
import useIdeStore from '@ide/store';
import { message } from 'tea-component';
export default forwardRef(function CodeMirrorEditor({
  editor,
  className,
  style
}: {
  editor: EditorItem;
  className?: string;
  style?: React.CSSProperties;
}, refs) {
  const dom = useRef<HTMLDivElement | null>(null);
  const editorView = useRef<EditorView | null>(null);
  const [hasLoadFile, setHasLoadFile] = useState<boolean>(false);
  const { server, removeEditor, updateEditor, openEditor, updateLints, lints } = useIdeStore();
  // 服务器端代码缓存
  const [orgDoc, setOrgDoc] = useState<string>('');
  const themeConfig = useRef<Compartment>(new Compartment());
  const keyConfig = useRef<Compartment>(new Compartment());
  const autocompleteConfig = useRef<Compartment>(new Compartment());
  const lintsConfig = useRef<Compartment>(new Compartment());
  const langConfig = useRef<Compartment>(new Compartment());
  const { setting } = useIdeStore();
  const [typeMap] = useState({
    go,
    sum: javascript,
    mod: javascript,
    js: javascript
  });
  const editorStyle: React.CSSProperties = useMemo(() => {
    return {
      ...style,
      ...{
        fontSize: setting.editor_font_size
      }
    };
  }, [style, setting.editor_font_size]);
  const updateConfig = useRef<Compartment>(new Compartment());
  const editorableConfig = useRef<Compartment>(new Compartment());
  useEffect(() => {
    const state = EditorState.create({
      doc: '',
      extensions: [
        basicSetup,
        lintGutter(),
        updateConfig.current.of(EditorView.updateListener.of(() => {
        })),
        editorableConfig.current.of(EditorView.editable.of(true)),
        autocompleteConfig.current.of(autocompletion(server?.autocomplete
          ? {
            override: [completionSource({
              getAutoComplate: server.autocomplete,
              path: editor.path
            })]
          }
          : undefined)),
        langConfig.current.of(StreamLanguage.define(typeMap[(editor.fileType as keyof typeof typeMap)])),
        keyConfig.current.of(keyMap(editor)),
        themeConfig.current.of(theme[setting.editor_theme] || theme.vscodeDark),
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
    if (editorView.current) {
      editorView.current?.dispatch({
        effects: editorableConfig.current.reconfigure(EditorView.editable.of(editor.editable === undefined ? true : editor?.editable))
      });
    }
  }, [editorView, editor?.editable]);
  // 更新主题
  useEffect(() => {
    if (editorView.current) {
      editorView.current?.dispatch({
        effects: themeConfig.current.reconfigure(theme[setting.editor_theme])
      });
    }
  }, [setting.editor_theme]);
  // 获取文件方法函数目录
  const updateOutline = useCallback((code: string) => {
    if (code) {
      server?.fileOutline?.(code).then(res => {
        updateEditor(editor.path, {
          outline: res
        });
      }).catch(e => {
        message.error({ content: e.message });
      });
    } else {
      updateEditor(editor.path, {
        outline: undefined
      });
    }
  }, []);
  // 获取文件内容和目录
  const getFile = useCallback(() => {
    if (!editorView.current || !editor.path || !server) {
      return;
    }
    server?.getFileContent?.(editor.path).then(res => {
      setOrgDoc(res.content);
      editorView.current?.dispatch({
        changes: { from: 0, to: editorView.current.state.doc.length, insert: res.content }
      });
      setHasLoadFile(true);
    }).catch(e => {
      message.error({ content: e.message });
      removeEditor(editor.path);
    });
  }, [server, editor.path]);
  const close = useCallback(() => {
    removeEditor(editor.path);
  }, [editor.path]);
  // 自动保存函数
  const saveFile = useCallback(async () => {
    if (!editorView.current || !server || !editor.hasUnSave) {
      return;
    }
    const code = editorView.current.state.doc.toString() || '';
    const param = {
      file: editor.path,
      code
    };
    server?.saveFile?.(param).catch(e => {
      message.error({ content: e.message });
    });
    setOrgDoc(param.code);
  }, [server, editor.hasUnSave]);
  /**
   * 保存文件函数
   *
   * doNotCheck 是否校验是否有修改 true 为不校验，默认未校验
   *   */
  const save = useCallback(async (doNotCheck?: boolean) => {
    if (!editorView.current || !server) {
      return;
    }
    if (!doNotCheck && !editor.hasUnSave) {
      return;
    }
    const code = editorView.current.state.doc.toString() || '';
    const pos = editorView.current.state.selection.ranges[0].from;
    const param = {
      file: editor.path,
      code
    };
    if (editor.fileType === 'go') {
      const { line, ch } = getLineAndChByPos(code, pos);
      const fmtParam = {
        ...param,
        cursorLine: line,
        cursorCh: ch
      };
      updateLints({});
      try {
        const newCode = await server?.fmt?.(fmtParam);
        param.code = newCode;
        editorView.current?.dispatch({
          changes: { from: 0, to: editorView.current.state.doc.length, insert: newCode }
        });
      } catch (e: any) {
        message.error({ content: e.message });
      }
    }
    server?.saveFile?.(param).catch(e => {
      message.error({ content: e.message });
    });
    setOrgDoc(param.code);
  }, [server, editor.hasUnSave]);

  // 更新文件是否修改过校验
  useEffect(() => {
    if (!editorView.current) {
      return;
    }
    editorView?.current?.dispatch({
      effects: updateConfig.current.reconfigure(EditorView.updateListener.of((info) => {
        const { state, docChanged } = info;
        // console.log(info)
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
    if (editor.fileType === 'go') {
      updateOutline(orgDoc);
      server?.build?.({
        file: editor.path,
        code: orgDoc,
        nextCmd: ''
      }).catch(e => {
        message.error({ content: e.message });
      });
    }
  }, [orgDoc, hasLoadFile]);
  // 更新校验
  const decl = useCallback(async (event?: MouseEvent) => {
    if (!event || !editorView.current || !server || editor.fileType !== 'go') {
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
    const res = await server?.decl({
      path: editor.path,
      code,
      cursorLine: line,
      cursorCh: ch
    }).catch(e => {
      message.error({ content: e.message });
    });
    if (res) {
      openEditor({
        path: res.path,
        name: res.path.match(/[^/]+$/)?.[0],
        action: {
          Line: res.cursorLine,
          Ch: res.cursorCh,
          type: 'cursor'
        }
      });
    }
  }, [server, editorView, editor.path]);
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
  const editorLints = useMemo(() => {
    return lints[editor.path];
  }, [editor.path, lints]);

  useEffect(() => {
    if (!editorView.current) {
      return;
    }
    // const select = editorView.current.state.selection
    editorView.current.dispatch({
      // selection: editorView.current.state.selection,
      effects: lintsConfig.current.reconfigure(outLint(editorLints || []))
    });
  }, [editorView, editorLints]);

  useEffect(() => {
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
      case 'update':
        getFile();
        break;
      default:
        break;
    }
  }, [hasLoadFile, editor.action]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveFile();
    }, 10000);
    return () => clearTimeout(timer);
  }, [saveFile]);

  useImperativeHandle(refs, () => ({
    save
  }));

  return (
    <div style={editorStyle} className={className} ref={dom}></div>
  );
});
