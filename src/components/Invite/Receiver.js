import React, {useState, useEffect} from 'react'
import logo from '../../img/catalyst-by-vpai.png'

import { login } from '../../state/near'
//material ui imports
import { CircularProgress } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
//display loading animation
//check if signed in
//if signed in -- direct to proper dao

//if not signed in
//direct so signin
//...

const Receiver = ({state}) => {
    const {
        app, wallet, links, claimed, accountId, curInfo, finished
    } = state
    const linkArray = (window.location.pathname.split("/")).slice(2);
    const link = window.location.origin + "/" + `${linkArray[0]}` + "/" + `${linkArray[1]}`
    const daoName = (linkArray[1].split("."))[0]
    useEffect(() => {
    },[]);

    return (
        <>
        {finished? 
        <Grid container spacing={6} direction="column" alignItems='center' justify='center' style={{flexGrow: 1}}>
                <Grid item xs={6}>
                    <img style={{width: 300}} src={logo}/>
                </Grid>
                <Grid item xs={6}>
                    <Typography style={{fontSize: 24}}>You've been invited to {`${daoName}`}!</Typography>
                </Grid>
                <Grid item xs={6}>
                {wallet && wallet.signedIn? 
                  <Button  style={{backgroundColor: '#ffa366'}} variant="outlined" href={link}>
                    Accept Invitation
                  </Button>
                 :
                 <Button style={{backgroundColor: '#ffa366'}} variant="contained" onClick={login}>
                     Accept Invitation
                 </Button>}
                </Grid>
        </Grid>:
        <CircularProgress />}
        </>
    )
}

export default Receiver 