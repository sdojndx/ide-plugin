import React from 'react';
import { IdeSetting } from '@/zx_demo/store/settingStore';
import { IdeEventListener } from './IdeEventListener';

export interface SideNavs{
  menuIcon?: React.ReactNode;
  activeMenuIcon?: React.ReactNode;
  name?: string;
  components: React.ReactNode;
  id: string;
};

export interface IdeProps{
  /**
   * ide顶部模块
   */
  headerContent?: React.ReactNode;
  /**
   * 监听创建函数
   * @param store ide组件内部数据
   * @returns
   */
  ideEventListener: IdeEventListener,
  userId?: string | number;
  /**
   * 左导航模块,如果不传则页面不展示这个模块 （可切换的导航）
   */
  leftNavMenuContent:React.ReactNode;
  /**
   * 左导航功能区模块 （一般为随左导航切换的功能区域）
   */
  leftNavContent:React.ReactNode;
  /**
   *  地步日志区域模块，不传则不展示
   */
  bottomContent:React.ReactNode;
}
