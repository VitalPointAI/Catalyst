import { wallet } from './wallet'
import * as nearApiJs from 'near-api-js'
import getConfig from './config'

class DIDs {

    constructor(){}

    async initDIDsContract(account, contractId) {
        //initialize DAO Contract
        const didscontract = new nearApiJs.Contract(account, contractId, {
            viewMethods: [
                'getDID',
                'getInitialize',
                'getSchemas',
                'findSchema',
                'getDefinitions',
                'findDefinition',
                'findAlias',
                'getAliases',
                'hasDID'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
                'putDID',
                'initialize',
                'addSchema',
                'addDefinition',
                'addAlias'
            ],
            sender: account.accountId
            });

            return didscontract
    }

    async loadDIDs(contractId) {
       
      //  let loadAccount = await this.loadAccountObject()
        let loadAccount = await wallet.loadAccount()
       
        const account = await wallet.getAccount(loadAccount.accountId)
        
        let didsContract = await this.initDIDsContract(account, contractId)
        
        return didsContract
    }

    async loadAccountObject() {
        const nearConfig = getConfig(process.env.NODE_ENV || 'development')
        const near = await nearApiJs.connect(Object.assign({ deps: { keyStore: wallet.keyStore } }, nearConfig))
        let loadAccount = await wallet.loadAccount()
        return loadAccount
    }
    
}

export const dids = new DIDs()