declare module '@microsoft/microsoft-graph-client' {
  import { AuthenticationProvider } from '@microsoft/microsoft-graph-core';

  export interface ClientOptions {
    authProvider: AuthenticationProvider;
  }

  export class Client {
    static init(options: ClientOptions): Client;
    static initWithMiddleware(options: ClientOptions): Client;

    api(path: string): APIMethod;
  }

  export interface APIMethod {
    get(): Promise<any>;
    post(body: any): Promise<any>;
    put(body: any): Promise<any>;
    patch(body: any): Promise<any>;
    delete(): Promise<any>;
  }
}

declare module '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials' {
  import { TokenCredential } from '@azure/core-auth';
  import { AuthenticationProvider } from '@microsoft/microsoft-graph-core';

  export class TokenCredentialAuthenticationProvider implements AuthenticationProvider {
    constructor(credential: TokenCredential, options: { scopes: string[] });
  }
}
