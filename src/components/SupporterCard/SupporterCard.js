import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import * as nearAPI from 'near-api-js'
import Persona from '@aluhning/get-personas-js'

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
      margin: 'auto'
    },
    avatar: {
      backgroundColor: red[500],
    },
    header: {
      display: 'inherit'
    }
  }));

  const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function SupporterCard(props) {

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [did, setDid] = useState()
    const [curUserIdx, setCurUserIdx] = useState()
    const [joined, setJoined] = useState(props.joined)
    const [contribution, setDonation] = useState()

    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near, 
      appIdx
    } = state

    const classes = useStyles();

    const {
      accountId,
      donation,
      contributed,
    } = props

    const thisPersona = new Persona()

    useEffect(
        () => {
         
        async function fetchData() {

          if(accountId){
            let result = await thisPersona.getPersona(accountId)
            if(result){
              result.date ? setDate(result.date) : setDate('')
              result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
              result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
              result.name ? setName(result.name) : setName('')
            }
          }
        }
        
        fetchData()
          .then((res) => {
           
          })

    }, [avatar]
    )
    
    function formatDate(timestamp) {
      let stringDate = timestamp.toString()
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
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
          subheader={ <><center><Chip size="small" color="primary" label={accountId}/><br></br>
          <Typography variant="overline" align="center">Contributed: {formatDate(contributed)}</Typography></center></>}
          className={classes.header}
          />
 
          <CardContent>
            <Grid container alignItems="center" style={{marginTop: '-20px', marginBottom:'20px', display:'inherit'}}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Typography variant="h6" align="center">{donation} Ⓝ</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        </>
    )
}