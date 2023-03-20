import axios, { AxiosResponse } from 'axios';
import { message } from 'tea-component/lib/message/Message';
import { v4 as uuidv4 } from 'uuid';

export interface ResponseData<T> {
  data: T;
}
export interface ResponseList<T> {
  TotalCount: number;
  GroupList: T[];
}

export interface ResponseError {
  Error: {
    Code: string;
    Message: string;
  };
}
export interface ResponseIf<T> {
  Response: T;
  retCode?: number;
  Error?: string;
}
export type ResponseInfo<T> = AxiosResponse<
  ResponseIf<ResponseData<T> | ResponseList<T> | ResponseError> | any,
  any
>;
export type Fetch<P, T> = (params: P) => Promise<T>;

const instance = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_HOST, // process.env.NODE_ENV === 'production' ? BASEURL : '/chainmaker',
  headers: {
    withCredentials: true,
  },
});
instance.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {};
  }
  (config.headers as any)['Cloud-Trace-Id'] = uuidv4();
  return config;
});
instance.interceptors.response.use(
  (response) => {
    // console.log(response);
    // const resp: any = response?.data?.Response;
    // if (resp?.Error?.Code) {
    //     message.error({
    //         content: resp
    //     })
    // }
    // if (resp) {
    //     return resp;
    // }
    const { data } = response;
    if (data?.retCode && data.retCode !== 13002) {
      if (data && data.Error === 'no-session') {
        message.error({ content: '未登陆' });
        window.location.href = `${window.location.origin}login`;
      } else if (data && data.Error === 'no-auth') {
        message.error({ content: '无权限访问该接口' });
      } else if (data.retCode === 1115 || data.retCode === 12006) {
        message.error({ content: '用户登录态已失效，请重新登录' });
        // 跳转登录页
        window.location.href = `${import.meta.env.VITE_CONSOLE_HOST}login`;
      } else if (data.retCode === 1000) {
        message.error({ content: '当前无操作权限' });
        window.location.href = `${import.meta.env.VITE_CONSOLE_HOST}`;
      } else if (data.retCode === 1114) {
        message.error({ content: 'token已过期，请重新登录' });
        window.location.href = `${import.meta.env.VITE_CONSOLE_HOST}login`;
      } else if (data.retCode === 12142) {
        message.error({ content: '云官网token失效' });
        window.open(
          'https://cloud.tencent.com/open/authorize?scope=login&app_id=100025741174&redirect_url=https%3A%2F%2Fconsole.zxchain.qq.com/auth-info&state=1043',
          '_self',
        );
      }
      //   if (reject) {
      //     reject(response.data);
      // //   }
      //   message.error({ content: data?.retMsg });

      //   return;
    }
    // if (data.retMsg === 'failed') {
    //   reject(res.data);
    // }
    // resolve(res.data);
    return response.data;
  },
  (error) => Promise.reject(error),
);
// 对错误信息进行默认处理的get请求 封装函数
export const createGetChannel = (url: string): Fetch<any, any> => {
  return (
    params?: any,
    transformResponse?: (resp: ResponseInfo<any>) => void,
  ) =>
    instance.get(url, {
      params: { ...params },
      transformResponse,
    });
};
// 对错误信息进行默认处理的get请求 封装函数
export const createGetChannelBlob = (url: string): Fetch<any, any> => {
  return (
    params?: any,
    transformResponse?: (resp: ResponseInfo<any>) => void,
  ) =>
    instance.get(url, {
      params: { ...params },
      transformResponse,
      responseType: 'blob',
    });
};

// 对错误信息进行默认处理的post请求 封装函数
export const createPostChannel = (url: string): Fetch<any, any> => {
  return (data?: any) =>
    instance.post(url, {
      ...data,
    });
};
// 对错误信息进行默认处理的post formData请求 封装函数
export const createPostFormDataChannel = (url: string): Fetch<any, any> => {
  return (data?: any) =>
    instance.post(url, data, {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
};
// 单纯处理的post请求 的封装函数
export const createPostFetch = (url: string): Fetch<any, any> => {
  return (data: any) =>
    axios.post(url, {
      ...data,
    });
};
