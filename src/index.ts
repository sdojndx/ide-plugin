import IdeComponent from './ide/index.tsx';
import { useIdeStore } from './ide/store/index.ts';
import theme from './ide/components/codeEditor/theme.ts';
export type * from './ide/types/index.d.ts';
export type * from './ide/store/index.d.ts';

export {
  theme,
  useIdeStore,
  IdeComponent
};
