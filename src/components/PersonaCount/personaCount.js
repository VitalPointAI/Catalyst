import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

// Material UI Components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
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

export default function PersonaCount(props) {
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
   
    useEffect(
        () => {
  
        async function fetchData() {
            setFinished(false)
            if(state) {
                state.isUpdated

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
 
                if((links && links.length > 0) || (claimed && claimed.length > 0)){
                    return true
                }
            }
        }

        fetchData()
            .then((res) => {
             res ? setProfileExists(true) : null
             setFinished(true)
            })
        
    }, []
    )

const classes = useStyles()

    return (
        <>    
        <Grid container justifyContent="center" alignItems="center" spacing={1} >        
            <Grid item xs={12} sm={12} md={7} lg={7} xl={7} align="center">
                {profileExists && contractId == undefined ? (
                    <>
                    <Grid container justifyContent="center" alignItems="center" spacing={1} >
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        {!matches ? (
                            <>
                            <div style={{display: 'inline', width: '100%'}}>
                            <Link to="/personas">
                                <Button color="primary" style={{textAlign: 'center'}}>Your Personas: {claimCount ? claimCount : '0'}</Button>
                            </Link>
                            <Tooltip TransitionComponent={Zoom} title="The number of personas claimed by the signed in persona.">
                                <InfoIcon fontSize="small" style={{marginLeft:'3px', marginTop:'-3px'}} />
                            </Tooltip>
                            </div>
                            
                            </>
                            ) : (
                            <>
                            <div style={{display: 'inline', width: '100%'}}>
                            <Link to="/personas">
                                <Button color="primary" style={{textAlign: 'center'}}>Your Personas: {claimCount ? claimCount : '0'}</Button>
                            </Link>
                            <Tooltip TransitionComponent={Zoom} title="The number of personas claimed by the signed in persona.">
                                <InfoIcon fontSize="small" style={{marginLeft:'3px', marginTop:'-3px'}} />
                            </Tooltip>
                            </div>
                            
                            </>
                            )}
                        </Grid>
                    </Grid>   
                    </>)
                    :
                    contractId == undefined ? (
                    <>
                        <Grid container justifyContent="center" alignItems="center" spacing={1} >
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <Typography variant="overline" display="inline" style={{marginLeft: '10px'}}>
                                    <Tooltip TransitionComponent={Zoom} title="The number of personas claimed by the signed in persona.">
                                        <InfoIcon fontSize="small" style={{marginRight:'3px', marginTop:'-3px'}} />
                                    </Tooltip>
                                    <Button style={{textAlign: 'center', marginRight: '10px'}}>Your Personas: 0</Button>
                                </Typography>
                            </Grid>
                        </Grid>
                    </>
                    ) 
                    : null
                }
            </Grid>        
        </Grid>
      </>
    )
}