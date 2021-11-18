import { Observable } from 'rxjs';

import { IConnectorMessage, INetwork, INativeCurrency } from '../interface';
import { parameters } from '../helpers';
import { AbstractConnector } from '../abstract-connector';

export class MetamaskConnect extends AbstractConnector {
  public connector: any;
  private chainID: number;
  private chainName: string;
  private nativeCurrency: INativeCurrency;
  private rpc: string;
  private blockExplorerUrl: string;

  /**
   * Metamask class to connect browser metamask extention to your application
   * using connect wallet.
   */
  constructor(network: INetwork) {
    super();

    this.chainID = network.chainID;
    if (network.chainName) this.chainName = network.chainName;
    if (network.nativeCurrency) this.nativeCurrency = network.nativeCurrency;
    if (network.rpc) this.rpc = network.rpc;
    if (network.blockExplorerUrl)
      this.blockExplorerUrl = network.blockExplorerUrl;
  }

  /**
   * Connect Metamask browser or mobile extention to application. Create connection with connect
   * wallet and return provider for Web3.
   *
   * @returns return connect status and connect information with provider for Web3.
   * @example this.connect().then((connector: IConnectorMessage) => console.log(connector),(err: IConnectorMessage) => console.log(err));
   */
  public connect(): Promise<IConnectorMessage> {
    return new Promise<any>((resolve, reject) => {
      if (typeof window.ethereum !== 'undefined') {
        this.connector = window.ethereum;
        resolve({
          code: 1,
          connected: true,
          provider: 'Web3',
          message: {
            title: 'Success',
            subtitle: 'Connect success',
            text: `Metamask found and connected.`,
          },
        } as IConnectorMessage);
      }

      reject({
        code: 2,
        connected: false,
        message: {
          title: 'Error',
          subtitle: 'Error connect',
          text: `Metamask not found, please install it from <a href='https://metamask.io/' target="_blank">metamask.io</a>.`,
        },
      } as IConnectorMessage);
    });
  }

  private ethRequestAccounts(): Promise<any> {
    return this.connector.request({ method: 'eth_requestAccounts' });
  }

  private getChainId(): Promise<any> {
    return this.connector.request({ method: 'eth_chainId' });
  }

  private async checkNet(): Promise<any> {
    if (
      !this.chainName ||
      !this.nativeCurrency ||
      !this.rpc ||
      !this.blockExplorerUrl
    ) {
      return true;
    }
    try {
      const currentChain = await this.getChainId();

      if (this.chainID !== parseInt(currentChain)) {
        try {
          await this.connector.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${this.chainID.toString(16)}` }],
          });
          return true;
        } catch (err: any) {
          if (err.code === 4902) {
            try {
              await this.connector.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${this.chainID.toString(16)}`,
                    chainName: this.chainName,
                    nativeCurrency: this.nativeCurrency,
                    rpcUrls: [this.rpc],
                    blockExplorerUrls: [this.blockExplorerUrl],
                  },
                ],
              });
              return true;
            } catch (err) {
              throw new Error('user reject add chain');
            }
          }
          throw new Error(`user reject switch network`);
        }
      }
      return true;
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Get account address and chain information from metamask extention.
   *
   * @returns return an Observable array with data error or connected information.
   * @example this.getAccounts().subscribe((account: any)=> {console.log('account',account)});
   */

  public getAccounts(): Observable<any> {
    const onError = (observer: any, errorParams: any) => {
      observer.error(errorParams);
    };

    const onNext = (observer: any, nextParams: any) => {
      observer.next(nextParams);
    };

    return new Observable((observer) => {
      this.checkNet()
        .then(() => {
          if (this.connector && this.connector.isMetaMask) {
            this.connector.on('chainChanged', async (chainId: string) => {
              const accounts = await this.ethRequestAccounts();
              onNext(observer, {
                address: accounts[0],
                network: parameters.chainsMap[chainId],
              });
            });

            this.connector.on('accountsChanged', (address: Array<any>) => {
              if (address.length) {
                onNext(observer, {
                  address: address[0],
                  network:
                    parameters.chainsMap[parameters.chainIDMap[+this.chainID]],
                });
              } else {
                onError(observer, {
                  code: 3,
                  message: {
                    title: 'Error',
                    subtitle: 'Authorized error',
                    message: 'You are not authorized.',
                  },
                });
              }
            });

            this.ethRequestAccounts().then((accounts) => {
              if (!accounts[0]) {
                this.connector.enable().catch(() => {
                  onError(observer, {
                    code: 3,
                    message: {
                      title: 'Error',
                      subtitle: 'Authorized error',
                      message: 'You are not authorized.',
                    },
                  });
                });
              } else {
                if (accounts[0]) {
                  this.connector
                    .request({
                      method: 'net_version',
                    })
                    .then((chainID: string) => {
                      onNext(observer, {
                        address: accounts[0],
                        network:
                          parameters.chainsMap[parameters.chainIDMap[+chainID]],
                      });
                    });
                } else {
                  onError(observer, {
                    code: 3,
                    message: {
                      title: 'Error',
                      subtitle: 'Authorized error',
                      message: 'You are not authorized.',
                    },
                  });
                }
              }
            });
          }
        })
        .catch((err: any) => {
          onError(observer, {
            code: 4,
            message: {
              title: 'Error',
              subtitle: 'Authorized error',
              message: err.message,
            },
          });
        });
    });
  }
}
