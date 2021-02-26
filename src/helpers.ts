export const parameters = {
  chainIDMap: {
    1: '0x1',
    3: '0x3',
    4: '0x4',
    5: '0x5',
    42: '0x2a',
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
    name: 'Chain not selected or nnot equal to settings chain',
  },
  5: {
    type: 'Error',
    name: 'Qr code modal are closed',
  },
  6: {
    type: 'Error',
    name: 'Wallet disconnected',
  },
};

export const getCode = (code: number) => codeMap[code];
