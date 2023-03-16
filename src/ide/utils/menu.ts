// svg
import file from '@ide/static/svgs/file.svg';
import fileActive from '@ide/static/svgs/file-active.svg';
import adjust from '@ide/static/svgs/adjust.svg';
import adjustActive from '@ide/static/svgs/adjust-active.svg';
import build from '@ide/static/svgs/build.svg';
import buildActive from '@ide/static/svgs/build-active.svg';
import deploy from '@ide/static/svgs/deploy.svg';
import deployActive from '@ide/static/svgs/deploy-active.svg';
import call from '@ide/static/svgs/call.svg';
import callActive from '@ide/static/svgs/call-active.svg';
import setup from '@ide/static/svgs/setup.svg';

export interface MenuItem {
  title: string,
  icon: string,
  active: string,
  type: string
}

export const MENU_LIST: Array<MenuItem> = [{
  title: '文件浏览',
  icon: file,
  active: fileActive,
  type: 'fileTree'
}, {
  title: '合约调试',
  icon: adjust,
  active: adjustActive,
  type: 'contractDebug'
}, {
  title: '合约编译',
  icon: build,
  active: buildActive,
  type: 'contractCompile'
}, {
  title: '合约部署',
  icon: deploy,
  active: deployActive,
  type: 'contractDeploy'
}, {
  title: '合约调用',
  icon: call,
  active: callActive,
  type: 'contractCall'
}, {
  title: '设置',
  icon: setup,
  active: setup,
  type: 'set'
}];
