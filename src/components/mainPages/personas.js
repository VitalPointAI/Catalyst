import React, { useEffect, useState } from 'react';
import PersonaCard from '../PersonaCard/personaCard'
import { get, set, del } from '../../utils/storage'
import { Steps, Hints } from "intro.js-react";
import { PERSONAS_ARRIVAL} from '../../state/near'
const getLink = (accountId, key, wallet, owner) => `?accountId=${accountId}&key=${key}&from=${wallet.getAccountId()}&owner=${owner}`

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        minHeight: 550
    },
    menuButton: {
      marginRight: theme.spacing(0),
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
  }));

export const PersonaPage = ({ state, update, dispatch }) => {

    const classes = useStyles();

    const {
        app, wallet, links, claimed, accountId,
    } = state
  
    const [loaded, setLoaded] = useState(false)
    const [editPersonaClicked, setEditPersonaClicked] = useState(false)
    const [countOfClaims, setCountOfClaims] = useState()
    const [countOfLinks, setCountOfLinks] = useState()
    const [stepsEnabled, setStepsEnabled] = useState(false)
    const [options, setOptions] = useState({
        doneLabel: 'Continue!',
        showButtons: true,
        overlayOpacity: 0.5,
        scrollTo: 'element',
        skipLabel: "Skip",
        showProgress: true,
        disableInteraction: true
    })
    function onStepsExit(){
        setStepsEnabled(false)
    }
    useEffect(
        () => {
        let newVisit = get(PERSONAS_ARRIVAL, [])
        if(!newVisit[0]){
            newVisit.push({status: true})
            set(PERSONAS_ARRIVAL, newVisit)
            setStepsEnabled(true) 
        }
        async function fetchData() {
            setLoaded(false)
            let i = 0
            let countClaim = 0
            while (i < claimed.length ){
                if(claimed[i].owner == accountId || claimed[i].accountId == accountId){
                    countClaim++
                }
                i++
            }
            setCountOfClaims(countClaim)

            let j = 0
            let countLinks = 0
            while (j < links.length ){
                if(links[j].owner == accountId){
                    countLinks++
                }
                j++
            }
            setCountOfLinks(countLinks)
          
        }
        
        fetchData()
            .then((res) => {
                setLoaded(true)
            })
        
    }, [countOfClaims, countOfLinks, claimed]
    )


    function handleEditPersonaClick(property){
        setStepsEnabled(false)
        setEditPersonaClicked(property) 
    }

    const steps = [
        { 
            intro: "Welcome to the personas page" 
        },
        {   element: '.reservation', 
            intro: "Here you can see the Personas that you have reserved, but have yet to claim",
            position: "right"
        },
        {   
            element: '.claimed',
            intro: "And here you can see, and edit the details of your claimed Personas",
            position: "Left"
        },
        {
            element: '.edit',
            intro: "Click the edit icon, and let people know who you are!",
            position: "Left"
        }
    ]
    return (
 
        <>
        <Steps 
            enabled={stepsEnabled}
            onExit={()=>{onStepsExit()}}
            steps={steps}
            options={options}
            initialStep={0}
        />
        <div className={classes.root}>
        <Grid container alignItems="flex-start" justifyContent="center" spacing={1} >
            {countOfLinks > 0 ? 
                (<> <Grid className="reservation" item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                    
                    <Paper className={classes.paper}>
                        <Typography variant="h5" style={{marginBottom: '20px'}}>Reserved Personas</Typography>
                    <Grid  ontainer alignItems="flex-start" justifyContent="center" spacing={0} style={{padding: '20px'}}>
                        {links.filter(person => person.owner == accountId).map(({ key, keyStored, accountId, owner }) =>
                            <PersonaCard
                                key={keyStored}
                                accountId={accountId}
                                owner={owner}
                                link={getLink(accountId, key, wallet, owner)}
                                state={state}
                                handleEditPersonaClick={handleEditPersonaClick}
                                />
                        )}
                    </Grid>
                    </Paper>
                    </Grid>
                </>)
                :  <Grid className='reservation' item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                <Paper className={classes.paper}>
                    <Typography variant="h5" style={{marginBottom: '20px'}}>Reserved Personas</Typography>
                    <Typography variant="overline">No Personas Reserved for Claiming.</Typography>
                </Paper>
                </Grid>
                
            }
      
       
            { countOfClaims > 0 ? 
                (<>
                    <Grid className='claimed' item xs={12} sm={12} md={6} lg={6} xl={6} align="center" >
                    <Paper className={classes.paper}>
                        <Typography variant="h5" style={{marginBottom: '20px'}}>Claimed Personas</Typography>
                        <Grid className='edit' container alignItems="center" justifyContent="center" spacing={0} style={{padding: '20px'}}>
                            {claimed.filter(person => (person.owner == accountId || person.accountId == accountId)).map(({ keyStored, accountId, owner }) =>
                                <PersonaCard 
                                    className='edit'
                                    key={keyStored}
                                    accountId={accountId}
                                    owner={owner}
                                    link={''}
                                    state={state}
                                    handleEditPersonaClick={handleEditPersonaClick}
                                />              
                            )}
                        </Grid>
                </Paper>
                </Grid>
            </>)
            : <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
            <Paper className={classes.paper}>
                <Typography variant="h5" style={{marginBottom: '20px'}}>Claimed Personas</Typography>
                <Typography variant="overline">No Personas available.</Typography>
            </Paper>
            </Grid>
            } 
        </Grid>
        </div>
       
    </>
 
    )
}