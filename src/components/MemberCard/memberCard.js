import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      marginTop: '10px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    header: {
      display: 'inherit'
    }
  }));

  const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function MemberCard(props) {

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [did, setDid] = useState()
    const [curUserIdx, setCurUserIdx] = useState()

    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near, 
      appIdx
    } = state

    const classes = useStyles();

    const {
      accountName, 
      shares, 
      memberCount, 
      summoner,
    } = props

    useEffect(
        () => {
         
          async function fetchData() {

            // Set Card Persona Idx
            let curPersonaIdx
            if(accountName){
              let existingDid = await didRegistryContract.hasDID({accountId: accountName})
            
                if(existingDid){
                 
                  let personaAccount = new nearAPI.Account(near.connection, accountName)

                  curPersonaIdx = await ceramic.getCurrentUserIdx(personaAccount, appIdx)
                  setCurUserIdx(curPersonaIdx)
              
                  let result = await curPersonaIdx.get('profile', curPersonaIdx.id)
                  console.log('result member card', result)
                  
                  if(result){
                    result.date ? setDate(result.date) : setDate('')
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                    result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                    result.name ? setName(result.name) : setName('')
                  }
              }
            }
        }
       
        fetchData()
          .then((res) => {
           
          })

    }, [avatar]
    )

    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }
      

    return(
        <>
        <Card raised={true} className={classes.card} >
          <div style={{float:'left', padding:'3px', width:'18%'}}>
          <Avatar variant="circular" src={avatar}  />
          </div>
          <div style={{float:'left', marginLeft:'10px', width:'70%'}}>
          <CardHeader
            title={name}
          />
          </div>
         
          <CardHeader
          subheader={ <><center><Chip size="small" color="primary" label={accountName}/><br></br><Typography variant="overline" align="center">Joined: {date}</Typography></center></>}
          className={classes.header}
          />
 
          <CardContent>
            <Grid container alignItems="center" style={{marginTop: '-20px', marginBottom:'20px', display:'inherit'}}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Typography variant="overline" align="center">{shares > 1 ? shares + ' shares' : shares + ' share' }</Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Typography variant="overline">{`Voting Power: ${shares && memberCount ? (shares / memberCount)*100 : '100'}%`}</Typography>
              </Grid>
            </Grid>
          </CardContent>
          {summoner == accountName ? <center><Chip size="small" color="secondary" label='summoner' style={{marginTop: '-30px'}}/></center> : null} 
        </Card>
        </>
    )
}