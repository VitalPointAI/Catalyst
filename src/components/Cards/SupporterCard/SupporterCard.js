import React, { useState, useEffect, useContext } from 'react'
import { explorerUrl } from '../../../state/near'
import { appStore, onAppMount } from '../../../state/app'
import { ceramic } from '../../../utils/ceramic'

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
    card: {
      maxWidth: '250px',
      marginBottom: '15px'
    },
    header: {
      display: 'inherit'
    }
  }));

  const imageName = require('../../../img/default-profile.png') // default no-image avatar
  const logoName = require('../../../img/default_logo.png') // default no logo

export default function SupporterCard(props) {

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [logo, setLogo] = useState(logoName)
    const [accountType, setAccountType] = useState('')
    const [shortBio, setShortBio] = useState('')
    const [did, setDid] = useState()
    const [joined, setJoined] = useState(props.joined)
    const [contribution, setDonation] = useState()
    const [memberDid, setMemberDid] = useState('')
    const [pfpLogo, setPfpLogo] = useState('')
    const [pfpAvatar, setPfpAvatar] = useState('')

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

          
         
          if(accountId && appIdx){
            let thisAccountType
            try{
                thisAccountType = await didRegistryContract.getType({accountId: accountId})
                setAccountType(thisAccountType)
                console.log('thisaccounttype', thisAccountType)
              } catch (err) {
                accountType = 'none'
                console.log('account not registered, not type avail', err)
            }

            let did = await ceramic.getDid(accountId, daoFactory, didRegistryContract)
            console.log('did sup', did)
            setMemberDid(did)
              if(thisAccountType != 'guild'){
                let result = await appIdx.get('profile', did)
                if(result){
                  result.date ? setDate(result.date) : setDate('')
                  result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                  result.name ? setName(result.name) : setName('')
                  result.profileNft ? setPfpAvatar(result.profileNft) : setPfpAvatar('')
                }
              } else {
                if(thisAccountType == 'guild'){
                  let result = await appIdx.get('guildProfile', did)
                  console.log('result sup', result)
                  if(result){
                    result.date ? setDate(result.date) : setDate('')
                    result.logo ? setLogo(result.logo) : setLogo(logoName)
                    result.name ? setName(result.name) : setName('')
                    result.profileNft ? setPfpLogo(result.profileNft) : setPfpLogo('')
                  }
                }
              }
            
          }
        }
        
        fetchData()
          .then((res) => {
           
          })

    }, [accountId, appIdx]
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
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
               {accountType == 'guild' ? (
                <a href={`https://nearguilds.live/guild-profiles/${memberDid}`}>
              <div style={{ 
                  height: '40px',
                  backgroundImage: `url(${pfpLogo != logoName && pfpLogo != '' ? pfpLogo : logo})`, 
                  backgroundSize: 'contain',
                  backgroundPosition: 'center', 
                  backgroundRepeat: 'no-repeat',
                  backgroundOrigin: 'content-box'
              }}/>
              </a>
              )
          :  (
            <a href={`https://nearpersonas.live/indiv-profiles/${memberDid}`}>
              <Avatar src={pfpAvatar != imageName && pfpAvatar != '' ? pfpAvatar : avatar} style={{marginRight: '5px'}}/>
              </a>
              )
          }
            </Grid>
            <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center" >
              
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
          subheader={ <> <center><Chip label={name != '' ? name : accountId} style={{marginBottom: '3px'}}/><br></br>
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