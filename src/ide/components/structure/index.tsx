import StructureItem from './structure-item';
import righticon from '@ide/static/svgs/righticon.svg';
import useIdeStore from '@ide/store';
import React from 'react';

export default function Structure() {
  const { editors } = useIdeStore();
  const { setIsHideFunc } = useIdeStore();
  return <>
    <div className='func_header'>
      <img src={righticon} className='nav_action' onClick={() => setIsHideFunc(true)} />
    </div>
    <div className='ide_func_c'>
      <div className='func_ls'>
        {editors.map(editor => (<StructureItem editor={editor} style={{ display: editor.isVisible ? 'block' : 'none' }} key={editor.path} />))}
      </div>
    </div>
  </>;
}
