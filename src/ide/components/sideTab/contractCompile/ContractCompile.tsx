import React, { useCallback, useState } from 'react';
import { Button, Form, Select } from 'tea-component';

import useIdeStore from '@ide/store';

export default function ContractCompile({ style }: {
  style?: React.CSSProperties;
}) {
  const { server } = useIdeStore();
  const [version, setVersion] = useState<string>('v1.0.0');
  const [lang, setLang] = useState<string>('docker-go');
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const { contract } = useIdeStore();
  const [compileResult, setCompileResult] = useState<{ status: 'success' | 'error' | null; file: string; name: string }>({ status: null, file: '', name: '' });

  const compileContract = useCallback(async () => {
    console.log('contract: ', contract);
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
      console.log('compile contract result: ', result);
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

  // const downloadCompileResult = useCallback(async () => {
  //   // `${import.meta.env.VITE_API_HOST}api/v1/ide/file/getContractFile?path=${compileResult.file}`
  //   const href = await server?.getDownloadPath?.(compileResult.file);
  //   if (href) {
  //     window.location.href = href;
  //   }
  // }, [compileResult, server]);

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
        {/* <div className="func">
          <Text className="label">项目名称</Text>
          <select className="func-select" defaultValue={contract?.projectName}>
            <option value={contract?.projectName}>{contract?.projectName}</option>
          </select>
        </div> */}
        <Form.Item label="至信链版本">
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            appearance="button"
            options={[{ value: 'v1.0.0', text: 'v1.0.0' }]}
            value={version}
            onChange={setVersion}
          />
        </Form.Item>
        {/* <div className="func">
          <Text className="label">至信链版本</Text>
          <select className="func-select" value={version} onChange={(e) => setVersion(e.target.value)}>
            <option value='v1.0.0'>v1.0.0</option>
          </select>
        </div> */}
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
        {/* <div className="func">
          <Text className="label">合约语言类型</Text>
          <select className="func-select" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value='docker-go'>docker-go</option>
          </select>
        </div>  */}
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
              {/* <div className="compile_close_icon" onClick={closeCompileResult}></div>
              <div className="compile_icon"></div>
              <div className="compile_file">
                {compileResult.name}
                <span className="compile_download" onClick={downloadCompileResult}></span>
              </div>
              <p>合约编译成功，您可选择在IDE内直接部署或者下载到本地部署。</p> */}
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
