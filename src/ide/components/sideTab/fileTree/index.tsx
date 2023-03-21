import { TreeItem } from '@ide/types/tree';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tree } from 'tea-component/lib/tree/Tree';
import { Icon } from 'tea-component/lib/icon/Icon';
import { Popover } from 'tea-component/lib/popover/Popover';
import { DropdownBox } from 'tea-component/lib/dropdown/Dropdown';
import { List } from 'tea-component/lib/list/List';
import { Modal } from 'tea-component/lib/modal/Modal';
import { message } from 'tea-component';
import useIdeStore from '@ide/store';

const supportFileType = ['go', 'mod', 'sum', 'js', 'ts'];

function TreePopover({ item }: { item: TreeItem }) {
  const [visible, setVisible] = useState(false);
  const { setAddFileInfo, setModalStatus } = useIdeStore();
  const { server } = useIdeStore();
  const { setting } = useIdeStore();
  const { getFiles } = useIdeStore();
  const { openEditor, removeEditor } = useIdeStore();
  const removeFile = useCallback(async () => {
    if (!item.path) {
      return;
    }
    const yes = await Modal.confirm({
      message: '二次确认提示',
      description: '请再次确认是否删除该合约文件，删除后将无法恢复',
      okText: '删除',
      cancelText: '取消',
      className: `${setting.theme}_model`,
      maskStyle: {
        backgroundColor: 'rgba(0,0,0,0.2)'
      }
    });
    if (yes) {
      server?.removeFile?.(item.path).then(() => {
        getFiles();
        removeEditor(item.path);
      }).catch(e => {
        message.error({ content: e.message });
      });
    }
  }, [server]);
  const openFile = useCallback(() => {
    if (item.type === 'file') {
      event?.preventDefault();
      const type = item.path.match(/[^.]+$/)?.[0];
      if (type && supportFileType.indexOf(type) > -1) {
        openEditor({
          path: item.path,
          name: item.name
        });
      } else {
        setModalStatus({
          modalShow: true,
          modalContent: '不支持该类型文件'
        });
      }
    }
  }, []);
  const exportFile = useCallback(async () => {
    if (!item.path) {
      return;
    }
    const res = await server?.exportFile?.(item.path);
    if (res) {
      // const path = await server?.getDownloadPath?.(item.path);
      // if (path) {
      //   window.location.href = path;
      // }
      const a = document.createElement('a');
      a.setAttribute('target', '_blank');
      a.setAttribute('href', `${server?.requestPath}api/v1/ide/file/7z?path=${item.path}.7z`);
      a.setAttribute('download', `${server?.requestPath}api/v1/ide/file/7z?path=${item.path}.7z`);
      a.click();
      setTimeout(function () {
        a.remove();
      }, 10);
    }
  }, [server]);
  return <Popover
    visible={visible}
    onVisibleChange={visible => setVisible(visible)}
    placement="bottom-start"
    trigger="contextMenu"
    overlayClassName={`${setting.theme}_popover`}
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

export default function FileTree({ style }: {
  style?: React.CSSProperties;
}) {
  const { server } = useIdeStore();
  const { setActiveTreeNode } = useIdeStore();
  const { contract, getFiles, getGoModuleFiles, fileTree, userId } = useIdeStore();
  const [expandedIds, setExpandedIds] = useState<string[] | undefined>(undefined);
  const totalTree = useMemo(() => {
    return fileTree ? formatTree(fileTree).tree : [];
  }, [fileTree]);
  useEffect(() => {
    if (!contract?.contractName || !totalTree.length || Array.isArray(expandedIds) || !userId) {
      return;
    }
    setExpandedIds(JSON.parse(localStorage.getItem(`${userId}_${contract?.contractName}_expends`) || '[]'));
  }, [contract?.contractName, expandedIds, totalTree, userId]);
  const expendChange = useCallback((expends: string[]) => {
    localStorage.setItem(`${userId}_${contract?.contractName}_expends`, JSON.stringify(expends));
  }, [contract?.contractName, userId]);
  const activeTreeNode = useCallback((activeIds: any, context: any) => {
    const { path, name } = context.data;
    setActiveTreeNode({ path, name });
  }, []);
  const getTreeInfo = useCallback(async () => {
    await getFiles();
    await getGoModuleFiles();
  }, [server]);
  useEffect(() => {
    getTreeInfo();
  }, [server, contract?.contractName]);
  return <>
    {expandedIds && <Tree
      style={style}
      className="file_tree"
      activable
      fullExpandable
      defaultExpandParent={false}
      defaultExpandedIds={expandedIds}
      onActive={activeTreeNode}
      data={totalTree}
      onExpand={expendChange}
    />
    }</>;
}
