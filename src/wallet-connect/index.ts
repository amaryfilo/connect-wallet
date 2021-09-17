import { Observable } from 'rxjs';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { IConnectorMessage, IProvider } from '../interface';
import { parameters } from '../helpers';
import { AbstractConnector } from '../abstract-connector';

export class WalletsConnect extends AbstractConnector {
  public connector: WalletConnectProvider;

  /**
   * Connect wallet to application using connect wallet via WalletConnect by scanning Qr Code
   * in your favourite cryptowallet.
   */
  constructor() {
    super();
  }

  /**
   * Connect WalletConnect to application. Create connection with connect wallet and return provider for Web3.
   *
   * @returns return connect status and connect information with provider for Web3.
   * @example this.connect().then((connector: IConnectorMessage) => console.log(connector),(err: IConnectorMessage) => console.log(err));
   */
  public async connect(
    provider: IProvider,
    chainUsed,
  ): Promise<IConnectorMessage> {
    return new Promise<any>(async (resolve, reject) => {
      this.connector = new WalletConnectProvider(
        provider.provider[provider.useProvider],
      );
      await this.connector
        .enable()
        .then(() => {
          resolve({
            code: 1,
            connected: true,
            provider: this.connector,
            message: {
              title: 'Success',
              subtitle: 'Wallet Connect',
              text: `Wallet Connect connected.`,
            },
          } as IConnectorMessage);
        })
        .catch(() => {
          reject({
            code: 5,
            connected: false,
            message: {
              title: 'Error',
              subtitle: 'Error connect',
              text: `User closed qr modal window.`,
            },
          } as IConnectorMessage);
        });
    });
  }

  /**
   * Get account address and chain information from connected wallet.
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
      if (!this.connector.connected) {
        this.connector.createSession();
      }

      onNext(observer, {
        address: this.connector.accounts[0],
        network:
          parameters.chainsMap[parameters.chainIDMap[this.connector.chainId]],
      });

      this.connector.on('connect', (error: any, payload: any) => {
        if (error) {
          onError(observer, {
            code: 3,
            message: {
              title: 'Error',
              subtitle: 'Authorized error',
              message: 'You are not authorized.',
            },
          });
        }

        const { accounts, chainId } = payload.params[0];

        onNext(observer, { address: accounts, network: chainId });
      });

      this.connector.on('disconnect', (error, payload) => {
        if (error) {
          console.log('wallet connect on connect error', error, payload);
          onError(observer, {
            code: 6,
            message: {
              title: 'Error',
              subtitle: 'Disconnect',
              message: 'Wallet disconnected',
            },
          });
        }
      });

      this.connector.on('wc_sessionUpdate', (error, payload) => {
        console.log(payload, 'wc_sessionUpdate');
      });

      this.connector.on('wc_sessionRequest', (error, payload) => {
        console.log(payload, 'wc_sessionRequest');
      });

      this.connector.on('call_request', (error, payload) => {
        console.log(payload, 'call_request');
      });

      this.connector.on('session_update', (error, payload) => {
        console.log(payload, 'session_update');
      });

      this.connector.on('session_request', (error, payload) => {
        console.log(payload, 'session_request');
      });

      return {
        unsubscribe(): any {},
      };
    });
  }
}
