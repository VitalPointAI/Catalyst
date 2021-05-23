import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { Link } from 'react-router-dom'
import { get, set, del } from '../../utils/storage'
import EditPersonaForm from '../../components/EditPersona/editPersona'
import { makeStyles } from '@material-ui/core/styles'
import { ceramic } from '../../utils/ceramic'

// Material UI Components
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import InfoIcon from '@material-ui/icons/Info';
import { LinearProgress } from '@material-ui/core'

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
        maxWidth: 600,
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

export default function Persona(props) {
    const [profileExists, setProfileExists] = useState(false)
    const [editPersonaClicked, setEditPersonaClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [isUpdated, setIsUpdated] = useState(false)
    const [finished, setFinished] = useState(false)
    const [avatar, setAvatar] = useState(props.avatar)
    const [claimCount, setClaimedCount] = useState(0)
    const [daoCount, setDaoCount] = useState()

    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near,
      appIdx,
      accountId,
      curUserIdx,
      claimed,
      daoList,
      links
    } = state

    const {
        balance
    } = props

    const {
        contractId
    } = useParams()
   
    useEffect(
        () => {
  
        async function fetchData() {
            setFinished(false)
            if(state) {
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
               
                if(daoList && daoList.daoList.length > 0){
                    let count = 0
                    let i = 0
                    while(i < daoList.daoList.length){
                        if(daoList.daoList[i].summoner == accountId){
                            count++
                        }
                        i++
                    }
                    setDaoCount(count)
                }
 
                if((links && links.length > 0) || (claimed && claimed.length > 0) || (daoList && daoList.daoList.length > 0)){
                    return true
                }

            }
        }

        fetchData()
            .then((res) => {
             res ? setProfileExists(true) : null
             setFinished(true)
            })
        
    }, [state, curUserIdx, links, claimed, isUpdated]
    )

const classes = useStyles()


function handleUpdate(property){
    setIsUpdated(property)
  }

const handleEditPersonaClick = () => {
    handleExpanded()
    handleEditPersonaClickState(true)
  }

  function handleEditPersonaClickState(property){
    setEditPersonaClicked(property)
  }

  function handleExpanded() {
    setAnchorEl(null)
  }

    return (
        <Grid container justify="space-between" alignItems="flex-start" spacing={1} className={classes.root}>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{textAlign: 'center'}}>
                {profileExists && contractId == undefined ? (
                    <>
                    <Typography variant="overline" display="inline">
                        <Tooltip TransitionComponent={Zoom} title="The number of personas claimed by the signed in persona.">
                            <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                        </Tooltip>
                        <Link to="/personas">
                            Your Personas: {claimCount}
                        </Link>
                        
                    </Typography>
                    <Typography variant="overline" display="inline" style={{marginLeft: '10px'}}>
                        <Tooltip TransitionComponent={Zoom} title="The number of DAOs the signed in persona has founded.">
                            <InfoIcon fontSize="small" style={{marginLeft: '5px', marginRight:'5px', marginTop:'-3px'}} />
                        </Tooltip>
                        <Link to="/daos">
                            Your DAOs: {daoCount}
                        </Link>
                    </Typography>
                    </>)
                    :
                    contractId == undefined ? (<>
                    <Typography variant="overline" display="inline" style={{marginLeft: '10px'}}>
                        <Tooltip TransitionComponent={Zoom} title="The number of personas claimed by the signed in persona.">
                            <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                        </Tooltip>Your Personas: 0
                    </Typography>
                    <Typography variant="overline" display="inline">
                        <Tooltip TransitionComponent={Zoom} title="The number of DAOs the signed in persona has founded.">
                            <InfoIcon fontSize="small" style={{marginLeft: '5px', marginRight:'5px', marginTop:'-3px'}} />
                        </Tooltip>Your DAOs: 0
                    </Typography>
                    </>
                    ) : (<>
                    <Grid container justify="space-evenly" alignItems="center" spacing={1}>
                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                            <Link to={`/dao/${contractId}/about`} variant="body1">About</Link>
                        </Grid>
                        <Grid item xs={10} sm={10} md={10} lg={10} xl={10}>
                            <Link to={`/dao/${contractId}/how`} variant="body1">Community Guidelines</Link>
                        </Grid>
                    </Grid>
                    </>) }               
                
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
            {finished ? (
                <>
                <Typography variant="overline" display="block" onClick={handleEditPersonaClick} style={{float:'right', marginLeft:'10px'}}>
                    {accountId}: {balance} Ⓝ
                </Typography>
                <Avatar src={avatar} className={classes.small} onClick={handleEditPersonaClick}/>
                </>
            ) : <LinearProgress />
            }
            </Grid>
            {editPersonaClicked ? <EditPersonaForm
                state={state}
                handleEditPersonaClickState={handleEditPersonaClickState}
                curPersonaIdx={state.curUserIdx}
                handleUpdate={handleUpdate}
                accountId={accountId}
                /> : null }
        </Grid>
    )
}