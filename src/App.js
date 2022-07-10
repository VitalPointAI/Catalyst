import React, { useState, useContext, useEffect } from 'react'
import { appStore, onAppMount } from './state/app'
import { get, set, del } from './utils/storage'
import { Route } from "react-router-dom"
import RandomPhrase from './components/common/RandomPhrase/randomPhrase'
import { KEY_REDIRECT } from './utils/ceramic'
import { Receiver } from './components/Receiver'
//import { PersonaPage } from './components/mainPages/personas'
import ExploreDaos from './components/mainPages/exploreDaos'
import AppFramework from './components/AppFramework/appFramework'
import NewKey from './components/mainPages/newKey'
//import Profile from './components/mainPages/profile'
import Register from './components/mainPages/register'
import { Home } from './components/Home'
import Daos from './components/mainPages/daos'
import Developers from './components/mainPages/developers'
import Supporters from './components/mainPages/supporters'
import ReceiveInvite from './components/Invite/Receiver'
import Opportunities from './components/mainPages/opportunities'
import MintFT from './components/mainPages/mintFT'
import FTs from './components/mainPages/fts'
import CommunityStreamIntro from './components/mainPages/communityStreamIntro'
import Header from './components/common/Header/header'
import Footer from './components/common/Footer/footer'
import ActiveProjectsByAccount from './components/mainPages/accountActiveProjects'
import OpportunityDetails from './components/mainPages/opportunityDetails'
import Choice from './components/mainPages/choice'

// Material-UI Components
import { CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

// helpers
export const btnClass = 'btn btn-sm btn-outline-primary mb-3 '
export const flexClass = 'd-flex justify-content-evenly align-items-center '
export const qs = (s) => document.querySelector(s)

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
    },
    centered: {
      width: '200px',
      height: '100px',
      textAlign: 'center',
      position: 'fixed',
      top: '50%',
      left: '50%',
      marginTop: '-100px',
      marginLeft: '-100px'
    },
    centeredPhrase: {
        maxWidth: '450px',
        height: '100px',
        textAlign: 'center',
        position: 'fixed',
        top: '50%',
        left: '50%',
        marginTop: '-80px',
        marginLeft: '-100px'
      },
    }));

const App = () => {
    
    const [nearPrice, setNearPrice] = useState(0)
    const { state, dispatch, update } = useContext(appStore)

    const classes = useStyles()
   
    const onMount = () => {
        dispatch(onAppMount());
    };

    useEffect(onMount, []);

    useEffect(
        () => {
          let timer
          async function getPrice(){
            let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
            if(getNearPrice.data.near.usd != nearPrice){
              update('', {nearPrice:getNearPrice.data.near.usd})
            }
          }
    
          function stop() {
            if (timer) {
                clearInterval(timer)
                timer = 0
            }
          }
    
          timer = setInterval(getPrice, 5000)
         
          
          return () => {
            
            stop()
          }
        },[]
    )

    window.onerror = function (message, url, lineNo) {
        alert('Error: ' + message + 
       '\nUrl: ' + url + 
       '\nLine Number: ' + lineNo);
    return true;   
    }    
    
    const {
        accountData, funding, wallet
    } = state
    
    let children = null

    if (!accountData || !wallet) {
        children = (<>
        <div className={classes.centered}><CircularProgress/><br></br>
            <Typography variant="h6">Setting Things Up...</Typography>
        </div>
        <div className={classes.centeredPhrase}>
            <RandomPhrase />
        </div></>)
    }

    if (accountData) {
        children = <Receiver {...{ state, dispatch }} />
    }

    if (funding) {
        children = <div class="container container-custom">
            <h2>DO NOT CLOSE OR REFRESH THIS PAGE</h2>
            <h2>Creating Persona...</h2>
        </div>
    }

    // if (wallet) {
    //     children = <PersonaPage {...{ state, dispatch, update }} />

    // }
    
    return(<>
        <div className={classes.root}>
        <Header state={state}/>
                <Route exact path="/">
                    <Home 
                        state={state}
                     >
                        { children }
                    </Home>
                </Route>
                <Route path="/daos">
                    <Daos state={state}/>
                </Route>
                <Route path="/explore">
                    <ExploreDaos state={state}/>
                </Route>
                <Route path="/fts">
                    <MintFT state={state}/>
                </Route>
                <Route path="/developers">
                    <Developers />
                </Route>
               
                <Route path="/inv">
                    <ReceiveInvite
                        state={state}
                    />
                </Route>
                <Route path="/newKey">
                    <NewKey />
                </Route>
                <Route path="/projects/:summoner">
                    <ActiveProjectsByAccount
                        state={state}
                    />
                </Route>
                <Route path="/opportunity/:contractId/:communityDid/:opportunityId">
                    <OpportunityDetails
                        state={state}
                    />
                </Route>
                <Route path="/register">
                    <Register />
                </Route>
                <Route exact path="/choice">
                    <Choice
                        state={state}
                    >
                        { children }
                    </Choice>
                </Route>
                <Route path="/community-stream">
                    <CommunityStreamIntro />
                </Route>
                <Route path="/dao/:contractId">
                    <AppFramework
                        state={state}
                    />
                </Route>
                <Route path="/ft/:contractId">
                    <FTs
                        state={state}
                    />
                </Route>
                <Route path="/supporters/:contractId">
                    <Supporters state={state}/>
                </Route>
                <Route path="/opportunities/:contractId">
                    <Opportunities state={state} />
                </Route>
        </div>
        <Footer />
        </>
    )
}

export default App
