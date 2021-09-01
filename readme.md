# Connect Wallet

This package provides the ability to connect Wallets to website or application via [MetaMask](https://metamask.io) extension (through a browser or the mobile application) and [WalletConnect](https://walletconnect.org) service using QR code scanner.

> Worked only with MetaMask and WalletConnect

## Features

- Connect to any blockchains.
- Add Contracts by providing Contract address and ABI code.
- Work with Contracts methods.
- Check transactions in blockchain.
- Add custom blockhain.

## Usage

#### 1. Install package.

NPM: `npm install @amfi/connect-wallet`
Yarn: `yarn add @amfi/connect-wallet`

#### 2. Import and initialize ConnectWallet in project.

```typescrpt
import { ConnectWallet } from '@amfi/connect-wallet';
const connectWallet = new ConnectWallet();
```

#### 3. Add custom blockchain by using `addChains([chains])` method.

If you need to add custom blockhain use `addChains(...chain)` method before you create connect.

Usage example:

```typescript
const chains: IChain[] = [
	...
    {
      name: 'binance',
      chainID: 56,
      hex: '0x38',
    },
    {
      name: 'binance-test',
      chainID: 97,
      hex: '0x61',
    },
		...
  ];
	...
const chainsInfo = this.connectWallet.addChains(this.chains); // will return chains that added into connectwallet, this method not async.
```

Where:
`name` - blockchain name.
`chainID` - blockchain id.
`hex` - blockchain id in hex format.

#### 4. Create configuration for Connect Wallet that will be used in `connectWallet.connect(provider, network, settings)` method.

Example configuration:

> Want use Ethereum mainnet? Set useProvider: `infura` and provide mainnet Infura. Remove rpc if it needed.

```typescript
{
	wallets: ['MetaMask', 'WalletConnect'],
	network: {
		name: 'Ropsten',
		chainID: 3
	},
	provider: {
		MetaMask: {
			name: 'MetaMask'
		},
		WalletConnect: {
			name: 'WalletConnect',
			useProvider: 'rpc',
			provider: {
				infura: {
					infuraID: 'PASS_HERE_INFURA_ID',
				},
				rpc: {
					rpc: {
						3: "PASS_HERE_BLOCKCHAIN_RPC" // if use Ethereum rpc, pass full Infura URL with Infura Id
					},
					chainId: 3
				},
			},
		},
	},
	settings: {
		providerType: true
	},
}
```

RPC configuration:

```typescript
rpc: {
	rpc: {
		// if use Ethereum rpc, pass full Infura URL with Infura Id
		[BLOCKCHAIN_NUMBER]: "BLOCKCHAIN_RPC",
		[BLOCKCHAIN_NUMBER]: "BLOCKCHAIN_RPC",
		...
		[BLOCKCHAIN_NUMBER]: "BLOCKCHAIN_RPC"
	},
	// What Blockchain need to use
	chainId: BLOCKCHAIN_NUMBER
},
```

Where:

`BLOCKCHAIN_NUMBER` - blockchain/network/chain ID, for example ropsten = 3, rinkeby = 4, and etc. Used to identify what kind of blockhain need to use.
`BLOCKCHAIN_RPC` - Blockhain URL.

> `chainId` === `rpc.BLOCKCHAIN_NUMBER`

#### 5. Pass configuration to ConnectWallet in method `connect()`.

You need to pass 3 configuration options: provider, network, settings.

##### Provider

MetaMask:

```typescript
{
  name: string;
}
```

Wallet Connect:

```typescript
{
	name: string;
	useProvider?: string;
	provider?: {
		infura?: {
			infuraID?: string;
		}
		rpc?: {
			rpc: {
				[index: number]: string;
			};
			chainId?: number;
		};
	};
}
```

##### Network

```typescript
{
  name: string;
  chainID: number;
}
```

Where:

`name` - blockchain name.
`chainID` - blockchain id.

> All parameters required

##### Settings

```typescript
{
	providerType?: boolean;
}
```

Where:

`providerType` - show in response your provider type: MetaMask or WalletConnect.

##### Pass configuration

```typescript
connectWallet.connect(provider, network, settings).then(
  (connected: boolean) => console.log('connect wallet: ', connected),
  (err: any) => console.log('connect wallet error: ', err)
);
```

#### 6. If connect established use `addContract()` method to add contract in Connect Wallet.

You can pass 3 parameters in method `addContract`: ContractName, address, abi.

interface:

```typescript
{
	name: string;
	address: string;
	abi: Array<any>;
}
```

`ContractName` (`name`) - use for identify your contract in Connect Wallet, for example you add two Staking contracts and one Token contract, so you can create 3 addContract methods and pass in each one params:

```json
{
  "ContractName": "Staking1",
  "ContractName": "Staking2",
  "ContractName": "Token"
}
```

`address` - contract address.
`abi` - contact ABI.

Example:

```typescript
connectWallet.addContract({'Staking1', '0x0000000000000000', ABI[]});
connectWallet.addContract({'Staking2', '0x0000000000000000', ABI[]});
connectWallet.addContract({'Token', '0x0000000000000000', ABI[]});
```

#### 7. Use Contracts methods via method `contract()`.

`ContractName` - pass your contact name that was added in step 5.

Example:

```typescript
connectWallet
  .contract('Staking1')
  .stakeStart('123')
  .send({ from: '0x000000....' })
  .then((tx: any) => console.log(tx));

connectWallet
  .contract('Staking2')
  .stakeStart('123')
  .send({ from: '0x000000....' })
  .then((tx: any) => console.log(tx));

connectWallet
  .contract('Token')
  .methods.balanceOf('0x0000000,,,')
  .call()
  .then(
    (balance: string) => console.log(balance),
    (err: any) => console.log(err)
  );
```

#### 8. Get account and provider info via `getAccounts()` method.

When connect are established via method `getAccounts()` can get user wallet account information. Also with user information can get what provider are used.

```typescript
connectWallet.getAccounts().subscribe(
  (user: any) => console.log('user account: ', user),
  (err: any) => console.log('user account error: ', err)
);
```

#### 9. Check transaction via `txCheck()` method.

Provide transaction Hash to check if transaction are in blockchain or not.

Example:

```typescript
connectWallet.txCheck('TX_HASH').then(
  (info: any) => console.log('info: ', info),
  (err: any) => console.log('info tx error:', err)
);
```

#### 10. To get current Web3 via`currentWeb3()` method.

Get current Web3 and access to all Web3 functions.

Example:

```typescript
const currentWeb3 = connectWallet.currentWeb3();
```
