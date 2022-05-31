import Web3 from 'web3';
import { Observable } from 'rxjs';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core';

import { MetamaskConnect } from './metamask';
import { WalletsConnect } from './wallet-connect';
import { CoinbaseWalletConnect } from './coinbase-wallet';
import { KardiaChainConnect } from './kardiachain';

import {
  INetwork,
  IMessageProvider,
  IContract,
  IProvider,
  IAddContract,
  IConnect,
  ISettings,
  IError,
  IConnectorMessage,
  ContractWeb3,
  IChain,
  INoNameContract,
  IEvent,
  IEventError,
} from './interface';
import { parameters, addChains } from './helpers';


export class ConnectWallet {
  private connector:
    | MetamaskConnect
    | WalletsConnect
    | CoinbaseWalletConnect
    | KardiaChainConnect;
  private providerName: string;
  private availableProviders: string[] = [
    'MetaMask',
    'WalletConnect',
    'CoinbaseWallet',
    'KardiaChain',
  ];

  private network: INetwork;
  private settings: ISettings;

  public Web3: Web3;
  private contracts: IContract = {};
  private allTxSubscribers = [];

  /**
   * Connect provider to web3 and get access to web3 methods, account address and transaction in blockchain.
   * Supported MetaMask, WalletConnect, Kardiachain and CoinBase providers.
   */
  constructor(initProvider?: provider) {
    if (initProvider) {
      this.Web3 = new Web3(initProvider);
    }
  }

  /**
   * Add custom chains to Connect Wallet, provide an array of chains than return chain list parameters.
   *
   * @returns return chains list parameters
   * @example this.addChains([chain,chain]).then((parameters: any) => console.log(parameters),(err) => console.log(err));
   */
  public addChains = (chains: IChain[]): any => addChains(chains);

  /**
   * Create new wallet provider with network and settings valuse by passing it in function arguments.
   *
   * @param {IProvider} provider provider data with provider name and setting.
   * @param {INetwork} network application working network name and chainID.
   * @param {ISettings} settings connect wallet settings.
   * @returns return connection info in boolean (true - connected, false - not connected) or error provider.
   * @example connectWallet.connect(providerWallet, networkWallet, connectSetting).then((connect) =>
   * {console.log(connect);},(error) => {console.log('connect error', error);});
   */
  public async connect(
    provider: IProvider,
    network: INetwork,
    settings?: ISettings,
  ): Promise<IConnectorMessage> {
    if (!this.availableProviders.includes(provider.name)) {
      return {
        code: 2,
        type: 'error',
        connected: false,
        provider,
        message: {
          title: 'Error',
          subtitle: 'Provider Error',
          text: `Your provider doesn't exists`,
        },
      };
    }

    this.network = network;
    this.settings = settings ? settings : { providerType: false };

    this.connector = this.chooseProvider(provider.name);

    return new Promise<IConnectorMessage>((resolve, reject) => {
      this.connector
      .connect(provider)
      .then((connect) => this.applySettings(connect))
      .then((connect: IConnectorMessage) => {
        connect.connected ? this.initWeb3(connect.provider) : reject(connect);
        resolve(connect);
      },(err) => reject(this.applySettings(err)));
    });
  }

  /**
   * Find and choose available provider for create connection.
   *
   * @param {Srtring} name provider name passing from connect function in provider value.
   * @returns return selected provider class.
   * @example connectWallet.chooseProvider('MetaMask'); //=> new MetamaskConnect()
   */
  private chooseProvider(name: string): MetamaskConnect | WalletsConnect {
    this.providerName = name;
    switch (name) {
      case 'MetaMask':
        return new MetamaskConnect(this.network);
      case 'WalletConnect':
        return new WalletsConnect();
      case 'CoinbaseWallet':
        return new CoinbaseWalletConnect(this.network);
      case 'KardiaChain':
        return new KardiaChainConnect();
    }
  }

  /**
   * Initialize a Web3 by set provider after using connect function.
   *
   * @param {Any} provider array with provider information.
   * @example connectWallet.initWeb3(provider);
   */
  private initWeb3(provider: any): void {
    if (this.Web3) {
      this.Web3.setProvider(provider);
    } else {
      this.Web3 = new Web3(provider);
    }
  }

  /**
   * Geting current connectror
   *
   * @example connectWallet.getConnector();
   */
  public getConnector():
    | MetamaskConnect
    | WalletsConnect
    | CoinbaseWalletConnect
    | KardiaChainConnect {
    return this.connector;
  }

  /**
   * Geting current providerName
   *
   * @example connectWallet.getproviderName();
   */
  public getproviderName(): string {
    return this.providerName;
  }

  /**
   * Add settings parameters to connect wallet answers.
   *
   * @param {Array} data array which needs to apply a settings parameters
   * @returns return completedata with settings parameters
   * @example connectWallet.applySettings(data); //=> data.type etc.
   */
  private applySettings(
    data: IConnectorMessage | IError | IConnect,
  ): IConnectorMessage | IError | IConnect {
    if (this.settings.providerType) {
      data.type = this.providerName;
    }
    return data;
  }

  /**
   * Get account address and chain information from selected wallet provider.
   *
   * @returns return an Promise array with data error or connected.
   * @example connectWallet.getAccounts().then((account: any)=> console.log('account',account),(err: any => console.log('account', err)));
   */
  public getAccounts(): Promise<IConnect | IError | { address: string }> {
    const error: IError = {
      code: 4,
      message: {
        title: 'Error',
        subtitle: 'Chain error',
        text: '',
      },
    };

    return new Promise((resolve, reject) => {
      if (this.currentWeb3() && !this.connector) {
        const { address, accounts } = this.currentWeb3().currentProvider as any;
        resolve({ address: address || accounts[0] });
      } else if (this.connector) {
        const { chainID } = this.network;
        const { chainsMap, chainIDMap } = parameters;

        this.connector.getAccounts().then(
          (connectInfo: IConnect) => {
            if (connectInfo.network.chainID !== chainID) {
              error.message.text = `Please set network: ${
                chainsMap[chainIDMap[chainID]].name
              }.`;

              reject(this.applySettings(error));
            } else {
              resolve(this.applySettings(connectInfo));
            }
          },
          (error: IError) => {
            reject(this.applySettings(error));
          },
        );
      } else {
        error.code = 7;
        error.message = null;
        reject(this.applySettings(error));
      }
    });
  }

  /**
   * Create new Observer of transactions and add it to array of all transaction subscribers
   * variable. You can subscribe to waiting answer from blockchain if your trunsaction
   * finshed success or not. You will get transaction hash.
   *
   * @returns return new observable value.
   * @example connectWallet.txSubscribe().subscribe((tx) => {console.log('transacton', tx)});
   */
  public txSubscribe(): Observable<any> {
    const newObserver = new Observable((observer) => {
      this.allTxSubscribers.push(observer);
    });
    return newObserver;
  }

  /**
   * Trigger all transaction subscribers and pass transaction hash if transaction complete.
   *
   * @param {String} txHash transaction hash of success transaction.
   * @example connectWallet.clTxSubscribers(txHash);
   */
  public clTxSubscribers(txHash: string): void {
    this.allTxSubscribers.forEach((observer) => {
      observer.next(txHash);
    });
  }

  /**
   * Checking transaction hash status in blockchain. And return transacrion hash if transaction
   * was found and success or reject null if dont have enouth data or information.
   *
   * @param {String} txHash transaction hash.
   * @param {Any} resolve resolve transaction hash.
   * @param {Any} reject reject if transaction not found.
   * @returns return transaction hash or reject with null.
   * @example new Promise((resolve, reject) => {connectWallet.checkTx(txHash, resolve, reject);});
   */
  private txStatus(txHash: string, resolve: any, reject: any): void {
    this.Web3.eth.getTransactionReceipt(txHash, (err: any, res: any) => {
      if (err || (res && res.blockNumber && !res.status)) {
        reject(err);
      } else if (res && res.blockNumber) {
        this.clTxSubscribers(txHash);
        resolve(res);
      } else if (!res) {
        setTimeout(() => {
          this.txStatus(txHash, resolve, reject);
        }, 2000);
      }
    });
  }

  /**
   * Transaction check in blockchain. Use this funnction to start check transaction by his hash.
   * This function will triggered all transaction subscribers when transaction complete successful or
   * with errors. You need to provide transaction hash in function after you approve it.
   *
   * @param {String} txHash transaction hash.
   * @returns return promise with transaction search info, can return transaction hash or null.
   * @example connectWallet.txCheck(txHash).then((txHash: string) => console.log(txHash),(err) => console.log(err));
   */
  public txCheck(txHash: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.txStatus(txHash, resolve, reject);
    });
  }

  /**
   * Add contract to Web3 without providing contract name to initialize it, then you will
   * able to use contract function to get contract from web3 and use contract methods.
   *
   * @param {INoNameContract} contract contract object with contract address and abi.
   * @returns return contract web3 methods.
   * @example connectWallet.getContract(contract);
   */
  public getContract(contract: INoNameContract): Contract {
    return new this.Web3.eth.Contract(contract.abi, contract.address);
  }

  /**
   * Add contract to Web3. Provide contract name, address and abi code to initialize it, then you will
   * able to use contract(name) function to get contract from web3 and use contract methods.
   *
   * @param {IAddContract} contract contract object with contract name, address and abi.
   * @returns return true if contact added successfully or false if have some errors.
   * @example connectWallet.addContract(contract).then((contractStatus: boolean) => console.log(contractStatus), (err) => console.log(err));
   */
  public addContract(contract: IAddContract): Promise<boolean> {
    return new Promise<any>((resolve, reject) => {
      try {
        this.contracts[contract.name] = new this.Web3.eth.Contract(
          contract.abi,
          contract.address,
        );
        resolve(true);
      } catch {
        reject(false);
      }
    });
  }

  /**
   * Get contract by providing contract name. If you don't have contracts use addContract function to initialize it.
   *
   * @param {String} name contract name.
   * @returns return contract parameters and methods.
   * @example connectWallet.Contract(ContractName);
   */
  public Contract = (name: string): ContractWeb3 => this.contracts[name];

  /**
   * Get access to use Web3. Return Web3 variable to use it methods and parameters.
   *
   * @returns return Web3
   * @example connectWallet.currentWeb3();
   */
  public currentWeb3 = (): Web3 => this.Web3;

  /**
   * Get account balance from ethereum blockchain. Provide address in function arguments to recive address balance
   * from blockchain.
   *
   * @param {String} address address.
   * @returns return address balance.
   * @example connectWallet.getBalance(address).then((balance: string)=> {console.log(balance)});
   */
  public getBalance = (address: string): Promise<string | number> => {
    return this.Web3.eth.getBalance(address);
  };

  /**
   * Logout function. Use this function if you want to do logout from your application. Function will reset
   * current connection to defoult then you need to initialize connect() function again to connect to your
   * provider.
   *
   * @example connectWallet.resetConect();
   */
  public resetConect = (): void => (this.connector = undefined);

  /**
   * Use this method to sign custom mesaage.
   *
   * @example connectWallet.signMsg('0x0000000000000000000', 'some_data').then(data => console.log('sign:', data),err => console.log('sign err:',err));
   */
  public signMsg = (userAddr: string, msg: string): Promise<any> => {
    return this.Web3.eth.personal.sign(msg, userAddr, '');
  };

  /**
   * Subscribe to events from current connection: connect, disconnect, chain change, account change and etc.
   *
   * @example connectWallet.eventSubscriber().subscribe((event:IEvent) => console.log('event from subscribe', event), (err:IEventError) => console.log('event error', err));
   */
  public eventSubscriber(): Observable<IEvent | IEventError> {
    if (!this.connector) {
      throw new Error("connector haven't initialized");
    }

    return new Observable((observer) => {
      this.connector.eventSubscriber().subscribe(
        (event: IEvent) => observer.next(event),
        (error: IEventError) => observer.error(error),
      );
    });
  }
}
