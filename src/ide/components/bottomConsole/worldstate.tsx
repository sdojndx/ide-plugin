import useIdeStore from '@ide/store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'tea-component';

export default function IDEWorldState({ style }: {
  style?: React.CSSProperties;
}) {
  const { contract } = useIdeStore();
  const { worldState, unshiftWorldState, setWorldState } = useIdeStore();
  const [tree, setTree] = useState<{ [key: string]: { [keys: string]: any[] } }>({});
  const [contractTreeData, setContractTreeData] = useState<{ [keys: string]: any[] }>({});
  const [openStatus, setOpenStatus] = useState<boolean[]>([]);
  const { setModalStatus } = useIdeStore();
  const keyInputRef = useRef<HTMLTextAreaElement>(null);

  const createTree = useCallback(() => {
    const treeTemp: { [key: string]: { [keys: string]: any[] } } = {};
    if (worldState.length) {
      worldState.forEach((item, idx) => {
        const names = item.key.split('#');
        const len = names.length;

        if (len > 0) {
          const middleName = names.slice(1, len - 1).join('#');
          const lastName = names[len - 1];
          if (!treeTemp[names[0]]) {
            treeTemp[names[0]] = {
              keys: [middleName]
            };
          } else {
            if (treeTemp[names[0]].keys.indexOf(middleName) === -1) {
              treeTemp[names[0]].keys.push(middleName);
            }
          }
          if (!treeTemp[names[0]][middleName]) {
            treeTemp[names[0]][middleName] = [];
          }
          treeTemp[names[0]][middleName].push(Object.assign({ version: lastName, index: idx, inputKey: '' }, item));
        }
      });
      setTree(treeTemp);
    }
  }, [worldState]);

  const addData = useCallback((type?: string) => {
    if (contract && contract.contractName) {
      const list = tree[contract.contractName];

      if (list) {
        let count = 0;
        for (const [, value] of Object.entries(list)) {
          count += value.length;
        }
        if (count >= 100) {
          if (type !== 'auto') {
            setModalStatus({
              modalShow: true,
              modalContent: '已超过最大上限，无法继续添加'
            });
          }
          return false;
        }
      }

      unshiftWorldState({ key: `${contract.contractName}##0`, value: '' });
      return true;
    }
  }, [worldState, contract, tree]);

  const deleteData = useCallback((key: string, index: number) => {
    if (!key) {
      setWorldState(worldState.filter((_, idx) => idx !== index));
    } else {
      if (contract && contract.contractName && Object.keys(tree).length !== 0) {
        const list = tree[contract.contractName][key];
        let tempList = worldState;
        list.forEach((item) => {
          tempList = tempList.filter((state) => state.key !== item.key);
        });
        setWorldState(tempList);
      }
    }
  }, [worldState, tree, contract]);

  const inputHandler = useCallback((type: 'key' | 'value', value: string, index: number) => {
    if (contract && contract.contractName) {
      if (type === 'key') {
        console.log('tree: ', tree);
        if (value && tree[contract.contractName][value]) {
          setModalStatus({
            modalShow: true,
            modalContent: '输入的属性不能重复哦！'
          });
          return;
        }
        setWorldState(worldState.map((item, idx) => {
          if (idx === index) {
            return {
              ...item,
              key: `${contract.contractName}#${value}#0`
            };
          }
          return item;
        }));
      } else if (type === 'value') {
        setWorldState(worldState.map((item, idx) => {
          if (idx === index) {
            return {
              ...item,
              value
            };
          }
          return item;
        }));
      }
    }
  }, [worldState, contract, keyInputRef, tree]);

  const openDetail = (e: React.MouseEvent, index: number) => {
    e?.preventDefault();
    setOpenStatus(openStatus.map((item, idx) => {
      if (idx === index) {
        return !item;
      }
      return item;
    }));
  };

  useEffect(() => {
    if (worldState.length === 0) {
      setWorldState([{ key: `${contract.contractName}##0`, value: '' }]);
    }
    createTree();
  }, [createTree, worldState]);

  useEffect(() => {
    if (contract && contract.contractName && Object.keys(tree).length !== 0) {
      if (tree[contract.contractName]) {
        setContractTreeData(tree[contract.contractName]);
      } else {
        unshiftWorldState({ key: `${contract.contractName}##0`, value: '' });
      }
    }
  }, [contract, tree]);

  useEffect(() => {
    if (contract && contract.contractName && Object.keys(tree).length !== 0) {
      if (tree[contract.contractName]) {
        const arr = new Array(tree[contract.contractName].keys.length);
        arr.fill(false);
        setOpenStatus(arr);
      }
    }
  }, [contract, tree]);

  return (
    <div className="worldstate" style={style}>
      <div className="button-list">
        <Button type='primary' onClick={() => addData()}>新增</Button>
      </div>
      <div className="worldstate-form">
        <div className="header">
          <div className="flex2">key</div>
          <div className="flex3">value</div>
          <div className="flex1">Version</div>
        </div>
        <div className="table-body">
          {
            contractTreeData[''] && (
              contractTreeData[''].map((currentValue) => (
                <div className="cont" key={currentValue.index}>
                  <div className="cont-list">
                    <div className="item">
                      <textarea className="flex2" ref={keyInputRef} defaultValue={''} onBlur={(e) => inputHandler('key', e.target.value, currentValue.index)}></textarea>
                      <textarea className="flex3" defaultValue={currentValue.value} onBlur={(e) => inputHandler('value', e.target.value, currentValue.index)}></textarea>
                      <div className="flex1">{currentValue.version}</div>
                    </div>
                  </div>
                  <div className="operation" onClick={() => deleteData('', currentValue.index)}></div>
                </div>
              ))
            )
          }
          {
            contractTreeData.keys && contractTreeData.keys.map((key, idx) => {
              const list = contractTreeData[key].sort((a, b) => b.version - a.version);
              if (key !== '') {
                return (
                  <div className="cont" key={idx}>
                    <div className={`cont-list ${openStatus[idx] && 'open'}`} onDoubleClick={(e) => openDetail(e, idx)}>
                      {
                        list.map((currentValue, index) => (
                          <div className="item" key={currentValue.index}>
                            {
                              index === 0
                                ? (
                                  <>
                                    <div className="flex2 key-withbtn">
                                      {key}{index === 0 && (<div className="open-btn" onClick={(e) => openDetail(e, idx)}></div>)}
                                    </div>
                                    <textarea className="flex3" defaultValue={currentValue.value} onBlur={(e) => inputHandler('value', e.target.value, currentValue.index)}></textarea>
                                  </>

                                )
                                : (
                                  <>
                                    <div className="flex2 key-withbtn">
                                      {key}
                                    </div>
                                    <div className="flex3">{currentValue.value}</div>
                                  </>
                                )
                            }
                            <div className="flex1">{currentValue.version}</div>
                          </div>
                        ))
                      }
                    </div>
                    <div className="operation" onClick={() => deleteData(key, idx)}></div>
                  </div>
                );
              }
              return '';
            })
          }
        </div>
      </div>
    </div>
  );
}
