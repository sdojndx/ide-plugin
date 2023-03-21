import React, { useCallback, useRef } from 'react';
import ContractCall from './contractCall/ContractCall';
import ContractCompile from './contractCompile/ContractCompile';
import ContractDebug from './contractDebug/ContractDebug';
import ContractDeploy from './contractDeploy/ContractDeploy';
import FileTree from './fileTree';
import fold from '@ide/static/svgs/fold.svg';
import addfile from '@ide/static/svgs/addfile.svg';
import useIdeStore from '@ide/store';
import { FileTypes } from '@ide/utils/menu';

const accept = FileTypes.map(item => `.${item}`);
export default function SideTab() {
  const { activeTab, setIsHideNav, setModalStatus } = useIdeStore();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const { activeTreeNode } = useIdeStore();
  const { contract, getFiles } = useIdeStore();
  const { server } = useIdeStore();
  const triggerSelectFile = useCallback(() => {
    fileInput.current?.click();
  }, []);
  const importFile = useCallback(() => {
    const files = fileInput.current?.files;
    if (files && files.length) {
      const MAXFILESIZE = 2 * 1024 * 1024;
      if (files.length > 20) {
        setModalStatus({
          modalShow: true,
          modalContent: '上传文件一次最多上传20个。'
        });
        return false;
      }
      for (let len = 0; len < files.length; len++) {
        const file = files[len];
        if (file.size > MAXFILESIZE) {
          setModalStatus({
            modalShow: true,
            modalContent: '单个文件大小不能超过2M。'
          });
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
      server?.importFiles?.(fd).then(() => {
        getFiles();
      });
      // $.ajax({
      //   url: '/file/import',
      //   type: 'POST',
      //   data: fd,
      //   contentType: false,
      //   processData: false,
      //   success: function (result) {
      //     if (result.code === -1) {
      //       $('#dialogAlert').dialog('open', result.msg)
      //     } else {
      //       $('.upload-files').val(null)
      //       // tree.init();
      //     }
      //   },
      //   complete: function () {
      //     $('.disable-vdom').remove()
      //   }
      // })
    }
  }, [server, contract, activeTreeNode]);
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
      <FileTree style={{ display: activeTab === 'fileTree' ? 'block' : 'none' }} />
      <ContractDebug style={{ display: activeTab === 'contractDebug' ? 'block' : 'none' }} />
      <ContractCompile style={{ display: activeTab === 'contractCompile' ? 'block' : 'none' }} />
      <ContractDeploy style={{ display: activeTab === 'contractDeploy' ? 'block' : 'none' }} />
      <ContractCall style={{ display: activeTab === 'contractCall' ? 'block' : 'none' }} />
    </div>
  </>;
}
