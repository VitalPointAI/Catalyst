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

    async initDAOContract(account) {
        const daocontract = new nearApiJs.Contract(account, process.env.DAO_CONTRACT, {
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

    async loadDAO() {
        let loadAccount = await this.loadAccountObject()
        let daoContract = await this.initDAOContract(loadAccount)
        return daoContract
    }

    async loadAccountObject() {
        let keyPair = KeyPair.fromString(process.env.DAO_CONTRACT_PRIV_KEY)
        let signer = await InMemorySigner.fromKeyPair(networkId, process.env.DAO_CONTRACT, keyPair)
        const near = await nearApiJs.connect(Object.assign({deps: { keyStore: signer.keyStore }}, getConfig(process.env.NODE_ENV)))
        let loadAccount = new nearApiJs.Account(near.connection, process.env.DAO_CONTRACT)
        return loadAccount
    }   
    
}

export const daoContractSend = new DAOContract()