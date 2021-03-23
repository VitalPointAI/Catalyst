import * as nearApiJs from 'near-api-js'
import getConfig from './config'

const {
    networkId
} = getConfig(process.env.NODE_ENV)

const {
    KeyPair,
    InMemorySigner
} = nearApiJs

class DAOContract {

    constructor(){}

    async initDAOContract(account, contractId) {
        const daocontract = new nearApiJs.Contract(account, contractId, {
            viewMethods: [
                
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
               'cancelProposal',
               'processProposal'
            ]
            });
            return daocontract
    }

    async loadDAO(contractId) {
        let loadAccount = await this.loadAccountObject(contractId)
        let daoContract = await this.initDAOContract(loadAccount, contractId)
        return daoContract
    }

    async loadAccountObject(contractId) {
        let keyPair = KeyPair.fromString(process.env.FACTORY_PRIV_KEY)
        let signer = await InMemorySigner.fromKeyPair(networkId, contractId, keyPair)
        const near = await nearApiJs.connect(Object.assign({deps: { keyStore: signer.keyStore }}, getConfig(process.env.NODE_ENV)))
        let loadAccount = new nearApiJs.Account(near.connection, contractId)
        return loadAccount
    }   
    
}

export const daoContractSend = new DAOContract()