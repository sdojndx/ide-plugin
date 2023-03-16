import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input, Button, Select, notification, message } from 'tea-component';
import addIcon from '@ide/static/svgs/add-icon.svg';
import deleteIcon from '@ide/static/svgs/delete-icon.svg';
import { DeployContractListResponse } from '@ide/types/ideServer';
import useIdeStore from '@ide/store';
import { ExecResult } from '../components/ExecResult';

// 日期
export function dateFormatNotification(fmt: string) {
  const date = new Date();
  const dateObj: any = {
    // "Y+": date.getFullYear(), //年份
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (const k in dateObj) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1)
        ? (dateObj[k])
        : (('00' + dateObj[k]).substr(('' + dateObj[k]).length)));
    }
  }
  return fmt;
};
// 额外信息列表数据
export interface KeyValueItem {
  key: string
  value: string
}

export const LIST_INIT = [{ key: '', value: '' }];

export function KeyValueList({
  value,
  onChange
}: {
  value: Array<KeyValueItem>
  onChange: (item: Array<KeyValueItem>) => void
}) {
  function paramContentChanged(paramType: string, index: number, val: string) {
    const changedParams = value.map((item: any, idx: number) => {
      if (idx === index) {
        item[paramType] = val;
      }
      return item;
    });
    onChange(changedParams);
  }

  return (
    <div>
      {value.map((item, index) => (
        <div key={index} className="extra-info-list">
          <div className="left">
            <div className="key">
              <div className="extra-info-text">key</div>
              <Input
                className="extra-left-input"
                value={item.key}
                onChange={(val) => paramContentChanged('key', index, val)}
              />
            </div>
            <div className="key tea-mt-4n">
              <div className="extra-info-text">value</div>
              <Input
                className="extra-left-input"
                value={item.value}
                onChange={(val) => paramContentChanged('value', index, val)}
              />
            </div>
          </div>
          {index === 0
            ? (
              <img
                src={addIcon}
                alt=""
                onClick={() => {
                  onChange([
                    ...value,
                    {
                      key: '',
                      value: ''
                    }
                  ]);
                }}
              />
            )
            : (
              <img
                src={deleteIcon}
                alt=""
                onClick={() => {
                  value.splice(index, 1);
                  onChange([...value]);
                }}
              />
            )}
        </div>
      ))}
    </div>
  );
}

export default function ContractDeploy({ style }: {
  style?: React.CSSProperties;
}) {
  const [virtualMachine, setVirtualMachine] = useState('DOCKER_GO');
  const [projectName, setProjectName] = useState('');
  const [projectNameOptions, setProjectNameOptions] = useState([]);
  const [projectNameRelate, setProjectNameRelate] = useState<{ [x: string]: DeployContractListResponse }>({});
  const [buildTime, setBuildTime] = useState('');
  const [extraList, setExtraList] = useState(LIST_INIT);
  const [submit, setSubmit] = useState(false);
  const { contract } = useIdeStore();
  const { setOutputText } = useIdeStore();
  const { server } = useIdeStore();

  useEffect(() => {
    if (style?.display === 'block') {
      queryDeployContractList();
    }
  }, [style?.display]);

  const queryDeployContractList = useCallback(async () => {
    const res = await server?.queryDeployContractList?.();
    setProjectNameOptions(res);
    setProjectNameRelate(res.reduce((prev: { [x: string]: DeployContractListResponse }, val: DeployContractListResponse) => {
      prev[val.contractName] = val;
      return prev;
    }, {}));
    // 第一个项目名称
    if (!projectName && res.length) {
      setProjectName(res[0].contractName);
    }
  }, [server]);

  // 项目名称
  useEffect(() => {
    if (contract?.contractName) {
      // console.log('====contract', contract)
      setProjectName(contract.contractName);
      setBuildTime(projectNameRelate[contract.contractName]?.buildTime);
    }
  }, [contract?.contractName, projectNameRelate]);

  // 获取二进制内容
  const file2BinaryString = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const readFile = function (result: any) {
        const uint8Array = new Uint8Array(result.currentTarget.result);
        let str = '';
        for (let i = 0; i < uint8Array.length; i++) {
          str += String.fromCharCode(uint8Array[i]);
        }
        resolve(str);
      };
      reader.addEventListener('load', readFile);
      reader.readAsArrayBuffer(file);
    });
  };
  // 合约部署
  const deployContract = useCallback(async () => {
    const getSelected: DeployContractListResponse = projectNameRelate[projectName];
    if (!getSelected) {
      message.error({ content: '请选择项目名称！' });
      return;
    };

    setSubmit(true);

    // 合约部署-获取7z
    const file: File = await server?.getContractFile?.(getSelected.path);
    const content = await file2BinaryString(file);

    setSubmit(false);
    if (server?.pluginIsConnected()) {
      try {
        // ide插件部署
        server?.pluginRequest({
          method: 'zx_deployContract',
          params: {
            contractName: projectName,
            contractVersion: '1.0.0',
            contractBytes: content, // 合约内容
            runtimeType: virtualMachine,
            kvs: extraList.filter(
              (item) => item.key.trim() !== '' && item.value.trim() !== ''
            ),
            limit: 20000
          }
        })?.then((res) => {
          if (res) {
            setOutputText('<span class="notification-succ">部署 [' + projectName + '] ' + dateFormatNotification('yyyy-MM-dd hh:mm:ss') + ' ' + JSON.stringify(res) + '</span>');
          }
        }).catch((error: any) => {
          notification.error({
            title: error,
            description: error
          });
          setOutputText('<span class="notification-error">部署 [' + projectName + '] ' + dateFormatNotification('yyyy-MM-dd hh:mm:ss') + ' ' + JSON.stringify(error) + '</span>');
        });
        setOutputText('<span class="notification-run">部署 [' + projectName + '] ' + dateFormatNotification('yyyy-MM-dd hh:mm:ss') + ' 插件已唤起，请在插件上选择网络/账户发起上链请求</span>');
      } catch (error) {
        notification.error({
          title: '插件调用出错',
          description: error as any
        });
      }
      // 请求deploy接口
      await server?.deployContract?.(getSelected.contractName);
    } else {
      try {
        server?.pluginRequest({
          method: 'zx_webConnect',
          params: {}
        });
      } catch (error) {
        setOutputText('<span class="notification-run">部署 [' + projectName + '] ' + dateFormatNotification('yyyy-MM-dd hh:mm:ss') + ' ' + error + '</span>');
        notification.error({
          title: '插件调用出错',
          description: error as any
        });
      }
    }

    // notification.success({
    //   title: '部署成功',
    //   description: '部署成功'
    // });
  }, [projectName, projectNameOptions, server]);

  return (
    <div style={style} className="nav_tab">
      <Form className='side_tab_form' layout="vertical">
        <Form.Item label="虚拟机类型">
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            appearance="button"
            options={[{ value: 'DOCKER_GO', text: 'DockerGo' }]}
            value={virtualMachine}
            onChange={(value) => setVirtualMachine(value)}
          />
        </Form.Item>
        <Form.Item label="项目名称(已编译)">
          <Select
            className="set-height"
            size="full"
            matchButtonWidth
            appearance="button"
            options={projectNameOptions ? projectNameOptions.map((item: DeployContractListResponse) => ({ value: item.contractName, text: item.projectName })) : []}
            value={projectName}
            onChange={(value) => {
              console.log('value: ', value);
              setProjectName(value);
              setBuildTime(projectNameRelate[value].buildTime);
            }}
          />
          <Form.Text className="gray-text tea-mt-1n">{buildTime}</Form.Text>
        </Form.Item>
        <Form.Item label="额外信息(选填)">
          <KeyValueList
            value={extraList}
            onChange={(item: Array<KeyValueItem>) => {
              setExtraList(item);
            }}
          />
        </Form.Item>
        <Button
          type="primary"
          className="full-btn tea-mt-4n"
          disabled={!(window as any).zxChain}
          onClick={deployContract}
          loading={submit}
        >
          合约部署
        </Button>
      </Form>
      {style?.display === 'block' && <ExecResult />}
    </div>
  );
}
