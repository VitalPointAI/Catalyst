import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'
import { ceramic } from '../utils/ceramic'
import { factory } from '../utils/factory'
import { dao } from '../utils/dao'

import { config } from './config'

export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, FACTORY_DEPOSIT, DAO_FIRST_INIT, CURRENT_DAO, REDIRECT,
    NEW_PROPOSAL,
    networkId, nodeUrl, walletUrl, nameSuffix, factorySuffix,
    contractName, didRegistryContractName, factoryContractName
} = config

const {
    KeyPair,
    InMemorySigner,
    transactions: {
        addKey, deleteKey, fullAccessKey
    },
    utils: {
        PublicKey,
        format: {
            parseNearAmount, formatNearAmount
        }
    }
} = nearAPI

export const initNear = () => async ({ update, getState, dispatch }) => {

    let finished = false

    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    });

    const isAccountTaken = async (accountId) => {
        const account = new nearAPI.Account(near.connection, accountId);
        try {
            await account.state()
        } catch(e) {
            console.warn(e)
            if (/does not exist while viewing/.test(e.toString())) {
                return false
            }
        }
        return true
    }

    // resume wallet / contract flow
    const wallet = new nearAPI.WalletAccount(near);

    wallet.signIn = () => {
        wallet.requestSignIn(contractName, 'Blah Blah')
    }

    wallet.signedIn = wallet.isSignedIn()
    if (wallet.signedIn) {
        wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2)
    }

    const contract = new nearAPI.Contract(wallet.account(), contractName, {
        changeMethods: ['send', 'create_account', 'create_account_and_claim'],
    })

    const daoFactoryContract = new nearAPI.Contract(wallet.account(), factoryContractName, {
        changeMethods: ['createDemDAO'],
    })

    wallet.isAccountTaken = async (accountId) => {
        const accountTaken = await isAccountTaken(accountId + nameSuffix)
        update('app', { accountTaken, wasValidated: true })
    }

    wallet.isDaoAccountTaken = async (accountId) => {
        const accountTaken = await isAccountTaken(accountId + factorySuffix)
        update('app', { accountTaken, wasValidated: true })
    }

    wallet.fundAccount = async (amount, accountId, recipientName, owner) => {
        
        if (accountId.indexOf(nameSuffix) > -1 || accountId.indexOf('.') > -1) {
            alert(nameSuffix + ' is added automatically and no "." is allowed. Please remove and try again.')
            return update('app.wasValidated', true)
        }
        accountId = accountId + nameSuffix
        if (parseFloat(amount, 10) < 0.1 || accountId.length < 2 || accountId.length > 48) {
            return update('app.wasValidated', true)
        }
        const keyPair = KeyPair.fromRandom('ed25519')

        let state = getState()

        const links = get(ACCOUNT_LINKS, [])
        let c = 0
        let accountExists
        while(c < links.length) {
            if(links[c].accountId == accountId){
                accountExists = true
                alert('This account already exists in local storage, it will be updated.')
                links[c] = { key: keyPair.secretKey, accountId: accountId, recipientName: recipientName, owner: owner, keyStored: Date.now() }
                break
            } else {
                accountExists = false
            }
        c++
        }
        if(!accountExists){
            links.push({ key: keyPair.secretKey, accountId, recipientName, owner, keyStored: Date.now() })
            await ceramic.storeKeysSecret(state.curUserIdx, links, 'accountsKeys')
            set(ACCOUNT_LINKS, links)
        
            await contract.create_account({ new_account_id: accountId, new_public_key: keyPair.publicKey.toString() }, GAS, parseNearAmount(amount))
        }
    }

    wallet.fundDaoAccount = async (accountId, summoner) => {
        
        if (accountId.indexOf(factorySuffix) > -1 || accountId.indexOf('.') > -1) {
            alert(factorySuffix + ' is added automatically and no "." is allowed. Please remove and try again.')
            return update('app.wasValidated', true)
        }
        accountId = accountId + factorySuffix
        if (parseFloat(FACTORY_DEPOSIT, 10) < 0.1 || accountId.length < 2 || accountId.length > 48) {
            return update('app.wasValidated', true)
        }
      //  const keyPair = KeyPair.fromRandom('ed25519')

        let state = getState()

        const links = get(DAO_LINKS, [])
        const daoInit = get(DAO_FIRST_INIT, [])
        const proposals = get(NEW_PROPOSAL, [])
        let c = 0
        let accountExists
        while(c < links.length) {
            if(links[c].accountId == accountId){
                accountExists = true
                alert('This dao already exists in local storage, it will be updated.')
                links[c] = { contractId: accountId, summoner: summoner, created: Date.now() }
                break
            } else {
                accountExists = false
            }
        c++
        }
        if(!accountExists){
            links.push({ contractId: accountId, summoner: summoner, created: Date.now() })
            await ceramic.storeKeysSecret(state.curUserIdx, links, 'daoKeys')
            await addDaoToList(state.appIdx, accountId, summoner, Date.now())
            set(DAO_LINKS, links)
            daoInit.push({ contractId: accountId, init: true })
            set(DAO_FIRST_INIT, daoInit)
            proposals.push({ contractId: accountId, proposalId: '', new: false})
            set(NEW_PROPOSAL, proposals)
        //    let link = '/dao/' + accountId
            let link = '/daos'
            set(REDIRECT, {action: true, link: link})
            await daoFactoryContract.createDemDAO({ accountId: accountId, deposit: FACTORY_DEPOSIT }, GAS, parseNearAmount(FACTORY_DEPOSIT))
            console.log('fund daofactory contract', daoFactoryContract)
        }
    }    

    if(wallet.signedIn){
    
    // ********* Check and action redirect after DAO creation *************
    let page = get(REDIRECT, [])
    console.log('page', page)

    if (page.action == true){
        window.location.assign(page.link)
        
        set(REDIRECT, {action: false, link: ''})
    }

    // ********* Initiate Dids Registry Contract ************

    const account = wallet.account()
    const accountId = account.accountId
    const didRegistryContract = await ceramic.initiateDidRegistryContract(account)

     // ******** IDX Initialization *********

    //Initiate App Ceramic Components
    
    const appIdx = await ceramic.getAppIdx(didRegistryContract)

    // ********** Log DAO Initialization and Summon Events */
    // let daoInitialized = get(DAO_FIRST_INIT, [])
    // console.log('daoinit', daoInitialized)

    // if (daoInitialized === true) {
    //     // const near = await nearAPI.connect({
    //     //     networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    //     // })
    
    //     let daoType = 'Democracy'
    //     let logged = await logInitEvent(accountId, daoType, appIdx, didRegistryContract, wallet)
    //     console.log('logged', logged)
    //     if (logged) {
    //         set(DAO_FIRST_INIT, {init: false})
    //     }
    // }


    // ********** Initialize Current DAO IDX and it's Dao Contract */
  
    // // We look in local storage to get the value of the currently viewed contract account
    // let currentDao = get(CURRENT_DAO, [])
    // console.log('current dao here', currentDao)

    // // If there is a contractId (meaning we are working with a DAO), we initialize it's IDX and contract
    // // and add them to the App's state.
    // if(currentDao){
    //     let daoAccount = new nearAPI.Account(near.connection, currentDao)

    //     // 1. First we check to see if the currentDAO has a DID registered
    //     let existingDaoDid = await didRegistryContract.hasDID({accountId: currentDao})

    //     let currentDaoDid
    //     let curDaoIdx
    //     if(existingDaoDid){
    //         currentDaoDid = await didRegistryContract.getDID({
    //             accountId: currentDao
    //         })
        
    //         // 2. Next, we load up the owner of the contractId (Dao)
    //         let ownerAccounts = get(ACCOUNT_LINKS, [])
        
    //         let b = 0
    //         let owner
    //         while(b < ownerAccounts.length) {
    //             if(ownerAccounts[b].accountId == currentDao){
    //                 owner = ownerAccounts[b].owner
    //                 break
    //             }
    //         b++
    //         }
        
    //         // 3.  Based on whether there is an owner or not, we load the relevant IDX instance and contract
    //         if(owner != undefined){
    //             const ownerAccount = new nearAPI.Account(near.connection, owner)
    //             const ownerIdx = await ceramic.getCurrentUserIdx(ownerAccount, appIdx, didRegistryContract, owner)
    //             curDaoIdx = await ceramic.getCurrentUserIdx(daoAccount, appIdx, didRegistryContract, owner, ownerIdx)
    //         } else {
    //             curDaoIdx = await ceramic.getCurrentUserIdx(daoAccount, appIdx, didRegistryContract)
    //         }
    //     }

    //     if(!existingDaoDid){
    //         curDaoIdx = await ceramic.getCurrentUserIdxNoDid(appIdx, didRegistryContract, daoAccount)
    //     }

    //     const daoContract = await dao.initDaoContract(wallet.account(), currentDao)
    //     console.log('daoContract', daoContract)

    //     update('', { curDaoIdx, daoContract, currentDaoDid })
    // }

    
   
    // Set Current User Ceramic Client

    let curUserIdx
    let did
   
    let existingDid = await didRegistryContract.hasDID({accountId: accountId})
   
    if(existingDid){
        did = await didRegistryContract.getDID({
            accountId: accountId
        })
        let ownerAccounts = get(ACCOUNT_LINKS, [])
       
        let b = 0
        let owner
        while(b < ownerAccounts.length) {
            if(ownerAccounts[b].accountId == accountId){
                owner = ownerAccounts[b].owner
                break
            }
        b++
        }
       
        if(owner != undefined){
            const ownerAccount = new nearAPI.Account(near.connection, owner)
            const ownerIdx = await ceramic.getCurrentUserIdx(ownerAccount, appIdx, didRegistryContract, owner)
            curUserIdx = await ceramic.getCurrentUserIdx(account, appIdx, didRegistryContract, owner, ownerIdx)
        } else {
            curUserIdx = await ceramic.getCurrentUserIdx(account, appIdx, didRegistryContract)
        }
    }

    if(!existingDid){
        curUserIdx = await ceramic.getCurrentUserIdxNoDid(appIdx, didRegistryContract, account)
    }
    
    // Set Current User's Info
    const curInfo = await curUserIdx.get('profile', curUserIdx.id)

    //synch local links with what's stored for the account in ceramic
    let allAccounts = await ceramic.downloadKeysSecret(curUserIdx, 'accountsKeys')
    
    const storageLinks = get(ACCOUNT_LINKS, [])
    
    if(allAccounts.length != storageLinks.length){
        if(allAccounts.length < storageLinks.length){
            await ceramic.storeKeysSecret(curUserIdx, storageLinks, 'accountsKeys')
        }
        if(allAccounts.length > storageLinks.length){
            set(ACCOUNT_LINKS, allAccounts)
        }
    }

    //synch local user daos with what's stored for the account in ceramic
    let allDaos = await ceramic.downloadKeysSecret(curUserIdx, 'daoKeys')

    const storageDaos = get(DAO_LINKS, [])
    
    if(allDaos.length != storageDaos.length){
        if(allDaos.length < storageDaos.length){
            await ceramic.storeKeysSecret(curUserIdx, storageDaos, 'daoKeys')
        }
        if(allDaos.length > storageDaos.length){
            set(DAO_LINKS, allDaos)
        }
    }

    let daoList = await appIdx.get('daoList')
    console.log('daoList', daoList)
    
    update('', { didRegistryContract, appIdx, accountId, curUserIdx, wallet, curInfo, did, daoList })

     //** INITIALIZE FACTORY CONTRACT */
     let daoFactory = await factory.initFactoryContract(account)
     console.log('daoFactory', daoFactory)
     
     update('', {daoFactory})

    }
    // check localLinks, see if they're still valid

    const localLinks = get(ACCOUNT_LINKS, []).sort((a) => a.claimed ? 1 : -1)
    for (let i = 0; i < localLinks.length; i++) {
        const { key, accountId, keyStored = 0, claimed } = localLinks[i]
        const exists = await isAccountTaken(accountId)
        if (!exists) {
            localLinks.splice(i, 1)
            continue
        }
        if (!!claimed || Date.now() - keyStored < 5000) {
            continue
        }
        const keyExists = await hasKey(key, accountId, near)
        if (!keyExists) {
            localLinks[i].claimed = true
        }
    }
    set(ACCOUNT_LINKS, localLinks)

    const claimed = localLinks.filter(({claimed}) => !!claimed)
    const links = localLinks.filter(({claimed}) => !claimed)

    const daoLinks = get(DAO_LINKS, [])
  
    finished = true

    update('', { near, wallet, links, claimed, daoLinks, finished })

   
}

export async function login() {
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    });
    const connection = new nearAPI.WalletConnection(near)
    connection.requestSignIn(contractName, 'Near Personas')
}

export async function logout() {
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    });
    const connection = new nearAPI.WalletConnection(near)
    connection.signOut()
    window.location.replace(window.location.origin)
}

export const unclaimLink = (keyToFind) => async ({ update }) => {
    let links = get(ACCOUNT_LINKS, [])
    const link = links.find(({ key }) => key === keyToFind)
    if (!link) {
        alert('cannot find link')
        return
    }
    link.claimed = false
    set(ACCOUNT_LINKS, links)

    const claimed = links.filter(({claimed}) => claimed === true)
    links = links.filter(({claimed}) => !claimed)
    
    update('', { links, claimed })
}

export const keyRotation = () => async ({ update, getState, dispatch }) => {
    const state = getState()
   
    const { key, accountId, publicKey, seedPhrase, recipientName, owner } = state.accountData

    const keyPair = KeyPair.fromString(key)
    const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair)
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
    });
    const account = new nearAPI.Account(near.connection, accountId);
    const accessKeys = await account.getAccessKeys()

    const didContract = await ceramic.initiateDidRegistryContract(account)

    const appIdx = await ceramic.getAppIdx(didContract)

    const ownerAccount = new nearAPI.Account(near.connection, owner);

    let ownerAccounts = get(ACCOUNT_LINKS, [])
  
    let b = 0
    let ownersowner
    while(b < ownerAccounts.length) {
        if(ownerAccounts[b].accountId == owner){
            ownersowner = ownerAccounts[b].owner
            break
        }
    b++
    }
    
    const ownerIdx = await ceramic.getCurrentUserIdx(ownerAccount, appIdx, ownersowner)
   
    await ceramic.getCurrentUserIdxNoDid(appIdx, didContract, account, keyPair, recipientName, owner, ownerIdx)                 
    
    const actions = [
        deleteKey(PublicKey.from(accessKeys[0].public_key)),
        addKey(PublicKey.from(publicKey), fullAccessKey())
    ]

    set(SEED_PHRASE_LOCAL_COPY, seedPhrase)

    const result = await account.signAndSendTransaction(accountId, actions)

    fetch('https://hooks.zapier.com/hooks/catch/6370559/ocibjmr/', {
        method: 'POST',
        body: JSON.stringify({
            account_id: accountId,
            time_claimed: Date.now()
        })
    })
    
    return result
}

// Initializes a DAO by setting its key components
export async function initDao(wallet, contractId, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound) {

    try {
        const daoContract = await dao.initDaoContract(wallet.account(), contractId)

        // set trigger for first init to log summon and member events
        let firstInit = get(DAO_FIRST_INIT, [])
        firstInit.push({contractId: contractId, init: true })
        set(DAO_FIRST_INIT, firstInit)

        await daoContract.init({
            _periodDuration: parseInt(periodDuration),
            _votingPeriodLength: parseInt(votingPeriodLength),
            _gracePeriodLength: parseInt(gracePeriodLength),
            _proposalDeposit: proposalDeposit,
            _dilutionBound: parseInt(dilutionBound)
        }, GAS)

    } catch (err) {
        console.log('init failed', err)
        return false
    }
    return true
}

// Initializes a DAO by setting its key components
export async function submitProposal(wallet, contractId, applicant, tribute, depositToken, proposalDeposit) {

    const daoContract = await dao.initDaoContract(wallet.account(), contractId)
    const proposalId = await daoContract.getProposalsLength()

    try {
        // set trigger for to log new proposal
        let newProposal = get(NEW_PROPOSAL, [])
        newProposal.push({contractId: contractId, proposalId: proposalId, new: true})
        set(NEW_PROPOSAL, newProposal)

        await daoContract.submitProposal({
            a: applicant,
            sR: tribute,
            lR: '0',
            tO: tribute,
            tT: depositToken,
            pR: '0',
            pT: depositToken
            }, GAS, parseNearAmount((parseInt(tribute) + parseInt(proposalDeposit)).toString()))

    } catch (err) {
        console.log('submit proposal failed', err)
        return false
    }
    return true
}

// Adds Dao to list of all DAOs running on Catalyst
export async function addDaoToList (appIdx, contractId, summoner, created, category = '', name = '', logo = '', purpose = '') {
      
      let daoRecord = await appIdx.get('daoList')

      if(!daoRecord){
        daoRecord = { daoList: [] }
      }

      let indivDaoRecord = {
        contractId: contractId,
        summoner: summoner,
        date: created,
        category: category,
        name: name,
        logo: logo,
        purpose: purpose
      }

      daoRecord.daoList.push(indivDaoRecord)

      await appIdx.set('daoList', daoRecord)
}

// Logs the initial member and summoning event when a DAO is created
export async function logInitEvent (contractId, curDaoIdx, daoContract, daoType, accountId) {

    let summoner
    let periodDuration
    let votingPeriodLength
    let gracePeriodLength
    let proposalDeposit
    let dilutionBound
    let summonTime

    try {
        let result = await daoContract.getInitSettings()
        console.log('init settings result', result)
        summoner = result[0][0]
        periodDuration = result[0][1]
        votingPeriodLength = result[0][2]
        gracePeriodLength = result[0][3]
        proposalDeposit = result[0][4]
        dilutionBound = result[0][5]
        summonTime = result[0][6]
    } catch (err) {
        console.log('failure fetching init settings')
        return false
    }

    let totalMembers
    try {
        totalMembers = await daoContract.getTotalMembers()
        console.log('total Members', totalMembers)
    } catch (err) {
        console.log('no members', err)
        return false
    }

    // Do not log if this is not the first member (>1 means the DAO was already initialized)
    if (totalMembers > 1) {
        return false
    }
   
    let memberId = parseInt(totalMembers)
    
    let numberSummonTime = parseInt(summonTime)

    if(summonTime && memberId) {
       
      // Log Member Event
      let memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)
      if(!memberEventRecord){
        memberEventRecord = { events: [] }
      }

      let indivMemberEventRecord = {
        memberId: memberId.toString(),
        contractId: contractId,
        delegateKey: accountId,
        shares: '1',
        loot: '0',
        existing: true,
        highestIndexYesVote: 0,
        jailed: 0,
        joined: numberSummonTime,
        updated: numberSummonTime
      }

      memberEventRecord.events.push(indivMemberEventRecord)
      console.log('memberEventRecord.events', memberEventRecord.events)

      await curDaoIdx.set('members', memberEventRecord)
     
    }

    // Log Summon Event
    let summonEventRecord = await curDaoIdx.get('summonEvent', curDaoIdx.id)
    if(!summonEventRecord){
      summonEventRecord = { events: [] }
    }
   
    let indivSummonEventRecord = {
      eventId: '1',
      contractId: contractId,
      summoner: summoner,
      category: daoType,
      tokens: ['Ⓝ'],
      summoningTime: numberSummonTime,
      periodDuration: parseInt(periodDuration),
      votingPeriodLength: parseInt(votingPeriodLength),
      gracePeriodLength: parseInt(gracePeriodLength),
      proposalDeposit: proposalDeposit,
      dilutionBound: parseInt(dilutionBound),
      updateTime: numberSummonTime
    }

    summonEventRecord.events.push(indivSummonEventRecord)

    await curDaoIdx.set('summonEvent', summonEventRecord)

    return true
}

// Logs the initial member and summoning event when a DAO is created
export async function logProposalEvent (curDaoIdx, daoContract, proposalId) {

    let proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})   

    if(proposal) {
       
      // Log Proposal Event
      let proposalEventRecord = await curDaoIdx.get('proposals', curDaoIdx.id)
      if(!proposalEventRecord){
        proposalEventRecord = { events: [] }
      }

      let indivProposalRecord = {
        proposalId: (proposal.pI).toString(),
        applicant: proposal.a,
        proposer: proposal.p,
        sponsor: proposal.s,
        sharesRequested: proposal.sR,
        lootRequested: proposal.lR,
        tributeOffered: proposal.tO,
        tributeToken: proposal.tT,
        paymentRequested: proposal.pR,
        paymentToken: proposal.pT,
        startingPeriod: proposal.sP,
        yesVote: proposal.yV,
        noVote: proposal.nV,
        flags: proposal.f,
        maxTotalSharesAndLootAtYesVote: proposal.mT,
        proposalSubmission: parseInt(proposal.pS),
        votingPeriod: proposal.vP,
        gracePeriod: proposal.gP,
        voteFinalized: parseInt(proposal.voteFinalized)
        }

        proposalEventRecord.events.push(indivProposalRecord)
        console.log('proposalRecords.events', proposalEventRecord.events)

        await curDaoIdx.set('proposals', proposalEventRecord)

    return true
    }
}

export async function deleteLogInitEvent (accountId, summoner, daoType) {

    let daoAccount = new nearAPI.Account(near.connection, accountId);
    let thisCurDaoIdx = await ceramic.getCurrentUserIdxNoDid(appIdx, didRegistryContract, daoAccount)    
    console.log('thisCurDaoIdx', thisCurDaoIdx)

    const daoContract = await dao.initDaoContract(wallet.account(), accountId)
    let totalMembers = await daoContract.getTotalMembers()
    console.log('total Members', totalMembers)
    let memberId = parseInt(totalMembers)
    
    let numberSummonTime = parseInt(summonTime)

    if(summonTime && memberId) {
       
      // Log Member Event
      let memberEventRecord = await thisCurDaoIdx.get('member', thisCurDaoIdx.id)
      if(!memberEventRecord){
        memberEventRecord = { events: [] }
      }

      let indivMemberEventRecord = {
        memberId: memberId.toString(),
        contractId: daoContract.contractId,
        delegateKey: accountId,
        shares: '1',
        loot: '0',
        existing: true,
        highestIndexYesVote: 0,
        jailed: 0,
        joined: numberSummonTime,
        updated: numberSummonTime
      }

      memberEventRecord.events.push(indivMemberEventRecord)
      console.log('memberEventRecord.events', memberEventRecord.events)

      await thisCurDaoIdx.set('member', memberEventRecord)
     
    }

     // Log Summon Event

   let summonEventRecord = await thisCurDaoIdx.get('summonEvent', thisCurDaoIdx.id)
    if(!summonEventRecord){
      summonEventRecord = { events: [] }
    }
   
    let indivSummonEventRecord = {
      eventId: '1',
      contractId: daoContract.contractId,
      summoner: summoner,
      tokens: ['Ⓝ'],
      summoningTime: numberSummonTime,
      periodDuration: parseInt(periodDuration),
      votingPeriodLength: parseInt(votingPeriodLength),
      gracePeriodLength: parseInt(gracePeriodLength),
      proposalDeposit: proposalDeposit,
      dilutionBound: parseInt(dilutionBound),
      updateTime: numberSummonTime
    }

    summonEventRecord.events.push(indivSummonEventRecord)

    await thisCurDaoIdx.set('summonEvent', summonEventRecord)

    return true
}

export const hasKey = async (key, accountId, near) => {
    const keyPair = KeyPair.fromString(key)
    const pubKeyStr = keyPair.publicKey.toString()

    if (!near) {
        const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair)
        near = await nearAPI.connect({
            networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
        });
    }
    const account = new nearAPI.Account(near.connection, accountId);
    try {
        const accessKeys = await account.getAccessKeys()
        if (accessKeys.length > 0 && accessKeys.find(({ public_key }) => public_key === pubKeyStr)) {
            return true
        }
    } catch (e) {
        console.warn(e)
    }
    return false
}