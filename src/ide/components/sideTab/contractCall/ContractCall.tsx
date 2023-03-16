import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  message,
  notification,
  Switch
} from 'tea-component';
import { KeyValueList, KeyValueItem, LIST_INIT, dateFormatNotification } from '../contractDeploy/ContractDeploy';
import { HasDeployContractListResponse } from '@ide/types/ideServer';
import useIdeStore from '@ide/store';
import { ExecResult } from '../components/ExecResult';

export default function ContractCall({ style }: {
  style?: React.CSSProperties;
}) {
  const { setOutputText, contract } = useIdeStore();
  const [contractAddress, setContractAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [contractMethod, setContractMethod] = useState('');
  const [customMethod, setCustomMethod] = useState('');
  const [contractOption, setContractOption] = useState([]);
  const [methodOption, setMethodOption] = useState<string[]>([]);
  const [callContractResult, setCallContractResult] = useState('');
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const { server } = useIdeStore();
  const [contractMethodRelate, setContractMethodRelate] = useState<{ [x: string]: HasDeployContractListResponse['methods'] }>({});
  // const [submit, setSubmit] = useState(false);
  const [extraList, setExtraList] = useState(LIST_INIT);

  useEffect(() => {
    // 获取合约列表
    if (style?.display === 'block') {
      queryHasDeployContractList();
    }
  }, [style?.display]);

  // 获取合约列表
  const queryHasDeployContractList = useCallback(async () => {
    const result = await server?.hasDeployContractList();
    setContractOption(result);
    if (contract.contractName && result.filter((item: any) => item.contractName === contract.contractName).length) {
      setContractAddress(contract.contractName);
    } else {
      setContractAddress(result?.[0]?.contractName);
    }
    setContractMethodRelate(result.reduce((prev: { [x: string]: HasDeployContractListResponse['methods'] }, val: HasDeployContractListResponse) => {
      prev[val.contractName] = val.methods;
      return prev;
    }, {}));
  }, [server]);

  // 重置数据
  const resetHandle = () => {
    setContractAddress('');
    setCustomAddress('');
    setContractMethod('');
    setCustomMethod('');
    setExtraList(LIST_INIT);
  };
  useEffect(() => {
    setMethodOption(contractMethodRelate?.[contractAddress]);
    setContractMethod(contractMethodRelate?.[contractAddress]?.[0]);
  }, [contractMethodRelate, contractAddress]);
  // 调用合约
  const invokeContract = useCallback(() => {
    const name = contractAddress === 'custom' ? customAddress : contractAddress;
    const method = contractMethod === 'custom' ? customMethod : contractMethod;

    if (name.trim() === '' || method.trim() === '') {
      message.error({
        content: '合约地址和合约方法不能为空'
      });
      return;
    }
    const ac = isQuery ? '查询' : '执行';
    if (server?.pluginIsConnected()) {
      try {
        server?.pluginRequest({
          method: isQuery ? 'zx_queryContract' : 'zx_invokeContract',
          params: {
            contractName: name,
            method,
            kvs: [
              ...extraList.filter(
                (item) => item.key.trim() !== '' && item.value.trim() !== ''
              ),
              {
                key: 'method',
                value: method
              }
            ],
            limit: 20000
          }
        }).then((res) => {
          setCallContractResult('合约执行成功');
          setOutputText('<span class="notification-succ">' + ac + ' [' + name + ' ' + method + '] ' + dateFormatNotification('yyyy-MM-dd hh:mm:ss') + ' ' + JSON.stringify(res) + '</span>');
        }).catch((error: any) => {
          notification.error({
            title: error,
            description: error
          });
          setCallContractResult('合约执行失败');
          setOutputText('<span class="notification-error">' + ac + ' [' + name + ' ' + method + '] ' + dateFormatNotification('yyyy-MM-dd hh:mm:ss') + ' ' + JSON.stringify(error) + '</span>');
        });
        console.log('调用合约：唤起插件');
        setOutputText('<span class="notification-run">' + ac + ' [' + name + ' ' + method + '] ' + dateFormatNotification('yyyy-MM-dd hh:mm:ss') + ' 插件已唤起，请在插件上选择网络/账户发起上链请求</span>');
      } catch (error) {
        setOutputText('<span class="notification-error">' + ac + ' [' + name + ' ' + method + '] ' + dateFormatNotification('yyyy-MM-dd hh:mm:ss') + ' ' + JSON.stringify(error) + '</span>');
        notification.error({
          title: '插件调用出错',
          description: error as any
        });
      }
    } else {
      try {
        server?.pluginRequest({
          method: 'zx_webConnect',
          params: {}
        });
      } catch (error) {
        setOutputText('<span class="notification-error">执行 [' + name + ' ' + method + '] ' + dateFormatNotification('yyyy-MM-dd hh:mm:ss') + ' ' + error + '</span>');
        notification.error({
          title: '插件调用出错',
          description: error as any
        });
      }
    }
  }, [server, customAddress, contractAddress, customMethod, contractMethod, extraList, isQuery]);

  return (
    <div style={style} className="nav_tab">
      <Form className='side_tab_form' layout="vertical">
        <Form.Item label="选择合约(已部署)">
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            appearance="button"
            options={[...contractOption.map((item: HasDeployContractListResponse) => ({ value: item.contractName, text: item.projectName })), { value: 'custom', text: '自定义' }]}
            value={contractAddress}
            onChange={(value) => {
              setContractAddress(value);
              setCustomAddress('');
            }}
          />
          {contractAddress === 'custom' && (
            <Input
              className="select-next-input"
              size="full"
              value={customAddress}
              onChange={(val) => setCustomAddress(val)}
            />
          )}
        </Form.Item>
        <Form.Item label="合约方法">
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            appearance="button"
            options={[...(methodOption ? methodOption.map(item => ({ value: item, text: item })) : []), { value: 'custom', text: '自定义' }]}
            value={contractMethod}
            onChange={(value) => {
              setContractMethod(value);
              setCustomMethod('');
            }}
          />
          {contractMethod === 'custom' && (
            <Input
              className="select-next-input"
              size="full"
              value={customMethod}
              onChange={(val) => setCustomMethod(val)}
            />
          )}
        </Form.Item>
        <Form.Item label="" className="hide-label">
          <div className="tea-mt-4n">
            <KeyValueList
              value={extraList}
              onChange={(item: Array<KeyValueItem>) => {
                setExtraList(item);
              }}
            />
          </div>
        </Form.Item>
        <div className="form-switch">
          是否为查询交易<Switch value={isQuery} onChange={setIsQuery}></Switch>
        </div>

        <div className="form-operate-action  tea-mt-4n">
          <Button type="primary" className="full-btn" onClick={resetHandle}>
            重置数据
          </Button>
          <Button
            type="primary"
            className="full-btn"
            disabled={!(window as any).zxChain}
            onClick={invokeContract}
          // loading={submit}
          >
            合约调用
          </Button>
        </div>
      </Form>
      {style?.display === 'block' && <ExecResult result={callContractResult} />}
    </div>
  );
}
