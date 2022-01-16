import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

// Material UI Components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
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

export default function MemberCommunityCount(props) {
    
    const [finished, setFinished] = useState(false)
    const [daoCount, setDaoCount] = useState()
    const [memberCount, setMemberCount] = useState(0)

    const {
        contractId
    } = useParams()

    const {
        memberDaos
    } = props

    const matches = useMediaQuery('(max-width:500px)')
   
    useEffect(
        () => {
            if(memberDaos && memberDaos.length > 0){
                console.log('memberdaos', memberDaos)
                setMemberCount(memberDaos.length)
            }
  
    }, [memberDaos]
    )

const classes = useStyles()  

    return (
        <>    
        <Grid container justifyContent="center" alignItems="center" spacing={1} >        
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left">
                {contractId == undefined ? (
                    <>
                    <Grid container justifyContent="center" alignItems="center" spacing={1} >
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        {!matches ? (
                            <>
                            <div style={{display: 'inline', width: '100%'}}>
                           
                                <Typography variant="body1" color="primary">Member of {memberCount == 1? memberCount + ' Community' : memberCount + ' Communities' }</Typography>
                            
                           
                            </div>
                            </>
                            ) : (
                            <>
                            <div style={{display: 'inline', width: '100%'}}>
                          
                            <Typography variant="body1" color="primary">Member of {memberCount == 1? memberCount + ' Community' : memberCount + ' Communities' }</Typography>
                        
                           
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
                                <Typography variant="overline" display="inline">
                                   
                                <Typography variant="body1" color="primary">Member of 0 Communities</Typography>
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