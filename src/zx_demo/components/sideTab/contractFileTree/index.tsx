import { TreeItem } from '@/zx_demo/types/tree';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tree } from 'tea-component/lib/tree/Tree';
import { Icon } from 'tea-component/lib/icon/Icon';
import { Popover } from 'tea-component/lib/popover/Popover';
import { DropdownBox } from 'tea-component/lib/dropdown/Dropdown';
import { List } from 'tea-component/lib/list/List';
import { Modal } from 'tea-component/lib/modal/Modal';
import { useIdeStore } from '@ide/store';
import { FILE_TYPES } from '@/zx_demo/utils/menu';
import useAppStore from '@/zx_demo/store';
import appServer from '@/zx_demo/api/appServer';
import { useServerStore } from '@ide/store/serverStore';

function TreePopover({ item }: { item: TreeItem }) {
  const [visible, setVisible] = useState(false);
  const { getFiles, setAddFileInfo, setAlartModalContent, getTreeNode } = useAppStore();
  const { ideEventListener } = useServerStore();
  const { ideTheme, openEditor, removeEditor } = useIdeStore();
  const removeFile = useCallback(async () => {
    if (!item.path) {
      return;
    }
    const yes = await Modal.confirm({
      message: '二次确认提示',
      description: '请再次确认是否删除该合约文件，删除后将无法恢复',
      okText: '删除',
      cancelText: '取消',
      className: `${ideTheme}_model`,
      maskStyle: {
        backgroundColor: 'rgba(0,0,0,0.2)'
      }
    });
    if (yes) {
      appServer?.removeFile?.(item.path).then(() => {
        getFiles();
        removeEditor(item.path);
      });
    }
  }, []);
  const openFile = useCallback(() => {
    if (item.type === 'file') {
      event?.preventDefault();
      const type = item.path.match(/[^.]+$/)?.[0];
      if (type && FILE_TYPES.indexOf(type) > -1) {
        const nodeInfo = getTreeNode(item.path);
        openEditor({
          path: item.path,
          name: item.name,
          editable: nodeInfo?.editable
        });
      } else {
        setAlartModalContent('不支持该类型文件');
      }
    }
  }, []);
  const exportFile = useCallback(async () => {
    if (!item.path) {
      return;
    }
    appServer?.exportFile?.(item.path);
  }, [ideEventListener]);
  return <Popover
    visible={visible}
    onVisibleChange={visible => setVisible(visible)}
    placement="bottom-start"
    trigger="contextMenu"
    overlayClassName={`${ideTheme}_popover`}
    overlay={
      <DropdownBox>
        <List type="option" className="popover-list">
          {item.type !== 'file' && item.creatable === true && <List.Item
            onClick={(e) => {
              e.stopPropagation();
              setAddFileInfo({
                isOpenAddFile: true,
                newFilePath: item.path,
                newFileName: '.go',
                addFileType: 'file'
              });
              setVisible(false);
            }}
          >
            创建文件
          </List.Item>}
          {item.type !== 'file' && item.creatable === true && <List.Item
            onClick={(e) => {
              e.stopPropagation();
              setAddFileInfo({
                isOpenAddFile: true,
                newFilePath: item.path,
                newFileName: '',
                addFileType: 'folder'
              });
              setVisible(false);
            }}
          >
            创建文件夹
          </List.Item>}
          {item.type === 'folder' || < List.Item
            onClick={(e) => {
              e.stopPropagation();
              openFile();
              setVisible(false);
            }}
          >
            打开
          </List.Item>}
          {item.removable === false ||
            <List.Item
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
                setVisible(false);
              }}
            >
              删除
            </List.Item>}
          {item.removable === false || <List.Item
            onClick={(e) => {
              e.stopPropagation();
              setAddFileInfo({
                isOpenAddFile: true,
                newFilePath: item.path,
                newFileName: item.name,
                addFileType: 'rename'
              });
              setVisible(false);
            }}
          >
            重命名
          </List.Item>}
          {item.editable === false || <>
            <li className='line-space'></li>
            <List.Item
              onClick={(e) => {
                e.stopPropagation();
                exportFile();
                setVisible(false);
              }}
            >
              导出
            </List.Item>
          </>}
        </List>
      </ DropdownBox>
    }
  >
    <span onDoubleClick={openFile}>{item.name}</span>
  </Popover>;
}

function formatTree(tree: TreeItem[]): { tree: TreeItem[], expendIds: string[] } {
  const expendIds: string[] = [];
  function format(tree: TreeItem[]): TreeItem[] {
    return tree.map(item => {
      const { type, children, id } = item;
      if (type === 'file') {
        expendIds.push(id);
      }
      return {
        ...item,
        content: <TreePopover item={item} />,
        icon: type === 'file'
          ? <Icon type="daily" />
          : ({ expanded }: { expanded: boolean }) => {
            return <Icon type={expanded ? 'folderopen' : 'folderclose'} />;
          },
        children: children ? format(children) : undefined
      };
    });
  }
  const newTree = format(tree);
  return { tree: newTree, expendIds };
}

export default function ContractFileTree({ style }: {
  style?: React.CSSProperties;
}) {
  const { user, contract, fileTree, getFiles, getGoModuleFiles, setActiveTreeNode } = useAppStore();
  const [expandedIds, setExpandedIds] = useState<string[] | undefined>(undefined);
  const totalTree = useMemo(() => {
    return fileTree ? formatTree(fileTree).tree : [];
  }, [fileTree]);
  useEffect(() => {
    if (!contract?.contractName || !totalTree.length || Array.isArray(expandedIds) || !user.id) {
      return;
    }
    setExpandedIds(JSON.parse(localStorage.getItem(`${user.id}_${contract?.contractName}_expends`) || '[]'));
  }, [contract?.contractName, expandedIds, totalTree, user.id]);
  const expendChange = useCallback((expends: string[]) => {
    setExpandedIds(expends);
  }, []);
  const activeTreeNode = useCallback((activeIds: any, context: any) => {
    // const { path, name } = context.data;
    setActiveTreeNode(context.data);
  }, []);
  const getTreeInfo = useCallback(async () => {
    await getFiles();
    await getGoModuleFiles();
  }, []);
  useEffect(() => {
    getTreeInfo();
  }, [contract?.contractName]);
  return <>
    {expandedIds && <Tree
      style={style}
      className="file_tree"
      activable
      fullExpandable
      defaultExpandParent={false}
      expandedIds={expandedIds}
      onActive={activeTreeNode}
      data={totalTree}
      onExpand={expendChange}
    />
    }</>;
}
