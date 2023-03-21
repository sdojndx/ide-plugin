
import useIdeStore from '@ide/store';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, message } from 'tea-component';
import { Modal } from 'tea-component/lib/modal/Modal';
import { FileTypes } from '@ide/utils/menu';

const FileModel = React.forwardRef(() => {
  const { server } = useIdeStore();
  const { setting } = useIdeStore();
  const { addFileInfo, setAddFileInfo } = useIdeStore();
  const { getFiles } = useIdeStore();
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
      if (suffix && FileTypes.indexOf(suffix) === -1) {
        message.error({ content: `不支持该后缀 【${suffix}】` });
        return;
      }
      setLoading(true);
      if (addFileInfo.addFileType === 'rename') {
        const newPath = addFileInfo.newFilePath.replace(/[^/]+$/, addFileInfo.newFileName);
        server?.renameFile?.({
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
          // addFileInfo.newFilePath && removeEditor(addFileInfo.newFilePath)
          // openEditor({
          //   path: newPath
          // })
          close();
        }).catch((e) => {
          setLoading(false);
          message.error({ content: e.message });
        });
      } else {
        const path = addFileInfo.newFilePath + '/' + addFileInfo.newFileName;
        server?.newFile?.({
          path,
          fileType: addFileInfo?.addFileType === 'file' ? 'f' : 'd'
        }).then(() => {
          setLoading(false);
          getFiles();
          if (addFileInfo?.addFileType === 'file') {
            openEditor({ path });
          }
          close();
        }).catch((e) => {
          setLoading(false);
          message.error({ content: e.message });
        });
      }
    }
  }, [addFileInfo, close, server]);
  return <Modal
    maskClosable
    visible={addFileInfo.isOpenAddFile}
    caption={addFileInfo.addFileType === 'rename' ? '重命名' : `新建文件${addFileInfo.addFileType === 'file' ? '' : '夹'}`}
    onClose={close}
    className={`${setting.theme}_model`}
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
