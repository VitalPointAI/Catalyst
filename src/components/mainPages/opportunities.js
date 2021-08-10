import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { Header } from '../Header/header'
import * as nearAPI from 'near-api-js'
import Personas from '@aluhning/get-personas-js'
import OpportunityCard from '../OpportunityCard/OpportunityCard'
import Footer from '../../components/common/Footer/footer'
import Fuse from 'fuse.js'
import SearchBar from '../../components/common/SearchBar/search'
import { ceramic } from '../../utils/ceramic'

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
    const [aopportunities, setaOpportunities] = useState()
    const [searchOpportunities, setSearchOpportunities] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [suitabilityScore, setSuitabilityScore] = useState()

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      didRegistryContract, 
      near,
      appIdx
    } = state

    const {
      contractId
    } = useParams()

    useEffect(
        () => {
          async function fetchData() {
            console.log('contractid', contractId)
            console.log('accountId', accountId)
            if(didRegistryContract && near && contractId){
              let Persona = new Personas()
              let thisCurDaoIdx
              let daoAccount
              let opportunities
              try{
                daoAccount = new nearAPI.Account(near.connection, contractId)
              } catch (err) {
                console.log('no account', err)
              }
              thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
          
              opportunities = await thisCurDaoIdx.get('opportunities', thisCurDaoIdx.id)
              console.log('opportunities', opportunities)
              if(opportunities && opportunities.length > 0){
                setaOpportunities(opportunities.opportunities)
              }

              // Suitability Score

                    // 1. Build complete list of all opportuntities for all DAOs
                    let allOpportunities = []
                    let i = 0
                    console.log('opportunities here', opportunities)
                    if(opportunities){
                    while (i < opportunities.opportunities.length){
                      console.log('opportunities', opportunities)
                      allOpportunities.push(opportunities.opportunities[i])
                      i++
                    }
                    }
                    console.log('all opportunities', allOpportunities)

                    // 2. Retrieve current persona data
                    let currentPersona = await Persona.getPersona(accountId)
                    console.log('all opp persona', currentPersona)

                    // 3. Initialize recommendations array
                    let currentRecommendations = []
                  
                    // 3. For each opportunity, compare opportunity skillset requirements to persona skillsets and add to recommendations array if the same
                    // calculate a suitability percentage from skills required (true) (total skills possessed / total skills)
                    let j = 0
                    let developerPercentage = 0
                    let developerSkillCount = 0
                    let developerSkillMatch = 0
                    let skillPercentage = 0
                    let skillCount = 0
                    let skillMatch = 0
                  
                    while (j < allOpportunities.length){
                        for (const [key, value] of Object.entries(allOpportunities[j].desiredDeveloperSkillSet)){
                            if(value){
                                developerSkillCount++
                                for (const [pkey, pvalue] of Object.entries(currentPersona.developerSkillSet)){
                                    if(pkey == key && pvalue == value){
                                        developerSkillMatch ++
                                    }
                                }
                            }
                        }
                        for (const [key, value] of Object.entries(allOpportunities[j].desiredSkillSet)){
                            if(value){
                                skillCount++
                                for (const [pkey, pvalue] of Object.entries(currentPersona.skillSet)){
                                    if(pkey == key && pvalue == value){
                                        skillMatch++
                                    }
                                }
                            }
                        }
                        let asuitabilityScore = ((skillMatch + developerSkillMatch)/(skillCount + developerSkillCount)*100).toFixed(0)
                        setSuitabilityScore(asuitabilityScore)
                        currentRecommendations.push({opportunity: allOpportunities[j], skillMatch: skillMatch, developerSkillMatch: developerSkillMatch, skillCount: skillCount, developerSkillCount: developerSkillCount, suitabilityScore: asuitabilityScore})
                        j++
                    }
                    setRecommendations(currentRecommendations)
                    console.log('recommendations', currentRecommendations)
            }

          }

          fetchData()
    }, [state, contractId]
    )

    const searchData = async (pattern) => {
      if (!pattern) {
        let Persona = new Personas()
        let opportunities = await Persona.getOpportunities(contractId)
        let sortedOpportunities = _.sortBy(opportunities.opportunities, 'submitDate').reverse()
       
        setaOpportunities(sortedOpportunities)
        return
      }     
    
      
      const fuse = new Fuse(aopportunities, {
          keys: ['category', 'title', 'details']
      })
      
      const result = fuse.search(pattern)
     
      const matches = []
      if (!result.length) {
          setaOpportunities([])
      } else {
          result.forEach(({item}) => {
              matches.push(item)
      })
          setaOpportunities(matches)
      }
  }
    
    return (
        <>
        <div className={classes.root}>
        <Header state={state}/>
        <Grid container alignItems="center" justifyContent="flex-start" spacing={0}>
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
          
            {recommendations && recommendations.length > 0 ?
              recommendations.map((fr, i) => {
                console.log('fr', fr)
                return(
                  <OpportunityCard 
                    key={i}
                    creator={fr.opportunity.proposer}
                    created={fr.opportunity.submitDate}
                    updated={fr.opportunity.updatedDate}
                    reward={fr.opportunity.reward}
                    category={fr.opportunity.category}
                    projectName={fr.opportunity.projectName}
                    details={fr.opportunity.details}
                    title={fr.opportunity.title}
                    opportunityId={fr.opportunity.opportunityId}
                    opportunityStatus={fr.opportunity.status}
                    permission={fr.opportunity.permission}
                    skillCount={fr.skillCount}
                    skillMatch={fr.skillMatch}
                    developerSkillCount={fr.developerSkillCount}
                    developerSkillMatch={fr.developerSkillMatch}
                    suitabilityScore={fr.suitabilityScore}
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