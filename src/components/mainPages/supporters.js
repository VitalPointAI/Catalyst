import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { Header } from '../Header/header'
import Personas from '@aluhning/get-personas-js'
import SupporterCard from '../SupporterCard/SupporterCard'
import Footer from '../../components/common/Footer/footer'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
  root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
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

   
    useEffect(
        () => {
          async function fetchData() {

          let Persona = new Personas()
          let donations = await Persona.getDonations(contractId)
          
       
          setDonations(donations)
          }

          fetchData()
    }, []
    )
    
    return (
        <>
        <div className={classes.root}>
        <Header state={state}/>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'30px'}}>
            <Typography variant='h3' style={{marginTop: '20px'}}>Community Supporters</Typography>
            <Typography variant='body1' style={{padding: '5px'}}>These pers have made donations to our community fund - Thank-You.</Typography>
          </Grid>
         
            {donations && donations.donations.length > 0 ?
              donations.donations.map((fr, i) => {
              
                return(
                  <SupporterCard 
                    key={i}
                    accountId={fr.contributor}
                    donation= {fr.donation}
                    contributed={fr.contributed}
                    transactionHash={fr.transactionHash}
                  />
                )
              }) : null }
          
        </Grid>
        </div>
        <Footer />
        </>
    )
}