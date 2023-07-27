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
  leftNavMenuContent?: React.ReactNode;
  /**
   * 左导航功能区模块 （一般为随左导航切换的功能区域）
   */
  leftContent?: React.ReactNode;
  /**
   * 左导航功能区模块默认宽度
   */
  leftNavContentWidth?: number;
  /**
   * 编辑区右侧区域模块
   */
  rightContent?: React.ReactNode;
  /**
   * 编辑区右侧区域模块宽度
   */
  rightContentWidth?: number;
  /**
   *  底部日志区域模块，不传则不展示
   */
  bottomContent?: React.ReactNode;
  /**
   * 底部日志区域模块默认高度
   */
  bottomContentHeight?: number;
  /**
   * 自动保存的时间间隔
   */
  autoSaveSpace?: number;
}
