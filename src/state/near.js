import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'
import { APP_OWNER_ACCOUNT, ceramic } from '../utils/ceramic'
import { factory } from '../utils/factory'
import { tokenFactory } from '../utils/tokenFactory'
import { ft } from '../utils/ft'
import { dao } from '../utils/dao'
import { registry } from '../utils/registry'
import { config } from './config'
import { queries } from '../utils/graphQueries'

const axios = require('axios').default

export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, FACTORY_DEPOSIT, DAO_FIRST_INIT, 
    CURRENT_DAO, REDIRECT, FT_FIRST_INIT, NEW_PROPOSAL, NEW_PROPOSAL_TRIGGER, NEW_MEMBER_PROPOSAL, NEW_SPONSOR, NEW_CANCEL, KEY_REDIRECT, OPPORTUNITY_REDIRECT, NEW_PROCESS, NEW_VOTE, 
    DASHBOARD_ARRIVAL, DASHBOARD_DEPARTURE, WARNING_FLAG, PERSONAS_ARRIVAL, EDIT_ARRIVAL, COMMUNITY_ARRIVAL, 
    NEW_DONATION, NEW_EXIT, NEW_RAGE, NEW_DELEGATION, OPPORTUNITY_NOTIFICATION, PROPOSAL_NOTIFICATION, TOKEN_FACTORY_DEPOSIT,
    NEW_NOTIFICATIONS, IPFS_PROVIDER, PLATFORM_SUPPORT_ACCOUNT, STORAGE,
    NEW_REVOCATION, INACTIVATE_COMMUNITY, NEW_INACTIVATION, NEW_CHANGE_PROPOSAL,
    networkId, nodeUrl, walletUrl, nameSuffix, factorySuffix, tokenFactorySuffix, nftFactorySuffix, explorerUrl,
    contractName, didRegistryContractName, factoryContractName, tokenFactoryContractName,
    REGISTRY_API_URL, FIRST_TIME, PLATFORM_PERCENT, daoRootName, guildsRootName, personasRootName
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

let url = window.location.pathname
let pathArray = url.split('/')
let contractId
for(let x = 0; x < pathArray.length; x++){
    if(pathArray[x].includes(factorySuffix)){
        contractId = pathArray[x]
    }
}

export const initNear = () => async ({ update, getState, dispatch }) => {
    console.log('here')
    let finished = false

  

    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    });

    console.log('near', near)

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
        wallet.requestSignIn({
            contractId: contractName,
            title: 'Catalyst',
        })
        
        window.location.assign('/')
    }

    wallet.signedIn = wallet.isSignedIn()
    if (wallet.signedIn) {
        wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2)
        update('',{balance: wallet.balance})
    }

    const contract = new nearAPI.Contract(wallet.account(), contractName, {
        changeMethods: ['send', 'create_account', 'create_account_and_claim'],
    })

    // initiate global contracts
    const daoFactory = await factory.initFactoryContract(wallet.account())
    const ftFactory = await tokenFactory.initTokenFactoryContract(wallet.account())
    const didRegistryContract = await registry.initiateDidRegistryContract(wallet.account())

    wallet.isAccountTaken = async (accountId) => {
        const accountTaken = await isAccountTaken(accountId + nameSuffix)
        update('app', { accountTaken, wasValidated: true })
    }

    wallet.isToken = async (accountId) => {
        const accountTaken = await isAccountTaken(accountId)
        update('app', { accountTaken, wasValidated: true })
    }

    wallet.isDaoAccountTaken = async (accountId) => {
        const accountTaken = await isAccountTaken(accountId + factorySuffix)
        update('app', { accountTaken, wasValidated: true })
    }

    wallet.isRegistrationAccountValid = async (accountId) => {
        const accountTaken = await isAccountTaken(accountId + nameSuffix)
        update('app', { accountTaken, wasValidated: true })
    }

    wallet.isFTAccountTaken = async (accountId) => {
        const accountTaken = await isAccountTaken(accountId + tokenFactorySuffix)
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
        let publicKey = keyPair.getPublicKey().toString().split(':')[1]
        let state = getState()

        let upLinks = await ceramic.downloadKeysSecret(state.curUserIdx, 'accountsKeys')
      
            upLinks.push({ key: keyPair.secretKey, publicKey: publicKey, accountId: accountId, owner: owner, keyStored: Date.now() })
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
     
        const keyPair = KeyPair.fromRandom('ed25519')
        let publicKey = keyPair.getPublicKey().toString().split(':')[1]
        let state = getState()

        let upLinks = await ceramic.downloadKeysSecret(state.appIdx, 'daoKeys')
            
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
                
                let contractAccount = new nearAPI.Account(state.near.connection, accountId)
                let curDaoIdx = await ceramic.getCurrentDaoIdx(contractAccount, state.appIdx, state.didRegistryContract, keyPair.secretKey)
               
                upLinks.push({ 
                    key: keyPair.secretKey, 
                    publicKey: publicKey, 
                    contractId: accountId, 
                    summoner: summoner, 
                    created: Date.now(),
                    did: curDaoIdx.id,
                    status: 'active'
                })
                let result = await ceramic.storeKeysSecret(state.appIdx, upLinks, 'daoKeys')
                let link = '/dao/' + accountId
                set(REDIRECT, {action: true, link: link})

                if(result){
                    console.log('did', curDaoIdx.id)
                    await daoFactory.createDAO({ accountId: accountId, did: curDaoIdx.id, deposit: FACTORY_DEPOSIT}, GAS, parseNearAmount(FACTORY_DEPOSIT))
                }
                
            }
        } catch (err) {
            console.log('error setting up new Dao', err)
        }
        
    }

    wallet.fundFTAccount = async (accountId, creator) => {
        
        if (accountId.indexOf(tokenFactorySuffix) > -1 || accountId.indexOf('.') > -1) {
            alert(tokenFactorySuffix + ' is added automatically and no "." is allowed. Please remove and try again.')
            return update('app.wasValidated', true)
        }

        accountId = accountId + tokenFactorySuffix
        if (parseFloat(TOKEN_FACTORY_DEPOSIT, 10) < 0.1 || accountId.length < 2 || accountId.length > 48) {
            return update('app.wasValidated', true)
        }

        let ftCreated = await isAccountTaken(accountId)

            const keyPair = KeyPair.fromRandom('ed25519')
            let publicKey = keyPair.getPublicKey().toString().split(':')[1]
            let state = getState()

            let upLinks = await ceramic.downloadKeysSecret(state.appIdx, 'ftKeys')
          
            const ftInit = get(FT_FIRST_INIT, [])

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
                    upLinks.push({ key: keyPair.secretKey, publicKey: publicKey, contractId: accountId, creator: creator, created: Date.now() })
                    let result = await ceramic.storeKeysSecret(state.appIdx, upLinks, 'ftKeys')

                    let link = '/ft/' + accountId
                    set(REDIRECT, {action: true, link: link})
                    console.log('ftfactory', ftFactory)
                    if(result){
                        await ftFactory.createToken({ accountId: accountId, deposit: TOKEN_FACTORY_DEPOSIT}, GAS, parseNearAmount(TOKEN_FACTORY_DEPOSIT))
                    }
                 
                }
            } catch (err) {
                console.log('error setting up new Dao', err)
            }
        
    }

    if(wallet.signedIn){
   
        console.log('made it here')
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

    // ********* Initiate wallet account ************

    const account = wallet.account()
    const accountId = account.accountId
    
    // // ********* Get Registry Admin ****************
    // let superAdmin = await didRegistryContract.getSuperAdmin()
    // let admins = await didRegistryContract.getAdmins()

    //Initiate App Ceramic Components

    const appIdx = await ceramic.getAppIdx(didRegistryContract, account)
    console.log('appidx', appIdx)

    const updateCurUserPersonaState = async (didRegistryContract, daoFactory, appIdx, accountId) => {
        const imageName = require('../img/default-profile.png') // default no-image avatar
        const logoName = require('../img/default_logo.png') // default no-logo image
        let accountType
        try{
            accountType = await didRegistryContract.getType({accountId: accountId})
            if(accountType == 'none' || !accountType){
                finished = true
                update('', {finished, accountType})
                window.location.assign('/choice')
            }
            update('', {accountType})
        } catch (err) {
            window.location.assign('/choice')
            console.log('account not registered, no type avail', err)
        }
    
        // Current User
        let curUserDid = await ceramic.getDid(accountId, daoFactory, didRegistryContract)
        if(accountType != 'guild') {
            let result = await appIdx.get('profile', curUserDid)
            console.log('indiv result', result)
            if(result){
                result.avatar ? update('', {curUserAvatar: result.avatar}) : update('', {curUserAvatar: imageName})
                result.name ? update('', {curUserName: result.name}) : update('', {curUserName: ''})
                result.profileNft ? update('', {pfpCurUserAvatar: result.profileNftavatar}) : update('', {pfpCurUserAvatar: ''})
            }
        } else {
            if(accountType == 'guild'){
                let result = await appIdx.get('guildProfile', curUserDid)
                console.log('guild result', result)
                if(result){
                    result.logo ? update('', {curUserLogo: result.logo}) : update('', {curUserLogo: logoName})
                    result.name ? update('', {curUserName: result.name}) : update('', {curUserName: ''})
                    result.profileNft ? update('', {pfpCurUserLogo: result.profileNft}) : update('', {pfpCurUserLogo: ''})
                }
            }
        }
    }
    
    try{
        await updateCurUserPersonaState(didRegistryContract, daoFactory, appIdx, accountId)
    } catch (err){
        console.log('error updating cur user persona', err)
    }

    // let curUserIdx = await ceramic.getUserIdx(account, appIdx, daoFactory, didRegistryContract)
    // console.log('curuseridx', curUserIdx)

    // ********* All Announcements ****************
    try{
        let announcements = await ceramic.downloadKeysSecret(appIdx, 'announcementList')
        update('', {announcements: announcements})
        console.log('announcements', announcements)
    } catch (err) {
        console.log('problem getting all announcements', err)
    }

    let did
    try{
        did = await didRegistryContract.getDID({accountId: accountId})
    } catch (err) {
        console.log('error getting did', err)
    }


    let verificationStatus
    try{
        verificationStatus = await didRegistryContract.getVerificationStatus({accountId: accountId})
    } catch (err) {
        verificationStatus = false
        console.log('problem getting verification status', err)
    }

    // ******** IDX Initialization *********

    //Initiate App Ceramic Components

    //const appIdx = await ceramic.getAppIdx(didRegistryContract, account, near)
   
    // Create Current Arrays of Current and Inactive Communities
    let t = 0
    let start = 0
    let end = 0
    let interval = 20
    let currentDaosList = []
    let inactiveDaosList = []

    let legacyDaos = []
    legacyDaos.push({
        contractId: 'para.cdao.near',
        created: '1634411242799816834',
        did: null,
        status: 'active',
        summoner: 'aaron.near'
    })
    legacyDaos.push({
        contractId: 'vpacademy.cdao.near',
        created: '1634339086663097589',
        did: null,
        status: 'active',
        summoner: 'vpacademy.near'
    })
    legacyDaos.push({
        contractId: 'vpointai.cdao.near',
        created: '1634332537487845794',
        did: null,
        status: 'active',
        summoner: 'aaron.near'
    })

    try {
        let communities = await queries.getAllCommunities()
        console.log('all communities', communities)
      //let currentDaosList = await updateCurrentCommunities()
        if(networkId == 'mainnet'){
           currentDaosList = legacyDaos.concat(communities.data.createDAOs)
         //currentDaosList = legacyDaos.concat(currentDaosList)
        } 
        else {
            for(let x = 0; x < communities.data.createDAOs.length; x++){
                if(communities.data.createDAOs[x].status == 'active'){
                    currentDaosList.push(communities.data.createDAOs[x])
                }
                if(communities.data.createDAOs[x].status == 'inactive'){
                    inactiveDaosList.push(communities.data.createDAOs[x])
                }
            }
        }
    } catch (err) {
        console.log('error creating currentDaosList', err)
        // backup in event graph is down
        let currentDaosLength = await daoFactory.getDaoListLength() 
       
        while(t < currentDaosLength){
            if(currentDaosLength < interval){
                end = currentDaosLength
            }
            let newDaoList = await daoFactory.getDaoList({start: start, end: end})
            for(let i = 0; i < newDaoList.length; i++){
                if(newDaoList[i].status == 'active'){
                    currentDaosList.push(newDaoList[i])
                }
                if(newDaoList[i].status == 'inactive'){
                    inactiveDaosList.push(newDaoList[i])
                }
            }
            start = end
            if(end + interval > currentDaosLength){
                end = currentDaosLength
            } else {
            end = end + interval
            }
            t++   
        }
    }
    console.log('currentdaoslist', currentDaosList)
    console.log('inactivedaoslist', inactiveDaosList)

    let currentActiveDaos = await updateCurrentCommunities()
    console.log('active daos', currentActiveDaos)

    // Get List of Current Fungible Tokens
    let v = 0
    let ftStart = 0
    let ftEnd = 0
    let ftInterval = 20
    let currentTokensList = []

    try {
        let currentTokensLength = await ftFactory.getTokenListLength()
        while(v < currentTokensLength){
            if(currentTokensLength < ftInterval){
                ftEnd = currentTokensLength
            }
            let newTokensList = await ftFactory.getTokenList({start: ftStart, end: ftEnd})
            for(let i = 0; i < newTokensList.length; i++){
                currentTokensList.push(newTokensList[i])
            }
            ftStart = ftEnd
            if(ftEnd + ftInterval > currentTokensLength){
                ftEnd = currentTokensLength
            } else {
            ftEnd = ftEnd + ftInterval
            }
            v++        
        }
    } catch (err) {
        console.log('error creating currentTokensList', err)
    }

    // let curUserIdx = await ceramic.getCurrentUserIdx(account, appIdx, near, didRegistryContract, daoFactory)
    // let did
    // if (curUserIdx) {
    //     did = curUserIdx.id
    // }
    
    // let registeredDid = await ceramic.getDid(account.accountId, daoFactory, didRegistryContract )
    // if(registeredDid){
    //     did = registeredDid
    // }

    if(didRegistryContract && near && wallet){

        if(contractId){
          let thisCurDaoIdx
          let daoAccount
          let contract
          console.log('contractId', contractId)
          try{
            daoAccount = new nearAPI.Account(near.connection, contractId)
          } catch (err) {
            console.log('no account', err)
            return false
          }
          
          try{
            thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
            console.log('this appcurdaoidx', thisCurDaoIdx)
          } catch (err) {
            console.log('problem getting curdaoidx', err)
            return false
          }
          
          try{
            contract = await dao.initDaoContract(wallet.account(), contractId)
          } catch (err) {
            console.log('problem initializing dao contract', err)
            return false
          }
          console.log('contract', contract)
          update('', {
            curDaoIdx: thisCurDaoIdx,
            daoAccount: daoAccount,
            contract: contract
          })
          
        }
    }

    update('', { 
        did,
        ftFactory, 
        currentTokensList, 
        didRegistryContract, 
        appIdx, 
        account, 
        accountId, 
        daoFactory, 
        currentDaosList,
        currentActiveDaos,
        inactiveDaosList })

    //curUserIdx ? await synchAccountLinks(curUserIdx) : null

    finished = true

    update('', { near, wallet, finished })

    }
    
    finished = true

    update('', { near, wallet, finished })
}


export async function login() {
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    });
    const connection = new nearAPI.WalletConnection(near)
    connection.requestSignIn(contractName, 'Catalyst')
}

export async function logout() {
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    })
    const connection = new nearAPI.WalletConnection(near)
    connection.signOut()
    window.location.replace('/')
}

export async function logoutToWallet() {
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    })
    const connection = new nearAPI.WalletConnection(near)
    connection.signOut()
    window.location.replace(walletUrl)
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
    console.log('key rotate appidx', state.appIdx)
    const keyPair = KeyPair.fromString(key)
    let thisPublicKey = keyPair.getPublicKey().toString().split(':')[1]
    const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair)
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
    })
    const account = new nearAPI.Account(near.connection, accountId)
    const accessKeys = await account.getAccessKeys()

    let upLinks = await ceramic.downloadKeysSecret(curUserIdx, 'accountsKeys')
   
    let b = 0
    let exists = false
    while(b < upLinks.length){
        if(upLinks[b].accountId == accountId){
            let modifiedAccount = {
                key: key,
                publicKey: publicKey,
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
        upLinks.push({ key: key.secretKey, publicKey: thisPublicKey, accountId: accountId, owner: owner, keyStored: Date.now() })
    }
    await ceramic.storeKeysSecret(curUserIdx, upLinks, 'accountsKeys')
    set(ACCOUNT_LINKS, upLinks)            
    
    const actions = [
        deleteKey(PublicKey.from(accessKeys[0].public_key)),
        addKey(PublicKey.from(publicKey), fullAccessKey())
    ]
   
    set(SEED_PHRASE_LOCAL_COPY, seedPhrase)

    const result = await account.signAndSendTransaction(accountId, actions)
 //   let did = await ceramic.makeDID(curUserIdx.ceramic, account, near, state.appIdx)
    return result
}

// Initializes a DAO by setting its key components
export async function initDao(wallet, contractId, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, voteThreshold, shares, summonerContribution, platformPercent) {

    try {
        const daoContract = await dao.initDaoContract(wallet.account(), contractId)

        // set trigger for first init to log summon and member events
        let firstInit = get(DAO_FIRST_INIT, [])
        firstInit.push({contractId: contractId, shares: shares, init: true })
        set(DAO_FIRST_INIT, firstInit)
       
        await daoContract.init({
            _approvedTokens: ['Ⓝ'],
            _periodDuration: parseInt(periodDuration),
            _votingPeriodLength: parseInt(votingPeriodLength),
            _gracePeriodLength: parseInt(gracePeriodLength),
            _proposalDeposit: parseNearAmount(proposalDeposit),
            _dilutionBound: parseInt(dilutionBound),
            _voteThreshold: parseInt(voteThreshold),
            _shares: shares,
            _contribution: parseNearAmount(summonerContribution),
            _platformSupportPercent: parseNearAmount(platformPercent),
            _platformAccount: PLATFORM_SUPPORT_ACCOUNT,
            _contractId: contractId
        }, GAS, parseNearAmount(summonerContribution))

    } catch (err) {
        console.log('init failed', err)
        return false
    }
    return true
}

// Initializes a FT by setting its key components
export async function initFT(wallet, contractId, name, symbol, icon, reference, referenceHash, decimals, maxSupply) {

    let metadata = {
        spec: 'ft-1.0.0',
        name: name,
        symbol: symbol,
        icon: icon,
        reference: reference,
        reference_hash: referenceHash,
        decimals: parseInt(decimals),
    }

    try {
        const ftContract = await ft.initFTContract(wallet.account(), contractId)

        // set trigger for first init to log token summon event
        let firstFTInit = get(FT_FIRST_INIT, [])
        firstFTInit.push({contractId: contractId, metadata: metadata, maxSupply: maxSupply, creationTime: Date.now(), init: true })
        set(FT_FIRST_INIT, firstFTInit)
       
        await ftContract.init_token({
            metadata: metadata,
            max_supply: parseNearAmount(maxSupply)
        }, GAS)

    } catch (err) {
        console.log('init FT failed', err)
        return false
    }
    return true
}

// Submits new DAO settings from summoner if only member
export async function changeDao(wallet, contractId, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, voteThreshold, platformPercent, platformAccount) {

    try {
        const daoContract = await dao.initDaoContract(wallet.account(), contractId)
        
        await daoContract.setInit({
            _periodDuration: parseInt(periodDuration),
            _votingPeriodLength: parseInt(votingPeriodLength),
            _gracePeriodLength: parseInt(gracePeriodLength),
            _proposalDeposit: parseNearAmount(proposalDeposit),
            _dilutionBound: parseInt(dilutionBound),
            _voteThreshold: parseInt(voteThreshold),
            _platformSupportPercent: parseNearAmount(platformPercent),
            _platformAccount: platformAccount
        }, GAS)

    } catch (err) {
        console.log('change init failed', err)
        return false
    }
    return true
}

async function sendMessage(content, data, curDaoIdx){
    let request = new XMLHttpRequest()
    try{
        let hookArray = await ceramic.downloadKeysSecret(curDaoIdx, 'apiKeys')
  
        if(hookArray && Object.keys(hookArray).length != 0){
            let hook = hookArray[0].api
            if((data.type == 'proposal' && hookArray[0].discordActivation == true && hookArray[0].proposalActivation == true)
            || (data.type == "sponsor" && hookArray[0].discordActivation == true && hookArray[0].sponsorActivation == true)
            || (data.type == "process" && hookArray[0].discordActivation == true && hookArray[0].passedProposalActivation == true))
            {
                request.open("POST", `${hook}`)

                request.setRequestHeader('Content-type', 'application/json')

                    let embeddedData = {
                    author: {
                            name: 'Check It Out!',
                            url: data.url
                        }
                    }

                    let params = {
                        username: `${data.botName}`,
                        content: content,
                        embeds: [embeddedData]
                    }

                    request.send(JSON.stringify(params))
                    return true
            }
        }
    } catch (err) {
        console.log('notification error ', err)
    }
    return false
}

// Changes an amount or token type on an existing proposal
export async function submitProposalChange(wallet, contractId, proposalId, amount, token){
    const daoContract = await dao.initDaoContract(wallet.account(), contractId)

    // set trigger for to log change of proposal
    let changeProposal = get(NEW_CHANGE_PROPOSAL, [])
    changeProposal.push({contractId: contractId, proposalId: proposalId, fundingRequested: amount, fundingToken: token, new: true})
    set(NEW_CHANGE_PROPOSAL, changeProposal)

    try{
        await daoContract.changeAmount({
            proposalId: parseInt(proposalId),
            token: token,
            amount: parseNearAmount(amount)
            }, GAS )
        } catch (err) {
            console.log('change proposal failed', err)
            return false
        }
    return true
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
    references,
    token) {
   
    const daoContract = await dao.initDaoContract(wallet.account(), contractId)
    const proposalId = await daoContract.getProposalsLength()
    const rawProposalDeposit = await daoContract.getProposalDeposit()
    const proposalDeposit = formatNearAmount(rawProposalDeposit)
    const depositToken = await daoContract.getDepositToken()

    // set trigger for to log new proposal
    let newProposal = get(NEW_PROPOSAL, [])
    newProposal.push({contractId: contractId, proposalId: proposalId, new: true, type: proposalType})
    set(NEW_PROPOSAL, newProposal)

    switch(proposalType){
        case 'Member':
            try{               
            
            // set redirect for new member from an opportunity
            set(OPPORTUNITY_REDIRECT, {action: true, contractId: contractId})

            await daoContract.submitMemberProposal({
                applicant: applicant,
                sharesRequested: sharesRequested,
                lootRequested: loot,
                tributeOffered: parseNearAmount(tribute),
                tributeToken: depositToken,
                roleNames: ['member'],
                contractId: contractId
                }, GAS, parseNearAmount(((parseFloat(tribute) + parseFloat(proposalDeposit) + parseFloat(STORAGE)).toString())))
            } catch (err) {
                console.log('submit member proposal failed', err)
                return false
            }
            break
        case 'Tribute':
            try{
            await daoContract.submitTributeProposal({
                applicant: applicant,
                sharesRequested: sharesRequested,
                tributeOffered: parseNearAmount(tribute),
                tributeToken: depositToken,
                contractId: contractId
                }, GAS, parseNearAmount(((parseFloat(tribute) + parseFloat(proposalDeposit) + parseFloat(STORAGE)).toString())))
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
                    paymentRequested: parseNearAmount(paymentRequested),
                    paymentToken: depositToken,
                    referenceIds: references,
                    contractId: contractId
                    }, GAS, parseNearAmount( ( parseFloat(proposalDeposit) + parseFloat(STORAGE) ).toString() ))
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
                    }, GAS, parseNearAmount((parseFloat(proposalDeposit) + parseFloat(STORAGE)).toString()))
                } catch (err) {
                    console.log('submit configuration proposal failed', err)
                    return false
                }
                break
        case 'GuildKick':
            try{
                await daoContract.submitGuildKickProposal({
                    memberToKick: applicant,
                    contractId: contractId
                }, GAS, parseNearAmount((parseFloat(proposalDeposit) + parseFloat(STORAGE)).toString()))
                } catch (err) {
                    console.log('submit guild kick proposal failed', err)
                    return false
                }
                break
        case 'Whitelist':
            try{
                await daoContract.submitWhitelistProposal({
                    tokenToWhitelist: token,
                    depositToken: depositToken,
                    contractId: contractId
                }, GAS, parseNearAmount((parseFloat(proposalDeposit) + parseFloat(STORAGE)).toString()))
                } catch (err) {
                    console.log('submit whitelist proposal failed', err)
                    return false
                }
                break
        case 'Opportunity':
            try{
                await daoContract.submitOpportunityProposal({
                    applicant: applicant,
                    contractId: contractId
                    }, GAS, parseNearAmount((parseFloat(proposalDeposit) + parseFloat(STORAGE)).toString()))
                } catch (err) {
                    console.log('submit opportunity proposal failed', err)
                    return false
                }
                break
        case 'Payout':
            try{
                await daoContract.submitPayoutProposal({
                    applicant: applicant,
                    paymentRequested: parseNearAmount(paymentRequested),
                    paymentToken: depositToken,
                    referenceIds: references,
                    contractId: contractId
                    }, GAS, parseNearAmount((parseFloat(proposalDeposit) + parseFloat(STORAGE)).toString()))
                } catch (err) {
                    console.log('submit payout proposal failed', err)
                    return false
                }
                break
        case 'CancelCommit':
            try{
                await daoContract.submitCancelCommit({
                    applicant: applicant,
                    paymentRequested: parseNearAmount(paymentRequested),
                    paymentToken: depositToken,
                    referenceIds: references,
                    contractId: contractId
                    }, GAS, parseNearAmount((parseFloat(proposalDeposit) + parseFloat(STORAGE)).toString()))
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
       
        await daoContract.sponsorProposal({
            proposalId: proposalId,
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
                amount: parseNearAmount(donation)
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
export async function processProposal(daoContract, contractId, proposalId, proposalType, curDaoIdx, applicant) {

    try {
        // set trigger for to log new proposal
        let newProcess = get(NEW_PROCESS, [])
        newProcess.push({contractId: contractId, proposalId: proposalId, new: true, type: proposalType, applicant: applicant})
        set(NEW_PROCESS, newProcess)

        let proposal = await daoContract.getProposal({proposalId: proposalId})
        let platformPercent = await daoContract.getPlatformPercentage()
        let percentage = parseFloat(formatNearAmount(platformPercent, 5))/100
        let platformPayment = (parseFloat(proposal.paymentRequested) * percentage)
        let payment = platformPayment.toLocaleString('fullwide', {useGrouping: false})

        await daoContract.processProposal({
            proposalId: proposalId,
            platformPayment: payment,
            contractId: contractId,
            functionName: proposal.functionName,
            parameters: proposal.parameters
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
            proposalId: proposalId,
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
                let communityInactivation = get(INACTIVATE_COMMUNITY, [])
                communityInactivation.push({contractId: contractId, new: true})
                set(INACTIVATE_COMMUNITY, communityInactivation)                
            }
        } catch (err) {
            console.log('no members', err)
            return false
        }
       

        await daoContract.leave({
            contractId: contractId,
            accountId: accountId,
            share: share,
            availableBalance: balanceAvailable,
            appOwner: APP_OWNER_ACCOUNT
            }, GAS)

    } catch (err) {
        console.log('leave community failed', err)
        return false
    }
    return true
}

// Delete Community
export async function inactivateCommunity(factoryContract, contractId, accountId) {

    // set trigger for new community delete
    let newInactivation = get(NEW_INACTIVATION, [])
    newInactivation.push({contractId: contractId, accountId: accountId, new: true})
    set(NEW_INACTIVATION, newInactivation)

    try{
        await factoryContract.inactivateDAO({
            contractId: contractId
            }, GAS)

    } catch (err) {
        console.log('community inactivation failed', err)
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
            proposalId: proposalId,
            tribute: tribute,
            loot: loot
            }, GAS)

    } catch (err) {
        console.log('cancel proposal failed', err)
        return false
    }
    return true
}

// Synch DAOs
export async function synchDaos(state){

    try{
        let upLinks = await ceramic.downloadKeysSecret(state.appIdx, 'daoKeys')
        let i = 0
        let exists = false
        let change = false
        let newArray = []
        while (i < state.currentDaosList.length){
            // let k = 0
            // let count = 0
            // while(k < upLinks.length){
        //         let filtered = upLinks.filter(function(value, index, arr){
        //             return value.contractId == state.currentDaosList[i].contractId
        //         })
        //         console.log('filtered', filtered)
        //         newArray.push(filtered[0])
        //         change = true
        //         // if(state.currentDaosList[i].contractId == upLinks[k].contractId){
                    
        //         //     if(count > 0){
        //         //         upLinks.splice(k,1)
        //         //         change = true
        //         //         count = 0
        //         //     }
        //         //     count++
        //         //     console.log('count', count)
        //         // }
        //    // k++
        //    // }
        //     console.log('newArray', newArray)
        //     upLinks = newArray
            let j = 0
            while(j < upLinks.length){
                if(state.currentDaosList[i].contractId == upLinks[j].contractId){
                    exists = true
                    console.log('exists', exists)
                    break
                }
            j++
            }
            let summoner = state.currentDaosList[i].summoner
            let created = state.currentDaosList[i].created
            let did = state.currentDaosList[i].did
            let contractId = state.currentDaosList[i].contractId
            let status = state.currentDaosList[i].status

            if(!exists){
                console.log('ok')
                let keyPair = KeyPair.fromRandom('ed25519')
                let publicKey = keyPair.getPublicKey().toString().split(':')[1]
                upLinks.push({ 
                    key: keyPair.secretKey, 
                    publicKey: publicKey, 
                    contractId: contractId, 
                    summoner: summoner, 
                    created: created,
                    did: did,
                    status: status
                })
                change = true
            }
        i++
        }
        if(change){
            await ceramic.storeKeysSecret(state.appIdx, upLinks, 'daoKeys')
        }
    } catch (err) {
        console.log('error synching daos', err)
    }
    return true
}

// Synch Opportunity Budgets
export async function synchBudgets(curDaoIdx, allProposals) {
    let opportunities
    let oppBudget = 0
    let budgetChange = false
    
    try{
        opportunities = await curDaoIdx.get('opportunities', curDaoIdx.id)
    } catch (err) {
        console.log('problem retreiving opportunities', err)
    }
    if(opportunities){
        let j=0
        while (j < opportunities.opportunities.length){
            let i = 0
            while (i < allProposals.length){
                if(allProposals[i].flags[7]){
                    let status = getStatus(allProposals[i].flags)
                    if(status == 'Passed' || status == 'Voting'){
                        let k = 0
                        while (k < allProposals[i].referenceIds.length){
                            if(allProposals[i].referenceIds[k].keyName=='proposal'
                                && allProposals[i].referenceIds[k].valueSetting == opportunities.opportunities[j].opportunityId){
                                    oppBudget += opportunities.opportunities[j].budget
                                    if(opportunities.opportunities[j].budget != oppBudget){
                                        opportunities.opportunities[j].budget = oppBudget
                                        opportunities.opportunities[j] = opportunities.opportunities[j]
                                        budgetChange = true
                                    }
                                }
                            k++
                        }
                    }
                }
                
                i++
            }
            j++
        }

        if(budgetChange){
            try {
                await curDaoIdx.set('opportunities', opportunities)
                return true
            } catch (err) {
                console.log('error logging proposal', err)
            }
        }
    }
    return false
}

// Synch Proposals
export async function synchProposalEvent(curDaoIdx, daoContract) {
    let exists = false
    let contractProposals
    let proposalEventRecord
  
    try{
        contractProposals = await daoContract.getProposalsLength()
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
  
    if(proposalEventRecord.events.length != contractProposals){
        if(proposalEventRecord.events.length < contractProposals) {
            let i = 0
            while (i < contractProposals){
                try{
                    let proposal = await daoContract.getProposal({proposalId: i})
                   
                    if(proposal) { 
                        let k = 0
                        while (k < proposalEventRecord.events.length){
                            exists = false
                            if(parseInt(proposalEventRecord.events[k].proposalId) == proposal.proposalId){
                                exists = true
                                break
                            }
                            k++
                        }
                     
                        if(!exists){
                            let indivProposalRecord = {
                                proposalId: (proposal.proposalId).toString(),
                                applicant: proposal.applicant,
                                proposer: proposal.proposer,
                                sponsor: proposal.sponsor,
                                sharesRequested: proposal.sharesRequested,
                                lootRequested: proposal.lootRequested,
                                tributeOffered: proposal.tributeOffered,
                                tributeToken: proposal.tributeToken,
                                paymentRequested: proposal.paymentRequested,
                                paymentToken: proposal.paymentToken,
                                startingPeriod: parseInt(proposal.startingPeriod),
                                yesVote: proposal.yesVotes,
                                noVote: proposal.noVotes,
                                flags: proposal.flags,
                                maxTotalSharesAndLootAtYesVote: proposal.maxTotalSharesAndLootAtYesVote,
                                proposalSubmission: parseInt(proposal.proposalSubmitted),
                                votingPeriod: parseInt(proposal.votingPeriod),
                                gracePeriod: parseInt(proposal.gracePeriod),
                                voteFinalized: parseInt(proposal.voteFinalized),
                                submitTransactionHash: proposal.submitTransactionHash,
                                processTransactionHash: proposal.processTransactionHash,
                                cancelTransactionHash: proposal.cancelTransactionHash,
                                sponsorTransactionHash: proposal.sponsorTransactionHash,         
                                configuration: proposal.configuration,
                                memberRoleConfiguration: proposal.memberRoleConfiguration,
                                referenceIds: proposal.referenceIds ? proposal.referenceIds : [{}],
                                roles: proposal.roleNames,
                                roleConfiguration: proposal.roleConfiguration,
                                reputationConfiguration: proposal.reputationConfiguration,
                                functionName: proposal.functionName,
                                parameters: proposal.parameters    
                            }

                                proposalEventRecord.events.push(indivProposalRecord)
                       
                        }
                    }
                } catch (err) {
                    console.log('proposal does not exist', err)
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
                let emptied = await curDaoIdx.set('proposals', proposalEventRecord)
               
            } catch (err) {
                console.log('error emptying proposals', err)
            }
            let i = 0
            while (i < contractProposals){
                let proposal = await daoContract.getProposal({proposalId: i})
                
                if(proposal) {
                    
                    let indivProposalRecord = {
                        proposalId: (proposal.proposalId).toString(),
                        applicant: proposal.applicant,
                        proposer: proposal.proposer,
                        sponsor: proposal.sponsor,
                        sharesRequested: proposal.sharesRequested,
                        lootRequested: proposal.lootRequested,
                        tributeOffered: proposal.tributeOffered,
                        tributeToken: proposal.tributeToken,
                        paymentRequested: proposal.paymentRequested,
                        paymentToken: proposal.paymentToken,
                        startingPeriod: parseInt(proposal.startingPeriod),
                        yesVote: proposal.yesVotes,
                        noVote: proposal.noVotes,
                        flags: proposal.flags,
                        maxTotalSharesAndLootAtYesVote: proposal.maxTotalSharesAndLootAtYesVote,
                        proposalSubmission: parseInt(proposal.proposalSubmitted),
                        votingPeriod: parseInt(proposal.votingPeriod),
                        gracePeriod: parseInt(proposal.gracePeriod),
                        voteFinalized: parseInt(proposal.voteFinalized),
                        submitTransactionHash: proposal.submitTransactionHash,
                        processTransactionHash: proposal.processTransactionHash,
                        cancelTransactionHash: proposal.cancelTransactionHash,
                        sponsorTransactionHash: proposal.sponsorTransactionHash,         
                        configuration: proposal.configuration,
                        memberRoleConfiguration: proposal.memberRoleConfiguration,
                        referenceIds: proposal.referenceIds ? proposal.referenceIds : [{}],
                        roles: proposal.roleNames,
                        roleConfiguration: proposal.roleConfiguration,
                        reputationConfiguration: proposal.reputationConfiguration,
                        functionName: proposal.functionName,
                        parameters: proposal.parameters
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
    let budgetSynch = await synchBudgets(curDaoIdx, proposalEventRecord.events)
    return proposalEventRecord
}


// // Synch Current Member to Log
export async function synchMember(curDaoIdx, daoContract, contractId, accountId, update) {

    let exists = false
    let member
    let duplicates
   
    try{
        member = await daoContract.getMemberInfo({member: accountId})
     
    } catch (err) {
        console.log('current user does not appear to be a member', err)
    }

    let logMembers = await curDaoIdx.get('members', curDaoIdx.id)
  
    if(!logMembers){
        logMembers = { events: [] }
    }

    let i = 0
    let memberIndexesToDelete = []
    let count = 0
    if(member && member.length > 0){
        // add processed members
        while(i < logMembers.events.length){
            if(logMembers.events[i].delegateKey == member[0].delegateKey){
                exists = true
                count++
                if(count > 1){
                    memberIndexesToDelete.push(i)
                }
            }
            i++    
        }

        // delete duplicate members from datastream leaving first one
        if(memberIndexesToDelete.length > 0){
            duplicates = true
            let kk = 0
            while(kk < memberIndexesToDelete.length){
                logMembers.events.splice(memberIndexesToDelete[kk], 1)
                kk++
            }
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
        }

        if(update){
            let i = 0
            while(i < logMembers.events.length){
                let member = await daoContract.getMemberInfo({member: logMembers.events[i].delegateKey})
              
                let indivMemberRecord = {
                    memberId: logMembers.events[i].memberId,
                    contractId: logMembers.events[i].contractId,
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

                logMembers.events[i] = indivMemberRecord
                i++
            }
        }

        if(duplicates || !exists || update){
            try {
                await curDaoIdx.set('members', logMembers)
                return true
            } catch (err) {
                console.log('error adding new member', err)
            }
        }   
    }
    return true
}

// Logs the initial member and summoning event when a DAO is created
export async function logFTInitEvent (contractId, curFTIdx, FTContract, accountId, metadata, maxSupply, creationTime, transactionHash) {
    let logged = false

    try {
        let result = await FTContract.ft_medatata()
    } catch (err) {
        console.log('logftinitevent failure fetching metadata settings')
    }
    
    // Log Summon Event
    let summonEventRecord = await curFTIdx.get('ftSummonEvent', curFTIdx.id)
    if(!summonEventRecord){
    summonEventRecord = { events: [] }
    }

    let indivSummonEventRecord = {
    eventId: '1',
    contractId: contractId,
    creator: accountId,
    spec: metadata.spec,
    name: metadata.name,
    symbol: metadata.symbol,
    icon: metadata.icon,
    reference: metadata.reference,
    referenceHash: metadata.reference_hash,
    decimals: metadata.decimals,
    maxSupply: parseFloat(maxSupply),
    creationTime: creationTime,
    transactionHash: transactionHash ? transactionHash : '',
    }

    summonEventRecord.events.push(indivSummonEventRecord)

    try{
        await curFTIdx.set('ftSummonEvent', summonEventRecord)
        logged = true
    } catch (err) {
        console.log('error logging summon event', err)
    }
    
    if(logged){
        return true
    } else {
        return false
    }
}


// Logs the initial member and summoning event when a DAO is created
export async function logInitEvent (contractId, curDaoIdx, daoContract, daoType, accountId, shares, transactionHash) {
    
    let summoner
    let periodDuration
    let votingPeriodLength
    let gracePeriodLength
    let proposalDeposit
    let dilutionBound
    let voteThreshold
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
        console.log('loginitevent failure fetching init settings')
    }

    let totalMembers
    try {
        totalMembers = await daoContract.getTotalMembers()
        
    } catch (err) {
        console.log('no members', err)
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
        shares: shares,
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
      }

        // Associated Member Data to Log

        let dataObject = {
            memberId: memberId,
            summonTime: numberSummonTime,
            transactionHash: transactionHash,
            shares: parseInt(shares),
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
    }
    

    if(logged && summonLogged && memberDataLogged){
        return true
    } else {
        return false
    }
}

// Logs when a member decides to leave a community
export async function logExitEvent(contractId, curDaoIdx, daoContract, accountId, transactionHash) {
    let memberLogged = false
    let member
    let contractMemberRemoved = false
    try {
        member = await daoContract.getMemberInfo({member: accountId})
       
        // member still exists in contract, can't continue deleting from data stream
        if(member.length > 0){
            return false
        }
        contractMemberRemoved = true
    } catch (err) {
        console.log('no member exists', err)
    }
   
    // Retrieve Members from data stream
    let memberEventRecord
    try {
        memberEventRecord = await curDaoIdx.get('members', curDaoIdx.id)
    } catch (err) {
        console.log('no membereventrecords', err)
        memberLogged = true
        if(contractMemberRemoved && memberLogged) {
            // there is no member in the contract and the member data stream is empty - we are done
            return true
        }
    }

    // at this point, no member in the contract, but are members in data stream - need to set member as inactive
    if(memberEventRecord){
       
        // Splice member out of data stream
        let i = 0
        while (i < memberEventRecord.events.length){
            if(memberEventRecord.events[i].delegateKey == accountId){
                memberEventRecord.events.splice(i,1)

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
    if(memberLogged && contractMemberRemoved){
         // synch other members
         synchMember(curDaoIdx, daoContract, contractId, accountId, true)
        return true
    } else {
        return false
    }
}

// Logs a deleted community
export async function logInactivateCommunity(contractId, appIdx, accountId, transactionHash) {
    let dataLogged = false

    // Log Deletion Data
    let dataRecord = await appIdx.get('daoInactivationData', appIdx.id)
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
        dataType: 'newCommunityInactivation',
        contractId: contractId,
        data: dataObject
    }

    dataRecord.data.push(individualDataRecord)

    try {
        await appIdx.set('daoInactivationData', dataRecord)
        dataLogged = true
    } catch (err) {
        console.log('error logging dao inactivation', err)
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

// Logs a proposal change
export async function logProposalChange(
    curDaoIdx, 
    daoContract,
    proposalId,
    fundingRequested,
    fundingToken,
    transactionHash
    ){
      
        try{
            proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})
        } catch (err) {
            console.log('error retrieving proposal for this id', err)
            return false
        }
        
        if(proposal && curDaoIdx) {
            // Load existing array of details
            let detailRecords = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
       
            // Update existing records
            let exists
            let i = 0
            while (i < detailRecords.proposals.length){
            if(detailRecords.proposals[i].proposalId == proposalId){
                detailRecords.proposals[i].paymentRequested = fundingRequested
                detailRecords.proposals[i].paymentToken = fundingToken
                detailRecords.proposals[i].changeTransactionHash = transactionHash
                await curDaoIdx.set('fundingProposalDetails', detailRecords)
                exists = true
                break
            }
            i++
            }
            return true
        }
        return false
    }
    

// Logs a new Proposal Event
export async function logProposalEvent(curDaoIdx, daoContract, proposalId, contractId, transactionHash) {

    let logged = false
    let dataLogged = false
    let proposalType
    let proposal
    try{
        proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})
    } catch (err) {
        console.log('error retrieving proposal for this id', err)
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
            proposalId: (proposal.proposalId).toString(),
            applicant: proposal.applicant,
            proposer: proposal.proposer,
            sponsor: proposal.sponsor,
            sharesRequested: proposal.sharesRequested,
            lootRequested: proposal.lootRequested,
            tributeOffered: proposal.tributeOffered,
            tributeToken: proposal.tributeToken,
            paymentRequested: proposal.paymentRequested,
            paymentToken: proposal.paymentToken,
            startingPeriod: parseInt(proposal.startingPeriod),
            yesVote: proposal.yesVotes,
            noVote: proposal.noVotes,
            flags: proposal.flags,
            maxTotalSharesAndLootAtYesVote: proposal.maxTotalSharesAndLootAtYesVote,
            proposalSubmission: parseInt(proposal.proposalSubmitted),
            votingPeriod: parseInt(proposal.votingPeriod),
            gracePeriod: parseInt(proposal.gracePeriod),
            voteFinalized: parseInt(proposal.voteFinalized),
            submitTransactionHash: transactionHash,
            processTransactionHash: '',
            cancelTransactionHash: '',
            sponsorTransactionHash: '',         
            configuration: proposal.configuration,
            referenceIds: proposal.referenceIds,
            roles: proposal.roleNames,
            roleConfiguration: proposal.roleConfiguration,
            memberRoleConfiguration: proposal.memberRoleConfiguration,
            reputationConfiguration: proposal.reputationConfiguration,
            functionName: proposal.functionName,
            parameters: proposal.parameters
            }

            proposalEventRecord.events.push(indivProposalRecord)
         

            try {
                let set = await curDaoIdx.set('proposals', proposalEventRecord)
                logged = true
            } catch (err) {
                console.log('error logging proposal', err)
            }

            // Associated Proposal Data to Log

            let dataObject = {
                proposalId: proposalId,
                transactionHash: transactionHash,
                proposalAdded: parseInt(proposal.proposalSubmitted),
                proposer: proposal.proposer,
                applicant: proposal.applicant,
                sharesRequested: proposal.sharesRequested,
                lootRequested: proposal.lootRequested,
                tributeOffered: proposal.tributeOffered,
                tributeToken: proposal.tributeToken,
                paymentRequested: proposal.paymentRequested,
                paymentToken: proposal.paymentToken,
                proposalType: proposal.flags, //will need to derive type from the flags array in any queries,
                updated: Date.now()
            }

            let individualDataRecord = {
                dataType: 'newProposal',
                contractId: contractId,
                data: dataObject
            }

            proposalDataRecord.data.push(individualDataRecord)

            try {
                await curDaoIdx.set('proposalData', proposalDataRecord)
                dataLogged = true
            } catch (err) {
                console.log('error logging proposal data', err)
            }
    }
    
    if(logged && dataLogged){
        // Discord Integration
        let data = {
            botName: 'Proposal Manager',
            type: 'proposal',
            applicant: proposal.applicant,
            url: window.location.href
        }
        proposalType = getProposalType(proposal.flags)
       
        switch(proposalType){
            case 'Whitelist':
                try {
                    sendMessage('A whitelist proposal was received.', data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'Guildkick':
                try {
                    sendMessage('GuildKick proposal submitted for ' + proposal.applicant, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'Member':
                try {
                    sendMessage('Member proposal submitted for ' + proposal.applicant, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'Commitment':
                try {
                    sendMessage('Funding commitment proposal submitted for ' + proposal.applicant, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'Opportunity':
                try {
                    sendMessage('Opportunity proposal submitted by ' + proposal.proposer, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'Tribute':
                try {
                    sendMessage('Tribute proposal submitted for ' + proposal.applicant, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'Configuration':
                try {
                    sendMessage('Configuration proposal submitted by ' + proposal.proposer, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'Payout':
                try {
                    sendMessage('Payout proposal submitted for ' + proposal.applicant, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'CommunityRole':
                try {
                    sendMessage('Community role proposal submitted by ' + proposal.proposer, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'ReputationFactor':
                try {
                    sendMessage('Reputation factor proposal submitted by ' + proposal.proposer, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            case 'AssignRole':
                try {
                    sendMessage('Role assignment proposal submitted for ' + proposal.applicant, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            default:
                return true
        }
        return true
    }
    else {
        return false
    }
}

// Logs a Process Event
export async function logProcessEvent(near, appIdx, didRegistryContract, curDaoIdx, daoContract, contractId, proposalId, proposalType, transactionHash) {
   
    let processLogged = false
    let memberLogged = false
    let proposalDataLogged = false
    let memberDataLogged = false
    let budgetAdjusted = false

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

        let proposalStatus = getStatus(proposal.flags)

        // Action Budget Adjustment if Required
        if(proposalType == 'Commitment' && proposalStatus == 'Not Passed' && proposal.referenceIds.length > 0){
            
            let opportunityId = proposal.referenceIds[0].valueSetting
            let opportunitiesList = await curDaoIdx.get('opportunities', curDaoIdx.id)
            let i = 0
            if(opportunitiesList){
                while (i < opportunitiesList.opportunities.length){
                    if(opportunitiesList.opportunities[i].opportunityId == opportunityId){
                        let opportunity = opportunitiesList.opportunities[i]
                        opportunity.budget = opportunity.budget + parseFloat(proposal.paymentRequested)
                        opportunitiesList.opportunities[i] = opportunity
                        break
                    }
                    i++
                }

                try{
                    await curDaoIdx.set('opportunities', opportunitiesList)
                    budgetAdjusted=true
                } catch (err) {
                    console.log('error processing event', err)
                }
            }
        }

        // Update existing proposal
        let i = 0
        if(proposalRecords && proposalRecords.events.length > 0){
            while (i < proposalRecords.events.length){
                if(proposalRecords.events[i].proposalId == (proposal.proposalId).toString()){
                    let updatedProposalRecord = {
                        proposalId: (proposal.proposalId).toString(),
                        applicant: proposal.applicant,
                        proposer: proposal.proposer,
                        sponsor: proposal.sponsor,
                        sharesRequested: proposal.sharesRequested,
                        lootRequested: proposal.lootRequested,
                        tributeOffered: proposal.tributeOffered,
                        tributeToken: proposal.tributeToken,
                        paymentRequested: proposal.paymentRequested,
                        paymentToken: proposal.paymentToken,
                        startingPeriod: parseInt(proposal.startingPeriod),
                        yesVote: proposal.yesVotes,
                        noVote: proposal.noVotes,
                        flags: proposal.flags,
                        maxTotalSharesAndLootAtYesVote: proposal.maxTotalSharesAndLootAtYesVote,
                        proposalSubmission: parseInt(proposal.proposalSubmitted),
                        votingPeriod: parseInt(proposal.votingPeriod),
                        gracePeriod: parseInt(proposal.gracePeriod),
                        voteFinalized: parseInt(proposal.voteFinalized),
                        configuration: proposal.configuration,
                        referenceIds: proposal.referenceIds,
                        roles: proposal.roleNames,
                        roleConfiguration: proposal.roleConfiguration,
                        memberRoleConfiguration: proposal.memberRoleConfiguration,
                        reputationConfiguration: proposal.reputationConfiguration,
                        processTransactionHash: transactionHash ? transactionHash : '',
                        submitTransactionHash: proposalRecords.events[i].submitTransactionHash,
                        cancelTransactionHash: proposalRecords.events[i].cancelTransactionHash,
                        sponsorTransactionHash: proposalRecords.events[i].sponsorTransactionHash,
                        functionName: proposal.functionName,
                        parameters: proposal.parameters    
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
                        proposalId: (proposal.proposalId).toString(),
                        processTime: Date.now(),
                        transactionHash: transactionHash,
                        proposalAdded: parseInt(proposal.proposalSubmitted),
                        proposer: proposal.proposer,
                        applicant: proposal.applicant,
                        sharesRequested: proposal.sharesRequested,
                        lootRequested: proposal.lootRequested,
                        tributeOffered: proposal.tributeOffered,
                        tributeToken: proposal.tributeToken,
                        paymentRequested: proposal.paymentRequested,
                        yesVote: proposal.yesVotes,
                        noVote: proposal.noVotes,
                        paymentToken: proposal.paymentToken,
                        proposalType: proposal.flags, //will need to derive type from the flags array in any queries
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

        let member = await daoContract.getMemberInfo({member: proposal.applicant})
      
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
        if(member.length > 0){
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

            // initiate empty profile
            let record = {
                date: '',
                owner: '',
                name: '',
                avatar: '',
                shortBio: '',
                email: '',
                discord: '',
                twitter: '',
                reddit: '',
                birthdate: '',
                country: '',
                language: [],
                familiarity: '',
                skillSet: {},
                developerSkillSet: {},
                personaSkills: [],
                personaSpecificSkills: [],
                notifications: []
            }

           
            let thisCurPersonaIdx
            try{
            let personaAccount = new nearAPI.Account(near.connection, proposal.applicant)
            thisCurPersonaIdx = await ceramic.getUserIdx(personaAccount, appIdx, daoFactory, didRegistryContract)
            let result = await thisCurPersonaIdx.set('profile', record)    
            } catch (err) {
                console.log('error retrieving idx', err)
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
                proposer: proposal.proposer,
                applicant: proposal.applicant
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
            // Update an existing member (could be a reactivation)
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
                        proposer: proposal.proposer,
                        applicant: proposal.applicant,
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
    memberLogged = true
    processLogged = true
    if(processLogged && memberLogged && memberDataLogged && proposalDataLogged){
        // Discord Integration
        let data = {
            botName: 'Sponsor Manager',
            type: 'proposal',
            applicant: proposal.applicant,
            url: window.location.href
        }
        proposalType = getProposalType(proposal.flags)

        switch(proposalType){
            case ('Commitment' && budgetAdjusted ):
                try {
                    sendMessage(proposal.applicant+"'s Proposal "+proposalId + " has been processed", data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            default:
                try {
                    sendMessage(proposal.applicant+"'s Proposal "+proposalId + " has been processed", data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                return true
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
            if(proposalRecords.events[i].proposalId == (proposal.proposalId).toString()){
                let updatedProposalRecord = {
                    proposalId: (proposal.proposalId).toString(),
                    applicant: proposal.applicant,
                    proposer: proposal.proposer,
                    sponsor: proposal.sponsor,
                    sharesRequested: proposal.sharesRequested,
                    lootRequested: proposal.lootRequested,
                    tributeOffered: proposal.tributeOffered,
                    tributeToken: proposal.tributeToken,
                    paymentRequested: proposal.paymentRequested,
                    paymentToken: proposal.paymentToken,
                    startingPeriod: parseInt(proposal.startingPeriod),
                    yesVote: proposal.yesVotes,
                    noVote: proposal.noVotes,
                    flags: proposal.flags,
                    maxTotalSharesAndLootAtYesVote: proposal.maxTotalSharesAndLootAtYesVote,
                    proposalSubmission: parseInt(proposal.proposalSubmitted),
                    votingPeriod: parseInt(proposal.votingPeriod),
                    gracePeriod: parseInt(proposal.gracePeriod),
                    voteFinalized: parseInt(proposal.voteFinalized),
                    configuration: proposal.configuration,
                    referenceIds: proposal.referenceIds,
                    roles: proposal.RoleNames,
                    roleConfiguration: proposal.roleConfiguration,
                    reputationConfiguration: proposal.reputationConfiguration,
                    memberRoleConfiguration: proposal.memberRoleConfiguration,
                    submitTransactionHash: proposalRecords.events[i].submitTransactionHash,
                    cancelTransactionHash: proposalRecords.events[i].cancelTransactionHash,
                    processTransactionHash: proposalRecords.events[i].processTransactionHash,
                    sponsorTransactionHash: proposalRecords.events[i].sponsorTransactionHash,
                    functionName: proposal.functionName,
                    parameters: proposal.parameters
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
    let budgetAdjusted = false

    let proposal = await daoContract.getProposal({proposalId: parseInt(proposalId)})
    let proposalType = getProposalType(proposal.flags)
 
     // Log Proposal Data
     let proposalDataRecord = await curDaoIdx.get('proposalData', curDaoIdx.id)
     if(!proposalDataRecord){
         proposalDataRecord = { data: [] }
     }

    if(proposal && curDaoIdx) {

         // Action Budget Adjustment if Required
         if(proposalType == 'Commitment' && proposal.referenceIds.length > 0){
             
             let opportunityId = proposal.referenceIds[0].valueSetting
             let opportunitiesList = await curDaoIdx.get('opportunities', curDaoIdx.id)
             let i = 0
             if(opportunitiesList){
                while (i < opportunitiesList.opportunities.length){
                    if(opportunitiesList.opportunities[i].opportunityId == opportunityId){
                        let opportunity = opportunitiesList.opportunities[i]
                        opportunity.budget = opportunity.budget - parseFloat(proposal.paymentRequested)
                        opportunitiesList.opportunities[i] = opportunity
                        break
                    }
                    i++
                }
                try{
                    await curDaoIdx.set('opportunities', opportunitiesList)
                    budgetAdjusted=true
                } catch (err) {
                    console.log('error logging sponsor event', err)
                }
            }
         }

        // Load existing proposal details
        let proposalRecords = await curDaoIdx.get('proposals', curDaoIdx.id)

        // Update the proposal
        let exists
        let i = 0
        while (i < proposalRecords.events.length){
        if(proposalRecords.events[i].proposalId == proposalId){
            let updatedProposalRecord = {
                proposalId: (proposal.proposalId).toString(),
                applicant: proposal.applicant,
                proposer: proposal.proposer,
                sponsor: proposal.sponsor,
                sharesRequested: proposal.sharesRequested,
                lootRequested: proposal.lootRequested,
                tributeOffered: proposal.tributeOffered,
                tributeToken: proposal.tributeToken,
                paymentRequested: proposal.paymentRequested,
                paymentToken: proposal.paymentToken,
                startingPeriod: parseInt(proposal.startingPeriod),
                yesVote: proposal.yesVotes,
                noVote: proposal.noVotes,
                flags: proposal.flags,
                maxTotalSharesAndLootAtYesVote: proposal.maxTotalSharesAndLootAtYesVote,
                proposalSubmission: parseInt(proposal.proposalSubmitted),
                votingPeriod: parseInt(proposal.votingPeriod),
                gracePeriod: parseInt(proposal.gracePeriod),
                voteFinalized: parseInt(proposal.voteFinalized),
                configuration: proposal.configuration,
                referenceIds: proposal.referenceIds,
                roles: proposal.roleNames,
                roleConfiguration: proposal.roleConfiguration,
                reputationConfiguration: proposal.reputationConfiguration,
                memberRoleConfiguration: proposal.memberRoleConfiguration,
                submitTransactionHash: proposalRecords.events[i].submitTransactionHash,
                cancelTransactionHash: proposalRecords.events[i].cancelTransactionHash,
                processTransactionHash: proposalRecords.events[i].processTransactionHash,
                sponsorTransactionHash: transactionHash,
                functionName: proposal.functionName,
                parameters: proposal.parameters
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
                proposalId: (proposal.proposalId).toString(),
                sponsorTime: Date.now(),
                transactionHash: transactionHash,
                proposalAdded: parseInt(proposal.proposalSubmitted),
                proposer: proposal.proposer,
                applicant: proposal.applicant,
                sharesRequested: proposal.sharesRequested,
                lootRequested: proposal.lootRequested,
                tributeOffered: proposal.tributeOffered,
                tributeToken: proposal.tributeToken,
                paymentRequested: proposal.paymentRequested,
                yesVote: proposal.yesVotes,
                noVote: proposal.noVotes,
                paymentToken: proposal.paymentToken,
                proposalType: proposal.flags, //will need to derive type from the flags array in any queries
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

    if(logged && sponsorDataLogged){
            // Discord Integration
        let data = {
            botName: 'Sponsor Manager',
            type: 'proposal',
            applicant: proposal.applicant,
            url: window.location.href
        }
        proposalType = getProposalType(proposal.flags)
    
        switch(proposalType){
            case ('Commitment' && budgetAdjusted ):
                try {
                    sendMessage(proposal.applicant + "'s funding commitment " + proposalId + " has been sponsored by " + proposal.sponsor, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                break
            default:
                try {
                    sendMessage(proposal.applicant + "'s proposal " + proposalId + " has been sponsored by " + proposal.sponsor, data, curDaoIdx)
                } catch (err) {
                    console.log('error sending notification', err)
                }
                return true
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
                    proposalId: (proposal.proposalId).toString(),
                    applicant: proposal.applicant,
                    proposer: proposal.proposer,
                    sponsor: proposal.sponsor,
                    sharesRequested: proposal.sharesRequested,
                    lootRequested: proposal.lootRequested,
                    tributeOffered: proposal.tributeOffered,
                    tributeToken: proposal.tributeToken,
                    paymentRequested: proposal.paymentRequested,
                    paymentToken: proposal.paymentToken,
                    startingPeriod: parseInt(proposal.startingPeriod),
                    yesVote: proposal.yesVotes,
                    noVote: proposal.noVotes,
                    flags: proposal.flags,
                    maxTotalSharesAndLootAtYesVote: proposal.maxTotalSharesAndLootAtYesVote,
                    proposalSubmission: parseInt(proposal.proposalSubmitted),
                    votingPeriod: parseInt(proposal.votingPeriod),
                    gracePeriod: parseInt(proposal.gracePeriod),
                    voteFinalized: parseInt(proposal.voteFinalized),
                    configuration: proposal.configuration,
                    referenceIds: proposal.referenceIds,
                    roles: proposal.roleNames,
                    roleConfiguration: proposal.roleConfiguration,
                    reputationConfiguration: proposal.reputationConfiguration,
                    memberRoleConfiguration: proposal.memberRoleConfiguration,
                    cancelTransactionHash: transactionHash,
                    submitTransactionHash: proposalRecords.events[i].submitTransactionHash,
                    processTransactionHash: proposalRecords.events[i].processTransactionHash,
                    sponsorTransactionHash: proposalRecords.events[i].sponsorTransactionHash,
                    functionName: proposal.functionName,
                    parameters: proposal.parameters
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
                proposalId: (proposal.proposalId).toString(),
                sponsorTime: Date.now(),
                transactionHash: transactionHash,
                proposalAdded: parseInt(proposal.proposalSubmitted),
                proposer: proposal.proposer,
                applicant: proposal.applicant,
                sharesRequested: proposal.sharesRequested,
                lootRequested: proposal.lootRequested,
                tributeOffered: proposal.tributeOffered,
                tributeToken: proposal.tributeToken,
                paymentRequested: proposal.paymentRequested,
                yesVote: proposal.yesVotes,
                noVote: proposal.noVotes,
                paymentToken: proposal.paymentToken,
                proposalType: proposal.flags, //will need to derive type from the flags array in any queries
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
        donation = await daoContract.getDonation({donationId: donationId})
    } catch (err) {
        console.log('error retrieving donation for this id', err)
    }

     // Log Proposal Data
     let proposalDataRecord = await curDaoIdx.get('proposalData', curDaoIdx.id)
     console.log('proposaldata', proposalDataRecord)
     if(!proposalDataRecord){
         proposalDataRecord = { data: [] }
     }

    if(donation && curDaoIdx) {
       
        // Log New donation Event
        console.log('don curdaoidx', curDaoIdx)
        let donationEventRecord = await curDaoIdx.get('donations', curDaoIdx.id)
        console.log('donation event record', donationEventRecord)
        if(!donationEventRecord){
            donationEventRecord = { donations: [] }
        }

        let indivDonationRecord = {
            donationId: (donation.donationId).toString(),
            contractId: contractId,
            contributor: donation.contributor,
            contributed: parseFloat(donation.contributed),
            donation: parseFloat(formatNearAmount(donation.donation)),
            transactionHash: transactionHash
            }

            donationEventRecord.donations.push(indivDonationRecord)
         
            try {
                await curDaoIdx.set('donations', donationEventRecord)
                logged = true
                console.log('logged', logged)
            } catch (err) {
                console.log('error logging donation', err)
            }

            // Associated Proposal Data to Log

            let dataObject = {
                donationId: (donation.donationId).toString(),
                contractId: contractId,
                contributor: donation.contributor,
                contributed: parseFloat(donation.contributed),
                donation: parseFloat(formatNearAmount(donation.donation, 3)),
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
                console.log('donationdatalogged', donationDataLogged)
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


export function getStatus(flags, finalized, votingPeriod, gracePeriod, afterVoting) {
    console.log('flags', flags)
    console.log('voting period', votingPeriod)
    console.log('grace period', gracePeriod)
    console.log('after voting', afterVoting)
    console.log('finalized', finalized)
    
   /* flags [
        0: sponsored, 
        1: processed, 
        2: didPass, 
        3: cancelled,
    ]
    */
    let sponsored = flags[0]
    console.log('sponsored', sponsored)
    let processed = flags[1]
    console.log('processed', processed)
    let passed = flags[2]
    console.log('passed', passed)
    let cancelled = flags[3]
    console.log('cancelled', cancelled)

    if(cancelled){
        return 'Cancelled'
    }
    if(!sponsored && !processed && !passed && !cancelled){
        return 'Submitted'
    }
    // if(sponsored && !processed && !passed && !cancelled && !afterVoting){
    //     return 'Sponsored'
    // }
    if(sponsored && !processed && !cancelled && !finalized && votingPeriod && !gracePeriod){
        return 'Voting'
    }
    if(sponsored && !processed && !cancelled && !finalized && !votingPeriod && gracePeriod){
        return 'Grace'
    }
    if(sponsored && !processed && (afterVoting || finalized)){
        return 'Awaiting Finalization'
    }
    if(sponsored && processed && passed){
        return 'Passed'
    }
    if(sponsored && processed && !passed){
        return 'Not Passed'
    }    
  }

export function getProposalType(flags) {
 /* flags [
        4: whitelist, 
        5: guildkick, 
        6: member, 
        7: commitment, 
        8: opportunity, 
        9: tribute, 
        10: configuration, 
        11: payout, 
        12: communityRole, 
        13: reputationFactor, 
        14: assignRole
        15: affiliation
        16: cancelCommit
    ]
    */
    let type
    let element
    // start looking at 4th element as first three are different flags
    for (let i = 4; i < flags.length; i++){
        if(flags[i] == true){
            element = i
        }
    }
        switch(element){
            case 4:
                type = 'Whitelist'
                break
            case 5:
                type = 'GuildKick'
                break
            case 6:
                type = 'Member'
                break
            case 7:
                type = 'Commitment'
                break
            case 8:
                type = 'Opportunity'
                break
            case 9:
                type = 'Tribute'
                break
            case 10:
                type = 'Configuration'
                break
            case 11:
                type = 'Payout'
                break
            case 12:
                type = 'CommunityRole'
                break
            case 13:
                type = 'ReputationFactor'
                break
            case 14:
                type = 'AssignRole'
                break
            case 15:
                type = 'Affiliation'
                break
            case 16:
                type = 'CancelCommit'
                break
            default:
                type = ''
        }
    return type
}

export function generateId() {
    let buf = Math.random([0, 999999999])
    let b64 = btoa(buf);
    return b64.toString()
}

export function formatDate(timestamp){
    let intDate = parseInt(timestamp)
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(intDate).toLocaleString('en-US', options)
}

export function formatDateString(timestamp){
    if(timestamp){
        let stringDate = timestamp.toString()
        let options = {year: 'numeric', month: 'long', day: 'numeric'}
        return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
    } else {
        return null
    } 
}

export async function signal(proposalId, signalType, curDaoIdx, accountId, proposalType){
  
   
    let currentProperties
    let stream
    switch(proposalType){
        case 'Tribute':
            try{
                currentProperties = await curDaoIdx.get('tributeProposalDetails', curDaoIdx.id)
                stream = 'tributeProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving tribute proposal details', err)
            }
           
        case 'Commitment':
            try{
                currentProperties = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
                stream = 'fundingProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving funding commitment proposal details', err)
            }
            
        case 'Member':
            try{
                currentProperties = await curDaoIdx.get('memberProposalDetails', curDaoIdx.id)
                stream = 'memberProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving member proposal details', err)
            }
        case 'GuildKick':
            try{
                currentProperties = await curDaoIdx.get('guildKickProposalDetails', curDaoIdx.id)
                stream = 'guildKickProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving guild kick proposal details', err)
            }
        case 'Payout':
            try{
                currentProperties = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
                stream = 'payoutProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving payout proposal details', err)
            }
        case 'Configuration':
            try{
                currentProperties = await curDaoIdx.get('configurationProposalDetails', curDaoIdx.id)
                stream = 'configurationProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving configuration proposal details', err)
            }
        case 'CommunityRole':
            try{
                currentProperties = await curDaoIdx.get('communityRoles', curDaoIdx.id)
                stream = 'communityRoles'
                break
            } catch (err) {
                console.log('problem retrieving configuration proposal details', err)
            }
        case 'ReputationFactor':
            try{
                currentProperties = await curDaoIdx.get('reputationFactors', curDaoIdx.id)
                stream = 'reputationFactors'
                break
            } catch (err) {
                console.log('problem retrieving reputation factor proposal details', err)
            }
        case 'Opportunity':
            try{
                currentProperties = await curDaoIdx.get('opportunities', curDaoIdx.id)
                stream = 'opportunities'
                break
            } catch (err) {
                console.log('problem retrieving opportunity proposal details', err)
            }
        case 'CancelCommit':
            try{
                currentProperties = await curDaoIdx.get('cancelCommitmentProposalDetails', curDaoIdx.id)
                stream = 'cancelCommitmentProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving cancel commitment proposal details', err)
            }
        default:
            break
    }   
  
    let hasLiked = false
    let hasDisLiked = false
    let hasNeutral = false
    if(stream == 'opportunities'){
        let i = 0
    while (i < currentProperties.opportunities.length){
        
        if(currentProperties.opportunities[i].opportunityId == proposalId.toString()){
            let proposalToUpdate = currentProperties.opportunities[i]
            hasLiked = proposalToUpdate.likes.includes(accountId)
            hasDisLiked = proposalToUpdate.dislikes.includes(accountId)
            hasNeutral = proposalToUpdate.neutrals.includes(accountId)

            if(signalType == 'like' && !hasLiked){
                proposalToUpdate.likes.push(accountId)
             
                if(hasDisLiked){
                    let k = 0
                    while (k < proposalToUpdate.dislikes.length){
                        if(proposalToUpdate.dislikes[k] == accountId){
                            proposalToUpdate.dislikes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasNeutral){
                    let k = 0
                    while (k < proposalToUpdate.neutrals.length){
                        if(proposalToUpdate.neutrals[k] == accountId){
                            proposalToUpdate.neutrals.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }

            if(signalType == 'dislike' && !hasDisLiked){
                proposalToUpdate.dislikes.push(accountId)
                if(hasLiked){
                    let k = 0
                    while (k < proposalToUpdate.likes.length){
                        if(proposalToUpdate.likes[k] == accountId){
                            proposalToUpdate.likes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasNeutral){
                    let k = 0
                    while (k < proposalToUpdate.neutrals.length){
                        if(proposalToUpdate.neutrals[k] == accountId){
                            proposalToUpdate.neutrals.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }

            if(signalType == 'neutral' && !hasNeutral){
                proposalToUpdate.neutrals.push(accountId)
                if(hasLiked){
                    let k = 0
                    while (k < proposalToUpdate.likes.length){
                        if(proposalToUpdate.likes[k] == accountId){
                            proposalToUpdate.likes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasDisLiked){
                    let k = 0
                    while (k < proposalToUpdate.dislikes.length){
                        if(proposalToUpdate.dislikes[k] == accountId){
                            proposalToUpdate.dislikes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }
        currentProperties.opportunities[i] = proposalToUpdate
        break
        }
    i++
    }

    try{
        await curDaoIdx.set(stream, currentProperties)
    } catch (err) {
        console.log('error with signalling', err)
    } 
} else {
    let i = 0
    while (i < currentProperties.proposals.length){
        
        if(currentProperties.proposals[i].proposalId == proposalId.toString()){
            let proposalToUpdate = currentProperties.proposals[i]
            hasLiked = proposalToUpdate.likes.includes(accountId)
            hasDisLiked = proposalToUpdate.dislikes.includes(accountId)
            hasNeutral = proposalToUpdate.neutrals.includes(accountId)

            if(signalType == 'like' && !hasLiked){
                proposalToUpdate.likes.push(accountId)
               
                if(hasDisLiked){
                    let k = 0
                    while (k < proposalToUpdate.dislikes.length){
                        if(proposalToUpdate.dislikes[k] == accountId){
                            proposalToUpdate.dislikes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasNeutral){
                    let k = 0
                    while (k < proposalToUpdate.neutrals.length){
                        if(proposalToUpdate.neutrals[k] == accountId){
                            proposalToUpdate.neutrals.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }

            if(signalType == 'dislike' && !hasDisLiked){
                proposalToUpdate.dislikes.push(accountId)
                if(hasLiked){
                    let k = 0
                    while (k < proposalToUpdate.likes.length){
                        if(proposalToUpdate.likes[k] == accountId){
                            proposalToUpdate.likes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasNeutral){
                    let k = 0
                    while (k < proposalToUpdate.neutrals.length){
                        if(proposalToUpdate.neutrals[k] == accountId){
                            proposalToUpdate.neutrals.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }

            if(signalType == 'neutral' && !hasNeutral){
                proposalToUpdate.neutrals.push(accountId)
                if(hasLiked){
                    let k = 0
                    while (k < proposalToUpdate.likes.length){
                        if(proposalToUpdate.likes[k] == accountId){
                            proposalToUpdate.likes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasDisLiked){
                    let k = 0
                    while (k < proposalToUpdate.dislikes.length){
                        if(proposalToUpdate.dislikes[k] == accountId){
                            proposalToUpdate.dislikes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }
        currentProperties.proposals[i] = proposalToUpdate
        break
        }
    i++
    }

    try{
        await curDaoIdx.set(stream, currentProperties)
    } catch (err) {
        console.log('error with signalling', err)
    }
}


}

export async function synchAccountLinks(curUserIdx){

    //synch local links with what's stored for the account in ceramic
    let allAccounts = await ceramic.downloadKeysSecret(curUserIdx, 'accountsKeys')

    let storageLinks = get(ACCOUNT_LINKS, [])
    
    let k = 0
    let didMakeChange = false
    while(k < allAccounts.length){
        // ensure all the existing online accounts and offline accounts match
        let j = 0
        while (j < storageLinks.length){
            if(allAccounts[k].accountId == storageLinks[j].accountId){
                if(allAccounts[k].key != storageLinks[j].key){
                    allAccounts[k].key = storageLinks[j].key
                    didMakeChange = true
                }
                if(allAccounts[k].owner != storageLinks[j].owner){
                    allAccounts[k].owner = storageLinks[j].owner
                    didMakeChange = true
                }
                if(allAccounts[k].keyStored != storageLinks[j].keyStored){
                    allAccounts[k].keyStored = storageLinks[j].keyStored
                    didMakeChange = true
                }
                if(allAccounts[k].publicKey != storageLinks[j].publicKey){
                    allAccounts[k].publicKey = storageLinks[j].publicKey
                    didMakeChange = true
                }
            }
            j++
        }
    k++
    }
            
    // add any accounts that are missing
    let p = 0
    let wasMissing = false
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
            wasMissing = true
        }
        p++
    }
    
    // remove duplicates
    let copyArray = allAccounts
    let z = 0
    let wasDuplicate = false
    while(z < allAccounts.length){
        let r = 0
        let count = 0
        while(r < copyArray.length){
            if(copyArray[r].accountId == allAccounts[z].accountId){
                count++
                console.log('count', count)
                if(count > 1) {
                    copyArray.splice(r,1)
                    wasDuplicate = true
                }
            }
            r++
        }
        z++
    }
    allAccounts = copyArray
    console.log('copy array', copyArray)
    console.log('didMakeChange', didMakeChange)
    console.log('wasMissing', wasMissing)
    console.log('wasDuplicate', wasDuplicate)
    console.log('all accounts', allAccounts)

    if(didMakeChange || wasMissing || wasDuplicate){
        await ceramic.storeKeysSecret(curUserIdx, allAccounts, 'accountsKeys')
        set(ACCOUNT_LINKS, allAccounts)
    }
}

export async function updateCurrentCommunities() {
    let currentCommunitiesList = await queries.getAllCommunities()
    let sortedCommunities = _.sortBy(currentCommunitiesList.data.createDAOs, 'created')
    console.log('currentCommunitieslist', currentCommunitiesList)
    console.log('sortedCommunities', sortedCommunities)
    let inactivatedCommunitiesList = await queries.getAllInactivatedCommunities()
    let sortedInactivatedCommunities = _.sortBy(inactivatedCommunitiesList.data.inactivateDAOs, 'deactivated')
    console.log('inactivatedCommunitieslist', inactivatedCommunitiesList)
    console.log('sorted inactivatedCommunities', sortedInactivatedCommunities)

    let currentCommunities = []
    let lastIndexAdd
    let lastIndexDelete

    // first - start the loop to look through every one of the community entries
    for(let k = 0; k < sortedCommunities.length; k++){
        console.log('account', sortedCommunities[k].contractId)
        // make sure it hasn't already been added to the current communities list
        if(currentCommunities.filter(e => e.contractId == sortedCommunities[k].contractId).length == 0){
                for(let n = 0; n < sortedCommunities.length; n++){
                    if(sortedCommunities[k].contractId == sortedCommunities[n].contractId){
                        lastIndexAdd = n
                    }
                }
            console.log('lastIndexAdd', lastIndexAdd)
            // step 2 - get index of the last time the contractId was deleted
            for(let x = 0; x < sortedInactivatedCommunities.length; x++){
                if(sortedCommunities[lastIndexAdd].contractId == sortedInactivatedCommunities[x].contractId){
                    lastIndexDelete = x
                }
            }
            console.log('lastIndexDelete', lastIndexDelete)
            //  step 3 - if there is a last index added, compare last added with 
            //  last deleted to see if it is still an active guild.  Push it to the
            //  list of current guilds.
            if(lastIndexAdd > 0 ){
                console.log('comparison', parseFloat(sortedCommunities[lastIndexAdd].created) > parseFloat(sortedInactivatedCommunities[lastIndexDelete].deactivated))
                if(parseFloat(sortedCommunities[lastIndexAdd].created) > parseFloat(sortedInactivatedCommunities[lastIndexDelete].deactivated)) {
                    currentCommunities.push(sortedCommunities[lastIndexAdd])
                }
            }
        }
    }

console.log('currentCommunities', currentCommunities)
return currentCommunities
}

export function getProposalStatus(flags) {
    console.log('flags', flags)
    
   /* flags [
        0: sponsored, 
        1: processed, 
        2: didPass, 
        3: cancelled,
    ]
    */
    let sponsored = flags[0]
    console.log('sponsored', sponsored)
    let processed = flags[1]
    console.log('processed', processed)
    let passed = flags[2]
    console.log('passed', passed)
    let cancelled = flags[3]
    console.log('cancelled', cancelled)

    if(cancelled){
        return 'Cancelled'
    }
    if(!sponsored && !processed && !passed && !cancelled){
        return 'Submitted'
    }
    if(sponsored && !processed && !passed && !cancelled){
         return 'Sponsored'
    }
    if(sponsored && processed && passed){
        return 'Passed'
    }
    if(sponsored && processed && !passed){
        return 'Not Passed'
    }    
}

async function getPrice(currentNearPrice){
    let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
    if(getNearPrice.data.near.usd != currentNearPrice){
        update('', {nearPrice:getNearPrice.data.near.usd})
    }
    }

function stop(timer) {
if (timer) {
    clearInterval(timer)
    timer = 0
}
}