import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export interface SMIPContext {
    uri: string;
    authenticatorName: string;
    authenticatorPassword: string;
    username: string;
    role: string;
}

export class SMIPClient {
    // A non-authenticated client is used to get the token
    private _authClient: ApolloClient<any>;
    // An authenticated client is used to make requests
    private _apolloClient?: ApolloClient<any>;
    private _context: SMIPContext;
    private _token: string | null = null;        

    constructor(context: SMIPContext) {
        console.log("SMIPClient constructor invoked");
        this._context = context;        
        this._authClient = new ApolloClient({
            link: new HttpLink({ uri: context.uri }),
            cache: new InMemoryCache(),
        });    
        this.init();
    }   
    
    init = async () => {
        console.log("SMIPClient init invoked");
        this._apolloClient = await this.getClient();
        await this.ensureToken();
    }

    public get token() {
        return this._token;
    }

    public get context() {
        return this._context;
    }

    public get client() {
        return this._apolloClient;
    }    

    ensureToken = async () => {
        if (!this._token) {
            console.log("No token found, refreshing...");
            await this.refreshToken();
        }
    }

    refreshToken = async () => {               
        console.log("Refreshing token...");         
        this._authClient.mutate({
            mutation: gql`
            mutation AuthRequestMutation ($input: AuthenticationRequestInput!) {
                authenticationRequest(input: $input) {
                        clientMutationId
                        jwtRequest {
                            challenge
                            message
                        }                    
                }
            }`,
            variables: {                
                "input": {
                    authenticator: this.context.authenticatorName,
                    role: this.context.role,
                    userName: this.context.username
                }
            }
        }).then((authRequestResult) => {
            console.log(authRequestResult);
            const challenge = authRequestResult.data.authenticationRequest.jwtRequest.challenge;
            this._authClient.mutate({
                mutation: gql`
                mutation authValidationMutation($input: AuthenticationValidationInput!) {
                    authenticationValidation(input: $input) {
                       jwtClaim
                    }
                }
                `,
                variables: {
                    input: {
                        signedChallenge: `${challenge}|${this.context.authenticatorPassword}`,
                        authenticator: this.context.authenticatorName
                    }
                }
            }).then((authValidationResult) => {
                console.log(authValidationResult);                
                const jwt = authValidationResult.data.authenticationValidation.jwtClaim;
                console.log(`JWT = ${jwt}`);                
                this._token = jwt;          
                console.log("Token refreshed successfully");                                      
            }).catch((error) => {
                console.log(error);
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    getClient = async () => {                
        const authMiddleware = setContext(async (operation, { headers }) => {
            await this.ensureToken();
            console.log(`Setting authorization header to ${this._token}`);
            return {
                headers: {
                    ...headers,
                    authorization: `Bearer ${this._token}`
                }
            }
        });

        const httpLink = new HttpLink({ uri: this.context.uri, fetchOptions: { method: 'POST' } });
        
        this._apolloClient = new ApolloClient({
            link: authMiddleware.concat(httpLink),
            cache: new InMemoryCache(),
            connectToDevTools: true
        });
        return this._apolloClient;
    }
}