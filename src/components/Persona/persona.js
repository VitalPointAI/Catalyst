import React, { useState, useEffect } from 'react'
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
    const [daoCount, setDaoCount] = useState(0)

    const {
        state,
        accountId,
        balance
    } = props

    const {
        daoList
    } = state

    useEffect(
        () => {
  
        async function fetchData() {
            setFinished(false)
            if(state) {
                console.log(state)
                if (state.curUserIdx){
                    let result = await state.curUserIdx.get('profile', state.curUserIdx.id)
                  
                    if(result){
                        result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                    }
                }

                if(state.claimed && state.claimed.length > 0){
                    let i = 0
                    let count = 0
                    while (i < state.claimed.length){
                        if(state.claimed[i].owner == accountId){
                        count++
                        }
                    i++
                    }
                    setClaimedCount(count)
                }

                // if(state.daoLinks && state.daoLinks.length > 0){
                //     let i = 0
                //     let count = 0
                //     while (i < state.daoLinks.length){
                //         if(state.daoLinks[i].summoner == accountId){
                //         count++
                //         }
                //     i++
                //     }
                //     setDaoCount(count)
                // }

                if(daoList){
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

                if((state.links && state.links.length > 0) || (state.claimed && state.claimed.length > 0)){
                        return true
                }

              
            }
        }

        fetchData()
            .then((res) => {
             res ? setProfileExists(true) : null
             setFinished(true)
            })
        
    }, [state.curUserIdx, state.links, state.claimed, isUpdated]
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
                {profileExists ? (
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
                    (<>
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
                    )                 
                }
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