export function setLocalStorage(action: string, dir: string, func: string, value: any) {
  const storagename = action + '_params';
  const orgV = localStorage.getItem(storagename);
  const storagevalue = orgV ? JSON.parse(orgV) : {};
  storagevalue[dir + '-' + func] = {
    overtime: new Date().getTime() + 3 * 24 * 60 * 60 * 1000,
    value
  };
  localStorage.setItem(storagename, JSON.stringify(storagevalue));
}
export function getLocalStorage(action: string, dir: string, func: string) {
  const storagename = action + '_params';
  const orgV = localStorage.getItem(storagename);
  const storagevalue = orgV ? JSON.parse(orgV) : {};
  const v = storagevalue[dir + '-' + func];
  if (v && v.overtime && v.overtime > new Date().getTime()) {
    return v.value;
  } else {
    return {};
  }
}
export function removeLocalStorage(action: string, dir?: string, func?: string) {
  const storagename = action + '_params';
  const orgV = localStorage.getItem(storagename);
  let storagevalue = orgV ? JSON.parse(orgV) : {};
  if (dir && func) {
    delete storagevalue[dir + '-' + func];
  } else {
    storagevalue = {};
  }
  localStorage.setItem(storagename, JSON.stringify(storagevalue));
}

export function getContractOptionText({ projectName, contractAddr }: { projectName?: string; contractAddr?: string; }) {
  return `${projectName && projectName?.length > 10
    ? projectName.slice(0, 10) + '...'
    : projectName}${contractAddr ? '(' + contractAddr?.slice(0, 5) + '...' + contractAddr?.slice(-3) + ')' : ''}`;
};
