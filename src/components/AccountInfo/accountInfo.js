import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import * as nearAPI from 'near-api-js'
import { appStore, onAppMount } from '../../state/app'
import { Link } from 'react-router-dom'
import EditPersonaForm from '../EditPersona/editPersona'
import { makeStyles } from '@material-ui/core/styles'
import Purpose from '../Purpose/purpose'
import { ceramic } from '../../utils/ceramic'

// Material UI Components
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { LinearProgress } from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'

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

export default function PersonaInfo(props) {
    const [profileExists, setProfileExists] = useState(false)
    const [editPersonaClicked, setEditPersonaClicked] = useState(false)
    const [purposeClicked, setPurposeClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [finished, setFinished] = useState(false)
    const [avatar, setAvatar] = useState(props.avatar)
    const [claimCount, setClaimedCount] = useState(0)
    const [daoCount, setDaoCount] = useState()

    const { state, dispatch, update } = useContext(appStore)

    const {
      near,
      appIdx,
      accountId,
      curUserIdx,
      claimed,
      currentDaosList,
      isUpdated,
      links,
      did
    } = state

    const {
        balance
    } = props

    const {
        contractId
    } = useParams()

    const matches = useMediaQuery('(max-width:500px)');
   
    useEffect(
        () => {
  
        async function fetchData() {
            if(isUpdated){}
            setFinished(false)
            if(claimed && did) {
                let result = await appIdx.get('profile', did)
                if(result){
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                }
              

                if(claimed && claimed.length > 0){
                    let i = 0
                    let count = 0
                    while (i < claimed.length){
                        if(claimed[i].owner == accountId){
                        count++
                        }
                    i++
                    }
                    setClaimedCount(count)
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
 
                if((links && links.length > 0) || (claimed && claimed.length > 0) || (currentDaosList && currentDaosList.length > 0)){
                    return true
                }

            }
        }

        fetchData()
            .then((res) => {
             res ? setProfileExists(true) : null
             setFinished(true)
            })
        
    }, [isUpdated, did, claimed, currentDaosList]
    )

const classes = useStyles()



  const handleEditPersonaClick = () => {
    handleExpanded()
    handleEditPersonaClickState(true)
  }

  function handleEditPersonaClickState(property){
    setEditPersonaClicked(property)
  }

  
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
                {contractId != undefined ? (
                    !matches ? (
                    <>
                            
                                    <Button style={{textAlign: 'center', marginRight: '30px'}} onClick={handlePurposeClick}>Purpose</Button>
                                <Link to={`/opportunities/${contractId}`} variant="body1">
                                    <Button style={{textAlign: 'center', marginRight: '30px'}}>Opportunities</Button>
                                </Link>
                                <Link to={`/supporters/${contractId}`} variant="body1">
                                    <Button style={{textAlign: 'center'}}>Supporters</Button>
                                </Link>
                            
                    </>
                    ) : (
                        <>               
                        
                                <Button style={{textAlign: 'center', marginRight: '10px'}} onClick={handlePurposeClick}>Purpose</Button>
                            <Link to={`/opportunities/${contractId}`} variant="body1">
                                <Button style={{textAlign: 'center', marginRight: '10px'}}>Opportunities</Button>
                            </Link>
                            <Link to={`/supporters/${contractId}`} variant="body1">
                                <Button style={{textAlign: 'center'}}>Supporters</Button>
                            </Link>
                       
                    </>
                    )
                    ) : null }
          
            {!matches ? (

                finished ? (
                    <>
                    
                            <Typography variant="overline" display="block" style={{display: 'inline-flex', float: 'right'}} onClick={handleEditPersonaClick}>
                                <Avatar src={avatar} style={{marginRight: '5px'}} onClick={handleEditPersonaClick}/>
                                {accountId}: {balance} Ⓝ
                            </Typography>
                                          
                    </>
                ) : <LinearProgress />
            ) : (
                finished ? (
                    <>
                   
                            <Typography variant="overline" display="block" style={{display: 'inline-flex'}} onClick={handleEditPersonaClick}>
                                <Avatar src={avatar} style={{marginRight: '5px'}} onClick={handleEditPersonaClick}/>
                                {accountId}: {balance} Ⓝ
                            </Typography>
                       
                    </>
                ) : <LinearProgress />
           )}

            {editPersonaClicked ? <EditPersonaForm
                state={state}
                handleEditPersonaClickState={handleEditPersonaClickState}
                curUserIdx={curUserIdx}
                did={did}
                accountId={accountId}
                /> : null }

            {purposeClicked ? <Purpose
                handlePurposeClickState={handlePurposeClickState}
                contractId={contractId}
                /> : null }
       </>
    )
}