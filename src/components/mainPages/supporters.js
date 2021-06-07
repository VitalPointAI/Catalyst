import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { Header } from '../Header/header'
import Personas from '@aluhning/get-personas-js'
import SupporterCard from '../SupporterCard/SupporterCard'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
      //  maxWidth: 640,
        margin: 'auto',
      //  marginTop: 50,
        marginBottom: 50,
        minHeight: 550
    },
    menuButton: {
      marginRight: theme.spacing(0),
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    drawer: {
        marginTop: '5px'
    }
  }));
  
export default function Supporters(props) {

    const [result, setResult] = useState()
    const [donations, setDonations] = useState()

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      contractId
    } = useParams()

    console.log('cotractid', contractId)
    useEffect(
        () => {
          async function fetchData() {

          let Persona = new Personas()
          let donations = await Persona.getDonations(contractId)
          
          console.log('donations', donations)
          setDonations(donations)
          }

          fetchData()
    }, []
    )
    
    return (
        
        <div className={classes.root}>
        <Header state={state}/>
        <Grid container alignItems="center" justify="center" spacing={0} style={{paddingLeft: '50px', paddingRight: '50px'}}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'30px'}}>
            <Typography variant='h3'>Community Supporters</Typography>
            <Typography variant='body1'>These pers have made donations to our community fund - Thank-You.</Typography>
          </Grid>
        
            {donations && donations.donations.length > 0 ?
              donations.donations.map((fr, i) => {
                console.log('donation fr', fr)
                return(
                  <SupporterCard 
                    key={i}
                    accountId={fr.contributor}
                    donation= {Math.round(fr.donation/1000000000000000000000000, 2)}
                    contributed={fr.contributed}
                  />
                )
              }) : null }
         
        </Grid>
        </div>
    )
}