import { createPostChannel, createGetChannel, createPostFormDataChannel, createGetChannelBlob } from './request';

export const getUser = createGetChannel('api/v1/user/info/get');

export const logOut = createPostChannel('api/v1/user/logout');
export const index = createPostChannel('api/v1/ide/index');
export const files = createPostChannel('api/v1/ide/files');
export const goModuleFiles = createPostChannel('api/v1/ide/goModuleFiles');
export const newFile = createPostChannel('api/v1/ide/file/new');
export const file = createPostChannel('api/v1/ide/file');
export const outline = createPostChannel('api/v1/ide/outline');
export const saveFile = createPostChannel('api/v1/ide/file/save');
export const build = createPostChannel('api/v1/ide/build');
export const fmt = createPostChannel('api/v1/ide/go/fmt');
export const importFiles = createPostFormDataChannel('api/v1/ide/file/import');
export const exportFile = createPostChannel('api/v1/ide/file/7z/new');

export const autocomplete = createPostChannel('api/v1/ide/autocomplete');

export const removeFile = createPostChannel('api/v1/ide/file/remove');
export const renameFile = createPostChannel('api/v1/ide/file/rename');
export const contractHasBuild = createPostChannel('api/v1/ide/contractHasBuild');

export const contractNames = createPostChannel('api/v1/ide/compileDirectory');
export const contractMethod = createPostChannel('api/v1/ide/dockergo/method');

export const deployContractList = createPostChannel('api/v1/ide/deploy/contractList');
export const contractRunBuild = createPostChannel('api/v1/ide/buildAll');
export const contractInvokeAll = createPostChannel('api/v1/ide/invokeAll');
export const contractCompile = createPostChannel('api/v1/ide/cross');

export const getContractFile = createGetChannelBlob('api/v1/ide/file/getContractFile');
export const deployContract = createPostChannel('api/v1/ide/deploy');
export const hasDeployContractList = createPostChannel('api/v1/ide/deploy/hasDeployContractList');
export const preference = createPostChannel('api/v1/ide/preference');
export const pullnotify = createPostChannel('api/v1/ide/pullnotify');
export const newContract = createPostChannel('api/v1/ide/new/contract');

export const decl = createPostChannel('api/v1/ide/find/decl');
