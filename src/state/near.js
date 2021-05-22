import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'
import { ceramic } from '../utils/ceramic'
import { factory } from '../utils/factory'
import { dao } from '../utils/dao'

import { config } from './config'

export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, FACTORY_DEPOSIT, DAO_FIRST_INIT, CURRENT_DAO, REDIRECT,
    NEW_PROPOSAL, NEW_SPONSOR, NEW_CANCEL, KEY_REDIRECT, NEW_PROCESS, NEW_VOTE, IPFS_PROVIDER,
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
    const wallet = new nearAPI.WalletAccount(near)

    wallet.signIn = () => {
        wallet.requestSignIn(contractName, 'Blah Blah')
        window.location.assign('/')
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

    wallet.fundAccount = async (amount, accountId, owner) => {
      
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

       // const links = get(ACCOUNT_LINKS, [])
        let upLinks = await ceramic.downloadKeysSecret(state.curUserIdx, 'accountsKeys')
        console.log('uplinks fund account', upLinks)
        // let c = 0
        // let accountExists
        // while(c < links.length) {
        //     if(links[c].accountId == accountId){
        //         accountExists = true
        //         alert('This account already exists in local storage, it will be updated.')
        //         links[c] = { key: keyPair.secretKey, accountId: accountId, owner: owner, keyStored: Date.now() }
        //         break
        //     } else {
        //         accountExists = false
        //     }
        // c++
        // }
        //if(!accountExists){
            upLinks.push({ key: keyPair.secretKey, accountId: accountId, owner: owner, keyStored: Date.now() })
            await ceramic.storeKeysSecret(state.curUserIdx, upLinks, 'accountsKeys')
            set(ACCOUNT_LINKS, upLinks)
        
            await contract.create_account({ new_account_id: accountId, new_public_key: keyPair.publicKey.toString() }, GAS, parseNearAmount(amount))
        //}
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

        // // get DAO Key from Accounts
        // let accountLinks = get(ACCOUNT_LINKS, [])
        // let d = 0
        // let daoKey
        // while(d < accountLinks.length) {
        //     if(accountLinks[d].accountId == accountId){
        //         daoKey = accountLinks[d].key
        //         break
        //     }
        //     d++
        // }

        const keyPair = KeyPair.fromRandom('ed25519')

        let state = getState()

        let upLinks = await ceramic.downloadKeysSecret(state.appIdx, 'daoKeys')
        console.log('uplinks', upLinks)

       // const links = get(DAO_LINKS, [])
        const daoInit = get(DAO_FIRST_INIT, [])

        // let c = 0
        // let accountExists
        // while(c < links.length) {
        //     if(links[c].accountId == accountId){
        //         accountExists = true
        //         alert('This dao already exists in local storage, it will be updated.')
        //         links[c] = { key: daoKey, contractId: accountId, summoner: summoner, created: Date.now() }
        //         break
        //     } else {
        //         accountExists = false
        //     }
        // c++
        // }
        // if(!accountExists){

            try{
                upLinks.push({ key: keyPair.secretKey, contractId: accountId, summoner: summoner, created: Date.now() })
                await ceramic.storeKeysSecret(state.appIdx, upLinks, 'daoKeys')

                let daoAdded = await addDaoToList(state.appIdx, accountId, summoner, Date.now())

                let link = '/daos'
                set(REDIRECT, {action: true, link: link})

                if(daoAdded) {
                    await daoFactoryContract.createDemDAO({ accountId: accountId, deposit: FACTORY_DEPOSIT }, GAS, parseNearAmount(FACTORY_DEPOSIT))
                }
            } catch (err) {
                console.log('error setting up new Dao', err)
            }
        // }
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

    //** INITIALIZE FACTORY CONTRACT */
    const daoFactory = await factory.initFactoryContract(account)
   
    // Set Current User Ceramic Client

    let curUserIdx
   
    let existingDid = await didRegistryContract.hasDID({accountId: accountId})

    if(existingDid){
        curUserIdx = await ceramic.getCurrentUserIdx(account, appIdx)
    }
 
    if(!existingDid){
        curUserIdx = await ceramic.getCurrentUserIdxNoDid(appIdx, didRegistryContract, account, null, null, accountId)
    }

    update('', { didRegistryContract, appIdx, accountId, curUserIdx, daoFactory })
    console.log('curuserIdx', curUserIdx)
    if(curUserIdx){
        // check localLinks, see if they're still valid
        let state = getState()

         //synch local links with what's stored for the account in ceramic
        let allAccounts = await ceramic.downloadKeysSecret(curUserIdx, 'accountsKeys')
        console.log('all Accounts top', allAccounts)

        let storageLinks = get(ACCOUNT_LINKS, [])
        console.log('storagelinks top', storageLinks)
        
        if(allAccounts.length != storageLinks.length){
        
            if(allAccounts.length <= storageLinks.length){
           
                let k = 0
                while(k < allAccounts.length){
                    // ensure all the existing online accounts and offline accounts match
                    let j = 0
                    while (j < storageLinks.length){
                        if(allAccounts[k].accountId == storageLinks[j].accountId){
                            console.log('here')
                            allAccounts[k].key = storageLinks[j].key
                            allAccounts[k].owner = storageLinks[j].owner
                            allAccounts[k].keyStored = storageLinks[j].keyStored
                        }
                        console.log('j count', j)
                        j++
                    }
                k++
                }
                await ceramic.storeKeysSecret(curUserIdx, allAccounts, 'accountsKeys')

                // add any accounts that are missing
                let p = 0
                while(p < storageLinks.length){
                    let q = 0
                    let exists = false
                    while (q < allAccounts.length){
                        if(storageLinks[p].accountId == allAccounts[q].accountId){
                            exists = true
                        } 
                    q++
                    }
                    if(!exists){
                        allAccounts.push(storageLinks[p])
                    }
                    p++
                }
                await ceramic.storeKeysSecret(curUserIdx, allAccounts, 'accountsKeys')
            }
            
            if(allAccounts.length > storageLinks.length){
                set(ACCOUNT_LINKS, allAccounts)
            }
        }
        
        const localLinks = get(ACCOUNT_LINKS, []).sort((a) => a.claimed ? 1 : -1)
        for (let i = 0; i < localLinks.length; i++) {
            const { key, accountId, keyStored = 0, claimed, owner } = localLinks[i]
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
        await ceramic.storeKeysSecret(curUserIdx, localLinks, 'accountsKeys')

        const claimed = localLinks.filter(({claimed}) => !!claimed)
        const links = localLinks.filter(({claimed}) => !claimed)
    
        let daoList = await state.appIdx.get('daoList')
        console.log('daoList', daoList)
    
        update('', { links, claimed, daoList })
    }
    }

    finished = true
    update('', { near, wallet, finished})
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
    window.location.replace('/')
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
   
    const { key, accountId, publicKey, seedPhrase, owner } = state.accountData

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
    
  //  const ownerIdx = await ceramic.getCurrentUserIdx(ownerAccount, appIdx, ownersowner)
   
    await ceramic.getCurrentUserIdxNoDid(appIdx, didContract, account, keyPair, ownersowner)                 
    
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
            pT: depositToken,
            contractId: contractId
            }, GAS, parseNearAmount((parseInt(tribute) + parseInt(proposalDeposit)).toString()))

    } catch (err) {
        console.log('submit proposal failed', err)
        return false
    }
    return true
}

// Sponsor a DAO Proposal
export async function sponsorProposal(daoContract, contractId, proposalId, depositToken, proposalDeposit) {

    try {
        // set trigger for to log new proposal
        let newSponsor = get(NEW_SPONSOR, [])
        newSponsor.push({contractId: contractId, proposalId: proposalId, new: true})
        set(NEW_SPONSOR, newSponsor)

        await daoContract.sponsorProposal({
            pI: proposalId,
            proposalDeposit: proposalDeposit,
            depositToken: depositToken,
            contractId: contractId
            }, GAS, parseNearAmount((parseInt(proposalDeposit)).toString()))

    } catch (err) {
        console.log('sponsor proposal failed', err)
        return false
    }
    return true
}


// Process Queued Proposal
export async function processProposal(daoContract, contractId, proposalId, proposalType) {

    try {
        // set trigger for to log new proposal
        let newProcess = get(NEW_PROCESS, [])
        newProcess.push({contractId: contractId, proposalId: proposalId, new: true, type: proposalType})
        set(NEW_PROCESS, newProcess)

        await daoContract.processProposal({
            pI: proposalId
            }, GAS)

    } catch (err) {
        console.log('process proposal failed', err)
        return false
    }
    return true
}

// Voting Actions
export async function submitVote(daoContract, contractId, proposalId, vote) {

    try {
        // set trigger for to log new proposal
        let newVote = get(NEW_VOTE, [])
        newVote.push({contractId: contractId, proposalId: proposalId, new: true, vote: vote})
        set(NEW_VOTE, newVote)

        await daoContract.submitVote({
            pI: proposalId,
            vote: vote
            }, GAS)

    } catch (err) {
        console.log('vote submission failed', err)
        return false
    }
    return true
}

// Cancel a DAO Proposal
export async function cancelProposal(daoContract, contractId, proposalId, proposalDeposit, tribute) {

    try {
        // set trigger for to log new proposal
        let newCancel = get(NEW_CANCEL, [])
        newCancel.push({contractId: contractId, proposalId: proposalId, new: true})
        set(NEW_CANCEL, newCancel)

        await daoContract.cancelProposal({
            pI: proposalId,
            deposit: parseNearAmount(proposalDeposit),
            tribute: parseNearAmount(tribute)
            }, GAS)

    } catch (err) {
        console.log('cancel proposal failed', err)
        return false
    }
    return true
}

// Synch Proposals
export async function synchProposalEvent(curDaoIdx, daoContract) {

    let exists = false

    let contractProposals = await daoContract.getProposalsLength()
    let proposalEventRecord = await curDaoIdx.get('proposals', curDaoIdx.id)

    if(!proposalEventRecord){
        proposalEventRecord = { events: [] }
    }

    if(contractProposals != proposalEventRecord.events.length) {
        let i = 0
        while (i < contractProposals){
            let proposal = await daoContract.getProposal({proposalId: i})

            if(proposal) {
                let k = 0
                while (k < proposalEventRecord.events.length){
                    if(proposalEventRecord.events[k] == (proposal.pI).toString()){
                        exists = true
                        break
                    }
                    k++
                }

                if(!exists){
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
    
                        try {
                            await curDaoIdx.set('proposals', proposalEventRecord)
                           
                        } catch (err) {
                            console.log('error logging proposal', err)
                        }
                }
            }
        i++
        }
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

      // check for existing and update
      let i = 0
      let exists = false
      while (i < daoRecord.daoList.length){
          if(daoRecord.daoList[i].contractId == contractId){
              daoRecord.daoList[i] = indivDaoRecord
              exists = true
              break
          }
          i++
      }
      if(!exists){
        daoRecord.daoList.push(indivDaoRecord)
      }
      try{
        await appIdx.set('daoList', daoRecord)
        return true
      } catch (err) {
          console.log('problem adding dao to list', err)
          return false
      }
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
    let logged = false
    let summonLogged = false

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

    if(numberSummonTime && memberId) {
       
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

      
      try{
      await curDaoIdx.set('members', memberEventRecord)
      logged = true
      } catch (err) {
          console.log('error logging new member', err)
          logged = false
      }
     
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

   
    try{
        await curDaoIdx.set('summonEvent', summonEventRecord)
        summonLogged = true
    } catch (err) {
        console.log('error logging summon event', err)
        summonLogged = false
    }
    
    if(logged && summonLogged){
        return true
    } else {
        return false
    }
}

// Logs a new Proposal Event
export async function logProposalEvent(curDaoIdx, daoContract, proposalId) {

    let logged = false

    let proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})   

    if(proposal) {
       
        // Log New Proposal Event
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

            try {
                await curDaoIdx.set('proposals', proposalEventRecord)
                logged = true
            } catch (err) {
                console.log('error logging proposal', err)
            }
        }

    if(logged){
        return true
    } else {
        return false
    }
}

// Logs a Process Event
export async function logProcessEvent(curDaoIdx, daoContract, contractId, proposalId, proposalType, accountId) {

    let processLogged = false
    let memberLogged = false

    let proposal = await daoContract.getProposal({proposalId: proposalId})   

    if(proposal) {

        // Load existing proposal details
        let proposalRecords = await curDaoIdx.get('proposals', curDaoIdx.id)

        // Update an existing proposal
        let exists = false
        let i = 0
        while (i < proposalRecords.events.length){
            if(proposalRecords.events[i].proposalId == (proposal.pI).toString()){
                let updatedProposalRecord = {
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
                proposalRecords.events[i] = updatedProposalRecord
                try{
                    await curDaoIdx.set('proposals', proposalRecords)
                    exists = true
                    processLogged = true
                    break
                } catch (err) {
                    console.log('error logging process event', err)
                }
            }
         i++
        }
    }
    
    if(proposalType == 'Member'){

        let member = await daoContract.getMemberInfo({member: proposal.a})

        let totalMembers
        try {
            totalMembers = await daoContract.getTotalMembers()
            console.log('total Members', totalMembers)
        } catch (err) {
            console.log('no members', err)
            return false
        }

        let memberId = parseInt(totalMembers)
    
        if(memberId) {
           
          // Log Member Event
          let memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)
          if(!memberEventRecord){
            memberEventRecord = { events: [] }
          }
    
          let indivMemberEventRecord = {
            memberId: memberId.toString(),
            contractId: contractId,
            delegateKey: member[0].delegateKey,
            shares: member[0].shares,
            loot: member[0].loot,
            existing: member[0].existing,
            highestIndexYesVote: member[0].highestIndexYesVote,
            jailed: member[0].jailed,
            joined: parseInt(member[0].joined),
            updated: parseInt(member[0].updated)
          }
    
          memberEventRecord.events.push(indivMemberEventRecord)
          console.log('memberEventRecord.events', memberEventRecord.events)
          
          try {
          await curDaoIdx.set('members', memberEventRecord)
          memberLogged = true
          } catch (err) {
              console.log('error adding new member', err)
          }
        }
    } else {
        let member = await daoContract.getMemberInfo({member: accountId})
        console.log('member processed', member)

        let memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)

         // Update an existing member
         let exists = false
         let i = 0
         while (i < memberEventRecord.events.length){
             if(memberEventRecord.events[i].memberId == member.memberId){
                 let updatedMemberRecord = {
                    memberId: member.memberId.toString(),
                    contractId: contractId,
                    delegateKey: member.member[0].delegateKey,
                    shares: member.member[0].shares,
                    loot: member.member[0].loot,
                    existing: member.member[0].existing,
                    highestIndexYesVote: member.member[0].highestIndexYesVote,
                    jailed: member.member[0].jailed,
                    joined: member.member[0].joined,
                    updated: member.member[0].updated
                     }
                 memberEventRecord.events[i] = updatedMemberRecord
                 try {
                    await curDaoIdx.set('members', memberEventRecord)
                    exists = true
                    memberLogged = true
                    break
                 } catch (err) {
                     console.log('error updating member', err)
                 }
             }
          i++
        }
    }
    if(processLogged && memberLogged){
        return true
    } else {
        return false
    }
}

// Logs a Vote Event
export async function logVoteEvent(curDaoIdx, daoContract, proposalId, vote, accountId) {

    let voteLogged = false
    let memberLogged = false

    let proposal = await daoContract.getProposal({proposalId: proposalId})

    if(proposal) {
        // Load existing proposal details
        let proposalRecords = await curDaoIdx.get('proposals', curDaoIdx.id)

        // Update the proposal
        let exists
        let i = 0
        while (i < proposalRecords.events.length){
            if(proposalRecords.events[i].proposalId == (proposal.pI).toString()){
                let updatedProposalRecord = {
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
                proposalRecords.events[i] = updatedProposalRecord

                try{
                    await curDaoIdx.set('proposals', proposalRecords)
                    exists = true
                    voteLogged = true
                    break
                } catch (err) {
                    console.log('error logging vote event', err)
                }
            }
        i++
        }

        let member = await daoContract.getMemberInfo({member: accountId})

        let memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)

         // Update an existing member
         let memberExists = false
         let j = 0
         while (j < memberEventRecord.events.length){
             if(memberEventRecord.events[j].memberId == member.memberId){
                 let updatedMemberRecord = {
                    memberId: member.memberId.toString(),
                    contractId: contractId,
                    delegateKey: member.member[0].delegateKey,
                    shares: member.member[0].shares,
                    loot: member.member[0].loot,
                    existing: member.member[0].existing,
                    highestIndexYesVote: member.member[0].highestIndexYesVote,
                    jailed: member.member[0].jailed,
                    joined: member.member[0].joined,
                    updated: member.member[0].updated
                     }
                 memberEventRecord.events[j] = updatedMemberRecord

                 try{
                    await curDaoIdx.set('members', memberEventRecord)
                    memberExists = true
                    memberLogged = true
                    break
                 } catch (err) {
                     console.log('error updating member event', err)
                 }
             }
          j++
        }
    }
    if(voteLogged && memberLogged){
        return true
    } else {
        return false
    }
}

// Logs a new Sponsor Event
export async function logSponsorEvent (curDaoIdx, daoContract, proposalId) {

    let logged = false

    let proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})

    if(proposal) {
        // Load existing proposal details
        let proposalRecords = await curDaoIdx.get('proposals', curDaoIdx.id)

        // Update the proposal
        let exists
        let i = 0
        while (i < proposalRecords.events.length){
        if(proposalRecords.events[i].proposalId == proposalId){
            let updatedProposalRecord = {
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
            proposalRecords.events[i] = updatedProposalRecord

            try{
                await curDaoIdx.set('proposals', proposalRecords)
                exists = true
                logged = true
                break
            } catch (err) {
                console.log('error logging sponsor event', err)
            }
        }
        i++
        }
    }
    if(logged){
        return true
    } else {
        return false
    }
}

// Logs a new Cancel Event
export async function logCancelEvent (curDaoIdx, daoContract, proposalId) {

    let cancelled = false

    let proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})

    if(proposal) {
        // Load existing proposal details
        let proposalRecords = await curDaoIdx.get('proposals', curDaoIdx.id)
        
        // Update the proposal
        let exists
        let i = 0
        while (i < proposalRecords.events.length){
        if(proposalRecords.events[i].proposalId == proposalId){
            let updatedProposalRecord = {
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
         
            proposalRecords.events[i] = updatedProposalRecord

            try{
                await curDaoIdx.set('proposals', proposalRecords)
                exists = true
                cancelled = true
                break
            } catch (err) {
                console.log('error logging cancel event', err)
            }
        }
        i++
        }
    }
    if(cancelled){
        return true
    } else {
        return false
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