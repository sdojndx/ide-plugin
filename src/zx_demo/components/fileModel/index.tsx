
import { useIdeStore } from '@ide/store';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, message } from 'tea-component';
import { Modal } from 'tea-component/lib/modal/Modal';
import { FILE_TYPES } from '@/zx_demo/utils/menu';
import useAppStore from '@/zx_demo/store';
import appServer from '@/zx_demo/api/appServer';

const FileModel = React.forwardRef(() => {
  const { ideTheme } = useIdeStore();
  const { getFiles, addFileInfo, setAddFileInfo } = useAppStore();
  const { updateEditor, openEditor } = useIdeStore();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
  }, [addFileInfo.isOpenAddFile]);
  const close = useCallback(() => {
    setAddFileInfo({
      isOpenAddFile: false
    });
  }, [setAddFileInfo]);
  const submit = useCallback(() => {
    if (addFileInfo.newFilePath && addFileInfo.newFileName) {
      const suffix = addFileInfo.newFileName.match(/\.(\w+)$/)?.[1];
      if (suffix && FILE_TYPES.indexOf(suffix) === -1) {
        message.error({ content: `不支持该后缀 【${suffix}】` });
        return;
      }
      setLoading(true);
      if (addFileInfo.addFileType === 'rename') {
        const newPath = addFileInfo.newFilePath.replace(/[^/]+$/, addFileInfo.newFileName);
        appServer?.renameFile?.({
          oldPath: addFileInfo.newFilePath,
          newPath
        }).then(() => {
          setLoading(false);
          getFiles();
          if (addFileInfo.newFilePath) {
            updateEditor(addFileInfo.newFilePath, {
              path: newPath,
              name: addFileInfo.newFileName
            });
          }
          close();
        }).catch(() => {
          setLoading(false);
        });
      } else {
        const path = addFileInfo.newFilePath + '/' + addFileInfo.newFileName;
        appServer?.newFile?.({
          path,
          fileType: addFileInfo?.addFileType === 'file' ? 'f' : 'd'
        }).then(() => {
          setLoading(false);
          getFiles();
          if (addFileInfo?.addFileType === 'file') {
            openEditor({
              path
            });
          }
          close();
        }).catch(() => {
          setLoading(false);
        });
      }
    }
  }, [addFileInfo, close]);
  return <Modal
    maskClosable
    visible={addFileInfo.isOpenAddFile}
    caption={addFileInfo.addFileType === 'rename' ? '重命名' : `新建文件${addFileInfo.addFileType === 'file' ? '' : '夹'}`}
    onClose={close}
    className={`${ideTheme}_model`}
    size='s'
    maskStyle={{
      backgroundColor: 'rgba(0,0,0,0.2)'
    }}
  >
    <Modal.Body>
      <Input value={addFileInfo.newFileName} size="full" onChange={(value) => setAddFileInfo({ newFileName: value })} />
    </Modal.Body>
    <Modal.Footer>
      <Button type="primary" disabled={!addFileInfo?.newFileName || loading} onClick={submit}>
        确定
      </Button>
      <Button type="weak" onClick={close}>
        取消
      </Button>
    </Modal.Footer>
  </Modal>;
});
FileModel.displayName = 'FileModel';

export default FileModel;
