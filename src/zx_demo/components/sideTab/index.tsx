import React, { useCallback, useRef } from 'react';
// import ContractCall from './contractCall/ContractCall';
// import ContractCompile from './contractCompile/ContractCompile';
// import ContractDebug from './contractDebug/ContractDebug';
// import ContractDeploy from './contractDeploy/ContractDeploy';
// import FileTree from './contractFileTree';
import fold from '@ide/static/svgs/fold.svg';
import addfile from '@ide/static/svgs/addfile.svg';
import { useIdeStore } from '@ide/store';
import { FILE_TYPES } from '@/zx_demo/utils/menu';
import { SideNavs } from '@ide/types/ideProps';
import useAppStore from '@/zx_demo/store';
import appServer from '@/zx_demo/api/appServer';

const accept = FILE_TYPES.map(item => `.${item}`);
export default function SideTab({
  navList
}:{
  navList:SideNavs[]
}) {
  const { setIsHideNav } = useIdeStore();
  const { activeTab, activeTreeNode, setAlartModalContent } = useAppStore();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const { contract, getFiles } = useAppStore();
  const triggerSelectFile = useCallback(() => {
    fileInput.current?.click();
  }, []);
  const importFile = useCallback(() => {
    const files = fileInput.current?.files;
    if (files && files.length) {
      const MAXFILESIZE = 2 * 1024 * 1024;
      if (files.length > 20) {
        setAlartModalContent('上传文件一次最多上传20个。');
        return false;
      }
      for (let len = 0; len < files.length; len++) {
        const file = files[len];
        if (file.size > MAXFILESIZE) {
          setAlartModalContent('单个文件大小不能超过2M。');
          return false;
        }
      }
      let path = '';
      if (activeTreeNode?.path) {
        const reg = /\.[^.]+$/;
        if (reg.test(activeTreeNode.path)) {
          path = activeTreeNode.path.replace(reg, '');
        } else {
          path = activeTreeNode.path;
        }
      } else {
        path = contract.path || '';
      }
      if (!path) {
        return;
      }

      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append('fileupload', files[i]);
      }
      fd.append('path', path);
      appServer?.importFiles?.(fd).then(() => {
        getFiles();
      });
    }
  }, [contract, activeTreeNode]);
  return <>
    <div className='nav_header'>
      <div className='nav_options'>
        {activeTab === 'fileTree' && <>
          <img title='导入文件' onClick={triggerSelectFile} className='nav_import' src={addfile} />
        </>}
        <input
          ref={(ref) => (fileInput.current = ref)}
          type="file"
          onChange={importFile}
          multiple
          accept={accept.join(',')}
          className="upload-files"
          style={{ width: 0, height: 0, opacity: 0 }} />
      </div>
      <img src={fold} className='nav_action' onClick={() => setIsHideNav(true)} />
    </div>
    <div className='ide_nav_c'>
      {
        navList.map((item) => {
          return <div key={item.id} style={{ display: activeTab === item.id ? 'block' : 'none' }}>{item.components}</div>;
        })
      }
      {/* <FileTree style={{ display: activeTab === 'fileTree' ? 'block' : 'none' }} />
      <ContractDebug style={{ display: activeTab === 'contractDebug' ? 'block' : 'none' }} />
      <ContractCompile style={{ display: activeTab === 'contractCompile' ? 'block' : 'none' }} />
      <ContractDeploy style={{ display: activeTab === 'contractDeploy' ? 'block' : 'none' }} />
      <ContractCall style={{ display: activeTab === 'contractCall' ? 'block' : 'none' }} /> */}
    </div>
  </>;
}
