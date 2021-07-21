import React, { useState, useEffect, useContext } from 'react'
import { Redirect } from 'react-router-dom'
import { flexClass } from '../App'
import Footer from '../components/common/Footer/footer'
import { Header } from '../components/Header/header'


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

export const Container = ({ children, state }) => {

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
        />
        
        {finished ? 
           
            wallet && wallet.signedIn ? 
             children 
            
            : <Redirect to="https://vitalpoint.ai/catalyst" />
               
            : state.accountData ? 
                children 
            
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