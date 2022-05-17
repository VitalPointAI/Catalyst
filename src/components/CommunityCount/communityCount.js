import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'

// Material UI Components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'

export default function CommunityCount(props) {
    
    const [finished, setFinished] = useState(false)
    const [daoCount, setDaoCount] = useState()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      currentDaosList,
      isUpdated
    } = state

    const {
        contractId
    } = useParams()

    const matches = useMediaQuery('(max-width:500px)')
   
    useEffect(
        () => {
  
        async function fetchData() {
            setFinished(false)
            if(isUpdated){}
               
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
                return true
            }
        }

        fetchData()
            .then((res) => {
             setFinished(true)
            })
        
    }, [isUpdated, currentDaosList]
    )

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
                            <Typography variant="body1" color="primary">Started {daoCount ? daoCount == 1 ? daoCount + ' Project Community' : daoCount + '  Project Communities' : '0 Project Communities'}</Typography>
                            
                            </div>
                            </>
                            ) : (
                            <>
                            <div style={{display: 'inline', width: '100%'}}>
                            <Typography variant="body1" color="primary">Started {daoCount ? daoCount == 1 ? daoCount + ' Project Community' : daoCount + '  Project Communities' : '0 Project Communities'}</Typography>
                           
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
                                    
                                <Typography variant="body1" color="primary">Started 0 Project Communities</Typography>
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