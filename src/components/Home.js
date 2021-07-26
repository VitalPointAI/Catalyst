import React, { useState, useEffect, useContext } from 'react'
import { get, set, del } from '../utils/storage'
import { flexClass } from '../App'
import Footer from '../components/common/Footer/footer'
import Dashboard from '../components/mainPages/dashboard'
import Import from './Import/import'
import { KEY_REDIRECT } from '../state/near'
import { Header } from './Header/header'
import RandomPhrase from './common/RandomPhrase/randomPhrase'
import FrontPage from '../components/LandingSite/home'

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import '../App.css'


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
        marginTop: '-200px',
        marginLeft: '-100px'
      },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    menuButton: {
      marginRight: theme.spacing(0),
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    drawer: {
        marginTop: '5px'
    }
  }));

export const Home = ({ children, state }) => {

    const [key, setKey] = useState(false)
    const classes = useStyles();
   
    const {
        app, wallet, links, claimed, accountId, curInfo, finished
    } = state

    useEffect(
        () => {
            let needsKey = get(KEY_REDIRECT, [])
            if(needsKey.action == true){
                setKey(true)
            }
    }, [finished]
    )

    return (
        <>
        {finished ? 
           
            wallet && wallet.signedIn ?  
                key ? (<div className={classes.root}>
                        <Header state={state}/>
                            <Import />
                        <Footer />
                        </div>) : (
                        <div className={classes.root}>
                        <Header state={state}/>
                            <Dashboard />
                        <Footer />
                        </div>)

           // : window.location.replace('https://vitalpoint.ai/catalyst')
            :  (<div className={classes.root}><Header state={state}/><FrontPage /> <Footer /></div>)
            : state.accountData ? (
                <div className={classes.root}>
                <Header state={state}/>
                    {children}
                <Footer />
                </div>
            ) 
            : (<div className={classes.root}>
                <Header state={state}/>
                <div className={classes.centered}>
                    <CircularProgress/><br></br>
                    <Typography variant="h6">Setting Things Up...</Typography><br></br>
                    <RandomPhrase />
                </div>
                <Footer />
                </div>)
        }    
       
        { state.app.alert &&
            <div class="container-alert">
                <div class={flexClass + ' mt-0'}>
                    <div class="container container-custom mt-0">
                        <div class="alert alert-primary mt-0" role="alert">
                            {state.app.alert}
                        </div>
                    </div>
                </div>
            </div>
        }
        
    </>
    )
}