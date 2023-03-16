import React from 'react';

export type TreeIcon = ({ expanded }: { expanded: boolean; }) => React.ReactNode;
export interface TreeItem {
  id: string;
  content: React.ReactNode | string;
  name: string;
  type?: string;
  children?: TreeItem[];
  icon?: React.ReactNode | string | TreeIcon;
  path: string;
  editable?: boolean;
}
