import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    tokenFactoryContractName
} = config

class TokenFactory {

    constructor(){}

    async initTokenFactoryContract(account) {
      
        const tokenFactoryContract = new nearApiJs.Contract(account, tokenFactoryContractName, {
            viewMethods: [
                'getTokenList',
                'getTokenListLength',
                'getTokenIndex',
                'getTokensByAccount'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
               'createToken',
            ]
            });
            return tokenFactoryContract
    }
    
}

export const tokenFactory = new TokenFactory()