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
  leftContent,
  // leftNavContentWidth,
  bottomContent,
  // bottomContentHeight,
  rightContent,
  // rightContentWidth,
  autoSaveSpace,
  codeOptionContent
}: IdeProps) => {
  const {
    ideTheme, dragType, isHideLeftContent, setIsHideLeftContent, isHideRightContent, setIsHideRightContent,
    isHideBottomContent, setIsHideBottomContent, setAutoSaveSpace, hasLeftContent, hasRightContent, hasBottomContent,
    setHasLeftContent, setHasRightContent, setHasBottomContent, leftContentSize, rightContentSize, bottomContentSize,
    setLeftContentSize, setRightContentSize, setBottomContentSize
  } = useIdeStore();
  const { setIdeEventListener } = useServerStore();
  useEffect(() => {
    setIdeEventListener(ideEventListener);
  }, [ideEventListener]);
  useEffect(() => {
    if (autoSaveSpace) {
      setAutoSaveSpace(autoSaveSpace);
    }
  }, [autoSaveSpace]);
  useEffect(() => {
    if (!!leftContent !== hasLeftContent) {
      setHasLeftContent(!!leftContent);
    }
  }, [leftContent, hasLeftContent]);
  useEffect(() => {
    if (!!rightContent !== hasRightContent) {
      setHasRightContent(!!rightContent);
    }
  }, [rightContent]);
  useEffect(() => {
    if (!!bottomContent !== hasBottomContent) {
      setHasBottomContent(!!bottomContent);
    }
  }, [bottomContent]);
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
      {(!leftContent) || <>
        <FlexDrag className='ide_left' dragSides={['right']} width={leftContentSize} setWidth={setLeftContentSize} minWidth={240} maxWidth={400} style={{ display: isHideLeftContent ? 'none' : 'flex' }}>
          {leftContent}
        </FlexDrag>
        <div className='ide_nav_open' style={{ display: isHideLeftContent ? 'block' : 'none' }} onClick={() => setIsHideLeftContent(false)}>
          <img src={righticon} />
        </div>
      </>}
      <div className='flex_col flex_one'>
        <div className='flex_one'>
          <div className='flex_one'>
            <CodeEditor codeOptionContent={codeOptionContent}/>
          </div>
          {(!rightContent) || <>
            <FlexDrag className='ide_right' width={rightContentSize} setWidth={setRightContentSize} dragSides={['left']} minWidth={200} maxWidth={600} style={{ display: isHideRightContent ? 'none' : 'flex' }}>
              {rightContent}
            </FlexDrag>
            <div className='ide_func_open' style={{ display: isHideRightContent ? 'block' : 'none' }} onClick={() => setIsHideRightContent(false)}>
              <img src={fold} />
            </div>
          </>}
        </div>
        {(!bottomContent) || <>
          <FlexDrag className='ide_bottom' height={bottomContentSize} setHeight={setBottomContentSize} minHeight={100} maxHeight={500} style={{ display: isHideBottomContent ? 'none' : 'flex' }} dragSides={['top']}>
            {bottomContent}
          </FlexDrag>
          <div className='ide_console_open' style={{ display: isHideBottomContent ? 'block' : 'none' }} onClick={() => setIsHideBottomContent(false)}>
            <img src={downicon} />
          </div>
        </>}
      </div>
    </div>
  </div>;
};

export default IdeComponent;
