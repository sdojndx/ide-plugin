
export interface Contract {
  contractName?: string;
  projectName?: string;
  contractAddr?: string;
  path?: string;
}

export interface ContractKv {
  key: string;
  value: string;
  keyError: boolean;
  valueError: boolean;
}
