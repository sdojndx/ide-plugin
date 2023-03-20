import logo from '../assets/svgs/logo.svg';
import Ide from '@ide/index';
import { IdeSetting } from '@ide/store/settingStore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'tea-component';
import { getUser, index, logOut } from '../api';
import ideServer from '../ideServer';

function GetRequest() {
  const url = location.search; // 获取url中"?"符后的字串
  const theRequest: any = {};
  if (url.indexOf('?') !== -1) {
    const str = url.substr(1);
    const strs = str.split('&');
    strs.forEach((item) => {
      const param = item.split('=');
      theRequest[param[0]] = param[1];
    });
  }
  return theRequest;
}
export default function Home() {
  const [contractName, setContract] = useState<string>('');
  const [pageActionReady, setPageActionReady] = useState<boolean>(false);
  const [defaultSetting, setDefaultSetting] = useState<
    Partial<IdeSetting['setting']>
  >({});
  const [user, setUser] = useState<any>();
  const editor = useRef<any>();

  const checkContract = useCallback((contractName: string) => {
    ideServer
      ?.getContractFiles?.({ contractName, includeApi: false })
      .then((res) => {
        if (!res[0]?.children?.length) {
          message.error({
            content: '未找到该合约',
          });
          setTimeout(() => {
            window.location.href = `${import.meta.env.VITE_CONSOLE_HOST}`;
          }, 2000);
          return;
        }
        setContract(contractName);
        setPageActionReady(true);
      });
  }, []);
  // 新建合约
  const createContract = useCallback(async (contractName: string) => {
    await ideServer.newContract?.(contractName);
  }, []);

  const logout = useCallback(() => {
    logOut({}).then(() => {
      location.href = `${import.meta.env.VITE_CONSOLE_HOST}login`;
    });
  }, []);
  useEffect(() => {
    index({}).then((res) => {
      setDefaultSetting(res.data);
      getUser({}).then((res) => {
        console.log(res);
        setUser(res.data);
      });
      const urlParam = GetRequest();
      if (!urlParam?.contractName) {
        message.error({
          content: '请指定合约',
        });
        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_CONSOLE_HOST}`;
        }, 2000);
        return;
      }
      if (urlParam?.action === '1') {
        // 新建合约
        createContract(urlParam?.contractName).then(() => {
          checkContract(urlParam?.contractName);
        });
      } else {
        checkContract(urlParam?.contractName);
      }
    });
  }, []);
  useEffect(() => {
    if (contractName && pageActionReady) {
      const urlParam = GetRequest();
      if (urlParam?.action === '4') {
        // setActiveTab('contractCall')
        editor.current?.switchLeftNav('contractCall');
      }
    }
  }, [contractName, pageActionReady]);

  return (
    <>
      {contractName && pageActionReady && (
        <Ide
          ref={(r) => (editor.current = r)}
          header={
            <div className="zx_header_ide">
              <div className="zx_header_icon">
                <img src={logo} />
              </div>
              <div className="zx_header_flex"></div>
              <a
                target="_blank"
                href={import.meta.env.VITE_CONSOLE_HOST}
                className="zx_header_link"
                rel="noreferrer"
              >
                控制台
              </a>
              <a
                target="_blank"
                href="https://zxchain.qq.com/"
                className="zx_header_link"
                rel="noreferrer"
              >
                进入官网
              </a>
              <a
                target="_blank"
                href={`${
                  import.meta.env.VITE_CONSOLE_HOST
                }docs?docpath=doc/content/%E4%BA%A7%E5%93%81%E7%AE%80%E4%BB%8B/%E4%BA%A7%E5%93%81%E6%A6%82%E8%BF%B0.html`}
                className="zx_header_link"
                rel="noreferrer"
              >
                帮助文档
              </a>
              <div className="zx_header_user">{user?.name}</div>
              <div onClick={logout} className="zx_header_link">
                退出
              </div>
            </div>
          }
          ideServer={ideServer}
          userId={user?.secretId}
          contractName={contractName}
          defaultSetting={defaultSetting}
        ></Ide>
      )}
    </>
  );
}
