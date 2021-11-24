import { Observable } from 'rxjs';

import {
  IConnectorMessage,
  IProvider,
  IEvent,
  IEventError,
} from '../interface';

export abstract class AbstractConnector {
  public abstract connector: any;

  constructor() {}

  public abstract connect(provider?: IProvider): Promise<IConnectorMessage>;

  public abstract eventSubscriber(): Observable<IEvent | IEventError>;

  public abstract getAccounts(): Promise<any>;
}
