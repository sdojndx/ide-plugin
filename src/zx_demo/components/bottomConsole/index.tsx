import React, { useCallback, useState } from 'react';

import searchIcon from '@ide/static/svgs/search.svg';
import searchDown from '@ide/static/svgs/downarrow.svg';
import searchUp from '@ide/static/svgs/uparrow.svg';
import searchClose from '@ide/static/svgs/close-x.svg';
import IDEOutputs from './outputs';
import IDEEvents from './events';
import IDEWorldState from './worldstate';
import { Input } from 'tea-component';
import useAppStore from '@/zx_demo/store';
import { useIdeStore } from '@ide/store';

const encodeHTML = function (str: string) {
  if (typeof str === 'string') {
    return str.replace(/<|&|>/g, function (matches) {
      return ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;'
      })[matches] as string;
    });
  }
  return '';
};
const markupTags = function (str: string) {
  if (typeof str === 'string') {
    return str.replace(/<|>/g, function (matches) {
      return ({
        '<': '|||<',
        '>': '>|||'
      })[matches] as string;
    });
  }
  return '';
};

export default function BottomConsole() {
  const [tabs] = useState<{ id: string; label: string }[]>([
    { id: 'output', label: '输出' },
    { id: 'event', label: '事件' },
    { id: 'worldstate', label: '世界状态' }
  ]);

  const { clearOutputText, setOutputText, originOutputText, outputText } = useAppStore();
  const { clearEventData } = useAppStore();
  const { clearWorldState } = useAppStore();
  const [searchContent, setSearchContent] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // 清除日志
  // const clearLog = () => {
  //   clearOutputText()
  // }
  // 清空input框
  const clearInputLog = () => {
    setSearchContent('');
    clearOutputText();
    outputText.map((item: string) => {
      item = item.replace(/match_current/ig, '').replace(/match/ig, '');
      setOutputText(item);
      return item;
    });
  };
  // input change
  const inputChange = (val: string) => {
    setSearchContent(val);
    replaceOutPutText(val);
  };
  const replaceOutPutText = (searchValue: string) => {
    clearOutputText();
    originOutputText.forEach(item => {
      const contents = markupTags(item).split('|||');
      const searchText = encodeHTML(searchValue);
      const regexp = new RegExp(searchText, 'gi');
      const newContents = contents.map(function (text) {
        if (text.startsWith('<') && text.endsWith('>')) {
          return text;
        }
        const matchText = text.replace(regexp, '<span class="match">$&</span>');
        return matchText;
      });
      setOutputText(newContents.join(''));
      // return newContents.join('');
    });
  };

  // 下移
  const downHandle = () => {
    const indexArray: Array<number> = [];
    const matchArray = outputText.filter((item, idx) => {
      if (item?.includes('match')) {
        indexArray.push(idx);
      }
      return item.includes('match');
    });
    const matchLength = matchArray.length;
    if (matchLength) {
      clearOutputText();
      const index = currentMatchIndex >= matchLength - 1 ? 0 : currentMatchIndex + 1;
      setCurrentMatchIndex(index);
      outputText.map((item: string, idx: number) => {
        item = item.replace(/match_current/ig, '');
        if (idx === indexArray[index]) {
          item = item.replace(/match/ig, ' match  match_current');
        }
        setOutputText(item);
        return item;
      });
    }
  };

  // 上移
  const upHandle = () => {
    const indexArray: Array<number> = [];
    const matchArray = outputText.filter((item, idx) => {
      if (item?.includes('match')) {
        indexArray.push(idx);
      }
      return item.includes('match');
    });
    const matchLength = matchArray.length;
    if (matchLength) {
      clearOutputText();
      const index = currentMatchIndex <= 0 ? matchLength - 1 : currentMatchIndex - 1;
      setCurrentMatchIndex(index);
      outputText.map((item: string, idx: number) => {
        item = item.replace(/match_current/ig, '');
        if (idx === indexArray[index]) {
          item = item.replace(/match/ig, ' match  match_current');
        }
        setOutputText(item);
        return item;
      });
    }
  };
  // const [currentTab, setCurrentTab] = useState<'output' | 'event' | 'worldstate'>('output')
  const { currentTab, setCurrentTab } = useAppStore();
  const { setIsHideBottom } = useIdeStore();

  const clearConsole = useCallback(() => {
    if (currentTab) {
      switch (currentTab) {
        case 'output':
          clearOutputText();
          break;
        case 'event':
          clearEventData();
          break;
        case 'worldstate':
          clearWorldState();
          break;
        default:
          break;
      }
    }
  }, [currentTab]);

  return (
    <>
      <div className="tabs">
        {
          tabs.map((tab) => (
            <div key={tab.id} className={tab.id === currentTab ? 'current' : ''} onClick={() => setCurrentTab(tab.id)}>
              <span title={tab.label}>{tab.label}</span>
            </div>
          ))
        }
        <span className="fn-right tabs-search-wrapper">
          {
            currentTab === 'output' && (
              <span className="search-tools">
                <img className="tabs-search-pre" src={searchIcon} />
                <Input className="tabs-search" value={searchContent} onChange={(val: string) => inputChange(val)} placeholder="搜索"></Input>
                <span className="tabs-search-icon">
                  <img className="tabs-search-down" src={searchDown} onClick={downHandle} />
                  <img className="tabs-search-up" src={searchUp} onClick={upHandle} />
                  <img className="tabs-search-close" src={searchClose} onClick={clearInputLog} />
                </span>
              </span>
            )
          }
          <span className="clear-all" title="清除" onClick={clearConsole}>清除</span>
          <span className="down-icon ico-min" onClick={() => setIsHideBottom(true)}></span>
        </span>
      </div>

      <div className="tabs-panel">
        <IDEOutputs style={{ display: currentTab === 'output' ? 'block' : 'none' }} />
        <IDEEvents style={{ display: currentTab === 'event' ? 'block' : 'none' }} />
        <IDEWorldState style={{ display: currentTab === 'worldstate' ? 'block' : 'none' }} />
        {/* {currentTab === 'output' && <IDEOutputs></IDEOutputs>}
        {currentTab === 'event' && <IDEEvents></IDEEvents>}
        {currentTab === 'worldstate' && <IDEWorldState></IDEWorldState>} */}
      </div>
    </>
  );
}
