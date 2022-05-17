import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import Purpose from '../Purpose/purpose'

// Material UI Components
import Typography from '@material-ui/core/Typography'
import { LinearProgress } from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery'

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    customCard: {
        maxWidth: 450,
        minWidth: 275,
        margin: 'auto',
        padding: 20
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        float: 'right',
      },
    media: {
        height: 140,
      },
    button: {
        margin: theme.spacing(1),
      },
    }));

const imageName = require('../../img/default-profile.png') // default no-image avatar
const logoName = require('../../img/default_logo.png') // default no-logo

export default function PersonaInfo(props) {
    const [profileExists, setProfileExists] = useState(false)
    const [purposeClicked, setPurposeClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [finished, setFinished] = useState(false)
    const [avatar, setAvatar] = useState(imageName)
    const [pfpAvatar, setPfpAvatar] = useState('')
    const [claimCount, setClaimedCount] = useState(0)
    const [daoCount, setDaoCount] = useState()

    const [logo, setLogo] = useState(logoName)
    const [pfpLogo, setPfpLogo] = useState('')
    const [name, setName] = useState('')

    const { state, dispatch, update } = useContext(appStore)

    const {
      appIdx,
      accountId,
      claimed,
      currentDaosList,
      isUpdated,
      balance,
      did,
      accountType
    } = state

    const {
        contractId
    } = useParams()

    const matches = useMediaQuery('(max-width:500px)');
   
    useEffect(
        () => {
  
        async function fetchData() {
            if(isUpdated){}
           
            setFinished(false)
            if(did && accountType != 'guild') {
                let result = await appIdx.get('profile', did)
                console.log('result', result)
                if(result){
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                    result.name ? setName(result.name) : setName('')
                    result.profileNft ? setPfpAvatar(result.profileNft) : setPfpAvatar('')
                }
            } else {
                if(did && accountType == 'guild'){
                    let result = await appIdx.get('guildProfile', did)
                   
                    if(result){
                        result.logo ? setLogo(result.logo) : setLogo(logoName)
                        result.name ? setName(result.name) : setName('')
                        result.profileNft ? setPfpLogo(result.profileNft) : setPfpLogo('')
                    }
                }
            }
               
            if(currentDaosList && currentDaosList.length > 0){
                let count = 0
                let i = 0
                while(i < currentDaosList.length){
                    if(currentDaosList[i].summoner == accountId){
                        count++
                    }
                    i++
                }
                setDaoCount(count)
            }
 
            return true
        }
        

        fetchData()
            .then((res) => {
             res ? setProfileExists(true) : null
             setFinished(true)
            })
        
    }, [isUpdated, did, claimed, currentDaosList]
    )

const classes = useStyles()
  
  const handlePurposeClick = () => {
    handleExpanded()
    handlePurposeClickState(true)
  }

  function handlePurposeClickState(property){
    setPurposeClicked(property)
  }


  function handleExpanded() {
    setAnchorEl(null)
  }

    return (
            <>
          
            {!matches ? (

                finished ? (
                    <>
                    
                            <Typography variant="overline" >
                                {accountType == 'guild' ? (
                                    <a href={`https://nearguilds.live/guild-profiles/${did}`}>
                                    <div style={{
                                    height: '100px',
                                    backgroundImage: `url(${pfpLogo && pfpLogo != logoName && pfpLogo != '' ? pfpLogo : logo})`, 
                                    backgroundSize: 'contain',
                                    backgroundPosition: 'center', 
                                    backgroundRepeat: 'no-repeat',
                                    backgroundOrigin: 'content-box'
                                    }}/>
                                    </a>                               
                                )
                                :  (
                                    <a href={`https://nearpersonas.live/indiv-profiles/${did}`}>
                                    <div style={{
                                        height: '100px',
                                        backgroundImage: `url(${pfpAvatar && pfpAvatar != imageName && pfpAvatar != '' ? pfpAvatar : avatar})`, 
                                        backgroundSize: 'contain',
                                        backgroundPosition: 'center', 
                                        backgroundRepeat: 'no-repeat',
                                        backgroundOrigin: 'content-box',
                                        borderRadius: '50%'
                                    }}/>
                                    </a>
                                    )
                                   
                                }{name ? name : accountId}: {balance} Ⓝ
                            </Typography>
                                          
                    </>
                ) : <LinearProgress />
            ) : (
                finished ? (
                    <>
                   
                    <Typography variant="overline"  >
                        {accountType == 'guild' ? (
                            <a href={`https://nearguilds.live/guild-profiles/${did}`}>
                            <div style={{ 
                                height: '100px',
                                backgroundImage: `url(${pfpLogo && pfpLogo != logoName && pfpLogo != '' ? pfpLogo : logo})`, 
                                backgroundSize: 'contain',
                                backgroundPosition: 'center', 
                                backgroundRepeat: 'no-repeat',
                                backgroundOrigin: 'content-box'
                                }}/>
                            </a>
                            
                            )
                        :  (
                            <a href={`https://nearpersonas.live/indiv-profiles/${did}`}>
                            <div style={{ 
                                height: '100px',
                                backgroundImage: `url(${pfpAvatar && pfpAvatar != imageName && pfpAvatar != '' ? pfpAvatar : avatar})`, 
                                backgroundSize: 'contain',
                                backgroundPosition: 'center', 
                                backgroundRepeat: 'no-repeat',
                                backgroundOrigin: 'content-box',
                                borderRadius: '50%'
                            }}/>
                            </a>
                            )
                        }{name ? name : accountId}: {balance} Ⓝ
                    </Typography>
                       
                    </>
                ) : <LinearProgress />
           )}

            {purposeClicked ? <Purpose
                handlePurposeClickState={handlePurposeClickState}
                contractId={contractId}
                /> : null }
       </>
    )
}