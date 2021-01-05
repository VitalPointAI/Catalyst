import { wallet } from './wallet'
import * as nearApiJs from 'near-api-js'
import getConfig from './config'

class Personas {

    constructor(){}

    async initPersonasContract(account) {
         // PERSONA Contract Initialization
        const contract = new nearApiJs.Contract(account, process.env.PERSONAS_CONTRACT, {
            viewMethods: [
            'getAppIdentity',
            'getIdentity',
            'getAllPersonas'
            ],
            changeMethods: [
            'setAppIdentity',
            'registerApp',
            'registerPersona',
            'setIdentity'
            ],
            sender: process.env.PERSONAS_CONTRACT
        });
       
        return contract
    }

    async loadPersonas() {
        let loadAccount = await this.loadAccountObject()
        const account = await wallet.getAccount(loadAccount.accountId)
        let personasContract = await this.initPersonasContract(account)
        return personasContract
    }

    async loadAccountObject() {
        const nearConfig = getConfig(process.env.NODE_ENV || 'development')
        const near = await nearApiJs.connect(Object.assign({ deps: { keyStore: wallet.keyStore } }, nearConfig))
        let loadAccount = await wallet.loadAccount()
        return loadAccount
    }
    
}

export const personas = new Personas()