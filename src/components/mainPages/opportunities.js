import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { Header } from '../Header/header'
import Personas from '@aluhning/get-personas-js'
import OpportunityCard from '../OpportunityCard/OpportunityCard'
import Footer from '../../components/common/Footer/footer'
import Fuse from 'fuse.js'
import SearchBar from '../../components/common/SearchBar/search'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    card: {
      margin: 'auto',
      maxWidth: '250px',
      padding: '20px'
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
  
export default function Opportunities(props) {

    const [result, setResult] = useState()
    const [opportunities, setOpportunities] = useState()
    const [searchOpportunities, setSearchOpportunities] = useState([])

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      contractId
    } = useParams()

    useEffect(
        () => {
          async function fetchData() {
            if(contractId){
              let Persona = new Personas()
              let opportunities = await Persona.getOpportunities(contractId)
            
              setOpportunities(opportunities.opportunities)
            }

          }

          fetchData()
    }, []
    )

    const searchData = async (pattern) => {
      if (!pattern) {
        let Persona = new Personas()
        let opportunities = await Persona.getOpportunities(contractId)
        let sortedOpportunities = _.sortBy(opportunities.opportunities, 'submitDate').reverse()
       
        setOpportunities(sortedOpportunities)
        return
      }     
    
      
      const fuse = new Fuse(opportunities, {
          keys: ['category', 'title', 'details']
      })
      
      const result = fuse.search(pattern)
     
      const matches = []
      if (!result.length) {
          setOpportunities([])
      } else {
          result.forEach(({item}) => {
              matches.push(item)
      })
          setOpportunities(matches)
      }
  }
    
    return (
        <>
        <div className={classes.root}>
        <Header state={state}/>
        <Grid container alignItems="center" justify="flex-start" spacing={0}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'30px'}}>
            <Typography variant='h3' style={{marginTop: '20px'}}>Community Opportunities</Typography>
            <Typography variant='body1' style={{padding: '5px'}}>These are the opportunitites currently available to the community.</Typography>
          </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom:'30px'}}>
          <SearchBar
              placeholder="Search"
              onChange={(e) => searchData(e.target.value)}
          />
          </Grid>
          
            {opportunities && opportunities.length > 0 ?
              opportunities.map((fr, i) => {
              
                return(
                  <OpportunityCard 
                    key={i}
                    creator={fr.proposer}
                    created={fr.submitDate}
                    updated={fr.updatedDate}
                    reward={fr.reward}
                    category={fr.category}
                    projectName={fr.projectName}
                    details={fr.details}
                    title={fr.title}
                    opportunityId={fr.opportunityId}
                    opportunityStatus={fr.status}
                    permission={fr.permission}
                  />
                )
              }) : <Card className={classes.card}>
              <Typography variant="h5">No Opportunities Yet - Please Check Back Soon.</Typography>
            </Card> }
          
        </Grid>
        </div>
        <Footer />
        </>
    )
}