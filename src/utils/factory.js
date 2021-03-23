import * as nearApiJs from 'near-api-js'
import { wallet } from './wallet'
import getConfig from './config'

const {
    networkId
} = getConfig(process.env.NODE_ENV)

const {
    KeyPair,
    InMemorySigner
} = nearApiJs

class Factory {

    constructor(){}

    async initFactoryContract(account) {
      
        const factorycontract = new nearApiJs.Contract(account, process.env.FACTORY_CONTRACT, {
            viewMethods: [
                'getDaoList',
                'findDAO'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
               'createDemDAO'
            ]
            });
            return factorycontract
    }

    async loadFactory(contractId) {

        let loadAccount = await wallet.loadAccount()
       
        const account = await wallet.getAccount(loadAccount.accountId)
        
        let factoryContract = await this.initFactoryContract(account, contractId)
        
        return factoryContract
    }

    async loadAccountObject(account) {
        let keyPair = KeyPair.fromString(process.env.FACTORY_PRIV_KEY)
        let signer = await InMemorySigner.fromKeyPair(networkId, account.accountId, keyPair)
        const near = await nearApiJs.connect(Object.assign({deps: { keyStore: signer.keyStore }}, getConfig(process.env.NODE_ENV)))
        let loadAccount = await wallet.loadAccount(account.accountId)
        return loadAccount
    }   
    
}

export const factory = new Factory()