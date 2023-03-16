import useIdeStore from '@ide/store';
import React, { useEffect } from 'react';

export default function Test() {
  const { server } = useIdeStore();
  useEffect(() => {
    // server?.getContractFiles?.('nft').then(res => {
    //   console.log(res)
    // })
  }, [server]);
  return <div>Test</div>;
}
