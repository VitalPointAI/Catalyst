import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    networkId, factoryContractName
} = config

const {
    KeyPair,
    InMemorySigner
} = nearApiJs

class Factory {

    constructor(){}

    async initFactoryContract(account) {
      
        const factorycontract = new nearApiJs.Contract(account, factoryContractName, {
            viewMethods: [
                'getDaoList',
                'getDaoListLength',
                'getDaoIndex'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
               'createDAO',
               'deleteDAO',
               'inactivateDAO'
            ]
            });
            return factorycontract
    }

    // async loadFactory(account, contractId) {
    //     console.log('contractId', contractId)
    //    // let account = await this.loadAccountObject(contractId)
        
    //     let factoryContract = await this.initFactoryContract(account, contractId)
        
    //     return factoryContract
    // }

    // async loadAccountObject(contractId) {
    //     let keyPair = KeyPair.fromString(process.env.FACTORY_PRIV_KEY)
    //     let signer = await InMemorySigner.fromKeyPair(networkId, contractId, keyPair)
    //     const near = await nearApiJs.connect(Object.assign({deps: { keyStore: signer.keyStore }}, process.env.REACT_APP_ENV))
    //     let wallet = new nearApiJs.WalletAccount(near);
    //     console.log('wallet', wallet)
    //     let account = await wallet.account(contractId)
    //     console.log('account', account)
    //     return account
    // }   
    
}

export const factory = new Factory()