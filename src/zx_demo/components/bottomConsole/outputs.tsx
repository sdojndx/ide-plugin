import React, { useCallback, useEffect } from 'react';
import { NotifyMsg, OutputResponse } from '@ide/types/ideEventListener';
import { useIdeStore } from '@ide/store';
import useAppStore from '@/zx_demo/store';
import appServer from '@/zx_demo/api/appServer';

const lineUUIDs: any = {};
export default function IDEOutputs({ style }: {
  style?: React.CSSProperties;
}) {
  const {
    outputText, setOriginOutputText, getFiles, getTreeNode
  } = useAppStore();
  const {
    openEditor, removeEditor,
    updateEditor, updateAllEditor
  } = useIdeStore();

  const getOutput = useCallback(({ msgList }: OutputResponse) => {
    // const getLastMessage: Array<NotifyMsg> = msgList.filter((item) => item.timestamp >= lastTimestamp);

    msgList.forEach((item: NotifyMsg) => {
      if (lineUUIDs[item.uuid]) {
        return;
      }
      lineUUIDs[item.uuid] = true;
      const data = JSON.parse(item.info);
      setOriginOutputText(data.output);
      switch (data.cmd) {
        case 'build':
          if (data.lints) {
            const linemap: any = {};
            data.lints.forEach((lint: any) => {
              if (!linemap[lint.file]) {
                linemap[lint.file] = [];
              }
              linemap[lint.file].push(lint);
            });
            // updateLints(linemap);
            for (const path in linemap) {
              updateEditor(path, {
                lints: linemap[path]
              });
            }
          } else {
            updateAllEditor({
              lints: undefined
            });
          }
          break;
        case 'update-file':
          // 更新已经打开的文件内容
          updateEditor(data.path, {
            action: {
              type: 'updateCode',
              v: new Date().getTime()
            }
          });
          break;
        case 'create-file':
          getFiles();
          break;
        case 'remove-file':
          getFiles();
          removeEditor(data.path);
          break;
        case 'rename-file':
          getFiles();
          updateEditor(data.path, {
            path: data.newPath
          });
          break;
        default:
          break;
      }
    });
  }, []);
  useEffect(() => {
    appServer?.addOutputListener?.(getOutput);
    return () => {
      appServer?.removeOutputListener?.();
    };
  }, [getOutput]);
  const click = useCallback((e: any) => {
    const dom: HTMLElement = e.target as HTMLElement;
    if (dom && dom.className === 'path') {
      const { path, line, column } = dom.dataset;
      if (path && line && column) {
        const nodeInfo = getTreeNode(path);
        openEditor({
          path,
          editable: nodeInfo?.editable,
          name: path.match(/[^/]+$/)?.[0],
          action: {
            Line: Number(line),
            Ch: Number(column),
            type: 'cursor'
          }
        });
      }
    }
  }, []);
  // useEffect(() => {
  //   setCurrentTab('output');
  // }, [outputText]);

  return (
    <div className='output ideoutput' style={style}>
      {
        outputText.map((text, idx) => (
          <p key={idx} onClick={(e) => click(e)} dangerouslySetInnerHTML={{ __html: text }}></p>
        ))
      }
    </div>
  );
}
