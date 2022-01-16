import React, { useState, useEffect, useContext } from 'react'
import { explorerUrl } from '../../state/near'
import { appStore, onAppMount } from '../../state/app'
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
import ExploreIcon from '@material-ui/icons/Explore'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      margin: 'auto',
      maxWidth: '250px'
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
      appIdx, 
      daoFactory
    } = state

    const classes = useStyles();

    const {
      accountId,
      donation,
      contributed,
      transactionHash
    } = props


    useEffect(
        () => {
         
        async function fetchData() {

          if(accountId && near){
            
              let did = await ceramic.getDid(accountId, daoFactory, didRegistryContract)
              let result = await appIdx.get('profile', did)
            
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

    }, [accountId, near]
    )
    
    function formatDate(timestamp) {
      let stringDate = timestamp.toString()
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
    }
      

    return(
        <>
        <Card raised={true} className={classes.card} >
          <Grid container justifyContent="flex-start" alignItems="center" spacing={0} style={{width: '90%'}}>
            <Grid item xs={1} sm={1} md={1} lg={1} xl={1} align="center">
              <Avatar variant="circular" src={avatar} style={{marginLeft: '3px'}} />
            </Grid>
            <Grid item xs={9} sm={9} md={9} lg={9} xl={9} align="center" >
              
            </Grid>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="left" >
              <Tooltip title="See transaction on explorer.">
              <a href={explorerUrl + '/transactions/' + transactionHash}>
                <IconButton aria-label="delete">
                  <ExploreIcon />
                </IconButton>
              </a>
              </Tooltip>
            </Grid>
          </Grid>
         
          <CardHeader
          subheader={ <><center><Chip size="small" color="primary" label={name ? name : accountId}/><br></br>
          <Typography variant="overline" align="center">{formatDate(contributed)}</Typography>
         </center></>}
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