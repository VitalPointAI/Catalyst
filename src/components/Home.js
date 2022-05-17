import React, { useState, useEffect, useContext } from 'react'
import { get, set, del } from '../utils/storage'
import { appStore, onAppMount } from '../state/app'
import { flexClass } from '../App'
import Dashboard from '../components/mainPages/dashboard'
import Import from './Import/import'
import { KEY_REDIRECT } from '../state/near'
import RandomPhrase from './common/RandomPhrase/randomPhrase'
import FrontPage from './mainPages/frontPage'

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import '../App.css'


const useStyles = makeStyles((theme) => ({
      centered: {
        width: '200px',
        height: '100px',
        textAlign: 'center',
        position: 'fixed',
        top: '50%',
        left: '50%',
        marginTop: '-100px',
        marginLeft: '-100px'
      }
  }));

export const Home = ({ children }) => {
    const { state, update } = useContext(appStore)
    const classes = useStyles()
   
    const {
        app, wallet, links, claimed, accountId, curInfo, finished, key
    } = state

    useEffect(
        () => {
            let needsKey = get(KEY_REDIRECT, [])
            if(needsKey.action == true){
                update('', {key: false})
            } else (
                update('', {key: false})
            )
    }, [finished]
    )

    return (
        <>
        {finished ? 
           
            wallet && wallet.signedIn ?  
                key ? (<Import />) 
                    : (<Dashboard />)
            : process.env.ENV == 'prod' ?
            window.location.replace('https://vitalpoint.ai/catalyst')
            :  (<FrontPage />)
            : state.accountData ? (
                {children}
            ) 
            : (<>
                <div className={classes.centered}>
                    <CircularProgress/><br></br>
                    <Typography variant="h6">Setting Things Up...</Typography><br></br>
                    <RandomPhrase />
                </div>
                </>)
        }    

        
    </>
    )
}
