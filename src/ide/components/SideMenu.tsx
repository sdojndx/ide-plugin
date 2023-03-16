import React from 'react';
import { List, Tooltip } from 'tea-component';
import { MENU_LIST } from '@ide/utils/menu';
import useIdeStore from '@ide/store';

export default function SideMenu({ value, onChange }: { value: string, onChange: (type: string) => void }) {
  const { setModalVisible } = useIdeStore();

  return <List>
    {MENU_LIST.map((item) => <Tooltip key={item.type} title={item.title}>
      <List.Item onClick={() => {
        if (item.type !== 'set') {
          onChange(item.type);
        } else {
          setModalVisible(true);
        }
      }} className={`side-menu-list ${item.type === 'set' && 'side-menu-list_set'}`}><img src={value === item.type ? item.active : item.icon} /></List.Item>
    </Tooltip>)}
  </List>;
}
