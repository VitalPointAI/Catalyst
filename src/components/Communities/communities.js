import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import SmallDaoCard from '../Cards/SmallDaoCard/smallDaoCard'
import AddDaoForm from '../CreateDAO/addDao'

// Material UI components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'
import { Divider } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core'
  
export default function Communities(props) {
   
    const [activeDaos, setActiveDaos] = useState([])
    const [inactiveDaos, setInactiveDaos] = useState([])
    const [anchorEl, setAnchorEl] = useState(null);
    const [addDaoClicked, setAddDaoClicked] = useState(false)

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      currentDaosList,
      isUpdated,
      daoFactory
    } = state
console.log('inactive daos', inactiveDaos)
    useEffect(
        () => {
          async function fetchData() {
            if(isUpdated){}
            if(currentDaosList){
                let sortedDaos = _.sortBy(currentDaosList, 'created')
                let activeDaos = []
                let inactiveDaos = []
                for(let x = 0; x < sortedDaos.length; x++){
                  let community = await daoFactory.getDaoByAccount({accountId: sortedDaos[x].contractId})
                  if(community.status == 'active'){
                    activeDaos.push(community)
                  } else {
                    if(sortedDaos[x].summoner == accountId){
                      inactiveDaos.push(community)
                    }
                  }
                }
                setActiveDaos(activeDaos)
                setInactiveDaos(inactiveDaos)
            }
          }

          fetchData()
          .then((res) => {

          })

    }, [currentDaosList, isUpdated]
    )

    const addDaoClick = (event) => {
      setAddDaoClicked(true)
      handleClick(event)
    }

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    }

    function handleAddDaoClick(property){
      setAddDaoClicked(property)
    }
  

    return (
        <>
        <Grid container alignItems="center" justifyContent="space-between" spacing={3} style={{padding: '20px'}} >
         
          { activeDaos && activeDaos.length > 0 ? 
                (<>
                <Grid container alignItems="center" justifyContent="center" spacing={3} style={{padding: '20px', minHeight: '150px'}}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography variant="h6">Active Projects</Typography>
                  </Grid>
                {activeDaos.filter(dao => dao.summoner == accountId).reverse().map(({ contractId, did, created, summoner, status }, i) => {
                  console.log('daos', activeDaos)
                  return (
                    
                    <SmallDaoCard
                        key={i}
                        contractId={contractId}
                        summoner={summoner}
                        created={created}
                        daoDid={did}
                        state={state}
                        status={status}
                    />
                  )
                  }
                )}
         
                </Grid>
                </>)
          : ( 
            <Grid container alignItems="center" justifyContent="center" spacing={0} >
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Typography variant="h6">No Active Projects</Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Button
                      variant="contained"
                      onClick={(e) => addDaoClick(e)}
                    >Create a Project Community</Button>
              </Grid>
            </Grid>
            )
          }
         
          {inactiveDaos && inactiveDaos.length > 0 ? 
              (  
                <Accordion style={{width: '100%'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                <Typography variant="h6">Inactive Projects</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Grid container alignItems="center" justifyContent="center" spacing={3} style={{padding: '20px', minHeight: '150px'}}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    {inactiveDaos.filter(dao => dao.summoner == accountId).reverse().map(({ contractId, did, created, summoner, status }, i) => {
                    console.log('inactiveDaos', inactiveDaos)
                    return (
                      
                      <SmallDaoCard
                          key={i}
                          contractId={contractId}
                          summoner={summoner}
                          created={created}
                          daoDid={did}
                          state={state}
                          status={status}
                      />
                    )
                    }
                    )}
                  </Grid>
                </Grid>
                </AccordionDetails>
              </Accordion>
              
            )
          : null}

        </Grid>
        
          {addDaoClicked ? <AddDaoForm
            state={state}
            handleAddDaoClick={handleAddDaoClick}
          /> : null }
        </>
    )
}