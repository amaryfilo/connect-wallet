import { Observable } from 'rxjs';
import Web3 from 'web3';

import { IConnectorMessage, IProvider } from '../interface';

export abstract class AbstractConnector {
  public abstract connector: any;

  constructor() {}

  public abstract connect(
    provider?: IProvider,
    chainUsed?: number,
  ): Promise<IConnectorMessage>;

  public abstract getAccounts(): Observable<any>;
}
