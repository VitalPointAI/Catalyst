import React, { useEffect, useState } from 'react';
import { MemoryRouter as Router } from 'react-router';
import PersonaCard from '../../components/PersonaCard/personaCard'


const forExample = `(for example: "bestie.near" or "squad.near")`
const baseUrl = window.location.href.substr(0, window.location.href.lastIndexOf('/'))
const getLink = (accountId, key, wallet, owner) => `?accountId=${accountId}&key=${key}&from=${wallet.getAccountId()}&owner=${owner}`

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        //maxWidth: 640,
        margin: 'auto',
      //  marginTop: 50,
        minHeight: 550,
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

    useEffect(
        () => {
 
        async function fetchData() {
            setLoaded(false)
            let i = 0
            let countClaim = 0
            while (i < claimed.length ){
                if(claimed[i].owner == accountId){
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
        setEditPersonaClicked(property)
    }

    return (
        <Router>
        <>
        <div className={classes.root}>
        <Grid container alignItems="flex-start" justify="center" spacing={2} style={{padding: '20px'}}>
            {countOfLinks > 0 ? 
                (<> <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                    <Paper className={classes.paper}>
                        <Typography variant="h5" style={{marginBottom: '20px'}}>Reserved Personas</Typography>
                    <Grid container alignItems="flex-start" justify="center" spacing={2} style={{padding: '20px'}}>
                        {links.filter(person => person.owner == accountId).map(({ key, accountId, owner }) =>
                            <PersonaCard
                                key={key}
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
                :  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                <Paper className={classes.paper}>
                    <Typography variant="h5" style={{marginBottom: '20px'}}>Reserved Personas</Typography>
                    <Typography variant="overline">No Personas Reserved for Claiming.</Typography>
                </Paper>
                </Grid>
             
            }
      
       
            { countOfClaims > 0 ? 
                (<>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center" >
                    <Paper className={classes.paper}>
                        <Typography variant="h5" style={{marginBottom: '20px'}}>Claimed Personas</Typography>
                        <Grid container alignItems="flex-start" justify="center" spacing={2} style={{padding: '20px'}}>
                            {claimed.filter(person => person.owner == accountId).map(({ key, accountId, owner }) =>
                                <PersonaCard
                                    key={key}
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
            : null
            } 
        </Grid>
        </div>
    </>
    </Router>
    )
}