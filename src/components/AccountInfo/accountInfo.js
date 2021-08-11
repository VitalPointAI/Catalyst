import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { Link } from 'react-router-dom'
import EditPersonaForm from '../EditPersona/editPersona'
import { makeStyles } from '@material-ui/core/styles'
import Persona from '@aluhning/get-personas-js'
import Purpose from '../Purpose/purpose'

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
    const [isUpdated, setIsUpdated] = useState()

    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near,
      appIdx,
      accountId,
      curUserIdx,
      claimed,
      currentDaosList,
      links
    } = state

    const {
        balance
    } = props

    const {
        contractId
    } = useParams()

    const matches = useMediaQuery('(max-width:500px)');

    const Dao = new Persona()
   
    useEffect(
        () => {
  
        async function fetchData() {
            setFinished(false)
            if(state) {
                state.isUpdated
            
                if (curUserIdx){
                    let result = await curUserIdx.get('profile', curUserIdx.id)
              
                    if(result){
                        result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                    }
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
        
    }, [isUpdated, currentDaosList]
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

  function handleUpdate(property){
      setIsUpdated(property)
  }

    return (
        <>    
        <Grid container justifyContent="center" alignItems="center" spacing={1} >        
            <Grid item xs={12} sm={12} md={7} lg={7} xl={7} align="center">
                {contractId != undefined ? 
                    !matches ? (
                    <>
                       
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center" style={{display: 'inline'}}>
                                    <Button style={{textAlign: 'center', marginRight: '30px'}} onClick={handlePurposeClick}>Purpose</Button>
                                <Link to={`/opportunities/${contractId}`} variant="body1">
                                    <Button style={{textAlign: 'center', marginRight: '30px'}}>Opportunities</Button>
                                </Link>
                                <Link to={`/supporters/${contractId}`} variant="body1">
                                    <Button style={{textAlign: 'center'}}>Supporters</Button>
                                </Link>
                            </Grid>
                    </>
                    ) : (
                        <>               
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center" style={{display: 'inline'}}>
                                <Button style={{textAlign: 'center', marginRight: '10px'}} onClick={handlePurposeClick}>Purpose</Button>
                            <Link to={`/opportunities/${contractId}`} variant="body1">
                                <Button style={{textAlign: 'center', marginRight: '10px'}}>Opportunities</Button>
                            </Link>
                            <Link to={`/supporters/${contractId}`} variant="body1">
                                <Button style={{textAlign: 'center'}}>Supporters</Button>
                            </Link>
                        </Grid>
                    </>
                    )
                    : null }
            </Grid>

            {!matches ?
               
            <Grid item xs={12} sm={12} md={5} lg={5} xl={5}>
                
                {finished ? (
                    <>
                    <Grid container justifyContent="center" alignItems="center" spacing={1} >
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Typography variant="overline" display="block" style={{display: 'inline-flex', float: 'right'}} onClick={handleEditPersonaClick}>
                                <Avatar src={avatar} className={classes.small} style={{marginRight: '5px'}} onClick={handleEditPersonaClick}/>
                                {accountId}: {balance} Ⓝ
                            </Typography>
                        </Grid>
                    </Grid>                    
                    </>
                ) : <LinearProgress />
                }
            </Grid>            
               
            :
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3} align="center">
                {finished ? (
                    <>
                    <Grid container justifyContent="center" alignItems="center" spacing={1} >
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Typography variant="overline" display="block" style={{display: 'inline-flex'}} onClick={handleEditPersonaClick}>
                                <Avatar src={avatar} className={classes.small} style={{marginRight: '5px'}} onClick={handleEditPersonaClick}/>
                                {accountId}: {balance} Ⓝ
                            </Typography>
                        </Grid>
                    </Grid>
                    </>
                ) : <LinearProgress />
                }
            </Grid>
            }
       

            {editPersonaClicked ? <EditPersonaForm
                state={state}
                handleEditPersonaClickState={handleEditPersonaClickState}
                curPersonaIdx={state.curUserIdx}
                handleUpdate={handleUpdate}
                accountId={accountId}
                /> : null }

            {purposeClicked ? <Purpose
                handlePurposeClickState={handlePurposeClickState}
                contractId={contractId}
            
                /> : null }
       
        </Grid>
      </>
    )
}