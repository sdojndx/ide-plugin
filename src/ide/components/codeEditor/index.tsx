import { EditorItem } from '@ide/store/editorStore';
import React, { useCallback, useMemo, useRef } from 'react';
import { Icon } from 'tea-component/lib/icon/Icon';
import maximum from '@ide/static/images/maximum.png';
import restore from '@ide/static/images/restore.png';
import save from '@ide/static/images/save.png';
import searchplus from '@ide/static/svgs/searchplus.svg';
import searchreduce from '@ide/static/svgs/searchreduce.svg';
import CodeMirrorEditor from './editor';
import { Modal } from 'tea-component/lib/modal';
import { useIdeStore } from '@ide/store';
import { useServerStore } from '@ide/store/serverStore';

export default function CodeEditor() {
  const { ideTheme } = useIdeStore();
  const { ideEventListener } = useServerStore();
  const {
    ideFileTabs, removeEditor, openEditor,
    isHideNav, isHideFunc, isHideBottom, setIsHideBottom, setIsHideFunc, setIsHideNav
  } = useIdeStore();
  // 初始化编辑文件选项
  // const [initEditer, setInitEditer] = useState(false);
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
        className: `${ideTheme}_model`,
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
  const switchFull = useCallback(() => {
    setIsHideBottom(!isFull);
    setIsHideFunc(!isFull);
    setIsHideNav(!isFull);
  }, [isFull]);
  const saveFile = useCallback(() => {
    ideFileTabs.forEach((editor, index) => {
      if (editor.hasUnSave) {
        refs.current[index].save();
      }
    });
  }, [ideFileTabs, refs]);

  return <div className='code_editor'>
    <div className='code_nav'>
      <div className='code_nav_l'>
        <div className='code_nav_c'>
          <div className='code_op'>
            {!ideEventListener?.onAddFontSize || <img onClick={ideEventListener.onAddFontSize} src={searchplus}></img>}
            {!ideEventListener?.onReduceFontSize || <img onClick={ideEventListener.onReduceFontSize} src={searchreduce}></img>}
          </div>
          {ideFileTabs.map(editor => (<div className={`code_nav_i ${editor.isVisible ? 'code_nav_select' : ''}`} onClick={() => switchNav(editor.path)} key={editor.path}>
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
      {ideFileTabs.map((editor, index) => (<CodeMirrorEditor ref={ref => {
        refs.current[index] = ref;
      }} style={{ display: editor.isVisible ? 'block' : 'none' }} className='editor_item' key={editor.id} editor={editor} />))}
    </div>
  </div>;
}
