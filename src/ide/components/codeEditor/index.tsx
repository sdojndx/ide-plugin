import { EditorItem } from '@ide/store/editorStore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from 'tea-component/lib/icon/Icon';
import maximum from '@ide/static/images/maximum.png';
import restore from '@ide/static/images/restore.png';
import save from '@ide/static/images/save.png';
import searchplus from '@ide/static/svgs/searchplus.svg';
import searchreduce from '@ide/static/svgs/searchreduce.svg';
import CodeMirrorEditor from './editor';
import { Modal } from 'tea-component/lib/modal';
import useIdeStore from '@ide/store';

export default function CodeEditor() {
  const { setting } = useIdeStore();
  const {
    editors, setEditors, removeEditor, openEditor, updateIdeSetting,
    contract, userId, files, fontSizes, lineHeights,
    isHideNav, isHideFunc, isHideBottom, setIsHideBottom, setIsHideFunc, setIsHideNav
  } = useIdeStore();
  // 初始化编辑文件选项
  const [initEditer, setInitEditer] = useState(false);
  const refs = useRef<any[]>([]);

  const isFull = useMemo(() => {
    return isHideBottom && isHideNav && isHideFunc;
  }, [isHideNav, isHideFunc, isHideBottom]);
  const rmEditor = useCallback(async (editor: EditorItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editor.hasUnSave) {
      const yes = await Modal.confirm({
        message: '保存提示',
        description: '该文件存在未保存的内容，您确认要强制关闭吗？',
        okText: '确定',
        cancelText: '取消',
        className: `${setting.theme}_model`,
        maskStyle: {
          backgroundColor: 'rgba(0,0,0,0.2)'
        }
      });
      if (yes) {
        removeEditor(editor.path);
      }
    } else {
      removeEditor(editor.path);
    }
  }, []);
  const switchNav = useCallback((path: string) => {
    openEditor({ path });
  }, []);
  const addFontSize = useCallback(() => {
    const index = setting.editor_font_size ? fontSizes.indexOf(setting.editor_font_size) : 0;
    if (index < fontSizes.length - 1) {
      updateIdeSetting({
        editor_font_size: fontSizes[index + 1]
      });
    }
  }, [setting.editor_font_size, fontSizes]);
  const reduceFontSize = useCallback(() => {
    const index = setting.editor_font_size ? fontSizes.indexOf(setting.editor_font_size) : 0;
    if (index > 0) {
      updateIdeSetting({
        editor_font_size: fontSizes[index - 1]
      });
    }
  }, [setting.editor_font_size, fontSizes, lineHeights]);
  const switchFull = useCallback(() => {
    setIsHideBottom(!isFull);
    setIsHideFunc(!isFull);
    setIsHideNav(!isFull);
  }, [isFull]);
  const saveFile = useCallback(() => {
    editors.forEach((editor, index) => {
      if (editor.hasUnSave) {
        refs.current[index].save();
      }
    });
    // const index = editors.findIndex((editor) => (editor.isVisible === true))
    // refs.current[index].save()
  }, [editors, refs]);
  useEffect(() => {
    // 更新页面关闭拦截函数，在存在未保存的文件是拦截关闭
    window.onbeforeunload = function () {
      const hasUnSaveEditor = editors.find((item) => item.hasUnSave);
      if (hasUnSaveEditor) {
        return 'there are unsaved file';
      }
    };
    // 缓存文件打开状态
    if (!contract?.contractName || !userId) {
      return;
    }
    localStorage.setItem(`${userId}_${contract?.contractName}_editors`, JSON.stringify(editors));
  }, [editors]);
  useEffect(() => {
    if (!contract?.contractName || !userId) {
      return;
    }
    setEditors(JSON.parse(localStorage.getItem(`${userId}_${contract?.contractName}_editors`) || '[]'));
  }, [contract?.contractName, userId]);

  useEffect(() => {
    console.log(files);
    if (initEditer) {
      return;
    }
    if (files.length > 0) {
      setInitEditer(true);
      if (editors.length === 0) {
        const mainNode = files[0].children?.find(node => node.name === 'main.go');
        if (mainNode) {
          openEditor({ path: mainNode.path });
        }
      }
    }
  }, [files, editors, initEditer]);
  return <div className='code_editor'>
    <div className='code_nav'>
      <div className='code_nav_l'>
        <div className='code_nav_c'>
          <div className='code_op'>
            <img onClick={addFontSize} src={searchplus}></img>
            <img onClick={reduceFontSize} src={searchreduce}></img>
          </div>
          {editors.map(editor => (<div className={`code_nav_i ${editor.isVisible ? 'code_nav_select' : ''}`} onClick={() => switchNav(editor.path)} key={editor.path}>
            <div>{editor.name}</div>
            <Icon onClick={(e) => rmEditor(editor, e)} size='s' type={editor.hasUnSave ? 'cur-active' : 'close'} />
          </div>))}
        </div>
      </div>
      <div className='code_op'>
        <img src={save} onClick={saveFile}></img>
        <img onClick={switchFull} src={isFull ? restore : maximum}></img>
      </div>
    </div>
    <div className='editor_ls' >
      {editors.map((editor, index) => (<CodeMirrorEditor ref={ref => {
        refs.current[index] = ref;
      }} style={{ display: editor.isVisible ? 'block' : 'none' }} className='editor_item' key={editor.id} editor={editor} />))}
    </div>
  </div>;
}
