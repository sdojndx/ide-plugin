import React, { useCallback, useEffect } from 'react';
import { NotifyMsg, OutputResponse } from '@ide/types/ideServer';
import useIdeStore from '@ide/store';

const lineUUIDs: any = {};
export default function IDEOutputs({ style }: {
  style?: React.CSSProperties;
}) {
  const { outputText, setOutputText, setOriginOutputText, openEditor, updateEditor, updateAllEditor, updateLints } = useIdeStore();
  const { server } = useIdeStore();
  const { setCurrentTab } = useIdeStore();

  const getOutput = useCallback(({ msgList }: OutputResponse) => {
    // const getLastMessage: Array<NotifyMsg> = msgList.filter((item) => item.timestamp >= lastTimestamp);

    msgList.forEach((item: NotifyMsg) => {
      if (lineUUIDs[item.uuid]) {
        return;
      }
      lineUUIDs[item.uuid] = true;
      const data = JSON.parse(item.info);
      setOutputText(data.output);
      setOriginOutputText(data.output);
      switch (data.cmd) {
        case 'build':
          if (data.lints) {
            // console.log(data)
            const linemap: any = {};
            data.lints.forEach((lint: any) => {
              if (!linemap[lint.file]) {
                linemap[lint.file] = [];
              }
              linemap[lint.file].push(lint);
            });
            updateLints(linemap);
            // for (const path in linemap) {
            //   updateEditor(path, {
            //     lints: linemap[path]
            //   })
            // }
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
              type: 'update',
              v: new Date().getTime()
            }
          });
          break;
        default:
          break;
      }
    });
  }, []);
  useEffect(() => {
    server?.addOutputListener?.(getOutput);
    return () => {
      server?.removeOutputListener?.();
    };
  }, [server, getOutput]);
  const click = useCallback((e: any) => {
    const dom: HTMLElement = e.target as HTMLElement;
    if (dom && dom.className === 'path') {
      const { path, line, column } = dom.dataset;
      if (path && line && column) {
        openEditor({
          path,
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
  useEffect(() => {
    setCurrentTab('output');
  }, [outputText]);

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
