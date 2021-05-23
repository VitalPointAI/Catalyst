import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { flexClass } from '../App'
import SignIn from '../components/SignIn/signIn'
import Footer from '../components/common/Footer/footer'
import LeftSideDrawer from '../components/LeftSideDrawer/leftSideDrawer'
import LogoutButton from '../components/LogoutButton/logoutButton'
import LoginButton from '../components/LogInButton/loginButton'
import Persona from '../components/Persona/persona'
import Logo from '../components/Logo/logo'
import { Header } from '../components/Header/header'


// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import '../App.css'


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
      //  maxWidth: 640,
        margin: 'auto',
      //  marginTop: 50,
        marginBottom: 50,
        minHeight: 550,
        padding: '20px',
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

export const Container = ({ children, state, handleSnackBarOpen, handleSuccessMessage, handleErrorMessage, snackBarOpen, severity, errorMessage, successMessage }) => {

    const classes = useStyles();
   
    const {
        app, wallet, links, claimed, accountId, curInfo, finished
    } = state

    useEffect(
        () => {        
    }, []
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
        successMessage={successMessage}/>
       
        <div class={flexClass}>
        {finished ? (
            <div class="container container-custom">
                {wallet && wallet.signedIn ? children : <SignIn wallet={wallet} state={state}/>}
            </div>
            ) : state.accountData ? (
            <div class="container container-custom">
                {children}
            </div>
            ) : <CircularProgress/> 
        }
            
        </div>
      
        
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