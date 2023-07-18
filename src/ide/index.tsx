// 导入样式
import 'tea-component/lib/tea.css';
import './ide.less';
import React, { useEffect } from 'react';
// import IdeEventListener from '../../IdeEventListener';
import FlexDrag from './components/flex-drag';
import fold from './static/svgs/fold.svg';
import righticon from './static/svgs/righticon.svg';
import downicon from './static/svgs/downicon.svg';
import CodeEditor from './components/codeEditor';
import { IdeProps } from './types/ideProps';
import { useServerStore } from './store/serverStore';
import { useIdeStore } from './store';

const IdeComponent = ({
  ideEventListener,
  headerContent,
  leftNavMenuContent,
  leftNavContent,
  bottomContent,
  rightContent
}: IdeProps) => {
  const { ideTheme, dragType, isHideNav, setIsHideNav, isHideFunc, setIsHideFunc, isHideBottom, setIsHideBottom } = useIdeStore();
  const { setIdeEventListener } = useServerStore();
  useEffect(() => {
    setIdeEventListener(ideEventListener);
  }, [ideEventListener]);
  return <div className={`ide_main ${ideTheme}_ide ${dragType || ''}`}>
    {(!headerContent) || <>
      <div className='ide_header'>
        {headerContent}
      </div>
    </>
    }
    <div className='ide_content flex_one'>
      {(!leftNavMenuContent) || <div className='ide_tools'>
        {leftNavMenuContent}
      </div>}
      {(!leftNavContent) || <>
        <FlexDrag className='ide_nav' dragSides={['right']} minWidth={240} maxWidth={400} style={{ display: isHideNav ? 'none' : 'flex' }}>
          {leftNavContent}
        </FlexDrag>
        <div className='ide_nav_open' style={{ display: isHideNav ? 'block' : 'none' }} onClick={() => setIsHideNav(false)}>
          <img src={righticon} />
        </div>
      </>}
      <div className='flex_col flex_one'>
        <div className='flex_one'>
          <div className='flex_one'>
            <CodeEditor />
          </div>
          {(!rightContent) || <><FlexDrag className='ide_func' dragSides={['left']} minWidth={200} maxWidth={400} style={{ display: isHideFunc ? 'none' : 'flex' }}>
            {rightContent}
          </FlexDrag>
          <div className='ide_func_open' style={{ display: isHideFunc ? 'block' : 'none' }} onClick={() => setIsHideFunc(false)}>
            <img src={fold} />
          </div></>}
        </div>
        {(!bottomContent) || <>
          <FlexDrag className='ide_console' minHeight={100} maxHeight={400} style={{ display: isHideBottom ? 'none' : 'flex' }} dragSides={['top']}>
            {bottomContent}
          </FlexDrag>
        </>}
        <div className='ide_console_open' style={{ display: isHideBottom ? 'block' : 'none' }} onClick={() => setIsHideBottom(false)}>
          <img src={downicon} />
        </div>
      </div>
    </div>
  </div>;
};

export default IdeComponent;
