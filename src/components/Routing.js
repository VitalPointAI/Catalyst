import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled, { ThemeProvider } from 'styled-components'
import { dao } from '../utils/dao'
import { proposalEvent } from '../utils/proposalEvents'

import { Route, Switch, Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { withLocalize } from 'react-localize-redux'
import translations_en from '../translations/en.global.json'
import translations_ru from '../translations/ru.global.json'
import translations_zh_hans from '../translations/zh-hans.global.json'
import translations_zh_hant from '../translations/zh-hant.global.json'
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
function Routing(props) {

    const[currentPeriod, setCurrentPeriod] = useState()
    const[proposalsLength, setProposalsLength] = useState()
    const[proposalEvents, setProposalEvents] = useState()

    const { 
        refreshAccount, handleRefreshUrl,
        history, clearAlert,
        clear, handleRedirectUrl, handleClearUrl
    } = props

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
                    let accountObj = await dao.loadAccountObject()
                    let accountId = accountObj.accountId
                   
                    let contract = await dao.loadDAO()
                   
                    let i = 1
        
                  setTimeout(async function refreshCurrentPeriod() {
                    let start = true
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
    
                fetchData()
                    .then((res) => {
                    })
            
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
            <Container className='App' id='app-container'>
                <GlobalStyle />
                <ConnectedRouter basename={PATH_PREFIX} history={props.history} >
                    <ThemeProvider theme={theme}>
                        <ScrollToTop/>
                        <NetworkBanner 
                            account={props.account}
                        />
                        <Navigation/>
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
                                <Route
                                    exact
                                    path='/' 
                                    component={!props.account.accountId ? GuestLanding : DashboardDetailWithRouter}
                                />
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
                                    component={Profile}
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
