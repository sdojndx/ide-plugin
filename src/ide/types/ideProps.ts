import React from 'react';
import { IdeEventListener } from './ideEventListener';

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
   * ide组件的事件监听函数
   * @returns
   */
  ideEventListener: IdeEventListener,
  userId?: string | number;
  /**
   * 左导航模块,如果不传则页面不展示这个模块 （可切换的导航）
   */
  leftNavMenuContent?:React.ReactNode;
  /**
   * 左导航功能区模块 （一般为随左导航切换的功能区域）
   */
  leftNavContent?:React.ReactNode;
  /**
   * 编辑区右侧区域模块
   */
  rightContent?:React.ReactNode;
  /**
   *  底部日志区域模块，不传则不展示
   */
  bottomContent?:React.ReactNode;
}
