import React, { useCallback, useState } from 'react';
import { Button, Form, Select } from 'tea-component';

import useIdeStore from '@ide/store';

export default function ContractCompile({ style }: {
  style?: React.CSSProperties;
}) {
  const { server } = useIdeStore();
  const [lang, setLang] = useState<string>('docker-go');
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const { contract } = useIdeStore();
  const [compileResult, setCompileResult] = useState<{ status: 'success' | 'error' | null; file: string; name: string }>({ status: null, file: '', name: '' });

  const compileContract = useCallback(async () => {
    if (!contract || !contract.path) {
      return;
    }
    setShowLoading(true);
    setCompileResult({
      status: null,
      file: '',
      name: ''
    });
    try {
      const result = await server?.postContractCompile?.({
        path: contract.path.endsWith('/') ? contract.path : `${contract.path}/`,
        platform: 'linux_amd64'
      }).finally(() => {
        setShowLoading(false);
      });
      setCompileResult({
        status: 'success',
        file: result.file,
        name: result.file.match(/[^/]+$/)[0]
      });
    } catch {
      setCompileResult({
        status: 'error',
        file: '',
        name: ''
      });
    }
  }, [server, contract]);

  const closeCompileResult = () => {
    setCompileResult({
      status: null,
      file: '',
      name: ''
    });
  };

  return (
    <div style={style} className="nav_tab">
      <Form className='side_tab_form' layout="vertical">
        <Form.Item label="项目名称">
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            appearance="button"
            options={[{ value: contract?.projectName || '', text: contract?.projectName }]}
            value={contract?.projectName}
            onChange={() => { }}
          />
        </Form.Item>
        <Form.Item label="合约语言类型">
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            appearance="button"
            options={[{ value: 'docker-go', text: 'docker-go' }]}
            value={lang}
            onChange={setLang}
          />
        </Form.Item>
        <Button type="primary"
          className="full-btn tea-mt-4n" disabled={showLoading} onClick={compileContract}>合约编译</Button>
      </Form>
      {
        showLoading && (
          <div className="compile-btn-loading">
            <div className="loading-icon"></div>
          </div>
        )
      }

      <div className="compile-result">
        {
          compileResult.status === 'success' && (
            <div className="compile_success">
              <p>合约编译成功</p>
            </div>
          )
        }

        {
          compileResult.status === 'error' && (
            <div className="compile_error">
              <div className="compile_close_icon" onClick={closeCompileResult}></div>
              <div className="compile_icon"></div>
              <p>合约编译失败，请重试。</p>
            </div>
          )
        }
      </div>
    </div>
  );
}
