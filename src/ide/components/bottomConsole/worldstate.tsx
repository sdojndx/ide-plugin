import useIdeStore from '@ide/store';
import { Contract } from '@ide/types/contract';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Select } from 'tea-component';

export default function IDEWorldState({ style }: {
  style?: React.CSSProperties;
}) {
  const { contract, server } = useIdeStore();
  const [constracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const { worldState, unshiftWorldState, setWorldState } = useIdeStore();
  const [tree, setTree] = useState<{ [key: string]: { [keys: string]: any[] } }>({});
  const [contractTreeData, setContractTreeData] = useState<{ [keys: string]: any[] }>({});
  const [openStatus, setOpenStatus] = useState<boolean[]>([]);
  const { setModalStatus } = useIdeStore();
  const keyInputRef = useRef<HTMLTextAreaElement>(null);
  // 获取合约名称列表
  const getContractName = useCallback(async () => {
    const data = await server?.getContractNames();
    setContracts(data);
  }, [server]);
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
    if (selectedContract && selectedContract.contractName) {
      const list = tree[selectedContract.contractName];

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

      unshiftWorldState({ key: `${selectedContract.contractName}##0`, value: '' });
      return true;
    }
  }, [worldState, selectedContract, tree]);

  const deleteData = useCallback((key: string, index: number) => {
    if (!key) {
      setWorldState(worldState.filter((_, idx) => idx !== index));
    } else {
      if (selectedContract && selectedContract.contractName && Object.keys(tree).length !== 0) {
        const list = tree[selectedContract.contractName][key];
        let tempList = worldState;
        list.forEach((item) => {
          tempList = tempList.filter((state) => state.key !== item.key);
        });
        setWorldState(tempList);
      }
    }
  }, [worldState, tree, selectedContract]);

  const inputHandler = useCallback((type: 'key' | 'value', value: string, index: number) => {
    if (selectedContract && selectedContract.contractName) {
      if (type === 'key') {
        if (value && tree[selectedContract.contractName][value]) {
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
              key: `${selectedContract.contractName}#${value}#0`
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
  }, [worldState, selectedContract, keyInputRef, tree]);

  const openDetail = (e: React.MouseEvent, index: number) => {
    e?.preventDefault();
    setOpenStatus(openStatus.map((item, idx) => {
      if (idx === index) {
        return !item;
      }
      return item;
    }));
  };
  const contractOptions = useMemo(() => {
    // return constracts.filter((contract) => {
    //   if (contract?.contractName) {
    //     return !!tree[contract.contractName];
    //   } else {
    //     return false;
    //   }
    // }).map((contract) => ({ value: contract?.projectName || '', text: contract?.projectName }));
    return constracts.map((contract) => ({ value: contract?.projectName || '', text: contract?.projectName }));
  }, [constracts, tree]);

  useEffect(() => {
    if (worldState.length === 0 && contract.contractName) {
      setWorldState([{ key: `${contract.contractName}##0`, value: '' }]);
    }
    createTree();
  }, [createTree, contract]);

  useEffect(() => {
    if (Object.keys(tree).length !== 0) {
      if (selectedContract && selectedContract.contractName) {
        if (tree[selectedContract.contractName]) {
          setContractTreeData(tree[selectedContract.contractName]);
        } else {
          unshiftWorldState({ key: `${selectedContract.contractName}##0`, value: '' });
        }
      } else {
        // const keys = Object.keys(tree);
        // setContractTreeData(keys.reduce((ls, item) => {
        //   if (item) {
        //     return [...ls, ...tree[item]];
        //   }
        //   return ls;
        // }, []));
      }
    }
  }, [selectedContract, tree]);

  useEffect(() => {
    if (contract && contract.contractName && Object.keys(tree).length !== 0) {
      if (tree[contract.contractName]) {
        const arr = new Array(tree[contract.contractName].keys.length);
        arr.fill(false);
        setOpenStatus(arr);
      }
    }
  }, [contract, tree]);
  useEffect(() => {
    setSelectedContract(contract);
  }, [contract]);
  useEffect(() => {
    if (style?.display === 'block') {
      getContractName();
    }
  }, [style?.display]);

  return (
    <div className="worldstate" style={style}>
      <div className="button-list">
        <div className='button-form-item'>
          <div className='button-form-label'>项目名称：</div>
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            searchable
            appearance="button"
            options={contractOptions}
            value={selectedContract?.projectName}
            onChange={(value) => {
              if (value !== '全部') {
                setSelectedContract(constracts.find(item => item.projectName === value) || null);
              } else {
                setSelectedContract(null);
              }
            }}
          />
        </div>
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
              if (key !== '') {
                const list = contractTreeData[key].sort((a, b) => b.version - a.version);
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
                                      <div className='flex1'>{key}</div>
                                      <div className="open-btn" onClick={(e) => openDetail(e, idx)}></div>
                                    </div>
                                    <textarea className="flex3" value={currentValue.value} onChange={(e) => inputHandler('value', e.target.value, currentValue.index)}></textarea>
                                  </>

                                )
                                : (
                                  <>
                                    <div className="flex2 key-withbtn">
                                      <div className='flex1'>{key}</div>
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
