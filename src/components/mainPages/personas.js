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
import Typography from '@material-ui/core/Typography';

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
        <Grid container alignItems="center" justify="flex-start" spacing={2} style={{marginBottom: '20px'}}>
            {countOfLinks > 0 ? 
                (<> <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{textAlign: 'center'}}>
                        <Typography variant="h5" style={{marginBottom: '20px'}}>Reserved Personas</Typography>
                    </Grid>
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
                </>)
                : null
            }
        </Grid>
        <Divider variant="middle" style={{marginBottom: '20px'}}/>
        <Grid container alignItems="center" justify="space-between" spacing={2} style={{padding: '20px'}}>
            { countOfClaims > 0 ? 
                (<>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                        <Typography variant="h5" style={{marginBottom: '20px'}}>Claimed Personas</Typography>
                    </Grid>
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
            </>)
            : null
            } 
        </Grid>
        </div>
    </>
    </Router>
    )
}