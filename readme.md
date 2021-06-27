# Connect Wallet

This package provides the ability to connect Wallets to website or application via [MetaMask](https://metamask.io) extension (through a browser or the mobile application) and [WalletConnect](https://walletconnect.org) service using QR code scanner.

> Worked only with MetaMask and WalletConnect

## Features

- Connect to any blockchains.
- Add Contacts by providing contract address and abi code.
- Work with Contracts methods.
- Check transactions in blockchain.

## Usage

#### 1. Install package.

`npm install @amfi/connect-wallet`

#### 2. Import and initialize ConnectWallet in project.

```typescrpt
import { ConnectWallet } from '@amfi/connect-wallet';
const connectWallet = new ConnectWallet();
```

#### 3. Create configuration for Connect Wallet that will be used in `connectWallet.connect(provider, network, settings)` method.

Example configuration:

> if you want use Ethereum mainnet set useProvider: `infuraID` and provide mainnet Infura and if you want you can delete rpc.

```typescript
{
	wallets: ['MetaMask', 'WalletConnect'],
	network: {
		name: chain.name,
		chainID: chain.id
	},
	provider: {
		MetaMask: {
			name: 'MetaMask'
		},
		WalletConnect: {
			name: 'WalletConnect',
			useProvider: 'rpc',
			provider: {
				infuraID: 'YOUR_INFURA_ID',
				rpc: {
					rpc: {
						3: "https://ropsten.YOUR_BLOCKCHAIN_RPC.io"
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

#### 4. Pass configuration to ConnectWallet in method `connect()`.

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
		infuraID?: string;
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

#### 5. If connect established use `addContract()` method to add contract in Connect Wallet.

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

#### 6. Use Contracts methods via method `contract()`.

`ContractName` - pass your contact name that was added in step 5.

Example:

```typescript
connectWallet
  .addContract('Staking1')
  .stakeStart('123')
  .send({ from: '0x000000....' })
  .then((tx: any) => console.log(tx));

connectWallet
  .addContract('Staking2')
  .stakeStart('123')
  .send({ from: '0x000000....' })
  .then((tx: any) => console.log(tx));

connectWallet
  .addContract('Token')
  .methods.balanceOf('0x0000000,,,')
  .call()
  .then(
    (balance: string) => console.log(balance),
    (err: any) => console.log(err)
  );
```

#### 7. Get account and provider info via `getAccounts()` method.

When connect are established via method `getAccounts()` can get user wallet account information. Also with user information can get what provider are used.

```typescript
connectWallet.getAccounts().subscribe(
  (user: any) => console.log('user account: ', user),
  (err: any) => console.log('user account error: ', err)
);
```

#### 8. Check transaction via `txCheck()` method.

Provide transaction Hash to check if transaction are in blockchain or not.

Example:

```typescript
connectWallet.txCheck('TX_HASH').then((info: any) => console.log('info: ', info). (err: any) => console.log('info tx error:', err));
```
