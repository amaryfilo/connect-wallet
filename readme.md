# AMFI Connect Wallet

This package provides the ability to connect wallets to website or application via [MetaMask](https://metamask.io) extension (through a browser or the mobile application), [WalletConnect](https://walletconnect.org) service using QR code scanner, [CoinbaseWallet](https://www.coinbase.com/wallet) extension and [KardiaChain](https://www.kardiachain.io/).

## **Features**

- Connect to any blockchains.
- Add Contracts by providing Contract address and ABI code.
- Work with Contracts methods.
- Check transactions in blockchain.
- Add custom blockhain.

## **Usage**

### **1. Install package.**

**Via NPM**

```console
npm install @amfi/connect-wallet
```

**Via Yarn**

```console
yarn add @amfi/connect-wallet
```

### **2. Import and initialize ConnectWallet in project.**

```typescrpt
import { ConnectWallet } from '@amfi/connect-wallet';
const connectWallet = new ConnectWallet();
```

### **3. Add custom blockchain.**

If you need to add custom blockhain use `addChains(...chain)` method before you create connect.

Usage example:

```typescript
/**
 * Description:
 *
 * name - blockchain name.
 * chainID - blockchain id.
 * hex - blockchain id in hex format.
*/

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

connectWallet.addChains(this.chains);
```

### **4. Create configuration for Connect Wallet**

#### Method `connect(provider, network, settings)`.

Example configuration:

> Want use Ethereum mainnet? \
> Set useProvider: `infura` and provide mainnet Infura. \
> Remove rpc if it needed.

```typescript
/**
 * Description:
 *
 * name - blockchain name.
 * chainID - blockchain id.
 * hex - blockchain id in hex format.
 */

const config = {
  wallets: ['MetaMask', 'WalletConnect', 'CoinbaseWallet', 'KardiaChain'],
  network: {
    name: 'Ropsten',
    chainID: 3,
  },
  provider: {
    MetaMask: {
      name: 'MetaMask',
    },
    CoinbaseWallet: {
      name: 'CoinbaseWallet',
    },
    KardiaChain: {
      name: 'KardiaChain',
    },
    WalletConnect: {
      name: 'WalletConnect',
      useProvider: 'rpc', // Used to select the type of provider below
      provider: {
        infura: {
          infuraID: 'PASS_HERE_INFURA_ID', // Your id from Infura
        },
        rpc: {
          rpc: {
            // If you use Ethereum rpc, pass full Infura URL
            3: 'https://ropsten.infura.io/v3/PASS_HERE_BLOCKCHAIN_RPC',
            // For use this rpc change chainId below to 56
            56: 'https://bsc-dataseed.binance.org/',
          },
          chainId: 3, // Used to select a rpc above
        },
      },
    },
  },
  settings: {
    // Add provider type from wallets in this config
    providerType: true,
  },
};

connectWallet.connect(config);
```

RPC configuration:

```typescript
/**
 * Description
 *
 * BLOCKCHAIN_NUMBER - used to identify what kind of blockhain need to use, ex.: ropsten: 3, rinkeby: 4
 * BLOCKCHAIN_RPC - blockhain rpc url
 * chainId - used to select rpc (equal to rpc.BLOCKCHAIN_NUMBER)
*/

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

### **5. Pass configuration to ConnectWallet.**

You need to pass 3 configuration options: provider, network, settings in `connect()` method.

#### **Provider**

For MetaMask:

```typescript
{
  name: string;
}
```

For Wallet Connect:

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

#### **Network**

```typescript
/**
 * Description
 *
 * name - blockchain name
 * chainID - blockchain id
 *
 * All parameters required
 */

{
  name: string;
  chainID: number;
}
```

#### **Settings**

```typescript
{
	// show in response your provider type: MetaMask/WalletConnect/etc.
	providerType?: boolean;
}
```

#### **Pass configuration**

```typescript
connectWallet.connect(provider, network, settings).then(
  (connected: boolean) => console.log('connect wallet: ', connected),
  (err: any) => console.log('connect wallet error: ', err)
);
```

### **6. If connect established add contracts in Connect Wallet.**

Need to use 3 parameters in the `addContract`: ContractName, address, abi.

interface:

```typescript
/**
 * Description
 *
 * name - used to identify your contract in Connect Wallet ex.: Staking/Token
 * address - provide address ex.: 0x00000000000000000
 * abi - ABI from contract ex.: [{method...},{method...},{method...}]
*/

{
	name: string;
	address: string;
	abi: Array<any>;
}

connectWallet.addContract({'Staking1', '0x000...', ABI[]}).then((i) => {},(err) => {});
connectWallet.addContract({'Staking2', '0x000...', ABI[]}).then((i) => {},(err) => {});
connectWallet.addContract({'Token', '0x000...', ABI[]}).then((i) => {},(err) => {});
```

### **7. Use Contracts.**

To use contracr methods use method `contract(CONTRACT_NAME)`.

> `CONTRACT_NAME` - pass your contact name that was added in step 5.

```typescript
const start = connectWallet
  .contract('Staking1')
  .stakeStart('123')
  .send({ from: '0x000...' })
  .then((tx: any) => console.log(tx));

const end = connectWallet
  .contract('Staking2')
  .stakeEnd('123')
  .send({ from: '0x000...' })
  .then((tx: any) => console.log(tx));

const balance = connectWallet
  .contract('Token')
  .methods.balanceOf('0x000...')
  .call()
  .then(
    (balance: string) => console.log(balance),
    (err: any) => console.log(err)
  );
```

### **8. Get account and provider.**

When the Connect established, you can get information about the account of the user wallet using the `getaccounts ()` method.

```typescript
connectWallet.getAccounts().then(
  (user: any) => console.log('account: ', user),
  (err: any) => console.log('error: ', err)
);
```

### **9. Check transaction.**

Provide transaction Hash to `txCheck()` method for check if transaction are in blockchain or not.

```typescript
connectWallet.txCheck('TX_HASH').then(
  (info: any) => console.log('info: ', info),
  (err: any) => console.log('tx error:', err)
);
```

### **10. Get current Web3.**

Get current Web3 and access to all Web3 functions via `currentWeb3()` method.

```typescript
const currentWeb3 = connectWallet.currentWeb3();
```

### **11. Subscribe on events.**

Subscribe to events from current connection: connect, disconnect, chain change, account change and etc.

```typescript
connectWallet.eventSubscriber().subscribe(
  (event: IEvent) => console.log('event from subscribe', event),
  (err: IEventError) => console.log('event error', err)
);
```
