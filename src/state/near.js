import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'
import { APP_OWNER_ACCOUNT, ceramic } from '../utils/ceramic'
import { factory } from '../utils/factory'
import { dao } from '../utils/dao'

import { config } from './config'

export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, FACTORY_DEPOSIT, DAO_FIRST_INIT, 
    CURRENT_DAO, REDIRECT, NEW_PROPOSAL, NEW_SPONSOR, NEW_CANCEL, KEY_REDIRECT, OPPORTUNITY_REDIRECT, NEW_PROCESS, NEW_VOTE, 
    IPFS_PROVIDER, NEW_DONATION, NEW_EXIT, NEW_RAGE, NEW_DELEGATION, NEW_REVOCATION, COMMUNITY_DELETE, NEW_DELETE, BUDGET_DEDUCTION, 
    BUDGET_INCREASE, networkId, nodeUrl, walletUrl, nameSuffix, factorySuffix, explorerUrl,
    contractName, didRegistryContractName, factoryContractName
} = config

export const {
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
        viewMethods: ['getDaoList', 'getDaoListLength', 'getDaoIndex'],
        changeMethods: ['createDAO', 'deleteDAO'],
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

        let upLinks = await ceramic.downloadKeysSecret(state.curUserIdx, 'accountsKeys')
      
     
            upLinks.push({ key: keyPair.secretKey, accountId: accountId, owner: owner, keyStored: Date.now() })
            await ceramic.storeKeysSecret(state.curUserIdx, upLinks, 'accountsKeys')
            set(ACCOUNT_LINKS, upLinks)
        
            await contract.create_account({ new_account_id: accountId, new_public_key: keyPair.publicKey.toString() }, GAS, parseNearAmount(amount))
       
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

            const keyPair = KeyPair.fromRandom('ed25519')

            let state = getState()

            let upLinks = await ceramic.downloadKeysSecret(state.appIdx, 'daoKeys')
   
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
                        await daoFactoryContract.createDAO({ accountId: accountId, deposit: FACTORY_DEPOSIT}, GAS, parseNearAmount(FACTORY_DEPOSIT))
                    }
                 
                }
            } catch (err) {
                console.log('error setting up new Dao', err)
            }
        
    }

    if(wallet.signedIn){
    
    // ********* Check and action redirects after DAO and proposal creation *************
    let urlVariables = window.location.search
    const urlParameters = new URLSearchParams(urlVariables)
    let transactionHash = urlParameters.get('transactionHashes')

    let page = get(REDIRECT, [])

    if (page.action == true){
        window.location.assign(page.link)
        
        set(REDIRECT, {action: false, link: ''})
    }
    
    if(transactionHash){
        let pageMember = get(OPPORTUNITY_REDIRECT, [])
        if (pageMember.action == true){
            let link=`/dao/${pageMember.contractId}?transactionHashes=${transactionHash}`
            window.location.assign(link)
            set(OPPORTUNITY_REDIRECT, {action: false, link: ''})
        }
    }

    // ********* Initiate Dids Registry Contract ************

    const account = wallet.account()
    const accountId = account.accountId
    const didRegistryContract = await ceramic.initiateDidRegistryContract(account)

     // ******** IDX Initialization *********

    //Initiate App Ceramic Components
    
    const appIdx = await ceramic.getAppIdx(didRegistryContract)
    let appIndex = await appIdx.getIndex()

    //** INITIALIZE FACTORY CONTRACT */
    let daoFactory
    try {
        daoFactory = await factory.initFactoryContract(account)
    } catch (err) {
        console.log('error initializing daoFactory', err)
    }

    let t = 0
    let start = 0
    let end = 0
    let interval = 20
    let currentDaosList = []

    try {
        let currentDaosLength = await daoFactory.getDaoListLength()
        console.log('currentdaolength', currentDaosLength)
    
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

    } catch (err) {
        console.log('error creating currentDaosList', err)
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
 
    update('', { didRegistryContract, appIdx, account, accountId, curUserIdx, daoFactory, currentDaosList })
    
    if(curUserIdx){
        // check localLinks, see if they're still valid
        let state = getState()

         //synch local links with what's stored for the account in ceramic
        let allAccounts = await ceramic.downloadKeysSecret(curUserIdx, 'accountsKeys')
    
        let storageLinks = get(ACCOUNT_LINKS, [])
     
        if(allAccounts.length != storageLinks.length){
        
            if(allAccounts.length <= storageLinks.length){
           
                let k = 0
                while(k < allAccounts.length){
                    // ensure all the existing online accounts and offline accounts match
                    let j = 0
                    while (j < storageLinks.length){
                        if(allAccounts[k].accountId == storageLinks[j].accountId){
                         
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
        let changed = false
        for (let i = 0; i < localLinks.length; i++) {
            const { key, accountId, keyStored = 0, claimed, owner } = localLinks[i]
            const exists = await isAccountTaken(accountId)
            if (!exists) {
                localLinks.splice(i, 1)
                changed = true
                continue
            }
          
            if (!!claimed || Date.now() - keyStored < 5000) {
                continue
            }
            const keyExists = await hasKey(key, accountId, near)
            if (!keyExists) {
                localLinks[i].claimed = true
                changed = true
            }
        }
        if(changed){
            set(ACCOUNT_LINKS, localLinks)
            await ceramic.storeKeysSecret(curUserIdx, localLinks, 'accountsKeys')
        }

        const daoLinks = await ceramic.downloadKeysSecret(state.appIdx, 'daoKeys')
  
        for (let i = 0; i < daoLinks.length; i++) {
            const { contractId } = daoLinks[i]
            const exists = await isAccountTaken(contractId)
            if(!exists){
                daoLinks.splice(i, 1)
           
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
    
        update('', { links, claimed })
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
    })
    const connection = new nearAPI.WalletConnection(near)
    connection.signOut()
    window.location.replace('https://vitalpoint.ai/catalyst')
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


    let upLinks = await ceramic.downloadKeysSecret(curUserIdx, 'accountsKeys')
   

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
    
    const actions = [
        deleteKey(PublicKey.from(accessKeys[0].public_key)),
        addKey(PublicKey.from(publicKey), fullAccessKey())
    ]

    set(SEED_PHRASE_LOCAL_COPY, seedPhrase)

    const result = await account.signAndSendTransaction(accountId, actions)
    
    return result
}

// Initializes a DAO by setting its key components
export async function initDao(wallet, contractId, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, voteThreshold, summonerContribution) {

    try {
        const daoContract = await dao.initDaoContract(wallet.account(), contractId)

        // set trigger for first init to log summon and member events
        let firstInit = get(DAO_FIRST_INIT, [])
        firstInit.push({contractId: contractId, contribution: summonerContribution, init: true })
        set(DAO_FIRST_INIT, firstInit)
       
        await daoContract.init({
            _approvedTokens: ['Ⓝ'],
            _periodDuration: parseInt(periodDuration),
            _votingPeriodLength: parseInt(votingPeriodLength),
            _gracePeriodLength: parseInt(gracePeriodLength),
            _proposalDeposit: proposalDeposit,
            _dilutionBound: parseInt(dilutionBound),
            _voteThreshold: parseInt(voteThreshold),
            _shares: summonerContribution,
            _contractId: contractId
        }, GAS, parseNearAmount(summonerContribution))

    } catch (err) {
        console.log('init failed', err)
        return false
    }
    return true
}

// Submits new DAO settings from summoner if only member
export async function changeDao(wallet, contractId, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, voteThreshold) {

    try {
        const daoContract = await dao.initDaoContract(wallet.account(), contractId)
        
        await daoContract.setInit({
            _periodDuration: parseInt(periodDuration),
            _votingPeriodLength: parseInt(votingPeriodLength),
            _gracePeriodLength: parseInt(gracePeriodLength),
            _proposalDeposit: proposalDeposit,
            _dilutionBound: parseInt(dilutionBound),
            _voteThreshold: parseInt(voteThreshold)
        }, GAS)

    } catch (err) {
        console.log('change init failed', err)
        return false
    }
    return true
}

async function sendMessage(content, type, type2, data, curDaoIdx){
    let request = new XMLHttpRequest()
    let hookArray = await ceramic.downloadKeysSecret(curDaoIdx, 'apiKeys')
  
    if(hookArray && Object.keys(hookArray).length != 0){
        let hook = hookArray[0].api
       

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
    }
    return false
}

// Initializes a DAO by setting its key components
export async function submitProposal(
    wallet, 
    contractId, 
    proposalType, 
    applicant, 
    loot, 
    tribute,
    sharesRequested,
    paymentRequested,
    configuration,
    references) {
   
    const daoContract = await dao.initDaoContract(wallet.account(), contractId)
    const proposalId = await daoContract.getProposalsLength()
    const proposalDeposit = await daoContract.getProposalDeposit()
    const depositToken = await daoContract.getDepositToken()

    // set trigger for to log new proposal
    let newProposal = get(NEW_PROPOSAL, [])
    newProposal.push({contractId: contractId, proposalId: proposalId, new: true})
    set(NEW_PROPOSAL, newProposal)

    switch(proposalType){
        case 'Member':
            try{               
            
            // set redirect for new member from an opportunity
            set(OPPORTUNITY_REDIRECT, {action: true, contractId: contractId})

            await daoContract.submitMemberProposal({
                a: applicant,
                sR: sharesRequested,
                lR: loot,
                tO: tribute,
                tT: depositToken,
                roleNames: ['member'],
                contractId: contractId
                }, GAS, parseNearAmount(((parseInt(tribute) + parseInt(loot) + parseInt(proposalDeposit)).toString())))
            } catch (err) {
                console.log('submit member proposal failed', err)
                return false
            }
            break
        case 'Tribute':
            try{
            await daoContract.submitTributeProposal({
                a: applicant,
                sR: sharesRequested,
                tO: tribute,
                tT: depositToken,
                contractId: contractId
                }, GAS, parseNearAmount(((parseInt(tribute) + parseInt(proposalDeposit)).toString())))
            } catch (err) {
                console.log('submit tribute proposal failed', err)
                return false
            }
            break
        case 'Commitment':
            try{
                // set redirect for new commitment from an opportunity
                set(OPPORTUNITY_REDIRECT, {action: true, contractId: contractId})

                await daoContract.submitCommitmentProposal({
                    applicant: applicant,
                    paymentRequested: paymentRequested,
                    paymentToken: depositToken,
                    referenceIds: references,
                    contractId: contractId
                    }, GAS, parseNearAmount(proposalDeposit))
                } catch (err) {
                    console.log('submit commitment proposal failed', err)
                    return false
                }
                break
        case 'Configuration':
            try{
                await daoContract.submitConfigurationProposal({
                    applicant: applicant,
                    configuration: configuration,
                    contractId: contractId
                    }, GAS, parseNearAmount(proposalDeposit))
                } catch (err) {
                    console.log('submit configuration proposal failed', err)
                    return false
                }
                break
        case 'Opportunity':
            try{
                await daoContract.submitOpportunityProposal({
                    creator: applicant,
                    contractId: contractId
                    }, GAS, parseNearAmount(proposalDeposit))
                } catch (err) {
                    console.log('submit opportunity proposal failed', err)
                    return false
                }
                break
        case 'Payout':
            try{
                await daoContract.submitPayoutProposal({
                    a: applicant,
                    pR: paymentRequested,
                    pT: depositToken,
                    referenceIds: references,
                    contractId: contractId
                    }, GAS, parseNearAmount(proposalDeposit))
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
export async function sponsorProposal(daoContract, contractId, proposalId, depositToken, proposalDeposit, curDaoIdx) {

    try {
        // set trigger for to log new proposal
        let newSponsor = get(NEW_SPONSOR, [])
        newSponsor.push({contractId: contractId, proposalId: proposalId, new: true})
        set(NEW_SPONSOR, newSponsor)
        
        let proposal = await daoContract.getProposal({proposalId: proposalId})
        let opportunityId = proposal.referenceIds[0].valueSetting
        let opportunitiesList = await curDaoIdx.get('opportunities', curDaoIdx.id)
        let opportunity

        for(let i = 0; i < opportunitiesList.opportunities.length;i++){
          if(opportunitiesList.opportunities[i].opportunityId = opportunityId){
            opportunity = opportunitiesList.opportunities[i]; 
            opportunity['budget'] = parseInt(opportunity['budget']) - proposal.pR
            opportunitiesList.opportunities[i] = opportunity
          } 
        }

        let budgetDeduction = get(BUDGET_DEDUCTION, [])
        budgetDeduction.push({opportunitiesList: opportunitiesList})
        set(BUDGET_DEDUCTION, budgetDeduction)

        await daoContract.sponsorProposal({
            pI: proposalId,
            depositToken: depositToken,
            contractId: contractId
            }, GAS, parseNearAmount(proposalDeposit))

       
    } catch (err) {
        console.log('sponsor proposal failed', err)
        return false
    }

  
    return true
}

// Make a Donation
export async function makeDonation(wallet, contractId, contributor, donation) {
    const daoContract = await dao.initDaoContract(wallet.account(), contractId)
    const donationId = await daoContract.getDonationsLength()
    const depositToken = await daoContract.getDepositToken()
    try {
        // set trigger for to log new donation
        let newDonation = get(NEW_DONATION, [])
        newDonation.push({contractId: contractId, donationId: donationId, contributor: contributor, new: true})
        set(NEW_DONATION, newDonation)

        await daoContract.makeDonation({
            args: {
                contractId: contractId,
                contributor: contributor,
                token: depositToken,
                amount: donation
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

// Make a Vote Delegation
export async function delegate(wallet, contractId, delegator, receiver, quantity) {
    const daoContract = await dao.initDaoContract(wallet.account(), contractId)
   
    try {
        // set trigger for to log new delegation
        let newDelegation = get(NEW_DELEGATION, [])
        newDelegation.push({contractId: contractId, delegator: delegator, receiver: receiver, quantity: quantity, new: true})
        set(NEW_DELEGATION, newDelegation)

        await daoContract.delegate({
            args: {
                delegateTo: receiver,
                quantity: quantity
            },
            gas: GAS,
            walletMeta: 'to delegate votes'
        })
    } catch (err) {
        console.log('delegation failed', err)
        return false
    }
    return true
}

// Revoke a Vote Delegation
export async function revokeDelegatedVotes(wallet, contractId, delegator, receiver, quantity) {
    const daoContract = await dao.initDaoContract(wallet.account(), contractId)
   
    try {
        // set trigger for to log new delegation
        let newRevocation = get(NEW_REVOCATION, [])
        newRevocation.push({contractId: contractId, delegator: delegator, receiver: receiver, quantity: quantity, new: true})
        set(NEW_REVOCATION, newRevocation)

        await daoContract.undelegate({
            args: {
                delegateFrom: receiver,
                quantity: quantity
            },
            gas: GAS,
            walletMeta: 'to revoke vote delegation'
        })
    } catch (err) {
        console.log('delegation revocation failed', err)
        return false
    }
    return true
}

// Process Queued Proposal
export async function processProposal(daoContract, contractId, proposalId, proposalType, curDaoIdx) {

    try {
        // set trigger for to log new proposal
        let newProcess = get(NEW_PROCESS, [])
        newProcess.push({contractId: contractId, proposalId: proposalId, new: true, type: proposalType})
        set(NEW_PROCESS, newProcess)
        
        let proposal = await daoContract.getProposal({proposalId: proposalId})
        let opportunitiesList

        if(proposal.nV >= proposal.yV){
            let opportunityId = proposal.referenceIds[0].valueSetting
            let opportunity
            opportunitiesList = await curDaoIdx.get('opportunities', curDaoIdx.id)
      
            for(let i = 0; i < opportunitiesList.opportunities.length;i++){
                if(opportunitiesList.opportunities[i].opportunityId = opportunityId){
                    opportunity = opportunitiesList.opportunities[i]; 
                    opportunity['budget'] = parseInt(opportunity['budget']) + proposal.pR
                    opportunitiesList.opportunities[i] = opportunity
                } 
            }
        }
        
        let budgetIncrease = get(BUDGET_INCREASE, [])
        budgetIncrease.push({opportunitiesList: opportunitiesList})
        set(BUDGET_INCREASE, budgetIncrease)

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

// Rage Quit
export async function rageQuit(daoContract, contractId, accountId, sharesToBurn, lootToBurn) {

    try {
        // set trigger for to log new proposal
        let newRage = get(NEW_RAGE, [])
        newRage.push({contractId: contractId, member: accountId, new: true})
        set(NEW_RAGE, newRage)

        await daoContract.rageQuit({
            sharesToBurn: sharesToBurn,
            lootToBurn: lootToBurn,
            }, GAS)
    } catch (err) {
        console.log('rage quit failed', err)
        return false
    }
    return true
}

// Leave Community
export async function leaveCommunity(daoContract, contractId, share, accountId, entitlement, balanceAvailable) {

    try {
        // set trigger for to log member exit
        let newExit = get(NEW_EXIT, [])
        newExit.push({contractId: contractId, account: accountId, new: true, share: share})
        set(NEW_EXIT, newExit)

        // set trigger for new donation if share is not the total share
        if(share < entitlement){
            const donationId = await daoContract.getDonationsLength()
            
            // set trigger for to log new proposal
            let newDonation = get(NEW_DONATION, [])
            newDonation.push({contractId: contractId, donationId: donationId, contributor: accountId, new: true})
            set(NEW_DONATION, newDonation)
        }

        // check if this is the last member and if so, set trigger to delete the community
        let totalMembers
        try {
            totalMembers = await daoContract.getTotalMembers()
            if(totalMembers == 1){
                let communityDelete = get(COMMUNITY_DELETE, [])
                communityDelete.push({contractId: contractId, new: true})
                set(COMMUNITY_DELETE, communityDelete)
            }
        } catch (err) {
            console.log('no members', err)
            return false
        }

        await daoContract.leave({
            contractId: contractId,
            accountId: accountId,
            share: share,
            remainingBalance: balanceAvailable,
            appOwner: APP_OWNER_ACCOUNT
            }, GAS)

    } catch (err) {
        console.log('leave community failed', err)
        return false
    }
    return true
}

// Delete Community
export async function deleteCommunity(factoryContract, contractId, accountId) {

    // set trigger for new community delete
    let newDelete = get(NEW_DELETE, [])
    newDelete.push({contractId: contractId, accountId: accountId, new: true})
    set(NEW_DELETE, newDelete)

    try{
        await factoryContract.deleteDAO({
            accountId: contractId
            }, GAS)

    } catch (err) {
        console.log('delete community failed', err)
        return false
    }
    return true
}

// Cancel a DAO Proposal
export async function cancelProposal(daoContract, contractId, proposalId, loot = 0, tribute = 0) {

    try {
        // set trigger for to log new proposal
        let newCancel = get(NEW_CANCEL, [])
        newCancel.push({contractId: contractId, proposalId: proposalId, new: true})
        set(NEW_CANCEL, newCancel)

        await daoContract.cancelProposal({
            pI: proposalId,
            tribute: tribute,
            loot: loot
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

    let contractProposals
    let proposalEventRecord
    try{
        contractProposals = await daoContract.getProposalsLength()
        console.log('synch contract proposal length', contractProposals)
    } catch (err) {
        console.log('problem retrieving proposal length', err)
    }

    try{
        proposalEventRecord = await curDaoIdx.get('proposals', curDaoIdx.id)
    } catch (err) {
        console.log('problem retreiving proposal events', err)
    }
  
    if(!proposalEventRecord){
        proposalEventRecord = { events: [] }
    }
    console.log('synch proposal events', proposalEventRecord.events)
    console.log('synch proposal record events length', proposalEventRecord.events.length)
    if(proposalEventRecord.events.length != contractProposals){
        if(proposalEventRecord.events.length < contractProposals) {
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
                            voteFinalized: parseInt(proposal.voteFinalized),
                            configuration: proposal.configuration,
                            referenceIds: proposal.referenceIds
                            }

                            proposalEventRecord.events.push(indivProposalRecord)
                    }
                }
            i++
            }
            try {
                await curDaoIdx.set('proposals', proposalEventRecord)
            
            } catch (err) {
                console.log('error logging proposal', err)
            }
        } else 
        if(proposalEventRecord.events.length > contractProposals){
            proposalEventRecord = { events: [] }
            try {
                await curDaoIdx.set('proposals', proposalEventRecord)
            } catch (err) {
                console.log('error emptying proposals', err)
            }
            let i = 0
            while (i < contractProposals){
                let proposal = await daoContract.getProposal({proposalId: i})
               
                if(proposal) {
                    
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
                        voteFinalized: parseInt(proposal.voteFinalized),
                        configuration: proposal.configuration,
                        referenceIds: proposal.referenceIds
                        }

                        proposalEventRecord.events.push(indivProposalRecord)
                }
            i++
            }
            try {
                await curDaoIdx.set('proposals', proposalEventRecord)
            
            } catch (err) {
                console.log('error logging proposal', err)
            }
        }
    }

    return true
}

// // Synch Current Member to Log
export async function synchMember(curDaoIdx, daoContract, contractId, accountId) {

    let exists = false
    let member
 
    try{
        member = await daoContract.getMemberInfo({member: accountId})
        console.log('member here', member)
    } catch (err) {
        
        console.log('current user does not appear to be a member', err)
    }

    let logMembers = await curDaoIdx.get('members', curDaoIdx.id)
    console.log('logmembers', logMembers)
    if(!logMembers){
        logMembers = { events: [] }
    }

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
        
            let memberId = generateId()

            let indivMemberRecord = {
                memberId: memberId,
                contractId: contractId,
                delegateKey: member[0].delegateKey,
                shares: member[0].shares,
                delegatedShares: member[0].delegatedShares,
                receivedDelegations: member[0].receivedDelegations,
                loot: member[0].loot,
                existing: member[0].existing,
                highestIndexYesVote: member[0].highestIndexYesVote,
                roles: member[0].roles,
                reputation: member[0].reputation,
                jailed: member[0].jailed,
                joined: parseInt(member[0].joined),
                updated: parseInt(member[0].updated),
                active: member[0].active
            }
        
            logMembers.events.push(indivMemberRecord)
        
            try {
                await curDaoIdx.set('members', logMembers)
            } catch (err) {
                console.log('error adding new member', err)
            }
        }
        return true
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
export async function logInitEvent (contractId, curDaoIdx, daoContract, daoType, accountId, contribution, transactionHash) {

    let summoner
    let periodDuration
    let votingPeriodLength
    let gracePeriodLength
    let proposalDeposit
    let dilutionBound
    let summonTime
    let logged = false
    let summonLogged = false
    let memberDataLogged = false

    try {
        let result = await daoContract.getInitSettings()
        
        summoner = result[0][0]
        periodDuration = result[0][1]
        votingPeriodLength = result[0][2]
        gracePeriodLength = result[0][3]
        proposalDeposit = result[0][4]
        dilutionBound = result[0][5]
        voteThreshold = result[0][6]
        summonTime = result[0][7]
    } catch (err) {
        console.log('failure fetching init settings')
        return false
    }

    let totalMembers
    try {
        totalMembers = await daoContract.getTotalMembers()
        
    } catch (err) {
        console.log('no members', err)
        return false
    }

    // Do not log if this is not the first member (>1 means the DAO was already initialized)
    if (totalMembers > 1) {
        return false
    }
   
    //let memberId = parseInt(totalMembers)
    let memberId = generateId()
    
    let numberSummonTime = parseInt(summonTime)

    if(numberSummonTime && memberId) {
       
      // Log Member Event
      let memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)
      if(!memberEventRecord){
        memberEventRecord = { events: [] }
      }
  
    // Log Member Data
    let memberDataRecord = await curDaoIdx.get('memberData', curDaoIdx.id)
    if(!memberDataRecord){
        memberDataRecord = { data: [] }
    }

      let indivMemberEventRecord = {
        memberId: memberId,
        contractId: contractId,
        delegateKey: accountId,
        shares: contribution,
        delegatedShares: '0',
        receivedDelegations: '0',
        loot: '0',
        existing: true,
        highestIndexYesVote: 0,
        roles: ['member'],
        reputation: [],
        jailed: 0,
        joined: numberSummonTime,
        updated: Date.now(),
        active: true
      }

      memberEventRecord.events.push(indivMemberEventRecord)
   

      
      try{
      await curDaoIdx.set('members', memberEventRecord)
      logged = true
      } catch (err) {
          console.log('error logging new member', err)
          logged = false
      }

        // Associated Member Data to Log

        let dataObject = {
            memberId: memberId,
            summonTime: numberSummonTime,
            transactionHash: transactionHash,
            shares: parseInt(contribution),
            loot: 0,
            summoner: accountId
        }

        let individualDataRecord = {
            dataType: 'newSummoner',
            contractId: contractId,
            data: dataObject
        }

        memberDataRecord.data.push(individualDataRecord)


        try {
            await curDaoIdx.set('memberData', memberDataRecord)
            memberDataLogged = true
        } catch (err) {
            console.log('error logging new member data', err)
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
    voteThreshold: parseInt(voteThreshold),
    updateTime: Date.now(),
    transactionHash: transactionHash
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

// Logs when a member decides to leave a community
export async function logExitEvent(contractId, curDaoIdx, daoContract, accountId, transactionHash) {
    let memberLogged = false
    let member
    try {
        member = await daoContract.getMemberInfo({member: accountId})
       
    } catch (err) {
        console.log('no member exists', err)
        memberLogged = true
        return true
    }
   
    // Retrieve Members
    let memberEventRecord
    try {
        memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)
 
    } catch (err) {
        console.log('no membereventrecords', err)
        memberLogged = true
        return true
    }

    if(member && member.length > 0 && memberEventRecord){
       
        // Update an existing member- set active to inactive indicating member has left
        let exists = false
        let i = 0
        while (i < memberEventRecord.events.length){
            if(memberEventRecord.events[i].delegateKey == member[0].delegateKey){
                let updatedMemberRecord = {
                    memberId: memberEventRecord.events[i].memberId,
                    contractId: contractId,
                    delegateKey: member[0].delegateKey,
                    shares: member[0].shares,
                    delegatedShares: member[0].delegatedShares,
                    receivedDelegations: member[0].receivedDelegations,
                    loot: member[0].loot,
                    existing: member[0].existing,
                    highestIndexYesVote: member[0].highestIndexYesVote,
                    roles: member[0].roles,
                    reputation: member[0].reputation,
                    jailed: member[0].jailed,
                    joined: parseInt(member[0].joined),
                    updated: parseInt(member[0].updated),
                    active: member[0].active
                    }

                memberEventRecord.events[i] = updatedMemberRecord

                try {
                    await curDaoIdx.set('members', memberEventRecord)
                    memberLogged = true
                    break
                } catch (err) {
                    console.log('error updating member', err)
                }
            }
        i++
        }
    } else {
        // member doesn't exist so set to true so flag is updated, doesn't keep trying to log
        memberLogged = true    
    }
    if(memberLogged){
        return true
    } else {
        return false
    }
}

// Logs a deleted community
export async function logDeleteCommunity(contractId, appIdx, accountId, transactionHash) {
    let dataLogged = false

    // Log Deletion Data
    let dataRecord = await appIdx.get('daoDeletionData', appIdx.id)
    if(!dataRecord){
        dataRecord = { data: [] }
    }
    
     // Associated Proposal Data to Log

    let dataObject = {
        accountId: accountId, // last member
        contractId: contractId,
        deleteTime: Date.now(),
        transactionHash: transactionHash,
    }

    let individualDataRecord = {
        dataType: 'newCommunityDelete',
        contractId: contractId,
        data: dataObject
    }

    dataRecord.data.push(individualDataRecord)
    console.log('proposalData.data', dataRecord.data)

    try {
        await appIdx.set('daoDeletionData', dataRecord)
        dataLogged = true
    } catch (err) {
        console.log('error logging dao deletion', err)
    }

    if(dataLogged){
        return true
    } else {
        return false
    }
}

// Logs a vote delegation event (delegate or revoke delegation)
export async function logDelegationEvent (contractId, curDaoIdx, daoContract, delegator, receiver, transactionHash) {
    let delegatorLogged = false
    let receiverLogged = false

    let delegatorAccount
    try {
        delegatorAccount = await daoContract.getMemberInfo({member: delegator})
      
    } catch (err) {
        console.log('no delegatorAccount exists', err)
        return true
    }

    let receiverAccount
    try {
        receiverAccount = await daoContract.getMemberInfo({member: receiver})
 
    } catch (err) {
        console.log('no receiver account exists', err)
        return true
    }
   
    // Retrieve Members
    let memberEventRecord
    try {
        memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)
      
    } catch (err) {
        console.log('no delegate membereventrecords', err)
        return true
    }

    // update delegator
    if(delegatorAccount && delegatorAccount.length > 0 && memberEventRecord){
       
        // Update an existing member- updating delegations
        let i = 0
        while (i < memberEventRecord.events.length){
            if(memberEventRecord.events[i].delegateKey == delegatorAccount[0].delegateKey){
                let updatedMemberRecord = {
                    memberId: memberEventRecord.events[i].memberId,
                    contractId: contractId,
                    delegateKey: delegatorAccount[0].delegateKey,
                    shares: delegatorAccount[0].shares,
                    delegatedShares: delegatorAccount[0].delegatedShares,
                    receivedDelegations: delegatorAccount[0].receivedDelegations,
                    loot: delegatorAccount[0].loot,
                    existing: delegatorAccount[0].existing,
                    roles: delegatorAccount[0].roles, 
                    reputation: delegatorAccount[0].reputation,
                    highestIndexYesVote: delegatorAccount[0].highestIndexYesVote,
                    jailed: delegatorAccount[0].jailed,
                    joined: parseInt(delegatorAccount[0].joined),
                    updated: parseInt(delegatorAccount[0].updated),
                    active: delegatorAccount[0].active
                    }

                memberEventRecord.events[i] = updatedMemberRecord

                try {
                    await curDaoIdx.set('members', memberEventRecord)
                    delegatorLogged = true
                    break
                } catch (err) {
                    console.log('error updating delegator', err)
                }
            }
        i++
        }
    } else {
        // member doesn't exist so set to true so flag is updated, doesn't keep trying to log
        delegatorLogged = true    
    }

     // update receiver
     if(receiverAccount && receiverAccount.length > 0 && memberEventRecord){
       
        // Update an existing member- updating delegations
        let i = 0
        while (i < memberEventRecord.events.length){
            if(memberEventRecord.events[i].delegateKey == receiverAccount[0].delegateKey){
                let updatedMemberRecord = {
                    memberId: memberEventRecord.events[i].memberId,
                    contractId: contractId,
                    delegateKey: receiverAccount[0].delegateKey,
                    shares: receiverAccount[0].shares,
                    delegatedShares: receiverAccount[0].delegatedShares,
                    receivedDelegations: receiverAccount[0].receivedDelegations,
                    loot: receiverAccount[0].loot,
                    existing: receiverAccount[0].existing,
                    highestIndexYesVote: receiverAccount[0].highestIndexYesVote,
                    jailed: receiverAccount[0].jailed,
                    roles: receiverAccount[0].roles,
                    reputation: receiverAccount[0].reputation,
                    joined: parseInt(receiverAccount[0].joined),
                    updated: parseInt(receiverAccount[0].updated),
                    active: receiverAccount[0].active
                    }

                memberEventRecord.events[i] = updatedMemberRecord

                try {
                    await curDaoIdx.set('members', memberEventRecord)
                    receiverLogged = true
                    break
                } catch (err) {
                    console.log('error updating receiver', err)
                }
            }
        i++
        }
    } else {
        // member doesn't exist so set to true so flag is updated, doesn't keep trying to log
        receiverLogged = true    
    }

    if(delegatorLogged && receiverLogged){
        return true
    } else {
        return false
    }
}

// Logs a new Proposal Event
export async function logProposalEvent(curDaoIdx, daoContract, proposalId, contractId, transactionHash) {
    console.log('trans hash', transactionHash)
    let logged = false
    let dataLogged = false

    let proposal
    try{
        proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})
        console.log('near proposal', proposal)

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

        // Log Proposal Data
        let proposalDataRecord = await curDaoIdx.get('proposalData', curDaoIdx.id)
        if(!proposalDataRecord){
            proposalDataRecord = { data: [] }
        }
        
        // Individual Proposal Event
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
            voteFinalized: parseInt(proposal.voteFinalized),
            submitTransactionHash: transactionHash,
            configuration: proposal.configuration,
            referenceIds: proposal.referenceIds
            }

            proposalEventRecord.events.push(indivProposalRecord)
         

            try {
                await curDaoIdx.set('proposals', proposalEventRecord)
                logged = true
            } catch (err) {
                console.log('error logging proposal', err)
            }

            // Associated Proposal Data to Log

            let dataObject = {
                proposalId: proposalId,
                transactionHash: transactionHash,
                proposalAdded: parseInt(proposal.pS),
                proposer: proposal.p,
                applicant: proposal.a,
                sharesRequested: proposal.sR,
                lootRequested: proposal.lR,
                tributeOffered: proposal.tO,
                tributeToken: proposal.tT,
                paymentRequested: proposal.pR,
                paymentToken: proposal.pT,
                proposalType: proposal.f, //will need to derive type from the flags array in any queries,
                updated: Date.now()
            }

            let individualDataRecord = {
                dataType: 'newProposal',
                contractId: contractId,
                data: dataObject
            }

            proposalDataRecord.data.push(individualDataRecord)
            console.log('proposalData.data', proposalDataRecord.data)

            try {
                await curDaoIdx.set('proposalData', proposalDataRecord)
                dataLogged = true
            } catch (err) {
                console.log('error logging proposal data', err)
            }
    }

    if(logged && dataLogged){
        // Discord Integration
        // 6 is member, 7 is funding, none is payout?
        if(proposal.f[6]){
            let data = {
                applicant: proposal.a,
                url: window.location.href
            }
            try {
              
                sendMessage('New member application received for ' + proposal.a, 'Member', 'proposal', data, curDaoIdx)
            } catch (err) {
                console.log('error sending notification', err)
            }
            
        } 
        else if(proposal.f[7]){
            let data = {
                applicant: proposal.a,
                url: window.location.href
            }
            try{
                
                sendMessage(proposal.a + " has requested a funding commitment of " + proposal.pR + " NEAR", 'Funding',
                'proposal', data, curDaoIdx)
            } catch (err) {
                console.log('error sending notification', err)
            }
        }
        else if(proposal.f[10]){
            let data = {
                applicant: proposal.a,
                url: window.location.href
            }
            try{
               
                sendMessage(proposal.a + " has requested a configuration change to " + proposal.configuration, data, curDaoIdx)
            } catch (err) {
                console.log('error sending notification', err)
            }
        }
        else if(proposal.f[8]){
            let data = {
                applicant: proposal.a,
                url: window.location.href
            }
            try{
               
                sendMessage(proposal.a + " has submitted an opportunity", "", data, curDaoIdx)
            } catch (err) {
                console.log('error sending notification', err)
            }
        }
        else{
            let data = {
                applicant: proposal.a,
                url: window.location.href
            }
            try {
              
                sendMessage(proposal.a + " has requested a payout of " + proposal.pR + " NEAR", 'Payout', 'proposal',
                data, curDaoIdx)
            } catch (err) {
                console.log('error sending notification', err)
            }
        }
        return true
    }
    else {
        return false
    }
}

// Logs a Process Event
export async function logProcessEvent(curDaoIdx, daoContract, contractId, proposalId, proposalType, transactionHash) {
   
    let processLogged = false
    let memberLogged = false
    let proposalDataLogged = false
    let memberDataLogged = false

    let proposal = await daoContract.getProposal({proposalId: proposalId})   

    if(proposal && curDaoIdx) {

        // Load existing proposal details
        let proposalRecords
        try{
            proposalRecords = await curDaoIdx.get('proposals', curDaoIdx.id)
        } catch (err) {
            console.log('problem loading proposal records', err)
        }

        // Log Proposal Data
        let proposalDataRecord = await curDaoIdx.get('proposalData', curDaoIdx.id)
        if(!proposalDataRecord){
            proposalDataRecord = { data: [] }
        }


        // Update an existing proposal
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
                        voteFinalized: parseInt(proposal.voteFinalized),
                        configuration: proposal.configuration,
                        referenceIds: proposal.referenceIds,
                        processTransactionHash: transactionHash ? transactionHash : '',
                        submitTransactionHash: proposalRecords.events[i].submitTransactionHash,
                        cancelTransactionHash: proposalRecords.events[i].cancelTransactionHash,
                        sponsorTransactionHash: proposalRecords.events[i].sponsorTransactionHash
                        }

                    proposalRecords.events[i] = updatedProposalRecord
                    try{
                        await curDaoIdx.set('proposals', proposalRecords)
                        processLogged = true
                        memberLogged = true
                    } catch (err) {
                        console.log('error logging process event', err)
                    }

                    // Associated Proposal Data to Log

                    let dataObject = {
                        proposalId: (proposal.pI).toString(),
                        processTime: Date.now(),
                        transactionHash: transactionHash,
                        proposalAdded: parseInt(proposal.pS),
                        proposer: proposal.p,
                        applicant: proposal.a,
                        sharesRequested: proposal.sR,
                        lootRequested: proposal.lR,
                        tributeOffered: proposal.tO,
                        tributeToken: proposal.tT,
                        paymentRequested: proposal.pR,
                        yesVote: proposal.yV,
                        noVote: proposal.nV,
                        paymentToken: proposal.pT,
                        proposalType: proposal.f, //will need to derive type from the flags array in any queries
                        updated: Date.now()
                    }

                    let individualDataRecord = {
                        dataType: 'processedProposal',
                        contractId: contractId,
                        data: dataObject
                    }

                    proposalDataRecord.data.push(individualDataRecord)
                 

                    try {
                        await curDaoIdx.set('proposalData', proposalDataRecord)
                        proposalDataLogged = true
                        memberDataLogged = true
                    } catch (err) {
                        console.log('error logging process proposal data', err)
                    }
                }
            i++
            }
        }
    }
    
    if(proposalType == 'Member' || proposalType == 'Tribute'){

        let member = await daoContract.getMemberInfo({member: proposal.a})
    
        let memberId = generateId()
       
        // Log Member Event
        let memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)
        if(!memberEventRecord){
            memberEventRecord = { events: [] }
        }

        // Log Member Data
        let memberDataRecord = await curDaoIdx.get('memberData', curDaoIdx.id)
        if(!memberDataRecord){
            memberDataRecord = { data: [] }
        }

        let memberExists = false
        if(memberEventRecord && memberEventRecord.events.length > 0){
            let k = 0
            while(k < memberEventRecord.events.length){
                if(member[0].delegateKey == memberEventRecord.events[k].delegateKey){
                    memberExists = true
                    break
                }
                k++
            }
            
        }

        if(member.length > 0 && !memberExists){
            
            let indivMemberEventRecord = {
                memberId: memberId,
                contractId: contractId,
                delegateKey: member[0].delegateKey,
                shares: member[0].shares,
                delegatedShares: member[0].delegatedShares,
                receivedDelegations: member[0].receivedDelegations,
                loot: member[0].loot,
                existing: member[0].existing,
                highestIndexYesVote: member[0].highestIndexYesVote,
                roles: member[0].roles,
                reputation: member[0].reputation,
                jailed: member[0].jailed,
                joined: parseInt(member[0].joined),
                updated: parseInt(member[0].updated),
                active: member[0].active
            }

            memberEventRecord.events.push(indivMemberEventRecord)
         
                
            try {
            await curDaoIdx.set('members', memberEventRecord)
            memberLogged = true
            processLogged = true
            } catch (err) {
                console.log('error adding new member', err)
            }

                // Associated Member Data to Log

                let dataObject = {
                memberId: memberId,
                joined: parseInt(member[0].joined),
                transactionHash: transactionHash,
                shares: member[0].shares,
                delegatedShares: member[0].delegatedShares,
                receivedDelegations: member[0].receivedDelegations,
                loot: member[0].loot,
                proposer: proposal.p,
                applicant: proposal.a
            }

            let individualDataRecord = {
                dataType: 'newMember',
                contractId: contractId,
                data: dataObject
            }

            memberDataRecord.data.push(individualDataRecord)
 

            try {
                await curDaoIdx.set('memberData', memberDataRecord)
                memberDataLogged = true
                proposalDataLogged = true
            } catch (err) {
                console.log('error logging new member data', err)
            }
            
        } else {
            if(member.length > 0 && memberExists){
            // Update an existing member
            let i = 0
            while (i < memberEventRecord.events.length){
                if(memberEventRecord.events[i].delegateKey == member[0].delegateKey){
                    let updatedMemberRecord = {
                        memberId: memberEventRecord.events[i].memberId,
                        contractId: contractId,
                        delegateKey: member[0].delegateKey,
                        shares: member[0].shares,
                        delegatedShares: member[0].delegatedShares,
                        receivedDelegations: member[0].receivedDelegations,
                        loot: member[0].loot,
                        existing: member[0].existing,
                        highestIndexYesVote: member[0].highestIndexYesVote,
                        roles: member[0].roles,
                        reputation: member[0].reputation,
                        jailed: member[0].jailed,
                        joined: parseInt(member[0].joined),
                        updated: parseInt(member[0].updated),
                        active: member[0].active
                        }

                    memberEventRecord.events[i] = updatedMemberRecord

                    try {
                        await curDaoIdx.set('members', memberEventRecord)
                        memberLogged = true
                        processLogged = true
                      
                    } catch (err) {
                        console.log('error updating member', err)
                    }

                     // Associated Member Data to Log (Member Changes)
                    let dataObject = {
                        memberId: memberEventRecord.events[i].memberId,
                        joined: parseInt(member[0].joined),
                        transactionHash: transactionHash,
                        shares: member[0].shares,
                        delegatedShares: member[0].delegatedShares,
                        receivedDelegations: member[0].receivedDelegations,
                        loot: member[0].loot,
                        proposer: proposal.p,
                        applicant: proposal.a,
                        active: member[0].active,
                        changeTime: parseInt(member[0].updated)
                    }
                  
                   
                    let individualDataRecord = {
                        dataType: 'changeMember',
                        contractId: contractId,
                        data: dataObject
                    }

                    memberDataRecord.data.push(individualDataRecord)
                  
                    try {
                        await curDaoIdx.set('memberData', memberDataRecord)
                        memberDataLogged = true
                        proposalDataLogged = true
                        break
                    } catch (err) {
                        console.log('error logging change member data', err)
                    }
                }
            i++
            }
            } 
        } 
    }
  
    if(processLogged && memberLogged && memberDataLogged && proposalDataLogged){
        let data = {
            applicant: proposal.a,
            url: window.location.href
        }
        try {
            sendMessage(proposal.a+"'s Proposal "+proposalId + " has been processed", "Processing", "process", data, curDaoIdx)
            return true
        } catch (err) {
            console.log('error sending notification', err)
        }
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

     // Log Vote Data
     let votingDataRecord = await curDaoIdx.get('votingData', curDaoIdx.id)
     if(!votingDataRecord){
         votingDataRecord = { data: [] }
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
                    voteFinalized: parseInt(proposal.voteFinalized),
                    configuration: proposal.configuration,
                    referenceIds: proposal.referenceIds,
                    submitTransactionHash: proposalRecords.events[i].submitTransactionHash,
                    cancelTransactionHash: proposalRecords.events[i].cancelTransactionHash,
                    processTransactionHash: proposalRecords.events[i].processTransactionHash,
                    sponsorTransactionHash: proposalRecords.events[i].sponsorTransactionHash
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
       
        
        let member
        try{
            member = await daoContract.getMemberInfo({member: accountId})
        } catch (err) {
            console.log('error retrieving member info', member)
        }

        let memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)

        let memberId = generateId()

         // Update the existing voting member
         let memberExists
         let j = 0
         while (j < memberEventRecord.events.length){
          
             if(memberEventRecord.events[j].delegateKey == member[0].delegateKey){
                 let updatedMemberRecord = {
                    memberId: memberId,
                    contractId: contractId,
                    delegateKey: member[0].delegateKey,
                    shares: member[0].shares,
                    delegatedShares: member[0].delegatedShares,
                    receivedDelegations: member[0].receivedDelegations,
                    loot: member[0].loot,
                    existing: member[0].existing,
                    highestIndexYesVote: member[0].highestIndexYesVote,
                    roles: member[0].roles,
                    reputation: member[0].reputation,
                    jailed: member[0].jailed,
                    joined: parseInt(member[0].joined),
                    updated: parseInt(member[0].updated),
                    active: member[0].active
                     }
                 memberEventRecord.events[j] = updatedMemberRecord

                 try{
                    let memberlog = await curDaoIdx.set('members', memberEventRecord)
                
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
export async function logSponsorEvent (curDaoIdx, daoContract, contractId, proposalId, transactionHash) {

    let logged = false
    let sponsorDataLogged = false

    let proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})

     // Log Proposal Data
     let proposalDataRecord = await curDaoIdx.get('proposalData', curDaoIdx.id)
     if(!proposalDataRecord){
         proposalDataRecord = { data: [] }
     }

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
                voteFinalized: parseInt(proposal.voteFinalized),
                configuration: proposal.configuration,
                referenceIds: proposal.referenceIds,
                submitTransactionHash: proposalRecords.events[i].submitTransactionHash,
                cancelTransactionHash: proposalRecords.events[i].cancelTransactionHash,
                processTransactionHash: proposalRecords.events[i].processTransactionHash,
                sponsorTransactionHash: transactionHash
                }
            proposalRecords.events[i] = updatedProposalRecord

            try{
                await curDaoIdx.set('proposals', proposalRecords)
                exists = true
                logged = true
            } catch (err) {
                console.log('error logging sponsor event', err)
            }

             // Associated Proposal Data to Log

             let dataObject = {
                proposalId: (proposal.pI).toString(),
                sponsorTime: Date.now(),
                transactionHash: transactionHash,
                proposalAdded: parseInt(proposal.pS),
                proposer: proposal.p,
                applicant: proposal.a,
                sharesRequested: proposal.sR,
                lootRequested: proposal.lR,
                tributeOffered: proposal.tO,
                tributeToken: proposal.tT,
                paymentRequested: proposal.pR,
                yesVote: proposal.yV,
                noVote: proposal.nV,
                paymentToken: proposal.pT,
                proposalType: proposal.f, //will need to derive type from the flags array in any queries
                updated: Date.now()
            }

            let individualDataRecord = {
                dataType: 'sponsoredProposal',
                contractId: contractId,
                data: dataObject
            }

            proposalDataRecord.data.push(individualDataRecord)
         
            try {
                await curDaoIdx.set('proposalData', proposalDataRecord)
                sponsorDataLogged = true
            } catch (err) {
                console.log('error logging process proposal data', err)
            }
        }
        i++
        }
    }
    if(logged  && sponsorDataLogged){
        let data = {
            applicant: proposal.a,
            url: window.location.href
        }
        try {
            sendMessage(proposal.a + "'s proposal " + proposalId + " has been sponsored by " + proposal.s
            , "Sponsorship", "sponsor", data, curDaoIdx)
            return true
        } catch (err) {
            console.log('error sending notification', err)
        }
    } else {
        return false
    }
}

// Logs a new Cancel Event
export async function logCancelEvent (curDaoIdx, daoContract, contractId, proposalId, transactionHash) {

    let cancelled = false
    let cancelDataLogged = false

    let proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})

     // Log Proposal Data
     let proposalDataRecord = await curDaoIdx.get('proposalData', curDaoIdx.id)
     if(!proposalDataRecord){
         proposalDataRecord = { data: [] }
     }

    if(proposal && curDaoIdx) {
        // Load existing proposal details
        let proposalRecords = await curDaoIdx.get('proposals', curDaoIdx.id)
     
        
        // Update the proposal
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
                    voteFinalized: parseInt(proposal.voteFinalized),
                    configuration: proposal.configuration,
                    referenceIds: proposal.referenceIds,
                    cancelTransactionHash: transactionHash,
                    submitTransactionHash: proposalRecords.events[i].submitTransactionHash,
                    processTransactionHash: proposalRecords.events[i].processTransactionHash,
                    sponsorTransactionHash: transactionHash
                    }
            
                proposalRecords.events[i] = updatedProposalRecord

                try{
                    await curDaoIdx.set('proposals', proposalRecords)
                    cancelled = true
                } catch (err) {
                    console.log('error logging cancel event', err)
                }

                // Associated Proposal Data to Log

             let dataObject = {
                proposalId: (proposal.pI).toString(),
                sponsorTime: Date.now(),
                transactionHash: transactionHash,
                proposalAdded: parseInt(proposal.pS),
                proposer: proposal.p,
                applicant: proposal.a,
                sharesRequested: proposal.sR,
                lootRequested: proposal.lR,
                tributeOffered: proposal.tO,
                tributeToken: proposal.tT,
                paymentRequested: proposal.pR,
                yesVote: proposal.yV,
                noVote: proposal.nV,
                paymentToken: proposal.pT,
                proposalType: proposal.f, //will need to derive type from the flags array in any queries
                updated: Date.now()
            }

            let individualDataRecord = {
                dataType: 'cancelledProposal',
                contractId: contractId,
                data: dataObject
            }

            proposalDataRecord.data.push(individualDataRecord)
          

            try {
                await curDaoIdx.set('proposalData', proposalDataRecord)
                cancelDataLogged = true
            } catch (err) {
                console.log('error logging cancel proposal data', err)
            }
            }
        i++
        }
    }
    if(cancelled && cancelDataLogged){
        return true
    } else {
        return false
    }
}

// Logs a new Donation Event
export async function logDonationEvent (curDaoIdx, daoContract, donationId, contractId, transactionHash) {

    let logged = false
    let donationDataLogged = false

    let donation
    try{
        donation = await daoContract.getDonation({donationId: parseInt(donationId)})
    } catch (err) {
        console.log('error retrieving donation for this id', err)
    }

     // Log Proposal Data
     let proposalDataRecord = await curDaoIdx.get('proposalData', curDaoIdx.id)
     if(!proposalDataRecord){
         proposalDataRecord = { data: [] }
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
            donation: parseInt(donation.donation),
            transactionHash: transactionHash
            }

            donationEventRecord.donations.push(indivDonationRecord)
         
            try {
                await curDaoIdx.set('donations', donationEventRecord)
                logged = true
            } catch (err) {
                console.log('error logging donation', err)
            }

            // Associated Proposal Data to Log

            let dataObject = {
                donationId: (donation.donationId).toString(),
                contractId: contractId,
                contributor: donation.contributor,
                contributed: parseInt(donation.contributed),
                donation: parseInt(donation.donation),
                donated: Date.now()
            }

            let individualDataRecord = {
                dataType: 'donation',
                contractId: contractId,
                data: dataObject
            }

            proposalDataRecord.data.push(individualDataRecord)
     

            try {
                await curDaoIdx.set('proposalData', proposalDataRecord)
                donationDataLogged = true
            } catch (err) {
                console.log('error logging donation proposal data', err)
            }
            
    }

    if(logged && donationDataLogged){
        return true
    } else {
        return false
    }
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

export function generateId() {
    let buf = Math.random([0, 999999999])
    let b64 = btoa(buf);
    return b64.toString()
}