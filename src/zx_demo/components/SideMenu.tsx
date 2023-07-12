import React from 'react';
import { List, Tooltip } from 'tea-component';
import { SideNavs } from '@ide/types/ideProps';
import useAppStore from '../store';

export default function SideMenu({
  navList
}: {
  navList:SideNavs[]
}) {
  const { activeTab, setActiveTab, setModalVisible } = useAppStore();

  return <List>
    {navList.map((item) => <Tooltip key={item.id} title={item.name}>
      <List.Item onClick={() => {
        if (item.id !== 'set') {
          setActiveTab(item.id);
        } else {
          setModalVisible(true);
        }
      }} className={`side-menu-list ${item.id === 'set' && 'side-menu-list_set'}`}>{activeTab === item.id ? item.activeMenuIcon || item.menuIcon : item.menuIcon}</List.Item>
    </Tooltip>)}
  </List>;
}
