import { Observable } from 'rxjs';

import { IConnectorMessage } from '../interface';
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

  constructor() {
    super();
  }

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

  public getAccounts(): Observable<any> {
    const onError = (observer: any, errorParams: any) => {
      observer.error(errorParams);
    };

    const onNext = (observer: any, nextParams: any) => {
      observer.next(nextParams);
    };

    return new Observable((observer) => {
      if (this.connector && this.connector.isKaiWallet) {
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
                  this.chainID = +chainID;
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

      // return {
      //   unsubscribe(): any {},
      // };
    });
  }
}
