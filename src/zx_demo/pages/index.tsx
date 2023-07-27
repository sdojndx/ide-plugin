import logo from '../assets/svgs/logo.svg';
import Ide from '@ide/index';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { message } from 'tea-component';
import { files, getUser, index, logOut, newContract } from '../api';
import { useIdeStore } from '@ide/store';
import { MENU_LIST } from '@/zx_demo/utils/menu';
import ContractFileTree from '@/zx_demo/components/sideTab/contractFileTree';
import ContractDebug from '@/zx_demo/components/sideTab/contractDebug/ContractDebug';
import ContractCompile from '@/zx_demo/components/sideTab/contractCompile/ContractCompile';
import ContractDeploy from '@/zx_demo/components/sideTab/contractDeploy/ContractDeploy';
import ContractCall from '@/zx_demo/components/sideTab/contractCall/ContractCall';

import AddFileModel from '@/zx_demo/components/fileModel';
import AlertModal from '@/zx_demo/components/alertModal';
import SetModal from '@/zx_demo/components/set/set';
import SideTab from '@/zx_demo/components/sideTab';
import SideMenu from '@/zx_demo/components/SideMenu';
import ideEventListenerCreater from '../api/ideEventListener';
import useAppStore from '../store';
import Structure from '../components/structure';
import BottomConsole from '../components/bottomConsole';

const menuMap = {
  fileTree: <ContractFileTree/>,
  contractDebug: <ContractDebug/>,
  contractCompile: <ContractCompile/>,
  contractDeploy: <ContractDeploy/>,
  contractCall: <ContractCall/>
};

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
  const [pageActionReady, setPageActionReady] = useState<boolean>(false);
  // const [defaultSetting, setDefaultSetting] = useState<
  // Partial<IdeSetting['setting']>
  // >({});
  const editor = useRef<any>();
  const ideStore = useIdeStore();
  const appStore = useAppStore();
  const { ideFileTabs, setEditors, setIdeStyle } = ideStore;
  const { contract, setUser, user, setContract, setIdeSetting } = appStore;

  const [navList] = useState(MENU_LIST.map(item => ({
    ...item,
    menuIcon: <img src={item.icon}/>,
    activeMenuIcon: <img src={item.active || item.icon}/>,
    components: (menuMap as any)[item.id] || <></>
  })));

  const checkContract = useCallback(async (contractName: string) => {
    const data = await files({ contractName, includeApi: false });
    if (data.retCode === 0) {
      if (data?.data?.children.length) {
        setContract({ contractName });
        setPageActionReady(true);
      } else {
        message.error({
          content: '未找到该合约'
        });
        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_CONSOLE_HOST}`;
        }, 2000);
      }
    } else {
      throw Error(data.message);
    }
  }, []);
  // 新建合约
  const createContract = useCallback(async (contractName: string) => {
    const { retCode, retMsg } = await newContract({ contractName });
    if (retCode !== 0) {
      message.error({
        content: retMsg
      });
    }
  }, []);

  const logout = useCallback(() => {
    logOut({}).then(() => {
      location.href = `${import.meta.env.VITE_CONSOLE_HOST}login`;
    });
  }, []);
  useEffect(() => {
    index({}).then((res) => {
      setIdeSetting(res.data);
      setIdeStyle({
        fontSize: res.data.editor_font_size
      });
      getUser({}).then((res) => {
        setUser({
          name: res.data.name,
          id: res.data.secretId
        });
      });
      const urlParam = GetRequest();
      if (!urlParam?.contractName) {
        message.error({
          content: '请指定合约'
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
    if (contract.contractName && pageActionReady) {
      const urlParam = GetRequest();
      if (urlParam?.action === '4') {
        // setActiveTab('contractCall')
        editor.current?.switchLeftNav('contractCall');
      }
    }
  }, [contract?.contractName, pageActionReady]);
  const ideEventListener = useMemo(() => {
    return ideEventListenerCreater(ideStore, appStore);
  }, [ideEventListenerCreater, ideStore, appStore]);

  useEffect(() => {
    // 更新页面关闭拦截函数，在存在未保存的文件是拦截关闭
    window.onbeforeunload = function () {
      const hasUnSaveEditor = ideFileTabs.find((item) => item.hasUnSave);
      if (hasUnSaveEditor) {
        return 'there are unsaved file';
      }
    };
    if (!user.id || !contract.contractName) {
      return;
    }
    localStorage.setItem(`${user.id}_${contract.contractName}_editors`, JSON.stringify(ideFileTabs));
  }, [ideFileTabs, user?.id, contract?.contractName]);

  useEffect(() => {
    if (!contract?.contractName || !user?.id) {
      return;
    }
    setEditors(JSON.parse(localStorage.getItem(`${user.id}_${contract.contractName}_editors`) || '[]'));
  }, [contract?.contractName, user?.id]);
  // const [a, setA] = useState(0);
  // const [b, setB] = useState(0);
  // const [c, setC] = useState(0);
  // const aaa = useCallback(() => {
  //   console.log([a, b, c]);
  // }, [a, c]);
  // useEffect(() => {
  //   console.log(a + b);
  // }, [a]);
  // useEffect(() => {
  //   aaa();
  // }, [c]);

  return (
    <>
      {/* <Button onClick={() => setA(a + 1)}>a:{a}</Button>
      <Button onClick={() => setB(b + 1)}>b:{b}</Button>
      <Button onClick={() => setC(c + 1)}>c:{c}</Button> */}
      {contract?.contractName && pageActionReady && (
        <Ide
          headerContent={
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
          leftNavMenuContent={
            <SideMenu
              navList={navList}
            />
          }
          leftContent={
            <SideTab navList={navList}/>
          }
          rightContent={
            <Structure />
          }
          bottomContent={
            <BottomConsole />
          }
          ideEventListener={ideEventListener}
        ></Ide>
      )}
      <AddFileModel />
      <AlertModal />
      <SetModal />
    </>
  );
}
