import { wallet } from './wallet'
import * as nearApiJs from 'near-api-js'
import getConfig from './config'

class DID {

    constructor(){}

    async initDIDContract(account) {
        // DID Contract Initialization
        const didcontract = new nearApiJs.Contract(account, process.env.DID_CONTRACT, {
            viewMethods: [
            'get_did',
            'get_document',
            'getDidStatus',
            'getDidCreated',
            'getDidUpdated',
            'getDidContexts',
            'getDidPublicKeyList',
            'getDidControllers',
            'getDidServices',
            'getDidAuthentication'
            ],
            changeMethods: [
            'reg_did_using_account'
            ]
        });
        return didcontract
    }

    async loadDID() {
        let loadAccount = await this.loadAccountObject()
        const account = await wallet.getAccount(loadAccount.accountId)
        let didContract = await this.initDIDContract(account)
        return didContract
    }

    async loadAccountObject() {
        const nearConfig = getConfig(process.env.NODE_ENV || 'development')
        const near = await nearApiJs.connect(Object.assign({ deps: { keyStore: wallet.keyStore } }, nearConfig))
        let loadAccount = await wallet.loadAccount()
        return loadAccount
    }

    async initializeDID(didContract, accountId) {
        
        try{
            await didContract.reg_did_using_account({}, process.env.DEFAULT_GAS_VALUE);
          } catch (err) {
            console.log('problem registering identity: ', err)
          }
      
          try{
            let didDocument = await didContract.get_document({account: accountId})
          } catch (err) {
            console.log('no didDocument ', err)
          }
          
      
          let DID = {}    
          try{
            DID.didStatus = await didContract.getDidStatus({account: accountId})
          } catch (err) {
            console.log('no status ', err)
            DID.didStatus = ''
          }
          try{
            DID.didContexts = await didContract.getDidContexts({account: accountId})
          } catch (err) {
            console.log('no contexts ', err)
            DID.didContexts = []
          }
          try{
            DID.didServices = await didContract.getDidServices({account: accountId})
          } catch (err) {
            console.log('no services ', err)
            DID.didServices = []
          }
          try{
            DID.didAuthenticators = await didContract.getDidAuthentication({account: accountId})
          } catch (err) {
            console.log('no authenticators ', err)
            DID.didAuthenticators = []
          }
          try{
            DID.didControllers = await didContract.getDidControllers({account: accountId})
          } catch (err) {
            console.log('no controllers ', err)
            DID.didControllers = []
          }
          try{
            DID.didPublicKeyList = await didContract.getDidPublicKeyList({account: accountId})
          } catch (err) {
            console.log('no public key list ', err)
            DID.didPublicKeyList = []
          }
          try{
            DID.didCreated = await didContract.getDidCreated({account: accountId})
          } catch (err) {
            console.log('no created', err)
            DID.didCreated = []
          }
          try{
            DID.didUpdated = await didContract.getDidUpdated({account: accountId})
          } catch (err) {
            console.log('not updated', err)
            DID.didUpdated = []
          }
        
          console.log('DID', DID)    
    }
    
}

export const did = new DID()