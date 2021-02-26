import { Observable } from 'rxjs';

import { IConnectorMessage } from '../interface';
import { parameters } from '../helpers';

declare global {
  interface Window {
    ethereum: any;
  }
}

export class MetamaskConnect {
  private connector: any;
  private chainID: number;

  /**
   * Metamask class to connect browser metamask extention to your application
   * using connect wallet.
   */
  constructor() {}

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
      if (this.connector && this.connector.isMetaMask) {
        this.connector.on('chainChanged', (chainId: string) => {
          onNext(observer, {
            address: this.connector.selectedAddress,
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

        if (!this.connector.selectedAddress) {
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
          if (this.connector.selectedAddress) {
            this.connector
              .request({
                method: 'net_version',
              })
              .then((chainID: string) => {
                this.chainID = +chainID;
                onNext(observer, {
                  address: this.connector.selectedAddress,
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
      }

      return {
        unsubscribe(): any {},
      };
    });
  }
}
