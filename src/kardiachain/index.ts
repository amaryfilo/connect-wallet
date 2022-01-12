import { Observable } from 'rxjs';

import { IConnectorMessage, IEventError, IEvent } from '../interface';
import { parameters } from '../helpers';
import { AbstractConnector } from '../abstract-connector';

declare global {
  interface Window {
    kardiachain: any;
  }
}

export class KardiaChainConnect extends AbstractConnector {
  public connector: any;
  private chainID: number;
  private currentAddr: string;

  /**
   * KardiaChainConnect class to connect browser KardiaChain Wallet extention to your application
   * using connect wallet.
   */
  constructor() {
    super();
  }

  /**
   * Connect KardiaChain Wallet browser. Create connection with connect
   * wallet and return provider for Web3.
   *
   * @returns return connect status and connect information with provider for Web3.
   * @example this.connect().then((connector: IConnectorMessage) => console.log(connector),(err: IConnectorMessage) => console.log(err));
   */
  public connect(): Promise<IConnectorMessage> {
    return new Promise<any>((resolve, reject) => {
      if (typeof window.kardiachain !== 'undefined') {
        this.connector = window.kardiachain;
        if (window.kardiachain.isKaiWallet) {
          this.connector.enable();
          resolve({
            code: 1,
            connected: true,
            provider: this.connector,
            message: {
              title: 'Success',
              subtitle: 'Connect success',
              text: `Kardiachain found and connected.`,
            },
          } as IConnectorMessage);
        }
      }

      reject({
        code: 2,
        connected: false,
        message: {
          title: 'Error',
          subtitle: 'Error connect',
          text: `Kardiachain not found, please install it from <a href='https://metamask.io/' target="_blank">metamask.io</a>.`,
        },
      } as IConnectorMessage);
    });
  }

  private ethRequestAccounts(): Promise<any> {
    return this.connector.request({ method: 'eth_requestAccounts' });
  }

  public eventSubscriber(): Observable<IEvent | IEventError> {
    return new Observable((observer) => {
      this.connector.on('chainChanged', async (chainId: string) => {
        const accounts = await this.ethRequestAccounts();
        observer.next({
          address: accounts[0],
          network: parameters.chainsMap[chainId],
          name: 'chainChanged',
        });
      });

      this.connector.on('accountsChanged', (address: Array<any>) => {
        if (
          (this.currentAddr &&
            address[0].toUpperCase() !== this.currentAddr.toUpperCase()) ||
          address[0].toUpperCase() !==
            this.connector.selectedAddress.toUpperCase()
        ) {
          if (address.length) {
            this.connector
              .request({
                method: 'eth_chainId',
              })
              .then((chainID: string) => {
                this.currentAddr = address[0];
                this.chainID = +chainID;
                observer.next({
                  address: address[0],
                  network:
                    parameters.chainsMap[parameters.chainIDMap[+chainID]],
                  name: 'accountsChanged',
                });
              });
          } else {
            observer.error({
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
    });
  }

  /**
   * Get account address and chain information from KardiaChain Wallet extention.
   *
   * @returns return an Observable array with data error or connected information.
   * @example this.getAccounts().subscribe((account: any)=> {console.log('account',account)});
   */

  public getAccounts(): Promise<any> {
    const error = {
      code: 3,
      message: {
        title: 'Error',
        subtitle: 'Authorized error',
        message: 'You are not authorized.',
      },
    };

    return new Promise((resolve, reject) => {
      if (this.connector && this.connector.isKaiWallet) {
        this.currentAddr = this.connector.selectedAddress;

        this.ethRequestAccounts().then((accounts) => {
          if (accounts[0]) {
            this.connector
              .request({
                method: 'eth_chainId',
              })
              .then((chainID: string) => {
                this.chainID = +chainID;
                this.currentAddr = accounts[0];
                resolve({
                  address: accounts[0],
                  network:
                    parameters.chainsMap[parameters.chainIDMap[+chainID]],
                });
              });
          } else {
            this.connector.enable().catch(() => {
              reject(error);
            });
            // reject(error);
          }

          // if (!accounts[0]) {
          // this.connector.enable().catch(() => {
          //   reject(error);
          // });
          // } else {
          //   if (accounts[0]) {
          //     this.connector
          //       .request({
          //         method: 'net_version',
          //       })
          //       .then((chainID: string) => {
          //         this.chainID = +chainID;
          //         this.currentAddr = accounts[0];
          //         resolve({
          //           address: accounts[0],
          //           network:
          //             parameters.chainsMap[parameters.chainIDMap[+chainID]],
          //         });
          //       });
          //   } else {
          //     reject(error);
          //   }
          // }
        });
      }
    });
  }
}
