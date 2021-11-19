import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

export interface IProvider {
  name: string;
  useProvider?: string;
  provider?: {
    bridge?: {
      url: string;
      infura?: string[];
    };
    infura?: {
      infuraId: string;
    };
    rpc?: {
      rpc: {
        [index: number]: string;
      };
      chainId?: number;
    };
  };
}

export type ContractWeb3 = Contract;

export interface IEvent {
  name: string;
  address: string;
  network: {
    name: string;
    chainId: number;
  };
}

export interface IEventError extends IEvent {
  code: number;
  message?: {
    title: string;
    subtitle: string;
    text: string;
  };
}

export interface IConnect {
  address: string;
  type?: string;
  network: {
    name: string;
    chainID: number;
  };
}

export interface IConnectorMessage {
  code: number;
  type?: string;
  connected: boolean;
  provider?: string | any;
  message?: {
    title: string;
    subtitle: string;
    text: string;
  };
}

export interface IError {
  code: number;
  type?: string;
  message?: {
    title: string;
    subtitle: string;
    text: string;
  };
}

export interface ISettings {
  providerType?: boolean;
}

export interface INativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface INetwork {
  chainName: string;
  chainID: number;
  nativeCurrency?: INativeCurrency;
  rpc?: string;
  blockExplorerUrl?: string;
}

export interface IMessageProvider {
  code: number;
  message?: {
    title?: string;
    text: string;
  };
  provider?: string;
}

export interface IContract {
  [index: string]: Contract;
}

export interface INoNameContract {
  address: string;
  abi: AbiItem | Array<AbiItem>;
}

export interface IAddContract extends INoNameContract {
  name: string;
}

export interface IChain {
  name: string;
  chainID: number;
  hex: string;
}
