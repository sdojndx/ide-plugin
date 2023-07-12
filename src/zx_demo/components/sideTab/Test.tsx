import { useIdeStore } from '@ide/store';
import { useServerStore } from '@ide/store/serverStore';
import React, { useEffect } from 'react';

export default function Test() {
  const { ideEventListener } = useServerStore();
  useEffect(() => {
  }, []);
  return <div>Test</div>;
}
