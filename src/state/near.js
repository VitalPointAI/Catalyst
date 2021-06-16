import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'
import { ceramic } from '../utils/ceramic'
import { factory } from '../utils/factory'
import { dao } from '../utils/dao'

import { config } from './config'

export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, FACTORY_DEPOSIT, DAO_FIRST_INIT, CURRENT_DAO, REDIRECT,
    NEW_PROPOSAL, NEW_SPONSOR, NEW_CANCEL, KEY_REDIRECT, NEW_PROCESS, NEW_VOTE, IPFS_PROVIDER, NEW_DONATION,
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
        viewMethods: ['getDaoList'],
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

    wallet.fundAccount = async (amount, accountId, name, owner) => {
      
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
        update('', { near, wallet, links, claimed })
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

        let daoCreated = await isAccountTaken(accountId)
        console.log('daocreated', daoCreated)

      
            const keyPair = KeyPair.fromRandom('ed25519')

            let state = getState()

            let upLinks = await ceramic.downloadKeysSecret(state.appIdx, 'daoKeys')
            console.log('uplinks', upLinks)

            const daoInit = get(DAO_FIRST_INIT, [])

            try{
                let i = 0
                let exists = false
                while (i < upLinks.length){
                    if(upLinks[i].contractId == accountId){
                        exists = true
                        break
                    }
                    i++
                }
                if(!exists){
                    upLinks.push({ key: keyPair.secretKey, contractId: accountId, summoner: summoner, created: Date.now() })
                    let result = await ceramic.storeKeysSecret(state.appIdx, upLinks, 'daoKeys')

                    let link = '/dao/' + accountId
                    set(REDIRECT, {action: true, link: link})

                    if(result){
                        await daoFactoryContract.createDemDAO({ accountId: accountId, deposit: FACTORY_DEPOSIT }, GAS, parseNearAmount(FACTORY_DEPOSIT))
                    }
                 
                }
            } catch (err) {
                console.log('error setting up new Dao', err)
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
    let appIndex = await appIdx.getIndex()
    console.log('appIndex', appIndex)
    // await appIdx.remove('daoKeys')
    // let appIndex1 = await appIdx.getIndex()
    // console.log('appIndex1', appIndex1)

    //** INITIALIZE FACTORY CONTRACT */
    const daoFactory = await factory.initFactoryContract(account)

    let currentDaosLength = await daoFactory.getDaoListLength()
    console.log('currentdaoslength', currentDaosLength)

   
    let t = 0
    let start = 0
    let end
    let interval = 20
    let currentDaosList = []

    while(t < currentDaosLength){
        if(currentDaosLength < interval){
            end = currentDaosLength
        }
        let newDaoList = await daoFactory.getDaoList({start: start, end: end})
        for(let i = 0; i < newDaoList.length; i++){
            currentDaosList.push(newDaoList[i])
        }
        start = end
        if(end + interval > currentDaosLength){
            end = currentDaosLength
        } else {
        end = end + interval
        }
        t++        
    }

    // Set Current User Ceramic Client

    let curUserIdx
   
    let existingDid = await didRegistryContract.hasDID({accountId: accountId})

    if(existingDid){
        curUserIdx = await ceramic.getCurrentUserIdx(account, appIdx, didRegistryContract)
    }
 
    if(!existingDid){
        curUserIdx = await ceramic.getCurrentUserIdxNoDid(appIdx, didRegistryContract, account, null, null, accountId)
    }
   
    update('', { didRegistryContract, appIdx, accountId, curUserIdx, daoFactory, currentDaosList })
    
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
                            break
                        }
                        j++
                    }
                k++
                }
                let test = await ceramic.storeKeysSecret(curUserIdx, allAccounts, 'accountsKeys')
                console.log('test', test)

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
            console.log('claimed', !!claimed)
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

        const daoLinks = await ceramic.downloadKeysSecret(state.appIdx, 'daoKeys')
        console.log('daolinks', daoLinks)
        for (let i = 0; i < daoLinks.length; i++) {
            const { contractId } = daoLinks[i]
            const exists = await isAccountTaken(contractId)
            if(!exists){
                daoLinks.splice(i, 1)
                console.log('daoLinks after', daoLinks)
                try{
                await ceramic.storeKeysSecret(state.appIdx, daoLinks, 'daoKeys')
                } catch (err) {
                    console.log('error removing missing dao account', err)
                }
                continue
            }
        }

        const claimed = localLinks.filter(({claimed}) => !!claimed)
        const links = localLinks.filter(({claimed}) => !claimed)
    
       // let daoList = await state.appIdx.get('daoList')
       // console.log('daoList', daoList)
    
        update('', { links, claimed })
    }
    }

    finished = true
    console.log('finished', finished)
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
    console.log('state', state)
   
    const { key, accountId, publicKey, seedPhrase, owner, curUserIdx } = state.accountData

    const keyPair = KeyPair.fromString(key)
    const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair)
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
    })
    const account = new nearAPI.Account(near.connection, accountId)
    const accessKeys = await account.getAccessKeys()

    const didContract = await ceramic.initiateDidRegistryContract(account)

    const appIdx = await ceramic.getAppIdx(didContract)

    

    // const ownerAccount = new nearAPI.Account(near.connection, owner)
    // const ownerIdx = await ceramic.getCurrentUserIdx(ownerAccount, appIdx, ownerIdx, didContract)

    // let upLinks = await ceramic.downloadKeysSecret(ownerIdx, 'accountsKeys')
    console.log('key rotate idx', curUserIdx)
    let upLinks = await ceramic.downloadKeysSecret(curUserIdx, 'accountsKeys')
   
    console.log('uplinks fund account', upLinks)

    let b = 0
    let exists = false
    while(b < upLinks.length){
        if(upLinks[b].accountId == accountId){
            let modifiedAccount = {
                key: keyPair.secretKey,
                accountId: accountId,
                owner: owner,
                keyStored: Date.now()
            }
            upLinks[b] = modifiedAccount
            exists = true
        }
        b++
    }

    if(!exists){
        upLinks.push({ key: keyPair.secretKey, accountId: accountId, owner: owner, keyStored: Date.now() })
    }
    await ceramic.storeKeysSecret(curUserIdx, upLinks, 'accountsKeys')
    
    set(ACCOUNT_LINKS, upLinks)

    let personaIdx = await ceramic.getCurrentUserIdx(account, appIdx, didContract)

    // let ownerAccounts = get(ACCOUNT_LINKS, [])
  
    // let b = 0
    // let ownersowner
    // while(b < ownerAccounts.length) {
    //     if(ownerAccounts[b].accountId == owner){
    //         ownersowner = ownerAccounts[b].owner
    //         break
    //     }
    // b++
    // }
    
   
   
    // await ceramic.getCurrentUserIdxNoDid(appIdx, didContract, account, keyPair, owner)                 
    
    const actions = [
        deleteKey(PublicKey.from(accessKeys[0].public_key)),
        addKey(PublicKey.from(publicKey), fullAccessKey())
    ]

    set(SEED_PHRASE_LOCAL_COPY, seedPhrase)

    const result = await account.signAndSendTransaction(accountId, actions)

    // fetch('https://hooks.zapier.com/hooks/catch/6370559/ocibjmr/', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         account_id: accountId,
    //         time_claimed: Date.now()
    //     })
    // })
    
    return result
}

// Initializes a DAO by setting its key components
export async function initDao(wallet, contractId, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, summonerContribution) {

    try {
        const daoContract = await dao.initDaoContract(wallet.account(), contractId)

        // set trigger for first init to log summon and member events
        let firstInit = get(DAO_FIRST_INIT, [])
        firstInit.push({contractId: contractId, contribution: summonerContribution, init: true })
        set(DAO_FIRST_INIT, firstInit)
       
        await daoContract.init({
            _periodDuration: parseInt(periodDuration),
            _votingPeriodLength: parseInt(votingPeriodLength),
            _gracePeriodLength: parseInt(gracePeriodLength),
            _proposalDeposit: proposalDeposit,
            _dilutionBound: parseInt(dilutionBound),
            _shares: summonerContribution,
            _contractId: contractId
        }, GAS, parseNearAmount(summonerContribution))

    } catch (err) {
        console.log('init failed', err)
        return false
    }
    return true
}

async function sendMessage(content, type, type2, data, curDaoIdx){
    let request = new XMLHttpRequest()
    let hookArray = await ceramic.downloadKeysSecret(curDaoIdx, 'apiKeys')
    let hook = hookArray[0].api
    console.log("hook", hook)

    if((type2 == 'proposal' && hookArray[0].discordActivation == true && hookArray[0].proposalActivation == true)
    || (type2 == "sponsor" && hookArray[0].discordActivation == true && hookArray[0].sponsorActivation == true)
    || (type2 == "process" && hookArray[0].discordActivation == true && hookArray[0].passedProposalActivation == true))
    {
        request.open("POST", `${hook}`)

        request.setRequestHeader('Content-type', 'application/json')

            let embeddedData = {
            author: {
                    name: data.applicant,
                    url: data.url
                }
            }

            let params = {
                username: `${type}` + ' Manager',
                content: content,
                embeds: [embeddedData]
            }

            request.send(JSON.stringify(params))
            return true
    }
    return false
}

// Initializes a DAO by setting its key components
export async function submitProposal(
    wallet, 
    contractId, 
    depositToken, 
    proposalDeposit, 
    proposalType, 
    applicant, 
    loot, 
    tribute,
    sharesRequested,
    paymentRequested) {
   
    const daoContract = await dao.initDaoContract(wallet.account(), contractId)
    const proposalId = await daoContract.getProposalsLength()

    // set trigger for to log new proposal
    let newProposal = get(NEW_PROPOSAL, [])
    newProposal.push({contractId: contractId, proposalId: proposalId, new: true})
    set(NEW_PROPOSAL, newProposal)

    switch(proposalType){
        case 'Member':
            try{
            await daoContract.submitProposal({
                a: applicant,
                sR: sharesRequested,
                lR: loot,
                tO: tribute,
                tT: depositToken,
                pR: paymentRequested,
                pT: depositToken,
                contractId: contractId
                }, GAS, parseNearAmount((parseInt(tribute) + parseInt(proposalDeposit)).toString()))
            } catch (err) {
                console.log('submit member proposal failed', err)
                return false
            }
            break
        case 'Commitment':
            try{
                await daoContract.submitCommitmentProposal({
                    applicant: applicant,
                    depositToken: depositToken,
                    paymentRequested: paymentRequested,
                    paymentToken: depositToken,
                    contractId: contractId
                    }, GAS, parseNearAmount(parseInt(proposalDeposit).toString()))
                } catch (err) {
                    console.log('submit commitment proposal failed', err)
                    return false
                }
                break
        case 'Opportunity':
            try{
                await daoContract.submitOpportunityProposal({
                    creator: applicant,
                    depositToken: depositToken,
                    contractId: contractId
                    }, GAS, parseNearAmount(parseInt(proposalDeposit).toString()))
                } catch (err) {
                    console.log('submit opportunity proposal failed', err)
                    return false
                }
                break
        case 'Payout':
            try{
                await daoContract.submitProposal({
                    a: applicant,
                    sR: sharesRequested,
                    lR: loot,
                    tO: tribute,
                    tT: depositToken,
                    pR: paymentRequested,
                    pT: depositToken,
                    contractId: contractId
                    }, GAS, parseNearAmount(parseInt(proposalDeposit).toString()))
                } catch (err) {
                    console.log('submit payout proposal failed', err)
                    return false
                }
                break
        default:
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

// Make a Donation
export async function makeDonation(wallet, contractId, donationToken, contributor, donation) {
    const daoContract = await dao.initDaoContract(wallet.account(), contractId)
    const donationId = await daoContract.getDonationsLength()
    try {
        // set trigger for to log new proposal
        let newDonation = get(NEW_DONATION, [])
        newDonation.push({contractId: contractId, donationId: donationId, contributor: contributor, new: true})
        set(NEW_DONATION, newDonation)

        await daoContract.makeDonation({
            args: {
                contractId: contractId,
                token: donationToken
            },
            gas: GAS,
            amount: parseNearAmount(donation),
            walletMeta: 'to make a donation'
        })
    } catch (err) {
        console.log('donation failed', err)
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
        newVote.push({contractId: contractId, proposalId: proposalId, new: true, vote: vote, tabValue: '3'})
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
export async function cancelProposal(daoContract, contractId, proposalId, proposalDeposit, tribute = 0) {

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

// Delete a DAO
export async function deleteDao(daoContract, contractId) {

    try {
        // set trigger for to log new proposal
        let newDelete = get(NEW_DELETE, [])
        newDelete.push({contractId: contractId, proposalId: proposalId, new: true})
        set(NEW_DELETE, newDelete)

        await daoContract.deleteDAO({
            beneficiary: accountId
            }, GAS)

    } catch (err) {
        console.log('delete proposal failed', err)
        return false
    }
    return true
}

// Synch Proposals
export async function synchProposalEvent(curDaoIdx, daoContract) {

    let exists = false

    let contractProposals
    try{
        contractProposals = await daoContract.getProposalsLength()
    console.log('xproposal length', contractProposals)
    } catch (err) {
        console.log('problem retrieving proposal length', err)
    }
    let proposalEventRecord = await curDaoIdx.get('proposals', curDaoIdx.id)
    console.log('xproposalEventRecord', proposalEventRecord)

    if(!proposalEventRecord){
        proposalEventRecord = { events: [] }
    }

    if(proposalEventRecord.events.length > 0){
        if(proposalEventRecord.events.length > contractProposals){
            proposalEventRecord = { events: [] }
        }
        if(contractProposals != proposalEventRecord.events.length) {
            let i = 0
            while (i < contractProposals){
                let proposal = await daoContract.getProposal({proposalId: i})
                console.log('xproposal', proposal)
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
    }
    return true
}

// Synch Current Member to Log
export async function synchMember(curDaoIdx, daoContract, contractId, accountId) {

    let exists = false

    let member
    let summoner
    try{
        member = await daoContract.getMemberInfo({member: accountId})
        summoner = await daoContract.getSummoner()
        console.log('synch summoner', summoner)
        console.log('member', member)
    } catch (err) {
        console.log('current user does not appear to be a member', err)
    }

    let logMembers = await curDaoIdx.get('members', curDaoIdx.id)

    if(!logMembers){
        logMembers = { events: [] }
    }

    //add summoner as needed

    let i = 0
    if(member && member.length > 0){
        // add processed members
        while(i < logMembers.events.length){
            if(logMembers.events[i].delegateKey == member[0].delegateKey){
                exists = true
                break
            }
            i++
        }

        if(!exists){
            let totalMembers
            try {
                totalMembers = await daoContract.getTotalMembers()
                console.log('total Members', totalMembers)
            } catch (err) {
                console.log('no members', err)
                return false
            }
           
            let memberId = parseInt(totalMembers)

            let indivMemberRecord = {
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
        
            logMembers.events.push(indivMemberRecord)
            console.log('logMembers.events', logMembers.events)
            
            try {
            await curDaoIdx.set('members', logMembers)
           
            } catch (err) {
                console.log('error adding new member', err)
            }
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
export async function logInitEvent (contractId, curDaoIdx, daoContract, daoType, accountId, contribution) {

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
        shares: contribution,
        loot: '0',
        existing: true,
        highestIndexYesVote: 0,
        jailed: 0,
        joined: numberSummonTime,
        updated: Date.now()
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
    updateTime: Date.now()
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
export async function logProposalEvent(curDaoIdx, daoContract, proposalId, contractId) {

    let logged = false

    let proposal
    try{
        proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})
    } catch (err) {
        console.log('error retrieving proposal for this id', err)
        // reset new proposal flag
        let newProposal = get(NEW_PROPOSAL, [])     
        let d = 0
        while(d < newProposal.length){
            if(newProposal[d].contractId==contractId && newProposal[d].new == true){
                newProposal[d].new = false
                set(NEW_PROPOSAL, newProposal)
            }
        d++
        }
    }

    if(proposal && curDaoIdx) {
       
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
        // Discord Integration
        // 6 is member, 7 is funding, none is payout?
        if(proposal.f[6]){
            let data = {
                applicant: proposal.a,
                url: window.location.href
            }
            console.log("sending message")
            sendMessage('New member application received for ' + proposal.a, 'Member', 'proposal', data, curDaoIdx)
            
        } 
        else if(proposal.f[7]){
            let data = {
                applicant: proposal.a,
                url: window.location.href
            }
            console.log("sending message")
            sendMessage(proposal.a + " has requested a funding commitment of " + proposal.pR + " NEAR", 'Funding',
            'proposal', data, curDaoIdx)
        }
        else{
            let data = {
                applicant: proposal.a,
                url: window.location.href
            }
            console.log("sending message")
            sendMessage(proposal.a + " has requested a payout of " + proposal.pR + " NEAR", 'Payout', 'proposal',
             data, curDaoIdx)
        }
        return true
    }
    else {
        return false
    }
}

// Logs a Process Event
export async function logProcessEvent(curDaoIdx, daoContract, contractId, proposalId, proposalType, accountId) {

    let processLogged = false
    let memberLogged = false

    let proposal = await daoContract.getProposal({proposalId: proposalId})   

    if(proposal && curDaoIdx) {

        // Load existing proposal details
        let proposalRecords
        try{
            proposalRecords = await curDaoIdx.get('proposals', curDaoIdx.id)
        } catch (err) {
            console.log('problem loading proposal records', err)
        }

        // Update an existing proposal
        let exists = false
        let i = 0
        if(proposalRecords && proposalRecords.events.length > 0){
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
                        memberLogged = true
                        break
                    } catch (err) {
                        console.log('error logging process event', err)
                    }
                }
            i++
            }
        }
    }
    
    if(proposalType == 'Member'){

        let member = await daoContract.getMemberInfo({member: proposal.a})
        console.log('member process', member)

        let totalMembers
        try {
            totalMembers = await daoContract.getTotalMembers()
            console.log('total Members', totalMembers)
        } catch (err) {
            console.log('no members', err)
            return false
        }

        let memberId = parseInt(totalMembers)
       
        // Log Member Event
        let memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)

        if(member.length > 0 && !memberEventRecord){
            memberEventRecord = { events: [] }
        
    
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
            processLogged = true
            } catch (err) {
                console.log('error adding new member', err)
            }
            
        } else {
            if(member.length > 0){
            // Update an existing member
            let exists = false
            let i = 0
            while (i < memberEventRecord.events.length){
                if(memberEventRecord.events[i].delegateKey == member[0].delegateKey){
                    let updatedMemberRecord = {
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

                    memberEventRecord.events[i] = updatedMemberRecord

                    try {
                        await curDaoIdx.set('members', memberEventRecord)
                        exists = true
                        memberLogged = true
                        processLogged = true
                        break
                    } catch (err) {
                        console.log('error updating member', err)
                    }
                }
            i++
            }
            } else {
                memberLogged=true
                processLogged = true
            }
        }
    }
    console.log('processLogged', processLogged)
    console.log('memberprocessLogged', memberLogged)
    if(processLogged && memberLogged){
        let data = {
            applicant: proposal.a,
            url: window.location.href
        }
        sendMessage(proposal.a+"'s Proposal "+proposalId + " has been processed", "Processing", "process", data, curDaoIdx)
        return true
    } else {
        return false
    }
}

// Logs a Vote Event
export async function logVoteEvent(curDaoIdx, contractId, daoContract, proposalId, accountId) {

    let voteLogged = false
    let memberLogged = false

    let proposal
    try{
        proposal = await daoContract.getProposal({proposalId: proposalId})
    } catch (err) {
        console.log('issue getting proposal', err)
    }

    if(proposal && curDaoIdx) {
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
        console.log('vote logged', voteLogged)
        
        let member
        try{
            member = await daoContract.getMemberInfo({member: accountId})
        } catch (err) {
            console.log('error retrieving member info', member)
        }

        let memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)

        let totalMembers
        try {
            totalMembers = await daoContract.getTotalMembers()
            console.log('total Members', totalMembers)
        } catch (err) {
            console.log('no members', err)
            return false
        }
       
        let memberId = parseInt(totalMembers)

         // Update the existing voting member
         let memberExists
         let j = 0
         while (j < memberEventRecord.events.length){
             console.log('member', member)
             if(memberEventRecord.events[j].delegateKey == member[0].delegateKey){
                 let updatedMemberRecord = {
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
                 memberEventRecord.events[j] = updatedMemberRecord

                 try{
                    let memberlog = await curDaoIdx.set('members', memberEventRecord)
                    console.log('memberlog', memberlog)
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
    console.log('memberLogged', memberLogged)
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

    if(proposal && curDaoIdx) {
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
        let data = {
            applicant: proposal.a,
            url: window.location.href
        }
        sendMessage(proposal.a + "'s proposal " + proposalId + " has been sponsored by " + proposal.s
        , "Sponsorship", "sponsor", data, curDaoIdx)
        return true
    } else {
        return false
    }
}

// Logs a new Cancel Event
export async function logCancelEvent (curDaoIdx, daoContract, proposalId) {

    let cancelled = false

    let proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})

    if(proposal && curDaoIdx) {
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

// Logs a new Donation Event
export async function logDonationEvent (curDaoIdx, daoContract, donationId, contractId) {

    let logged = false

    let donation
    try{
        donation = await daoContract.getDonation({donationId: parseInt(donationId)})
    } catch (err) {
        console.log('error retrieving donation for this id', err)
    }

    if(donation && curDaoIdx) {
       
        // Log New donation Event
        let donationEventRecord = await curDaoIdx.get('donations', curDaoIdx.id)
        if(!donationEventRecord){
            donationEventRecord = { donations: [] }
        }

        let indivDonationRecord = {
            donationId: (donation.donationId).toString(),
            contractId: contractId,
            contributor: donation.contributor,
            contributed: parseInt(donation.contributed),
            donation: parseInt(donation.donation)
            }

            donationEventRecord.donations.push(indivDonationRecord)
            console.log('donationRecords.donations', donationEventRecord.events)

            try {
                await curDaoIdx.set('donations', donationEventRecord)
                logged = true
            } catch (err) {
                console.log('error logging donation', err)
            }
        }

    if(logged){
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

export function getStatus(flags) {
    // flags [sponsored, processed, didPass, cancelled, whitelist, guildkick, member, commitment]
    let status = ''
    if(!flags[0] && !flags[1] && !flags[2] && !flags[3]) {
    status = 'Submitted'
    }
    if(flags[0] && !flags[1] && !flags[2] && !flags[3]) {
    status = 'Sponsored'
    }
    if(flags[0] && flags[1] && !flags[3]) {
    status = 'Processed'
    }
    if(flags[0] && flags[1] && flags[2] && !flags[3]) {
    status = 'Passed'
    }
    if(flags[0] && flags[1] && !flags[2] && !flags[3]) {
    status = 'Not Passed'
    }
    if(flags[3]) {
    status = 'Cancelled'
    }
    return status
  }