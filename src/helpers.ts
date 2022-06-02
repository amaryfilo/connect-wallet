import { IChain } from 'interface';

export const parameters = {
  chainIDMap: {
    1: '0x1',
    3: '0x3',
    4: '0x4',
    5: '0x5',
    42: '0x2a',
    128: '0x80',
    256: '0x100',
    69: 69,
    24: 24,
    56: '0x38',
    97: '0x61',
    137: '0x89',
    80001: '0x13881',
    43113: '0xa869',
    43114: '0xa86a',
    42220: '0xa4ec',
    44787: '0xaef3',
  },
  chainsMap: {
    '0x1': {
      name: 'mainnet',
      chainID: 1,
    },
    '0x3': {
      name: 'ropsten',
      chainID: 3,
    },
    '0x4': {
      name: 'rinkeby',
      chainID: 4,
    },
    '0x5': {
      name: 'goerli',
      chainID: 5,
    },
    '0x2a': {
      name: 'kovan',
      chainID: 42,
    },
    '0x80': {
      name: 'heco',
      chainID: 128,
    },
    '0x100': {
      name: 'heco-testnet',
      chainID: 256,
    },
    69: {
      name: 'KardiachainTestnet',
      chainID: 69,
    },
    24: {
      name: 'Kardiachain',
      chainID: 24,
    },
    '0x38': {
      name: 'binance',
      chainID: 56,
    },
    '0x61': {
      name: 'binance-testnet',
      chainID: 97,
    },
    '0x89': {
      name: 'polygon',
      chainID: 137,
    },
    '0x13881': {
      name: 'polygon-testnet',
      chainID: 80001,
    },
    '0xa86a': {
      name: 'avalanche',
      chainID: 43114,
    },
    '0xa869': {
      name: 'avalanche-testnet',
      chainID: 43113,
    },
    '0xa4ec': {
      name: 'celo',
      chainID: 42220,
    },
    '0xaef3': {
      name: 'celo-testnet',
      chainID: 44787,
    },
  },
};

export const codeMap = {
  1: {
    type: 'Success',
    name: 'Provider connected',
  },
  2: {
    type: 'Error',
    name: 'Provider not found',
  },
  3: {
    type: 'Error',
    name: 'Not authorized',
  },
  4: {
    type: 'Error',
    name: 'Chain not selected or not equal to settings chain',
  },
  5: {
    type: 'Error',
    name: 'Qr code modal are closed',
  },
  6: {
    type: 'Error',
    name: 'Wallet disconnected',
  },
  7: {
    type: 'Error',
    name: 'Cant getting user address',
  },
};

export const getCode = (code: number) => codeMap[code];

export const addChains = (chains: IChain[]) => {
  chains.map((chain: IChain) => {
    const { name, chainID, hex } = chain;
    parameters.chainIDMap[chainID] = hex;
    parameters.chainsMap[hex] = { name, chainID };
  });

  return parameters;
};
