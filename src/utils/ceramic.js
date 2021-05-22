import CeramicClient from '@ceramicnetwork/http-client'
import * as nearApiJs from 'near-api-js'
import { get, set, del } from './storage'
import { IDX } from '@ceramicstudio/idx'
import { createDefinition, publishSchema } from '@ceramicstudio/idx-tools'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyDidResolver from 'key-did-resolver'
import { DID } from 'dids'

// schemas
import { profileSchema } from '../schemas/profile'
import { daoProfileSchema } from '../schemas/daoProfile'
import { accountKeysSchema } from '../schemas/accountKeys'
import { daoKeysSchema } from '../schemas/daoKeys'
import { definitionsSchema } from '../schemas/definitions'
import { schemaSchema } from '../schemas/schemas'
import { daoListSchema } from '../schemas/daoList'
import { memberSchema } from '../schemas/members'
import { summonSchema } from '../schemas/summonEvent'
import { proposalSchema } from '../schemas/proposals'
import { proposalDetailsSchema } from '../schemas/proposalDetails'
import { commentsSchema } from '../schemas/comments'

import { config } from '../state/config'

const axios = require('axios').default


export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, REDIRECT, KEY_REDIRECT, APP_OWNER_ACCOUNT, IPFS_PROVIDER, FACTORY_DEPOSIT,
    networkId, nodeUrl, walletUrl, nameSuffix,
    contractName, didRegistryContractName
} = config

const {
  KeyPair,
  InMemorySigner,
  transactions: {
      addKey
  },
  utils: {
      PublicKey,
      format: {
          parseNearAmount, formatNearAmount
      }
  }
} = nearApiJs

class Ceramic {

  async storeSeedSecret(idx, payload, key, did) {
    let record = await idx.get(key, idx._ceramic.did.id)
    if(!record){
      record = { seeds: [] }
    }
   
    const secretData = { did, payload }
   
    let access = [idx._ceramic.did.id]
    if(did) access.push(did)
    const jwe = await idx._ceramic.did.createDagJWE(secretData, access)
  
    record.seeds.push(jwe)
  
    await idx.set(key, record)
  }

  async storeKeysSecret(idx, payload, key, did) {

    let record = await idx.get(key)
    
    if(!record){
      record = { seeds: [] }
    }
   
    let access = [idx._ceramic.did.id]
    if(did) access.push(did)
    const jwe = await idx._ceramic.did.createDagJWE(payload, access)
  
    record = { seeds: [jwe] }
  
    await idx.set(key, record)
  }
  
  async downloadSecret(idx, key, did) {
  
    let records = await idx.get(key)
   
    if(records){
      let i = 0
  
      while(i < records.seeds.length) {
        let record = await idx._ceramic.did.decryptDagJWE(records.seeds[i])
        if (record.did == did) {
          return record.payload
        }
        i++
      }
    }
    return false
  }

  async downloadKeysSecret(idx, key) {
    let records = await idx.get(key)
    if(records){
      return await idx._ceramic.did.decryptDagJWE(records.seeds[0])
    }
    return []
  }

  async getLocalAccountSeed(accountId){
    let accounts = get(ACCOUNT_LINKS, [])
    if(accounts && accounts.length > 0){
      let i = 0
      while (i < accounts.length){
        if(accounts[i].accountId == accountId){
          let seed = Buffer.from((accounts[i].key).slice(0,32))
          return seed
        }
        i++
      }
    } 
    return false
  }

async makeSeed(account){
    let keyPair = KeyPair.fromRandom('ed25519')
    
    let owner = account.accountId
    const links = get(ACCOUNT_LINKS, [])
    let c = 0
    let accountExists
    while(c < links.length) {
        if(links[c].accountId == account.accountId){
            accountExists = true
            links[c] = { key: keyPair.secretKey, accountId: account.accountId, owner: owner, keyStored: Date.now() }
            set(ACCOUNT_LINKS, links)
            break
        } else {
            accountExists = false
        }
    c++
    }
    if(!accountExists){
      links.push({ key: keyPair.secretKey, accountId: account.accountId, owner: owner, keyStored: Date.now() })
      set(ACCOUNT_LINKS, links)
    }
}

  async getCeramic(account, seed) {
    if (seed == undefined || seed == false){
      seed = await this.getLocalAccountSeed(account.accountId)
      if(seed == false || seed == undefined){
        await this.makeSeed(account)
        seed = await this.getLocalAccountSeed(account.accountId)
      }
    }
    // const API_URL = 'https://ceramic-clay.3boxlabs.com'
    const API_URL = 'http://localhost:7007'
    const ceramic = new CeramicClient(API_URL, {cacheDocCommits: true, docSyncEnabled: false, docSynchInterval: 30000})
    const provider = new Ed25519Provider(seed)
    const resolver = {...KeyDidResolver.getResolver()}
    const did = new DID({ resolver })
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
    await ceramic.did.authenticate()
    return ceramic
  }

  async getAppCeramic() {
    let retrieveSeed = await axios.get('https://vpbackend.azurewebsites.net/appseed')
    const seed = Buffer.from((retrieveSeed.data).slice(0, 32))
    //const API_URL = 'https://ceramic-clay.3boxlabs.com'
    const API_URL = 'http://localhost:7007'
    const ceramic = new CeramicClient(API_URL, {docSyncEnabled: false, docSynchInterval: 30000})
    const provider = new Ed25519Provider(seed)
    const resolver = {...KeyDidResolver.getResolver()}
    const did = new DID({ resolver })
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
    await ceramic.did.authenticate()
    return ceramic
  }

  async associateDID(accountId, contract, ceramic) {

    // ensure it's registered in the contract, if not, put it back there
    let exists = await contract.hasDID({accountId: accountId})

    if(exists) return ceramic.did.id
    
    if(!exists){
      try {
        let didContract = await this.useDidContractFullAccessKey()
          await didContract.putDID({
            accountId: accountId,
            did: ceramic.did.id
          }, GAS)
          return ceramic.did.id
      } catch (err) {
        console.log(err)
      }
    }
  }

  async associateAppDID(accountId, contract, ceramic) {
  
    /** Try and retrieve did from  contract if it exists */
      let did
        let didPresent = await contract.hasDID({accountId: accountId})
          if(didPresent) {   
          try {
              did = await contract.getDID({accountId: accountId});
              if(did) {
                return did
              }           
          } catch (err) {
              console.log('no DID retrievable', err)
          }
        }

        /** No DID, so create a new one and store it in the contract */
        if (ceramic.did.id) {
          try{
            let didContract = await this.useDidContractFullAccessKey()
            did = await didContract.putDID({
              accountId: accountId,
              did: ceramic.did.id
            }, GAS)
          } catch (err) {
            console.log('problem storing DID', err)
          }
        }
      return did
  }

  async initiateDidRegistryContract(account) {    
   
    // initiate the contract so its associated with this current account and exposing all the methods
    let didRegistryContract = new nearApiJs.Contract(account, didRegistryContractName, {
      viewMethods: [
          'getDID',
          'getSchemas',
          'findSchema',
          'getDefinitions',
          'findDefinition',
          'findAlias',
          'getAliases',
          'hasDID',
          'retrieveAlias',
          'hasAlias'
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: [
          'putDID',
          'initialize',
          'addSchema',
          'addDefinition',
          'addAlias',
          'storeAlias'
      ],
  })
    return didRegistryContract
  }

  async useDidContractFullAccessKey() {    

    // Step 1:  get the keypair from the contract's full access private key
    let retrieveKey = await axios.get('https://vpbackend.azurewebsites.net/didkey')
    let keyPair = KeyPair.fromString(retrieveKey.data)

    // Step 2:  load up an inMemorySigner using the keyPair for the account
    let signer = await InMemorySigner.fromKeyPair(networkId, didRegistryContractName, keyPair)

    // Step 3:  create a connection to the network using the signer's keystore and default config for testnet
    const near = await nearApiJs.connect({
      networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
    })

    // Step 4:  get the account object of the currentAccount.  At this point, we should have full control over the account.
    let account = new nearApiJs.Account(near.connection, didRegistryContractName)

    // initiate the contract so its associated with this current account and exposing all the methods
    let didRegistryContract = new nearApiJs.Contract(account, didRegistryContractName, {
      viewMethods: [
          'getDID',
          'getSchemas',
          'findSchema',
          'getDefinitions',
          'findDefinition',
          'findAlias',
          'getAliases',
          'hasDID',
          'retrieveAlias',
          'hasAlias'
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: [
          'putDID',
          'initialize',
          'addSchema',
          'addDefinition',
          'addAlias',
          'storeAlias'
      ],
  })
    return didRegistryContract
  }


  async getAlias(accountId, aliasName, client, schema, description, contract) {
    try {
      let aliasExists = await contract.hasAlias({alias: accountId+':'+aliasName})
      if(aliasExists){
        let alias = await contract.retrieveAlias({alias: accountId+':'+aliasName})
        return alias
      }
      if(!aliasExists){
        let schemaURL = await publishSchema(client, {content: schema})
        let definition = await createDefinition(client, {
          name: aliasName,
          description: description,
          schema: schemaURL.commitId.toUrl()
        })
        let didContract = await this.useDidContractFullAccessKey()
        await didContract.storeAlias({alias: accountId+':'+aliasName, definition: definition.id.toString()})
        return definition.id.toString()
      }
    } catch (err) {
      console.log('problem retrieving alias', err)
      return false
    }
  }

  async aliasSetup(idx, accountId, aliasName, defDesc, schemaFormat, ceramicClient) {
    const currentDefinitions = await idx.get('definitions', idx.id)
    let defExists
    if(currentDefinitions != null){
      let m = 0
        while (m < currentDefinitions.defs.length) {
            if (currentDefinitions.defs[m].accountId == accountId && currentDefinitions.defs[m].alias == aliasName){
              defExists = true
              return true
            }
        m++
      }
    } else {
      defExists = false
    }
    
    if(!defExists) {

      const currentSchemas = await idx.get('schemas', idx.id)

      // check for existing schema for this account from it's owner's account idx
      let schemaExists
      if(currentSchemas != null ){
        let k = 0
        while (k < currentSchemas.schemas.length) {
            if (currentSchemas.schemas[k].accountId == accountId && currentSchemas.schemas[k].name == aliasName){
            schemaExists = true
            break
            }
            k++
        }
      } else {
        schemaExists = false
      }

      let schemaURL
      if(!schemaExists){
          // create a new Schema
          
          let schemaURL = await publishSchema(ceramicClient, {content: schemaFormat})

          let schemaRecords = await idx.get('schemas', idx.id)
        
  
          if(schemaRecords == null){
            schemaRecords = { schemas: [] }
          }
         
          let record = {
              accountId: accountId,
              name: aliasName,
              url: schemaURL.commitId.toUrl()
            }
            
          schemaRecords.schemas.push(record)
          let result = await idx.set('schemas', schemaRecords)
      }

      let updatedSchemas = await idx.get('schemas', idx.id)
      
      let n = 0
      while (n < updatedSchemas.schemas.length) {
        if(updatedSchemas.schemas[n].accountId == accountId && updatedSchemas.schemas[n].name == aliasName){
            schemaURL = updatedSchemas.schemas[n].url
            break
        }
        n++
      }

      // create a new profile definition
      let definition
      try {
        definition = await createDefinition(ceramicClient, {
          name: aliasName,
          description: defDesc,
          schema: schemaURL
        })
      } catch (err) {
        console.log('definition issue', err)
      }
      
      if(definition){
        let defRecords = await idx.get('definitions', idx.id)
        if(defRecords == null){
          defRecords = { defs: [] }
        }

        let record = {
            accountId: accountId,
            alias: aliasName,
            def: definition.id.toString()
          }

        defRecords.defs.push(record)

        let result = await idx.set('definitions', defRecords)
        
        return true
      }
    }
    return true
  }

  async getAliases(idx, accountId) {
    
    let aliases = {}
    
    let allAliases = await idx.get('definitions', idx.id)
    
    if(allAliases != null) {

      //retrieve aliases for each definition
      let i = 0
      
      while (i < allAliases.defs.length) {
          if(allAliases.defs[i].accountId == accountId){
            let alias = {[allAliases.defs[i].alias]: allAliases.defs[i].def}
            aliases = {...aliases, ...alias}
          }
          i++
      }
      return aliases
    } else {
    return {}
    }
  }


  // application IDX - maintains most up to date schemas and definitions ensuring chain always has the most recent commit
  async getAppIdx(contract){

    const appClient = await this.getAppCeramic()

    const appDid = this.associateAppDID(APP_OWNER_ACCOUNT, contract, appClient)
    const definitions = this.getAlias(APP_OWNER_ACCOUNT, 'Definitions', appClient, definitionsSchema, 'alias definitions', contract)
    const schemas = this.getAlias(APP_OWNER_ACCOUNT, 'Schemas', appClient, schemaSchema, 'user schemas', contract)
    const daoList = this.getAlias(APP_OWNER_ACCOUNT, 'daoList', appClient, daoListSchema, 'list of all daos', contract)
    const daoProfile = this.getAlias(APP_OWNER_ACCOUNT, 'daoProfile', appClient, daoProfileSchema, 'dao profiles', contract)
    const profile = this.getAlias(APP_OWNER_ACCOUNT, 'profile', appClient, profileSchema, 'persona profiles', contract)
    const accountsKeys = this.getAlias(APP_OWNER_ACCOUNT, 'accountsKeys', appClient, accountKeysSchema, 'user account info', contract)
    const daoKeys = this.getAlias(APP_OWNER_ACCOUNT, 'daoKeys', appClient, daoKeysSchema, 'dao account info', contract)
    const members = this.getAlias(APP_OWNER_ACCOUNT, 'members', appClient, memberSchema, 'dao member info', contract)
    const summonEvent = this.getAlias(APP_OWNER_ACCOUNT, 'summonEvent', appClient, summonSchema, 'dao summon events', contract)
    const proposal = this.getAlias(APP_OWNER_ACCOUNT, 'proposals', appClient, proposalSchema, 'proposal events', contract)
    const proposalDetails = this.getAlias(APP_OWNER_ACCOUNT, 'proposalDetails', appClient, proposalDetailsSchema, 'proposal details', contract)
    const comments = this.getAlias(APP_OWNER_ACCOUNT, 'comments', appClient, commentsSchema, 'comments', contract)
    const done = await Promise.all([
      appDid, 
      definitions, 
      schemas, 
      daoList, 
      daoProfile, 
      profile, 
      accountsKeys, 
      daoKeys, 
      members, 
      summonEvent, 
      proposal, 
      proposalDetails, 
      comments
    ])
    
    let rootAliases = {
      definitions: done[1],
      schemas: done[2],
      daoList: done[3],
      daoProfile: done[4],
      profile: done[5],
      accountsKeys: done[6],
      daoKeys: done[7],
      members: done[8],
      summonEvent: done[9],
      proposals: done[10],
      proposalDetails: done[11],
      comments: done[12]
    }

    const appIdx = new IDX({ ceramic: appClient, aliases: rootAliases})
   
    return appIdx
  }

  // current user IDX (account currently logged in)
  async getCurrentUserIdx(account, appIdx){
      set(KEY_REDIRECT, {action: false, link: ''})
      let seed = await this.getLocalAccountSeed(account.accountId)
      if(seed == false){
        set(KEY_REDIRECT, {action: true, link: '/newKey'})
        return false
      }
      let currentUserCeramicClient = await this.getCeramic(account, seed)
      let curUserIdx = new IDX({ ceramic: currentUserCeramicClient, aliases: appIdx._aliases})
      return curUserIdx
  }

  // current dao IDX
  async getCurrentDaoIdx(contractAccount, appIdx, contract){
    let seed
    let daoKeys =  await this.downloadKeysSecret(appIdx, 'daoKeys')
    console.log('daoKeys', daoKeys)
    if(daoKeys && daoKeys.length > 0){
      let i = 0
      while(i < daoKeys.length){
        if(daoKeys[i].contractId == contractAccount.accountId){
          seed = Buffer.from((daoKeys[i].key).slice(0,32))
        }
        i++
      }
    }
    if(seed == undefined){
      return false
    }
    let currentDaoCeramicClient = await this.getCeramic(contractAccount, seed)
    this.associateDID(contractAccount.accountId, contract, currentDaoCeramicClient)
    let curDaoIdx = new IDX({ ceramic: currentDaoCeramicClient, aliases: appIdx._aliases})
    return curDaoIdx
}

  async getCurrentUserIdxNoDid(appIdx, contract, account, keyPair, owner) {
    
    
    owner = owner == undefined ? account.accountId : owner 

    if(keyPair == undefined){
      keyPair = KeyPair.fromRandom('ed25519')   
      const links = get(ACCOUNT_LINKS, [])
      let c = 0
      let accountExists
      while(c < links.length) {
          if(links[c].accountId == account.accountId){
              accountExists = true
              links[c] = { key: keyPair.secretKey, accountId: account.accountId, owner: owner, keyStored: Date.now() }
              set(ACCOUNT_LINKS, links)
              break
          } else {
              accountExists = false
          }
      c++
      }
      if(!accountExists){
        links.push({ key: keyPair.secretKey, accountId: account.accountId, owner: owner, keyStored: Date.now() })
        set(ACCOUNT_LINKS, links)
      }
    } else {
      const links = get(ACCOUNT_LINKS, [])
      let c = 0
      let accountExists
      while(c < links.length) {
          if(links[c].accountId == account.accountId){
              accountExists = true
              links[c] = { key: keyPair.secretKey, accountId: account.accountId, owner: owner, keyStored: Date.now() }
              break
          } else {
              accountExists = false
          }
      c++
      }
      if(!accountExists){
        links.push({ key: keyPair.secretKey, accountId: account.accountId, owner: owner, keyStored: Date.now() })
        set(ACCOUNT_LINKS, links)
      }
    }

    //retrieve seed for newly created account
    let seed = await this.getLocalAccountSeed(account.accountId)

    // Initiate new User Ceramic Client
    let newUserCeramicClient = await this.getCeramic(account, seed)
    
    // if(owner != undefined) {
    //   console.log('owner', owner)
    // let ownerSeed = await this.getLocalAccountSeed(owner)
    // console.log('owner seed', ownerSeed)
    //   if(!ownerSeed){
    //     ownerIdx = appIdx
    //   } else {
    //     let ownerClient = await this.getCeramic(owner, ownerSeed)
    //     console.log('owner client', ownerClient)
    //     const definitions = await this.getAlias(owner, owner+':Definitions', ownerClient, definitionsSchema, 'alias definitions', contract)
    //     const schemas = await this.getAlias(owner, owner+':Schemas', ownerClient, schemaSchema, 'user schemas', contract)
       
    //     let ownerAliases = {
    //       definitions: definitions,
    //       schemas: schemas
    //     }
    //     ownerIdx = new IDX({ ceramic: ownerClient, aliases: ownerAliases})
    //   }
    // } else {
    //   ownerIdx = appIdx
    // }
   
    
    // Associate current user NEAR account with DID and store in contract
    let associate = this.associateDID(account.accountId, contract, newUserCeramicClient)
    // let profileAlias = await this.aliasSetup(ownerIdx, account.accountId, 'profile', 'user profile data', profileSchema, newUserCeramicClient)
    // let daoProfileAlias = await this.aliasSetup(ownerIdx, account.accountId, 'daoProfile', 'dao profile data', daoProfileSchema, newUserCeramicClient)
    // let accountsKeysAlias = await this.aliasSetup(ownerIdx, account.accountId, 'accountsKeys', 'user account info', accountKeysSchema, newUserCeramicClient)
    // let daoKeysAlias = await this.aliasSetup(ownerIdx, account.accountId, 'daoKeys', 'user dao info', daoKeysSchema, newUserCeramicClient)
    // let membersAlias = await this.aliasSetup(ownerIdx, account.accountId, 'members', 'dao member info', memberSchema, newUserCeramicClient)
    // let summonAlias = await this.aliasSetup(ownerIdx, account.accountId, 'summonEvent', 'dao summon events', summonSchema, newUserCeramicClient)
    // const done = await Promise.all([associate])
  
    // let currentAliases = await this.getAliases(ownerIdx, account.accountId)
    //const curUserIdx = new IDX({ ceramic: newUserCeramicClient, aliases: currentAliases})
    const curUserIdx = new IDX({ ceramic: newUserCeramicClient, aliases: appIdx._aliases})
    // Store it's new seed/list of accounts for later retrieval
    const updatedLinks = get(ACCOUNT_LINKS, [])
    await this.storeKeysSecret(curUserIdx, updatedLinks, 'accountsKeys')

    // // Store it's new seed/list of daos for later retrieval
    // const updatedDaos = get(DAO_LINKS, [])
    // await this.storeKeysSecret(curUserIdx, updatedDaos, 'daoKeys')

    return curUserIdx
  }

}

export const ceramic = new Ceramic()