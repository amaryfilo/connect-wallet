### Wallet Connect

> version 1.0.0

This package provides the ability to connect a site or application to the MetaMask extension through a browser or the MetaMask mobile application and to the WalletConnect service using a QR code scanner to access the wallet.

The Web3 library is used to work with the blockchain.

#### Features:

- Add Contacts by providing address and abi code.
- Work with Contracts methods.
- Check transactions on blockchain.
- Call functions on contract and interactive with it in connected wallet.

> For now supported only MetaMask and WalletConnect

#### Usage

1. Install package from npm `npm install @amfi/connect-wallet`
2. Import ConnectWallet `import { ConnectWallet } from '@amfi/connect-wallet';`
3. Initialize ConnectWallet `const connectWallet = new ConnectWallet();` in your application.
4. Provide provider by using `connect()` function. Available Provider name: MetaMask, WalletConnect. For example `connectWallet.connect('MetaMask').then((connected: boolean) => console.log(connected),(err) => console.log(err));`.
5. If connect established then use `addContract()` function to add contract to Web3 `connectWallet.addContract({'ContractName',address,abi[]});`.
6. Then you can get access to contract methods by using contract method `connectWallet.contract(ContractName);`.
7. To get account and provider info (address, chainID) use `connectWallet.getAccounts()` method.
8. To check transaction use `connectWallet.checkTx(txHash)` function.
