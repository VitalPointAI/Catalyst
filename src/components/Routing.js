import React, { useEffect, useState, useContext } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Route, Switch, Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'

import DaoCeramicAppProvider from '../contexts/daoCeramicAppContext'

import { createDefinition, publishSchema } from '@ceramicstudio/idx-tools'
import { IDX } from '@ceramicstudio/idx'


import { dao } from '../utils/dao'
import { daoContractSend } from '../utils/daoContractSender'
import { factory } from '../utils/factory'
import { dids } from '../utils/dids'
import { proposalEvent } from '../utils/proposalEvents'
import { ceramic } from '../utils/ceramic'
import { wallet } from '../utils/wallet'

// SCHEMAS
import { profileSchema } from '../schemas/profile'
import { profileListSchema } from '../schemas/profileList'
import { jweSchema } from '../schemas/jwe'
import { memberSchema } from '../schemas/members'
import { daoSeedsSchema } from '../schemas/daoSeeds'


// TRANSLATIONS
import { withLocalize } from 'react-localize-redux'
import translations_en from '../translations/en.global.json'
import translations_ru from '../translations/ru.global.json'
import translations_zh_hans from '../translations/zh-hans.global.json'
import translations_zh_hant from '../translations/zh-hant.global.json'

import styled, { ThemeProvider } from 'styled-components'
import ScrollToTop from '../utils/ScrollToTop'
import GlobalAlert from './responsive/GlobalAlert'
import '../index.css'
import Dao from './dao/dao'
import Navigation from './navigation/Navigation'
import Footer from './common/Footer'
import NetworkBanner from './common/NetworkBanner'
import TwoFactorVerifyModal from '../components/accounts/two_factor/TwoFactorVerifyModal'
import PrivateRoute from './common/PrivateRoute'
import DashboardDetailWithRouter from './dashboard/DashboardDetail'
import AppFramework from '../components/dao/components/AppFramework/appFramework'
import HQ from './dao/components/landingPages/catalystHQ'
import ExploreDaos from './dao/components/landingPages/exploreDaos'
import { CreateAccountWithRouter } from './accounts/CreateAccount'
import { SetupRecoveryMethodWithRouter } from './accounts/recovery_setup/SetupRecoveryMethod'
import { SetupLedgerWithRouter } from './accounts/ledger/SetupLedger'
import { SetupLedgerSuccessWithRouter } from './accounts/ledger/SetupLedgerSuccess'
import { EnableTwoFactor } from './accounts/two_factor/EnableTwoFactor'
import { RecoverAccountWithRouter } from './accounts/RecoverAccount'
import { RecoverAccountSeedPhraseWithRouter } from './accounts/RecoverAccountSeedPhrase'
import { RecoverWithLinkWithRouter } from './accounts/RecoverWithLink'
import { SignInLedger } from './accounts/ledger/SignInLedger'
import { LoginWithRouter } from './login/Login'
import { LoginCliLoginSuccess } from './login/LoginCliLoginSuccess'
import { ContactsWithRouter } from './contacts/Contacts'
import { AuthorizedAppsWithRouter } from './access-keys/AccessKeys'
import { FullAccessKeysWithRouter } from './access-keys/AccessKeys'
import { SendContainer } from './send/SendContainer'
import { ReceiveMoneyWithRouter } from './receive-money/ReceiveMoney'
import { GuestLanding } from './landing/GuestLanding'
import { Profile } from './profile/Profile'
import { SignWithRouter } from './sign/Sign'
import { NodeStakingWithRouter } from './node-staking/NodeStaking'
import { AddNodeWithRouter } from './node-staking/AddNode'
import { NodeDetailsWithRouter } from './node-staking/NodeDetails'
import { StakingContainer } from './staking/StakingContainer'
import { DISABLE_SEND_MONEY, WALLET_CREATE_NEW_ACCOUNT_FLOW_URLS } from '../utils/wallet'
import { refreshAccount, handleRefreshUrl, clearAlert, clear, handleRedirectUrl, handleClearUrl, promptTwoFactor } from '../actions/account'
import LedgerConfirmActionModal from './accounts/ledger/LedgerConfirmActionModal';
import { initiateAppDB, initiateDB } from '../utils/threadsDB'
import GlobalStyle from './GlobalStyle'
import { SetupSeedPhraseWithRouter } from './accounts/SetupSeedPhrase'
import { SetupImplicitWithRouter } from './accounts/SetupImplicit'
import  AddFields from './schema-builder/AddFields'
import { handleClearAlert} from '../utils/alerts'
import { SettingsApplicationsRounded } from '@material-ui/icons'

const theme = {}

const PATH_PREFIX = process.env.PUBLIC_URL

//const onMissingTranslation = ({ defaultTranslation }) => defaultTranslation;
const onMissingTranslation = ({ defaultTranslation }) => {
    return `${defaultTranslation}`
};

const Container = styled.div`
    min-height: 100vh;
    padding-bottom: 200px;
    padding-top: 75px;
    .main {
        padding-bottom: 200px;
    }

    @media (max-width: 991px) {
        .App {
            .main {
                padding-bottom: 0px;
            }
        }
    }
`

const imageName = require('../images/default-profile.png') // default no-image avatar

function Routing(props) {

    const [currentPeriod, setCurrentPeriod] = useState()
    const [proposalsLength, setProposalsLength] = useState()
    const [proposalEvents, setProposalEvents] = useState()
    const [daoContractId, setDaoContractId] = useState()
    const [factoryContract, setFactoryContract] = useState()
    const [contract, setContract] = useState()
    const [daoContractSender, setDaoContractSend] = useState()
    const [didsContract, setDIDsContract] = useState()
    const [hasDao, setHasDao] = useState()
    const [accountId, setAccountId] = useState()
    const [daoList, setDaoList] = useState()

    const [appClient, setAppCeramicClient] = useState()
    const [curUserCeramicClient, setCurUserCeramicClient] = useState()
    const [DID, setDID] = useState()
    const [curUserIdx, setCurUserIdx] = useState()
    const [appIdx, setAppIdx] = useState()
    const [aliases, setAliases] = useState({})
    const [contractId, setContractId] = useState()
    const [contractIdx, setContractIdx] = useState()

    const [errorMessage, setErrorMessage] = useState()
    const [severity, setSeverity] = useState()
    const [successMessage, setSuccessMessage] = useState()
    const [snackBarOpen, setSnackBarOpen] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [avatar, setAvatar] = useState()
    

    const { 
        refreshAccount, handleRefreshUrl,
        history, clearAlert,
        clear, handleRedirectUrl, handleClearUrl
    } = props

  

  //  const { accountId } = useContext(DaoCeramicAppContext)

    const languages = [
        { name: "English", code: "en" },
        { name: "Русский", code: "ru" },
        { name: "简体中文", code: "zh-hans" },
        { name: "繁體中文", code: "zh-hant" }
    ]
    
    const activeLang = localStorage.getItem("languageCode") || languages[0].code

   
    useEffect(
        () => {
            let isMounted = true; // note this flag denote mount status

            if(isMounted){
            props.initialize({
                languages,
                options: {
                    defaultLanguage: 'en',
                    renderToStaticMarkup: false,
                    renderInnerHtml: true,
                    onMissingTranslation
                }
            })
        
            // TODO: Figure out how to load only necessary translations dynamically
            props.addTranslationForLanguage(translations_en, "en")
            props.addTranslationForLanguage(translations_ru, "ru")
            props.addTranslationForLanguage(translations_zh_hans, "zh-hans")
            props.addTranslationForLanguage(translations_zh_hant, "zh-hant")
        
            props.setActiveLanguage(activeLang)
            //this.addTranslationsForActiveLanguage(defaultLanguage)
            }
           
                handleRefreshUrl()
                refreshAccount()
           
                async function fetchData() {

                    let accountId
                    let accountObj = await dao.loadAccountObject()
                   
                    if(accountObj){
                        accountId = accountObj.accountId
                        setAccountId(accountId)

                        // Instantiate DIDs Contract
                        let thisDIDsContract = await dids.loadDIDs(process.env.DIDS_CONTRACT)
                        if(isMounted) {
                            setDIDsContract(thisDIDsContract)
                         
                        }
                    
                        // ******** IDX Initialization *********

                        //Set App Ceramic Client
                        let appSeed = Buffer.from(process.env.FACTORY_PRIV_KEY.slice(0, 32))
                        let appAccount = await wallet.getAccount(process.env.FACTORY_CONTRACT)
                       
                        let appClient = await ceramic.getCeramic(appAccount, appSeed)
                        setAppCeramicClient(appClient)
                       
                        let appDID = await ceramic.associateDAODID(appAccount, thisDIDsContract, appClient)
                       
                        // Associate app NEAR account with 3ID and store in contract and cache in local storage
                        let appAssociate = await ceramic.associateDID(appAccount, thisDIDsContract, appClient)
                        

                        // create app vault and definition if it doesn't exist
                        let jweAlias = await ceramic.schemaSetup(appAccount, 'jwe', 'encrypted seed', thisDIDsContract, appClient, jweSchema)

                        let seedAlias = await ceramic.schemaSetup(appAccount, 'SeedsJWE', 'encrypted dao seeds', thisDIDsContract, appClient, daoSeedsSchema)
                        let currentAliases = {}
                        try {
                            let allAliases = await thisDIDsContract.getAliases()
                          
                            //reconstruct aliases
                            let i = 0
                            
                            while (i < allAliases.length) {
                                let key = allAliases[i].split(':')
                                let alias = {[key[0]]: key[1]}
                                currentAliases = {...currentAliases, ...alias}
                                i++
                            }
                            if(allAliases) {
                                
                                let appIdx = new IDX({ ceramic: appClient, aliases: currentAliases})
                                setAppIdx(appIdx)
                              
                            }
                        } catch (err) {
                            console.log('error retrieving aliases and setting app Idx', err)
                        }
                        
                        // Set Current User Ceramic Client                      
                        let currentUserCeramicClient = await ceramic.getCeramic(accountObj)
                        setCurUserCeramicClient(curUserCeramicClient)
                       

                        // Associate current user NEAR account with 3ID and store in contract and cache in local storage
                        let associate = await ceramic.associateDID(accountObj, thisDIDsContract, currentUserCeramicClient)
                     
                        let profileAliases = await ceramic.schemaSetup(accountObj, 'profile', 'user profile data', thisDIDsContract, currentUserCeramicClient, profileSchema)
                        
                        let currentUserAliases = {}
                        let curInfo
                        try {
                            let allAliases = await thisDIDsContract.getAliases()
                          
                            //reconstruct aliases
                            let i = 0
                            
                            while (i < allAliases.length) {
                                let key = allAliases[i].split(':')
                                let alias = {[key[0]]: key[1]}
                                currentUserAliases = {...currentUserAliases, ...alias}
                                i++
                            }
                            if(allAliases) {
                               
                                let userIdx = new IDX({ ceramic: currentUserCeramicClient, aliases: currentUserAliases})
                                setCurUserIdx(userIdx)
                                curInfo = await userIdx.get('profile')
                                console.log('curInfo', curInfo)
                                if(curInfo){
                                    setAvatar(curInfo.avatar)
                                }

                              
                            }
                        } catch (err) {
                            console.log('error retrieving aliases and setting app Idx', err)
                        }
                        

                        // publish the document schemas and definitions and retain their CIDs (one time operation)
                        let isInitialized = await thisDIDsContract.getInitialize()
                        console.log('isinitialized', isInitialized)
                    //   if(!isInitialized) {

                        // const definitions = await thisDIDsContract.getDefinitions()
                        // console.log('definitions', definitions)

                        // const schemas = await thisDIDsContract.getSchemas()
                        // console.log('schemas', schemas)
                       // let currentAliases = {}
                        // let jweAliases = await ceramic.schemaSetup(accountObj, 'jwe', 'encrypted signatures', thisDIDsContract, ceramicClient, jweSchema)
                        // //currentAliases = {...aliases, ...jweAliases}
                        // handleAliases(jweAliases)

                      

                    //     let memberAliases = await ceramic.schemaSetup(accountObj, 'member', 'member events', thisDIDsContract, ceramicClient, memberSchema)
                    //    // currentAliases = {...currentAliases, ...memberAliases}
                    //     handleAliases(memberAliases)

                        //setAliases(currentAliases)
                        
                        
                        
                        // const loadVaults = await idx.get('vault')
                        // console.log('loadVaults', loadVaults)

                        // const loadProfiles = await idx.get('profile')
                        // console.log('loadProfile', loadProfiles)

                        //test encrypt
                        
                        // let upload = await ceramic.uploadSecret(idx, seed, aliases.vault)
                        // console.log('upload', upload)

                        // let download = await ceramic.downloadSecret(idx, aliases.vault)
                        // console.log('download', Buffer.from(download).toString("base64"))
                        // console.log('raw download', download)

                       
                        // view index
                       // console.log(await idx.getIndex(idx.id))
                        

                        
                        let daoName = accountId.split('.')
                        let dname = daoName[0]
                      
                        let thisfactoryContract = await factory.loadFactory(dname+'.'+process.env.FACTORY_CONTRACT)
                        

                        if(isMounted) {
                        setFactoryContract(thisfactoryContract)
                     
                        }

                        try{
                            let list = await thisfactoryContract.getDaoList()
                            setDaoList(list)
                        } catch (err) {
                            console.log('problem retrieving Dao List', err)
                        }
            
                        try {
                        let accountName = accountId.split('.')
                        let name = accountName[0]
                        let hasDao = await thisfactoryContract.findDAO({account: name + '.' + process.env.FACTORY_CONTRACT})
                        let contract = await dao.loadDAO(name + '.' + process.env.FACTORY_CONTRACT)
                        let daoContractSender = await daoContractSend.loadDAO(name + '.' + process.env.FACTORY_CONTRACT)
                      //  console.log('has dao routing', hasDao)
                        if(hasDao){
                            setHasDao(true)
                            setDaoContractId(name + '.' + process.env.FACTORY_CONTRACT)
                            setContract(contract)
                            setDaoContractSend(daoContractSender)                     
                            
                    
                            let i = 1
                
                        setTimeout(async function refreshCurrentPeriod() {
                            let start = true
                            let init
                            try{
                                init = await contract.getInit()
                            } catch (err) {
                                console.log('cant retreive init', err)
                            }
                            if(init=='done'){
                            try {
                            let period = await contract.getCurrentPeriod()
                            setCurrentPeriod(period)
                            console.log('get period success')
                            } catch (err) {
                            console.log('get period issue', err)
                            }
                            start = false
                            i++
                            if(start == false){
                            setTimeout(refreshCurrentPeriod, 10000)
                            }
                        }
                        }, 10000)
                    
                        let j = 1
                        setTimeout(async function refreshCurrentProposals() {
                            let start = true
                        try {
                                let proposalLength = await contract.getProposalsLength()
                                console.log('proposalLength', proposalLength)
                                setProposalsLength(proposalLength)
                                let currentProposalEvents = await proposalEvent.retrieveAllEvents(proposalLength, 'ProposalEvents')
                                console.log('currentproposalevents', currentProposalEvents)
                                setProposalEvents(currentProposalEvents)
                                
                            } catch (err) {
                                console.log('error retrieving proposal events', err)
                                return false
                            }
                            start = false
                            j++
                            if(start == false){
                            setTimeout(refreshCurrentProposals, 30000)
                            }
                        }, 30000)
                    
                    }
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
                if(props.account){
                fetchData()
                    .then((res) => {
                    })
                }
            
            history.listen(async () => {
               
                handleRedirectUrl(props.router.location)
                handleClearUrl()
                if (!WALLET_CREATE_NEW_ACCOUNT_FLOW_URLS.find((path) => props.router.location.pathname.indexOf(path) > -1)) {
                    await refreshAccount()
                }
                
               handleClearAlert()
                
            })

            


            // const prevLangCode = prevProps.activeLanguage && prevProps.activeLanguage.code
            // const curLangCode = props.activeLanguage && props.activeLanguage.code
            // const hasLanguageChanged = prevLangCode !== curLangCode

            // if (hasLanguageChanged) {
            //     // this.addTranslationsForActiveLanguage(curLangCode)
            //     localStorage.setItem("languageCode", curLangCode)
            // }
            return () => { isMounted = false } // use effect cleanup to set flag false if unmounted
        },
        []
    )

    function handleSetCurrentPeriod(currentPeriod) {
        setCurrentPeriod(currentPeriod)
      }
    
    function handleSetProposalsLength(proposalLength){
        setProposalsLength(proposalLength)
    }

    function handleSetProposalEvents(proposalEvents){
        setProposalEvents(proposalEvents)
    }

    function handleCurUserCeramicClient(client){
        setCurUserCeramicClient(client)
    }

    function handleDID(did){
        setDID(did)
    }

    function handleIDX(idx){
        setIDX(idx)
    }

    
    function handleContractId(contractId){
        setContractId(contractId)
    }

    function handleContractIdx(contractIdx){
        setContractIdx(contractIdx)
    }

    function handleAliases(newAliases){
        let currentAliases = {...aliases, ...newAliases}
        setAliases(currentAliases)
    }

    function handleErrorMessage(message, severity) {
        setErrorMessage(message)
        setSeverity(severity)
        refreshAccount()
      }
    
    function handleSuccessMessage(message, severity) {
    setSuccessMessage(message)
    setSeverity(severity)
    refreshAccount()
    }

    function handleSnackBarOpen(property) {
    setSnackBarOpen(property)
    }

    function handleAvatarChange(avatar){
        setAvatar(avatar)
    }
    
    
    async function handleProposalEventChange() {
    try {
        let proposalLength = await contract.getProposalsLength()
        let currentProposalEvents = await proposalEvent.retrieveAllEvents(proposalLength, 'ProposalEvents')
        console.log('currentproposalevents', currentProposalEvents)
        setProposalEvents(currentProposalEvents)
        setProposalsLength(proposalLength)
        return true
    } catch (err) {
        console.log('error retrieving proposal events', err)
        return false
    }
    }
    
   
const { search } = props.router.location
   
        
        return (
           <DaoCeramicAppProvider>
            <Container className='App' id='app-container'>
                <GlobalStyle />
                <ConnectedRouter basename={PATH_PREFIX} history={props.history} >
                    <ThemeProvider theme={theme}>
                        <ScrollToTop/>
                        <NetworkBanner 
                            account={props.account}
                        />
                        <Navigation curUserIdx={curUserIdx} avatar={avatar}/>
                        <GlobalAlert/>
                        <LedgerConfirmActionModal/>
                        { 
                            props.account.requestPending !== null &&
                            <TwoFactorVerifyModal
                                onClose={(verified, error) => {
                                    const { account, promptTwoFactor } = props
                                    // requestPending will resolve (verified == true) or reject the Promise being awaited in the method that dispatched promptTwoFactor
                                    account.requestPending(verified, error)
                                    // clears requestPending and closes the modal
                                    promptTwoFactor(null)
                                }}
                            />
                        }
                        {props.account.loader === false && (
                            <Switch>
                                <Redirect from="//*" to={{
                                    pathname: '/*',
                                    search: search
                                }} />
                                {!props.account.accountId ? (
                                <Route
                                    exact
                                    path='/'
                                    component={GuestLanding}
                                   
                                />
                                ) : (
                                    <Route
                                    exact
                                    path='/'
                                    render={() => (
                                        <DashboardDetailWithRouter
                                        {...props}
                                        handleCurUserCeramicClient={handleCurUserCeramicClient}
                                        handleDID={handleDID}
                                        DID={DID}
                                        />
                                    )}
                                    />
                                )}                                
                                <Route
                                    exact
                                    path='/create/:fundingContract?/:fundingKey?'
                                    component={CreateAccountWithRouter}
                                />
                                <Route
                                    exact
                                    path={'/create-from/:fundingAccountId'}
                                    component={CreateAccountWithRouter}
                                />
                                <Route
                                    exact
                                    path='/set-recovery/:accountId/:fundingContract?/:fundingKey?'
                                    component={SetupRecoveryMethodWithRouter}
                                />
                                <Route
                                    exact
                                    path='/setup-seed-phrase/:accountId/:step'
                                    component={SetupSeedPhraseWithRouter}
                                />
                                <Route
                                    exact
                                    path='/fund-create-account/:accountId/:implicitAccountId/:recoveryMethod'
                                    component={SetupImplicitWithRouter}
                                />
                                <Route
                                    exact
                                    path='/setup-ledger/:accountId'
                                    component={SetupLedgerWithRouter}
                                />
                                <Route
                                    exact
                                    path='/add-fields'
                                    component={AddFields}
                                />
                                <PrivateRoute
                                    exact
                                    path='/setup-ledger-success'
                                    component={SetupLedgerSuccessWithRouter}
                                />
                                <PrivateRoute
                                    exact
                                    path='/enable-two-factor'
                                    component={EnableTwoFactor}
                                />
                                <Route
                                    exact
                                    path='/recover-account'
                                    component={RecoverAccountWithRouter}
                                />
                                <Route
                                    exact
                                    path='/recover-seed-phrase/:accountId?/:seedPhrase?'
                                    component={RecoverAccountSeedPhraseWithRouter}
                                />
                                <Route
                                    exact
                                    path='/recover-with-link/:accountId?/:seedPhrase?'
                                    component={RecoverWithLinkWithRouter}
                                />
                                <Route
                                    exact
                                    path='/sign-in-ledger'
                                    component={SignInLedger}
                                />
                                <PrivateRoute
                                    path='/login'
                                    component={LoginWithRouter}
                                />
                                <PrivateRoute
                                    exact
                                    path='/contacts'
                                    component={ContactsWithRouter}
                                />
                                <PrivateRoute
                                    exact
                                    path='/authorized-apps'
                                    component={AuthorizedAppsWithRouter}
                                />
                                <PrivateRoute
                                    exact
                                    path='/full-access-keys'
                                    component={FullAccessKeysWithRouter}
                                />
                                {!DISABLE_SEND_MONEY &&
                                    <PrivateRoute
                                        exact
                                        path='/send-money/:id?'
                                        component={SendContainer}
                                    />
                                }
                                <PrivateRoute
                                    exact
                                    path='/receive-money'
                                    component={ReceiveMoneyWithRouter}
                                />
                                <Route
                                    exact
                                    path='/profile/:accountId?'
                                    render={(props) => (
                                        <Profile
                                        curUserIdx={curUserIdx}
                                        appIdx={appIdx}
                                        refreshAccount={refreshAccount}
                                        avatar={avatar}
                                        handleAvatarChange={handleAvatarChange}
                                        {...props}
                                        />
                                    )}
                                />
                                <PrivateRoute
                                    exact
                                    path='/sign'
                                    component={SignWithRouter}
                                />
                                <PrivateRoute
                                    exact
                                    path='/node-staking'
                                    component={NodeStakingWithRouter}
                                />
                                <PrivateRoute
                                    exact
                                    path='/add-node'
                                    component={AddNodeWithRouter}
                                />
                                <PrivateRoute
                                    exact
                                    path='/node-details'
                                    component={NodeDetailsWithRouter}
                                />
                                <Route
                                    exact
                                    path='/dao/:contractId'
                                    render={() => (
                                        <AppFramework
                                        {...props}
                                        handleSetCurrentPeriod={handleSetCurrentPeriod}
                                        handleContractIdx={handleContractIdx}
                                        refreshAccount={refreshAccount}
                                        contractIdx={contractIdx}
                                        didsContract={didsContract}
                                        accountId={accountId}
                                        appClient={appClient}
                                        appIdx={appIdx}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path='/createDao'
                                    render={() => (
                                        <HQ
                                        {...props}
                                        accountId={accountId}
                                        tokenName='Ⓝ'
                                        depositToken='Ⓝ'
                                        contract={contract}
                                        daoContract={daoContractSender}
                                        factoryContract={factoryContract}
                                        hasDao={hasDao}
                                        handleSnackBarOpen={handleSnackBarOpen}
                                        handleSuccessMessage={handleSuccessMessage}
                                        handleErrorMessage={handleErrorMessage}
                                        snackBarOpen={snackBarOpen}
                                        severity={severity}
                                        errorMessage={errorMessage}
                                        successMessage={successMessage}
                                        daoList={daoList}
                                        appIdx={appIdx}
                                        curUserIdx={curUserIdx}
                                        proposalDeposit={10}
                                        didsContract={didsContract}
                                        appClient={appClient}
                                        aliases={aliases}
                                        handleAliases={handleAliases}
                                      />
                                    )}
                                    />
                                <Route
                                    exact
                                    path='/explore'
                                    render={() => (
                                        <ExploreDaos
                                        {...props}
                                        daoList={daoList}
                                        appIdx={appIdx}
                                        didsContract={didsContract}
                                        appClient={appClient}
                                        handleContractId={handleContractId}
                                        handleContractIdx={handleContractIdx}
                                      />
                                    )}
                                />
                                <Route
                                    exact
                                    path='/proposals'
                                    render={() => (
                                        <Dao 
                                        {...props}
                                        proposalEvents={proposalEvents}
                                        currentPeriod={currentPeriod}
                                        proposalsLength={proposalsLength}
                                        handleSetCurrentPeriod={handleSetCurrentPeriod}
                                        handleProposalEventChange={handleProposalEventChange}
                                        handleSetProposalEvents={handleSetProposalEvents}
                                        handleSetProposalsLength={handleSetProposalsLength}
                                        factoryContract={factoryContract}
                                        contract={contract}
                                        daoContractSender={daoContractSender}
                                        hasDao={hasDao}
                                        accountId={accountId}
                                        daoList={daoList}
                                        curUserIdx={curUserIdx}
                                        appIdx={appIdx}
                                        didsContract={didsContract}
                                        />
                                    )}
                                />
                               
                                <PrivateRoute
                                    path='/staking'
                                    component={StakingContainer}
                                    render={() => (
                                        <StakingContainer
                                            history={props.history}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path='/cli-login-success'
                                    component={LoginCliLoginSuccess}
                                />
                                <PrivateRoute
                                    component={DashboardDetailWithRouter}
                                />
                            </Switch>
                        )}
                        <Footer />
                    </ThemeProvider>
                </ConnectedRouter>
            </Container>
            </DaoCeramicAppProvider>
        )
    
}

Routing.propTypes = {
    history: PropTypes.object.isRequired
}

const mapDispatchToProps = {
    refreshAccount,
    handleRefreshUrl,
    clearAlert,
    clear,
    handleRedirectUrl,
    handleClearUrl,
    promptTwoFactor
}

const mapStateToProps = ({ account, router }) => ({
    account,
    router
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withLocalize(Routing))
