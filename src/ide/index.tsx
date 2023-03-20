// 导入样式
import React, { useEffect, useImperativeHandle } from 'react';
import 'tea-component/lib/tea.css';
import './ide.less';
// import ideServer from '../../ideServer';
import FlexDrag from './components/flex-drag';
import SideMenu from './components/SideMenu';

import AlertModal from './components/alertModal';
import BottomConsole from './components/bottomConsole';
import CodeEditor from './components/codeEditor';
import AddFileModel from './components/fileModel';
import SetModal from './components/set/set';
import SideTab from './components/sideTab';
import Structure from './components/structure';
import downicon from './static/svgs/downicon.svg';
import fold from './static/svgs/fold.svg';
import righticon from './static/svgs/righticon.svg';
import useIdeStore from './store';
import { IdeSetting } from './store/settingStore';
import { IdeServer } from './types/ideServer';
const Ide = React.forwardRef(
  (
    {
      contractName,
      projectName,
      ideServer,
      header,
      userId,
      defaultSetting,
    }: {
      contractName?: string;
      projectName?: string;
      ideServer?: IdeServer;
      header?: React.ReactNode;
      userId?: string | number;
      defaultSetting: Partial<IdeSetting['setting']>;
    },
    ref,
  ) => {
    const {
      dragType,
      isHideNav,
      setIsHideNav,
      isHideFunc,
      setIsHideFunc,
      activeTab,
      setActiveTab,
      isHideBottom,
      setIsHideBottom,
    } = useIdeStore();
    const { server, setServer } = useIdeStore();
    const { setting, setIdeSetting } = useIdeStore();
    const { getHasBuild, setContract, setUserId } = useIdeStore();
    useEffect(() => {
      if (ideServer) {
        setServer(ideServer);
      }
    }, [ideServer]);
    useEffect(() => {
      setContract({ contractName, projectName });
      if (userId !== undefined) {
        setUserId(userId);
      }
      if (!contractName) {
        return;
      }
      getHasBuild(server?.getContractHasBuild);
    }, [contractName, projectName, userId, server]);
    useEffect(() => {
      setIdeSetting(defaultSetting);
    }, [defaultSetting]);
    useImperativeHandle(ref, () => ({
      output: () => {
        console.log('output');
      },
      switchLeftNav: (nav: string) => {
        setActiveTab(nav);
      },
    }));
    useEffect(() => {}, [contractName]);
    return (
      <div className={`ide_main ${setting.theme}_ide ${dragType || ''}`}>
        {header && <div className="ide_header">{header}</div>}
        <div className="ide_content flex_one">
          <div className="ide_tools">
            <SideMenu
              value={activeTab}
              onChange={(type) => {
                setActiveTab(type);
              }}
            ></SideMenu>
          </div>
          <FlexDrag
            className="ide_nav"
            dragSides={['right']}
            minWidth={240}
            maxWidth={400}
            style={{ display: isHideNav ? 'none' : 'flex' }}
          >
            <SideTab />
          </FlexDrag>
          <div
            className="ide_nav_open"
            style={{ display: isHideNav ? 'block' : 'none' }}
            onClick={() => setIsHideNav(false)}
          >
            <img src={righticon} />
          </div>
          <div className="flex_col flex_one">
            <div className="flex_one">
              <div className="flex_one">
                <CodeEditor />
              </div>
              <FlexDrag
                className="ide_func"
                dragSides={['left']}
                minWidth={200}
                maxWidth={400}
                style={{ display: isHideFunc ? 'none' : 'flex' }}
              >
                <Structure />
              </FlexDrag>
              <div
                className="ide_func_open"
                style={{ display: isHideFunc ? 'block' : 'none' }}
                onClick={() => setIsHideFunc(false)}
              >
                <img src={fold} />
              </div>
            </div>
            <FlexDrag
              className="ide_console"
              minHeight={100}
              maxHeight={400}
              style={{ display: isHideBottom ? 'none' : 'flex' }}
              dragSides={['top']}
            >
              <BottomConsole />
            </FlexDrag>
            <div
              className="ide_console_open"
              style={{ display: isHideBottom ? 'block' : 'none' }}
              onClick={() => setIsHideBottom(false)}
            >
              <img src={downicon} />
            </div>
          </div>
        </div>
        <AddFileModel />
        <AlertModal />
        <SetModal />
      </div>
    );
  },
);
Ide.displayName = 'Ide';
export default Ide;
