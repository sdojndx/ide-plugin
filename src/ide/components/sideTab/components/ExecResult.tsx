import useIdeStore from '@ide/store';
import React, { useEffect, useState } from 'react';

// 执行结果
export function ExecResult(props: {
  result?: string;
}) {
  const { server } = useIdeStore();
  const [isPluginReady, setIsPluginReady] = useState<boolean>(false);
  useEffect(() => {
    server?.pluginIsReady().then(res => {
      setIsPluginReady(res);
    });
  }, [server]);
  return <div className="deploy-result tea-mt-4n">
    <p className="white-text">执行结果</p>
    <div className="content">
      {isPluginReady
        ? (
          props.result || '插件已准备就绪'
        )
        : (
          <p>
            检测到您未安装至信链Web签名插件，请点击
            <a target="_blank" href={server?.pluginDownloadPage} rel="noreferrer">
              下载并安装
            </a>
            后，再部署合约
          </p>
        )}
    </div>
  </div>;
}
