import React, {useState, useEffect} from 'react'
import {get, set, del} from '../../utils/storage'
import SignIn from '../SignIn/signIn'
import Import from '../Import/import'
//material ui imports
import { CircularProgress } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { login } from '../../state/near'
//display loading animation
//check if signed in
//if signed in -- direct to proper dao

//if not signed in
//add dao name to local storage
//direct so signin
//...


//
const Receiver = ({state}) => {
    const {
        app, wallet, links, claimed, accountId, curInfo, finished
    } = state
    const linkArray = (window.location.pathname.split("/")).slice(2);
    const link = window.location.origin + "/" + `${linkArray[0]}` + "/" + `${linkArray[1]}`
    useEffect(() => {
        
   //     var link = (window.location.pathname.split("/")).slice(2); 
   //     if(wallet && wallet.signedIn){
          //  window.location.href=window.location.hostname + "/" + link[0] + "/" + link[1];  
     //       window.location.href = "AAA"
     //   }
      //  else{
       //     window.location.href = "OOO"
     //   }
     //   window.location.href = window.location.hostname + ":1234/" + link[1] + "/" + link[2];  
    },[]);

    return (
        <>
        {finished? 
        <Grid container >
            <Grid item>
                {wallet && wallet.signedIn? <Button href={link}>Accept Invitation</Button>
                 :<Button onClick={login}>Accept Invitation</Button>}
            </Grid>
        </Grid>:
        <CircularProgress />}
        </>
    )
}

export default Receiver 