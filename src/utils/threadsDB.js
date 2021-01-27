import { Client, ThreadID, PrivateKey, Where } from '@textile/hub';
import { encryptSecretBox, decryptSecretBox, parseEncryptionKeyNear } from './encryption'
import { wallet } from './wallet'
import { personas } from './personas'
import * as nearApiJs from 'near-api-js'
import getConfig from './config'
//import Big from 'big.js'

const appId = process.env.APP_ID;
let appDatabase;
let userDatabase;
// const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed()

async function keyCheck(accessKeys, accountId, near) {
  let currentUserKey = near.connection.signer.keyStore.localStorage.getItem('nearlib:keystore:' + accountId + ':default')
  const currentUserKeyPair = nearApiJs.utils.key_pair.KeyPair.fromString(currentUserKey)
  const currentUserKeyPublicKey = currentUserKeyPair.getPublicKey()
  const publicKeyString = currentUserKeyPublicKey.toString()

  for(let i=0; i < accessKeys.length; i++) {
    if(accessKeys[i].public_key === publicKeyString){
      return true
    } else if(accessKeys[i].access_key.permission !== 'FullAccess' && accessKeys[i].access_key.permission.FunctionCall.receiver_id == process.env.CONTRACT_NAME) {
      return true
    }
  }
  return false
}


async function getAppIdentity(appId, contract) {
      const type = 'org';
   
      /** Restore any cached app identity first */
      const cached = localStorage.getItem(appId + ":" + process.env.THREADDB_APPIDENTITY_STRING)
   
      if (cached !== null) {
      /**Convert the cached app identity string to a Libp2pCryptoIdentity and return */
      return PrivateKey.fromString(cached)
      }

      /** Try and retrieve app identity from contract if it exists */
      if (cached === null) {
              try {
                  let tempIdentity = PrivateKey.fromRandom()
  
                  let loginCallback = appLoginWithChallenge(tempIdentity);
                  let db = Client.withUserAuth(loginCallback);
                  let token = await db.getToken(tempIdentity)
  
                  if(token) {
                  /**Get encryption key*/
                  let loginCallback = loginWithChallengeEK(tempIdentity);    
                  let encKey = await Promise.resolve(loginCallback)
                  let encryptionKey = encKey.enckey
                  parseEncryptionKeyNear(appId, type, encryptionKey);
                  //let retrieveId = await contract.personaContract.getAppIdentity({appId: appId});
                  //let identity = decryptSecretBox(retrieveId.identity);
                  let threadId = process.env.APP_THREAD_ID
                  let identity = process.env.APP_IDENTITY 
                  localStorage.setItem(appId + ":" + process.env.THREADDB_APPIDENTITY_STRING, identity)
                  localStorage.setItem(appId + ":" + process.env.THREADDB_APP_THREADID, threadId)
                  return PrivateKey.fromString(identity); 
                  }
              } catch (err) {
                  console.log(err)
                 
                  /** No cached identity existed, so create a new one */
                //  let identity = PrivateKey.fromRandom()
                  let threadId = process.env.APP_THREAD_ID
                  let identity = process.env.APP_IDENTITY 
                  /** Add the string copy to the cache */
                  localStorage.setItem(appId + ":" + process.env.THREADDB_APPIDENTITY_STRING, identity)
  
                  /**Get encryption key*/
                  // let loginCallback = loginWithChallengeEK(identity);    
                  // let encKey = await Promise.resolve(loginCallback)
                  // let encryptionKey = encKey.enckey 
                  // parseEncryptionKeyNear(appId, type, encryptionKey);
                   let encryptedId = encryptSecretBox(identity)
                 
                  // const threadId = ThreadID.fromRandom();
                  // let stringThreadId = threadId.toString();
                  localStorage.setItem(appId + ":" + process.env.THREADDB_APP_THREADID, threadId);
                  let status = 'active'
                 
                  let contract = await personas.loadPersonas()
                  await contract.setAppIdentity({appId: appId, identity: encryptedId, threadId: threadId, status: status }, process.env.DEFAULT_GAS_VALUE);
  
                  const newIdentity = await contract.getAppIdentity({appId: appId});
                
                  let success = false
                  while(!success) {
                    let receipt = await contract.registerApp({appNumber: newIdentity.appNumber.toString() , appId: appId, appCreatedDate: new Date().getTime().toString(), status: status}, process.env.DEFAULT_GAS_VALUE);
                    if(receipt) {
                      success = true
                    }
                  }
                  return PrivateKey.fromString(identity); 
              }
      }             
}

async function getIdentity(accountId, contract) {
 
    const type = 'member'
    /** Restore any cached user identity first */
    const cached = localStorage.getItem(appId + ":" + process.env.THREADDB_IDENTITY_STRING)
   
    if (cached !== null) {
    /**Convert the cached identity string to a PrivateKey and return */
    return PrivateKey.fromString(cached)
    }

    /** Try and retrieve identity from contract if it exists */
    if (cached === null) {
            try {
                let tempIdentity = PrivateKey.fromRandom()
              
                const loginCallback = loginWithChallenge(tempIdentity);
                const db = Client.withUserAuth(loginCallback);
          
                const token = await db.getToken(tempIdentity)
               
                if(token) {
                /**Get encryption key*/
                let loginCallback = loginWithChallengeEK(tempIdentity);    
                let encKey = await Promise.resolve(loginCallback)
                let encryptionKey = encKey.enckey
                parseEncryptionKeyNear(accountId, type, encryptionKey);

                let retrieveId = await contract.getIdentity({account: accountId});
              
                let identity = decryptSecretBox(retrieveId.identity);
              
                localStorage.setItem(appId + ":" + process.env.THREADDB_IDENTITY_STRING, identity.toString())
                localStorage.setItem(appId + ":" + process.env.THREADDB_USER_THREADID, retrieveId.threadId);
                return PrivateKey.fromString(identity); 
              }
            } catch (err) {
                console.log(err)
               
                /** No cached identity existed, so create a new one */
                let identity = PrivateKey.fromRandom()
                
                /** Add the string copy to the cache */
                localStorage.setItem(appId + ":" + process.env.THREADDB_IDENTITY_STRING, identity.toString())

                /**Get encryption key*/
                let loginCallback = loginWithChallengeEK(identity);    
                let encKey = await Promise.resolve(loginCallback)
                let encryptionKey = encKey.enckey
                
                parseEncryptionKeyNear(accountId, type, encryptionKey);
                let encryptedId = encryptSecretBox(identity.toString());
               
                const threadId = ThreadID.fromRandom();
                let stringThreadId = threadId.toString();
                localStorage.setItem(appId + ":" + process.env.THREADDB_USER_THREADID, stringThreadId);
                let status = 'active'
                
                await contract.setIdentity({account: accountId, identity: encryptedId, threadId: stringThreadId, status: status }, process.env.DEFAULT_GAS_VALUE);

                const newIdentity = await contract.getIdentity({account: accountId});
               
                let success = false
                let privacy = 'private'
                let creationDate = new Date().getTime().toString()
               
                while(!success) {
                  let receipt = await contract.registerPersona({personaId: newIdentity.personaId.toString() , personaAccount: accountId, personaCreatedDate: creationDate, personaStatus: status, personaPrivacy: privacy}, process.env.DEFAULT_GAS_VALUE);
                  if(receipt) {
                    success = true
                  }
                }
              
                return PrivateKey.fromString(identity.toString()); 
            }
    }             
}

async function getAppThreadId(appId, contract) {

  /** Restore any cached user identity first */
  const cached = localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)
  
  if (cached !== null) {
      return cached
  }

  /** Try and retrieve from contract if it exists */
  if (cached === null) {
          try {
              let retrieveId = await contract.personaContract.getAppIdentity({appId: appId});
          
              let identity = decryptSecretBox(retrieveId);
            
              return identity.threadId; 
          } catch (err) {
             console.log(err);
          }
  }             
}


async function getThreadId(accountId, contract) {

    /** Restore any cached user identity first */
    const cached = localStorage.getItem(appId + ":" + process.env.THREADDB_USER_THREADID)
    
    if (cached !== null) {
        return cached
    }

    /** Try and retrieve from contract if it exists */
    if (cached === null) {
            try {
                let retrieveId = await contract.getIdentity({threadId: accountId});
               
                let identity = decryptSecretBox(retrieveId);
             
                return identity.threadId; 
            } catch (err) {
               console.log(err);
            }
    }             
}
const loginWithChallengeEK = (identity) => {
    // we pass identity into the function returning function to make it
    // available later in the callback
      return new Promise((resolve, reject) => {
        /** 
         * Configured for our development server
         * 
         * Note: this should be upgraded to wss for production environments.
         */
       // const socketUrl = `ws://vpai.azurewebsites.net/ws/enckey`
        const socketUrl = `wss://vpai-auth-server.herokuapp.com/ws/enckey`
        
        /** Initialize our websocket connection */
        const socket = new WebSocket(socketUrl)
  
        /** Wait for our socket to open successfully */
        socket.onopen = () => {
          /** Get public key string */
          const publicKey = identity.public.toString();

          socket.send(JSON.stringify({
              pubkey: publicKey,
              type: 'enckey'
          }));
  
          /** Listen for messages from the server */
          socket.onmessage = async (event) => {
             
            const data = JSON.parse(event.data)
            switch (data.type) {
              /** Error never happen :) */
              case 'error': {
                reject(data.value);
                break;
              }
            
              /** Enc Key Received */
              case 'enckey': {
                  resolve(data.value)
                  break;
              }

              default: {
                break;
              }
             
            }
          }
        }
      
      });
      socket.close()
  }

const loginWithChallenge = (identity) => {
    // we pass identity into the function returning function to make it
    // available later in the callback
    return () => {
      return new Promise((resolve, reject) => {
        /** 
         * Configured for our development server
         * 
         * Note: this should be upgraded to wss for production environments.
         */
       
        //let socketUrl = `ws://vpai.azurewebsites.net/ws/userauth`
        const socketUrl = `wss://vpai-auth-server.herokuapp.com/ws/userauth`
        /** Initialize our websocket connection */
        let socket = new WebSocket(socketUrl)
      
        /** Wait for our socket to open successfully */
        socket.onopen = () => {
          /** Get public key string */
          let publicKey = identity.public.toString();
    
          /** Send a new token request */
          socket.send(JSON.stringify({
            pubkey: publicKey,
            type: 'token'
          })); 
  
          /** Listen for messages from the server */
          socket.onmessage = async (event) => {
        
            let data = JSON.parse(event.data)
         
            switch (data.type) {
              /** Error never happen :) */
              case 'error': {
                reject(data.value);
                break;
              }
              /** The server issued a new challenge */
              case 'challenge': {
                /** Convert the challenge json to a Buffer */
                let buf = Buffer.from(data.value)
           
                /** User our identity to sign the challenge */
                let signed = await identity.sign(buf)
          
                /** Send the signed challenge back to the server */
            
                socket.send(JSON.stringify({
                  type: 'challenge',
                  sig: Buffer.from(signed).toJSON()
                }));
              
                break;
              }
              /** New token generated */
              case 'token': {
                resolve(data.value)
                break;
              }
              
              default: {
                break;
              }
            }
       
          }
          
        }
        
      })
    }
    socket.close()
  }

  const appLoginWithChallenge = (identity) => {
    // we pass identity into the function returning function to make it
    // available later in the callback
    return () => {
      return new Promise((resolve, reject) => {
        /** 
         * Configured for our development server
         * 
         * Note: this should be upgraded to wss for production environments.
         */
       
       // const socketUrl = `ws://vpai.azurewebsites.net/ws/appauth`
        const socketUrl = `wss://vpai-auth-server.herokuapp.com/ws/appauth`
        
        /** Initialize our websocket connection */
        const socket = new WebSocket(socketUrl)
     
        /** Wait for our socket to open successfully */
        socket.onopen = () => {
          /** Get public key string */
          const publicKey = identity.public.toString();
           
          /** Send a new token request */
          socket.send(JSON.stringify({
            pubkey: publicKey,
            type: 'token'
          })); 
  
          /** Listen for messages from the server */
          socket.onmessage = async (event) => {
            const data = JSON.parse(event.data)
            switch (data.type) {
              /** Error never happen :) */
              case 'error': {
                reject(data.value);
                break;
              }
              /** The server issued a new challenge */
              case 'challenge':{
                /** Convert the challenge json to a Buffer */
                const buf = Buffer.from(data.value)
                /** User our identity to sign the challenge */
                const signed = await identity.sign(buf)
                /** Send the signed challenge back to the server */
                socket.send(JSON.stringify({
                  type: 'challenge',
                  sig: Buffer.from(signed).toJSON()
                })); 
                break;
              }
              /** New token generated */
              case 'token': {
                resolve(data.value)
                break;
              }
              default: {
                break;
              }
       
            }
          }
        
        }
        
      });
    }
    socket.close()
  }

  export async function initiateAppDB() {
    let contract = personas.loadPersonas()
    let type = 'app';
    let appId = process.env.APPID
   
    const identity = await getAppIdentity(appId, contract);
    //const identity = PrivateKey.fromString(process.env.APP_IDENTITY)
   // const threadId = await getAppThreadId(appId, contract);
   const threadId = process.env.APP_THREAD_ID
    const appdb = await tokenWakeUp(type)
    
   
     await appdb.getToken(identity)
    
    
    appDatabase = appdb
   
    let appDbObj
    try {
        await appdb.getDBInfo(ThreadID.fromString(threadId))
        appDbObj = {
            db: appdb,
            threadId: threadId
        }
    } catch (err) {
    
      if(threadId){
        await appdb.newDB(ThreadID.fromString(threadId));
      }
        console.log('app DB created');
        appDbObj = {
            db: appdb,
            threadId: threadId
        }
    }
    return appDbObj
}
 

export async function initiateDB() {
    let contract = await personas.loadPersonas()
    let type = 'member';
   
    const account = await wallet.loadAccount()
  
    const identity = await getIdentity(account.accountId, contract);
   
    const threadId = await getThreadId(account.accountId, contract);
  
    const loginCallback = loginWithChallenge(identity);
    const db = Client.withUserAuth(loginCallback);
   // const db = await tokenWakeUp(type)

    // /** Restore any cached textile user token first */
    // const token = localStorage.getItem(appId + ":" + process.env.THREADDB_TOKEN_STRING)
    // if(!token){
    await db.getToken(identity)
    //   localStorage.setItem(appId + ":" + process.env.THREADDB_TOKEN_STRING, token)
    // } 
    
    userDatabase = db
    console.log('Verified on Textile API');
   
    let dbObj
    try {
        await db.getDBInfo(ThreadID.fromString(threadId))
        dbObj = {
            db: db,
            threadId: threadId
        }
    } catch (err) {
        await db.newDB(ThreadID.fromString(threadId), type);
        console.log('DB created');
        dbObj = {
            db: db,
            threadId: threadId
        }
    }
    return dbObj
}


export async function initiateAppCollection(collection, schema) {
  
  try {
      const r = await appDatabase.find(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), collection, {})
      
      return r
  } catch (err) {
      console.log(err);
      await appDatabase.newCollection(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), {name: collection, schema: schema});
      
  }
}


export async function initiateCollection(collection, schema) {

    try {
        const r = await userDatabase.find(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_USER_THREADID)), collection, {})
        return r
    } catch (err) {
        await userDatabase.newCollection(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_USER_THREADID)), {name: collection, schema: schema});
        console.log('New collection created', collection);
    }
}

export async function isAppCollection(collection) {
  try {
      let r = await appDatabase.getCollectionInfo(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), collection)
      return true
  } catch (err) {
      console.log(err);
      return false
  }
}

export async function isUserCollection(collection) {
  try {
      let r = await userDatabase.getCollectionInfo(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), collection)
      return true
  } catch (err) {
      console.log(err);
      return false
  }
}




export async function dataURItoBlob(dataURI)
{
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;

    if(dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for(var i = 0; i < byteString.length; i++)
    {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type: mimeString});
}

export async function tokenWakeUp(type) {
  /** Use the identity to request a new API token when needed */
  if (type === 'member') {
    const account = await wallet.loadAccount()
    const identity = await getIdentity(account.accountId, contract);
    const loginCallback = loginWithChallenge(identity);
    const db = Client.withUserAuth(loginCallback);
    return db
  } else if (type ==='app' ) {
   // const identity = await getAppIdentity(appId)
   const identity = PrivateKey.fromString(process.env.APP_IDENTITY)
    const loginCallback = appLoginWithChallenge(identity);
    const db = Client.withUserAuth(loginCallback);
    return db
  }
}

export async function deleteAppCollection(collection) {
  try{
  await appDatabase.deleteCollection(ThreadID.fromString(process.env.APP_THREAD_ID), collection)
  } catch (err) {
    console.log('problem deleteing collection', err)
  }
  return true
}

export async function retrieveAppRecord(id, collection) {
  
  let obj
  try {
      let r = await appDatabase.findByID(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), collection, id)
      obj = r
  } catch (err) {
      console.log('error', err)
      console.log('id does not exist')
  }
  return obj
}

export async function retrieveAppMemberRecord(member, collection) {
  
  let obj
  try {
      const query = new Where('delegateKey').eq(member)
      let r = await appDatabase.find(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), collection, query)
      obj = r
  } catch (err) {
      console.log('error', err)
      console.log('member does not exist')
  }
  return obj
}


export async function retrieveRecord(id, collection) {

    let obj
    try {
     
        let r = await userDatabase.findByID(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_USER_THREADID)), collection, id)
        obj = r
    } catch (err) {
        console.log('error', err)
        console.log('id does not exist')
    }
    return obj
}

export async function createAppRecord(collection, record) {

  try {
     await appDatabase.create(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), collection, [record])        
     console.log('success app record created')
  } catch (err) {
      console.log('error', err)
      console.log('there was a problem, app record not created')
  }
}

export async function createRecord(collection, record) {

    try {
       await userDatabase.create(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_USER_THREADID)), collection, [record])        
       console.log('success record created')
    } catch (err) {
        console.log('error', err)
        console.log('there was a problem, record not created')
    }
}

export async function updateAppRecord(collection, record) {
  
    try {
       await appDatabase.save(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), collection, record)        
       console.log('success app record updated')
    } catch (err) {
        console.log('error', err)
        console.log('there was a problem, app record not updated')
    }
  }
  
  export async function updateRecord(collection, record) {
  
      try {
         await userDatabase.save(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_USER_THREADID)), collection, record)        
         console.log('success record updated')
      } catch (err) {
          console.log('error', err)
          console.log('there was a problem, record not updated')
      }
  }

  export async function hasAppRecord(collection, id) {
  
    try {
       await appDatabase.has(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), collection, [id])        
       console.log('success app record found')
       return true
    } catch (err) {
        console.log('error', err)
        console.log('there was a problem, app record not found')
        return false
    }
  }
  
  export async function hasRecord(collection, id) {
  
      try {
       
         await userDatabase.has(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_USER_THREADID)), collection, [id])        
         console.log('success record found')
         return true
      } catch (err) {
          console.log('error', err)
          console.log('there was a problem, record not found')
          return false
      }
  }

export async function deleteAppRecord(id, collection) {

  try {
      await appDatabase.delete(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_APP_THREADID)), collection, [id])
      console.log('app record deleted')
  } catch (err) {
      console.log('error', err)
      console.log('there was an error deleting the app record')
  }
}


export async function deleteRecord(id, collection) {

    try {
        await userDatabase.delete(ThreadID.fromString(localStorage.getItem(appId + ":" + process.env.THREADDB_USER_THREADID)), collection, [id])
        console.log('record deleted')
    } catch (err) {
        console.log('error', err)
        console.log('there was an error deleting the record')
    }
}

export async function listAppDBs(){
  try{
    console.log(appDatabase)
    await appDatabase.listCollections()
  } catch (err) {
      console.log('problem listing databases', err)
  }
}

export async function deleteAppDB(threadID){
  try{
    await appDatabase.deleteDB(threadID)
  } catch (err) {
      console.log('problem deleting database', err)
  }
}

export async function listUserDBs(){
  try{
    await userDatabase.listDBs()
  } catch (err) {
      console.log('problem listing databases', err)
  }
}

export async function deleteUserDB(threadID){
  try{
    await userDatabase.deleteDB(threadID)
  } catch (err) {
      console.log('problem deleting database', err)
  }
}