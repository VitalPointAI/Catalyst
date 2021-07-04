import React, { useState, useEffect, useContext } from 'react'
import { get, set, del } from '../utils/storage'
import clsx from 'clsx';
import { flexClass } from '../App'
import SignIn from './SignIn/signIn'
import Footer from '../components/common/Footer/footer'
import Dashboard from '../components/mainPages/dashboard'
import LeftSideDrawer from './LeftSideDrawer/leftSideDrawer'
import LogoutButton from './LogoutButton/logoutButton'
import LoginButton from './LogInButton/loginButton'
import Persona from './Persona/persona'
import Logo from './Logo/logo'
import Import from './Import/import'
import { KEY_REDIRECT } from '../state/near'
import { Header } from './Header/header'
import FrontPage from './LandingSite/home'

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
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

export const Home = ({ children, state, handleSnackBarOpen, handleSuccessMessage, handleErrorMessage, snackBarOpen, severity, errorMessage, successMessage }) => {

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
        <div className={classes.root}>
            <Header state={state}
            handleSnackBarOpen={handleSnackBarOpen}
            handleSuccessMessage={handleSuccessMessage}
            handleErrorMessage={handleErrorMessage}
            snackBarOpen={snackBarOpen}
            severity={severity}
            errorMessage={errorMessage}
            successMessage={successMessage}
            />
       
        {finished ? 
           
            wallet && wallet.signedIn ?  
                key ? (<Import />) : <Dashboard />
            : <FrontPage wallet={wallet} state={state}/>
               
            : state.accountData ? (
                {children}
            ) 
            : <div className={classes.centered}><CircularProgress/><br></br><Typography variant="h6">Setting Things Up...</Typography></div>
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
        
        </div>
        <Footer />
    </>
    )
}