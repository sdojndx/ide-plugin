import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, message, Select, Switch, Text, Icon, Bubble, Copy } from 'tea-component';
import addParamIcon from '@ide/static/svgs/add-icon.svg';
import deleteParamIcon from '@ide/static/svgs/delete-icon.svg';
import { Contract, ContractKv } from '@ide/types/contract';
import { BuildContractParam, RunContractParam } from '@ide/types/ideEventListener';
import { getContractOptionText, getLocalStorage, removeLocalStorage, setLocalStorage } from '@ide/utils/tools';
import useAppStore from '@/zx_demo/store';
import { useServerStore } from '@ide/store/serverStore';
import appServer from '@/zx_demo/api/appServer';

export default function ContractDebug({ style }: {
  style?: React.CSSProperties;
}) {
  const { ideEventListener } = useServerStore();
  const { setOriginOutputText, contract, hasBuild, getHasBuild, setEventData, setWorldState, worldState } = useAppStore();
  const [constracts, setContracts] = useState<Contract[]>([]);
  const [crossContracts, setCrossContracts] = useState<Contract[]>([{ contractName: '', projectName: '', path: '' }]);
  const [selectedCrossContracts, setSelectedCrossContracts] = useState<Contract[]>([{ contractName: '', projectName: '', path: '' }]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractMethods, setContractMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>();
  const [contraceKvs, setContractKvs] = useState<ContractKv[]>([{ key: '', value: '', keyError: false, valueError: false }]);
  const [userContractMethod, setUserContractMethod] = useState('');
  const [canCross, setCanCross] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [buildResult, setBuildResult] = useState<{ complete: boolean; status: 'success' | 'error', msg: string; }>({ complete: false, status: 'error', msg: '' });
  // 获取合约名称列表
  const getContractName = useCallback(async () => {
    setContracts([contract]);
    setSelectedContract(contract);
    const data = await appServer?.getContractNames();
    setContracts(data);
    // const availableContracts = data.filter((item: any) => item.contractName !== contract.contractName);
    if (data?.length) {
      setCrossContracts(data);
      setSelectedCrossContracts([data[0]]);
    }
  }, [contract, ideEventListener]);

  const crossContractsOptions = useMemo(() => {
    return crossContracts.map((contract) => {
      const selectCrossContractNames = selectedCrossContracts.map(item => item.contractName);
      const disabled = selectCrossContractNames.indexOf(contract.contractName) > -1;
      return {
        disabled,
        value: contract?.contractName || '',
        text: getContractOptionText(contract),
        tooltip: `${contract.projectName}${contract.contractAddr ? '(' + contract.contractAddr + ')' : ''}`
      };
    });
  }, [crossContracts, selectedCrossContracts]);

  // 获取合约方法名列表
  const getContractMethod = useCallback(async () => {
    if (!selectedContract || !selectedContract.path) {
      return;
    }
    const data = await appServer?.getContractMethod(selectedContract.path);
    const jsonParsed = JSON.parse(data);
    if (jsonParsed.methods?.length) {
      setContractMethods([...jsonParsed.methods, '自定义']);
      setSelectedMethod(jsonParsed.methods[0]);
    } else {
      setContractMethods(['自定义']);
      setSelectedMethod('自定义');
    }
  }, [selectedContract, ideEventListener]);

  function addContractKv() {
    setContractKvs([...contraceKvs, { key: '', value: '', keyError: false, valueError: false }]);
  }

  function deleteContractKv(idx: number) {
    setContractKvs(contraceKvs.filter((item, i) => i !== idx));
  }

  function setKvValue(type: 'key' | 'value', value: string, idx: number) {
    if (type === 'key') {
      const exp = /^[\w]+$/;
      setContractKvs(contraceKvs.map((kv, i) => {
        if (i === idx) {
          return {
            ...kv,
            key: value,
            keyError: value ? !exp.test(value) : false
          };
        }
        return kv;
      }));
    }
    if (type === 'value') {
      // const exp1 = /^[^~!@#$^&*()=|;<>?~！@#￥……&*（）——|【】‘；：”“。，、？]+$/;
      // const exp2 = /^[\w\\.{}:'"-\u4e00-\u9fa5]+$/;
      setContractKvs(contraceKvs.map((kv, i) => {
        if (i === idx) {
          return {
            ...kv,
            value,
            valueError: false
          };
        }
        return kv;
      }));
    }
  }

  const addCrossContract = useCallback(() => {
    if (crossContracts.length <= selectedCrossContracts.length) {
      message.error({
        content: '没有更多可选择的链了'
      });
      return;
    }
    const selectCrossContractNames = selectedCrossContracts.map(item => item.contractName);
    const autoSelect = crossContracts.find(contract => selectCrossContractNames.indexOf(contract.contractName) === -1);
    if (autoSelect) {
      setSelectedCrossContracts([...selectedCrossContracts, autoSelect]);
    }
  }, [crossContracts, selectedCrossContracts]);

  function deleteCrossContract(idx: number) {
    setSelectedCrossContracts(
      selectedCrossContracts.filter((_, i) => i !== idx)
    );
  }

  function handleCrossContractChange(value: string, index: number) {
    const selected = crossContracts.find((item) => item.contractName === value);
    if (!selected) return;
    const newSelectedCrossContracts = selectedCrossContracts.slice();
    newSelectedCrossContracts[index] = selected;
    setSelectedCrossContracts(newSelectedCrossContracts);
  }

  // 构建合约
  const buildContract = useCallback(() => {
    if (!selectedContract) {
      message.error({ content: '请选择合约！' });
      return;
    }
    setShowLoading(true);
    const param: BuildContractParam = {
      contractName: selectedContract.contractName!,
      crossInvoke: canCross,
      crossInvokeContractNameList: canCross && selectedCrossContracts.length ? selectedCrossContracts.map(item => item.contractName!) : []
    };
    appServer?.postContractRunBuild(param).then(() => {
      setShowLoading(false);
      getHasBuild(appServer?.getContractHasBuild);
    }).catch(() => {
      setShowLoading(false);
    });
  }, [selectedContract, canCross, selectedCrossContracts]);

  // 执行合约
  const runContract = useCallback(async () => {
    const contractMethod = selectedMethod === '自定义' ? userContractMethod : selectedMethod;
    if (!selectedContract || !contractMethod) {
      message.error({ content: '请选择合约和方法！' });
      return;
    }
    if (contraceKvs.length) {
      for (let i = 0; i < contraceKvs.length; i++) {
        const kv = contraceKvs[i];
        if (kv.keyError || kv.valueError) { // || kv.key.length === 0 || kv.value.length === 0) {
          message.error({ content: '请检查参数是否正确！' });
          return;
        }
      }
    }
    setShowLoading(true);
    setBuildResult({
      ...buildResult,
      complete: false
    });
    const args: { [key: string]: string } = {};
    contraceKvs.forEach(kv => {
      args[kv.key] = kv.value;
    });

    const mapGlobalState: { [key: string]: string } = {};
    worldState.forEach(item => {
      mapGlobalState[item.key] = item.value;
    });
    const param: RunContractParam = {
      contractName: selectedContract.contractName!,
      crossInvoke: canCross,
      crossInvokeContractNameList: canCross && selectedCrossContracts.length ? selectedCrossContracts.map(item => item.contractName!) : [],
      contractMethod,
      args,
      globalStates: mapGlobalState
    };

    appServer?.postContractInvokeAll(param).then(result => {
      setShowLoading(false);
      // 日志输出
      const logs = result.logs;
      const className = result.response.status === 0 ? 'build-succ' : 'build-error';
      if (logs.length) {
        logs.forEach((item: string) => {
          setOriginOutputText(
            '<span class="' + className + '">' + item + '</span>'
          );
        });
      }
      const { response, events, globalStates } = result;
      setBuildResult({
        complete: true,
        status: response.status === 0 ? 'success' : 'error',
        msg: response.status === 0 ? (response.payload || '执行成功') : response.message
      });

      if (events) {
        setEventData(events);
      }
      if (globalStates) {
        const globalStateArr = Object.keys(globalStates).map((key) => ({ key, value: globalStates[key] }));
        setWorldState(globalStateArr);
      }
    }).catch(() => {
      setShowLoading(false);
    });
  }, [canCross, selectedCrossContracts, userContractMethod, selectedContract, selectedMethod, contraceKvs, worldState, ideEventListener]);

  const resetParam = () => {
    setContractKvs([{
      key: '',
      value: '',
      keyError: false,
      valueError: false
    }]);
    setCanCross(false);
    // setCrossContracts([]);
  };

  const resetAllParam = () => {
    removeLocalStorage('debug');
    resetParam();
  };

  const updateLocalParam = useCallback((param: any) => {
    if (selectedContract?.contractName && selectedMethod) {
      setLocalStorage('debug', selectedContract.contractName, selectedMethod, param);
    }
  }, [selectedContract, selectedMethod]);

  useEffect(() => {
    if (selectedContract?.contractName && selectedMethod) {
      const param = getLocalStorage('debug', selectedContract.contractName, selectedMethod);
      const { contraceKvs, canCross, selectedCrossContracts } = param;
      setContractKvs(contraceKvs || [{ key: '', value: '', keyError: false, valueError: false }]);
      setCanCross(canCross || false);
      setSelectedCrossContracts(selectedCrossContracts || [{ contractName: '', projectName: '', path: '' }]);
    }
  }, [selectedContract, selectedMethod]);

  useEffect(() => {
    updateLocalParam({
      contraceKvs, canCross, selectedCrossContracts
    });
  }, [contraceKvs, canCross, selectedCrossContracts]);

  useEffect(() => {
    if (!contract.contractName || !contract.path || !contract.projectName || style?.display !== 'block') {
      return;
    }
    getContractName();
  }, [contract, style?.display]);

  useEffect(() => {
    if (selectedContract && style?.display === 'block') {
      getContractMethod();
    }
  }, [selectedContract, style?.display]);
  return (
    <div style={style} className="nav_tab">
      <Form className='side_tab_form' layout="vertical">
        <Form.Item label="项目名称">
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            appearance="button"
            options={constracts.map((contract) => ({ value: contract?.projectName || '', text: contract?.projectName }))}
            value={selectedContract?.projectName}
            onChange={(value) => {
              setSelectedContract(constracts.find(item => item.projectName === value) || null);
            }}
          />
        </Form.Item>
        <Form.Item label="合约方法">
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            appearance="button"
            options={contractMethods.map((method) => ({ value: method || '', text: method }))}
            value={selectedMethod}
            onChange={(value) => setSelectedMethod(value)}
          />
          {selectedMethod === '自定义' && <Input className="select-next-input" size="full" value={userContractMethod} onChange={setUserContractMethod} />}
        </Form.Item>
        {/* <div className="func">
          <Text className="label">合约方法</Text>
          <select className="func-select" value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}>
            {
              contractMethods.length
                ? (
                  contractMethods.map((method) => <option value={method} key={method}>{method}</option>)
                )
                : (
                  <option>暂无方法名</option>
                )
            }
          </select>
          { selectedMethod === '自定义' && <Input className="select-next-input" value={userContractMethod} onChange={setUserContractMethod}/> }
        </div> */}
      </Form>
      <div className="params-container">
        {
          contraceKvs.map((kv, idx) => (
            <div className="param" key={idx}>
              <div className="left">
                <div className="key">
                  <span>key</span>
                  <div className="input-value-container">
                    <Input value={kv.key} onChange={(e) => setKvValue('key', e, idx)} />
                    {kv.keyError && <Text theme='danger' className='err-msg'>只能输入字母，下划线，数字。</Text>}
                  </div>
                </div>
                <div className="value">
                  <span>value</span>
                  <div className="input-value-container">
                    <Input value={kv.value} onChange={(e) => setKvValue('value', e, idx)} />
                    {kv.valueError && <Text theme='danger' className='err-msg'>字母、汉字、下划线，数字，常规的一些符号都可输入，不能输入特殊字符。</Text>}
                  </div>
                </div>
              </div>
              <div className="right">
                {idx === 0 ? <img className="add-param-btn" src={addParamIcon} alt="" onClick={addContractKv} /> : <img className="add-param-btn" src={deleteParamIcon} alt="" onClick={() => deleteContractKv(idx)} />}
              </div>
            </div>
          ))
        }
      </div>

      <div className="form-switch">
        是否跨合约调用<Switch value={canCross} onChange={setCanCross}></Switch>
      </div>

      {
        canCross && (
          <div className="crosscontract-container">
            {
              selectedCrossContracts.map((item, idx) => (
                <div className="crosscontract-item" key={idx}>
                  {/* <select className="func-select crosscontract-select" value={item?.contractName} onChange={(e) => handleCrossContractChange(e.target.value, idx)}>
                    {
                      crossContracts.map((contract, idx) => (
                        <option key={`${contract?.contractName}_${idx}`} value={contract?.contractName}>{contract?.projectName}</option>
                      ))
                    }
                  </select> */}
                  <Select
                    className="set-height"
                    size="full"
                    matchButtonWidth
                    appearance="button"
                    value={item?.contractName}
                    options={crossContractsOptions}
                    onChange={(value) => handleCrossContractChange(value, idx)}
                  />
                  {!item?.contractAddr || <Bubble dark>
                    <Copy
                      text={item.contractAddr}
                      tips={copied =>
                        copied
                          ? (
                            '复制成功'
                          )
                          : (
                            <>
                              <div style={{ textAlign: 'center' }}>点击复制</div>
                              <div>{item.contractAddr}</div>
                            </>
                          )
                      }>
                      <Icon type="copy" />
                    </Copy>
                  </Bubble>
                  }
                  {
                    idx === 0 ? <img src={addParamIcon} alt="" onClick={addCrossContract} /> : <img src={deleteParamIcon} alt="" onClick={() => deleteCrossContract(idx)} />
                  }
                </div>
              ))
            }
          </div>
        )
      }

      {
        !showLoading && <div className="debug-btns">
          <Button type="primary" onClick={buildContract} >构建合约</Button>
          <Button type={hasBuild ? 'weak' : 'primary'} onClick={runContract} disabled={hasBuild}>执行合约</Button>
        </div>
      }
      {
        showLoading && (
          <div className="debug-btn-loading">
            <div className="loading-icon"></div>
          </div>
        )
      }

      <div className="debug-extens-btns">
        <Button type="text" onClick={resetParam}>清空当前数据</Button>
        <Button type="text" onClick={resetAllParam}>重置全部数据</Button>
      </div>

      {
        buildResult.complete && (
          <div className="debug-result">
            <Text className="label">执行结果</Text>
            <div className={`content ${buildResult.status === 'success' ? 'build-succ' : 'build-error'}`}>{buildResult.msg}</div>
          </div>
        )
      }
    </div >
  );
}
