import useAppStore from '@/zx_demo/store';
import { useIdeStore } from '@ide/store';
import React, { useCallback } from 'react';
import { Button, Modal } from 'tea-component';

function AlertModal() {
  const { ideTheme } = useIdeStore();
  const { modalStatus, setModalStatus } = useAppStore();
  const close = useCallback(() => {
    setModalStatus({ modalShow: false, modalContent: '' });
  }, []);
  return <Modal
    maskClosable
    visible={modalStatus.modalShow}
    onClose={close}
    caption="提示"
    className={`${ideTheme}_model`}
    size='s'
    maskStyle={{
      backgroundColor: 'rgba(0,0,0,0.2)'
    }}
  >
    <Modal.Body>
      <p className='alert-modal__cotent'>{modalStatus.modalContent}</p>
    </Modal.Body>
    <Modal.Footer>
      <Button type="primary" onClick={close}>确定</Button>
    </Modal.Footer>
  </Modal>;
}

AlertModal.displayName = 'AlertModal';

export default AlertModal;
