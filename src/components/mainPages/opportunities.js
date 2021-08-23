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
import { dao } from '../../utils/dao'
import { getStatus } from '../../state/near'

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
                    console.log('xz all opp persona', currentPersona)

                    // 3. Initialize recommendations array
                    let currentRecommendations = []
                  
                    // 3. For each opportunity, compare opportunity skillset requirements to persona skillsets and add to recommendations array if the same
                    // calculate a suitability percentage from skills required (true) (total skills possessed / total skills)
                    let j = 0
                    
                    let developerSkillCount
                    let developerSkillMatch
                    let skillCount
                    let skillMatch
                  
                    while (j < allOpportunities.length){
                        //reset counters for each iteration through loop
                        developerSkillCount = 0
                        developerSkillMatch = 0
                        skillCount = 0
                        skillMatch = 0

                        for (const [key, value] of Object.entries(allOpportunities[j].desiredDeveloperSkillSet)){
                          console.log('xz dd key', key)
                          console.log('xz dd value', value)  
                          if(value){
                                developerSkillCount++
                                console.log('xz dev skill count', developerSkillCount)
                                for (const [pkey, pvalue] of Object.entries(currentPersona.developerSkillSet)){
                                    if(pkey == key && pvalue == value){
                                        developerSkillMatch ++
                                    }
                                }
                            }
                        }
                        console.log('xz allopps', allOpportunities)
                        for (const [key, value] of Object.entries(allOpportunities[j].desiredSkillSet)){
                          console.log('xz s key', key)
                          console.log('xz s value', value)    
                          if(value){
                                skillCount++
                                console.log('xz skill count', skillCount)
                                for (const [pkey, pvalue] of Object.entries(currentPersona.skillSet)){
                                  console.log('xz key', pkey)
                                  console.log('xz value', pvalue)    
                                  if(pkey == key && pvalue == value){
                                    console.log('xz match: ' + pkey + ':' + pvalue + ':' + key + ':' + value)
                                        skillMatch++
                                    }
                                }
                            }
                        }
                        console.log('xr skill match', skillMatch)
                        console.log('xrdeveloper skill match', developerSkillMatch)
                        console.log('xr skillCount', skillCount)
                        console.log('xr developer skill count', developerSkillCount)
                        let asuitabilityScore = ((skillMatch + developerSkillMatch)/(skillCount + developerSkillCount)*100).toFixed(0)
                        setSuitabilityScore(asuitabilityScore)
                        let thisContract = await dao.initDaoContract(state.wallet.account(), allOpportunities[j].contractId)
                          // confirm proposal exists
                        let exists
                        try{
                          console.log('test all opps', allOpportunities)
                          let testProposal = await thisContract.getProposal({pI: 0})
                          console.log('test proposal', testProposal) 
                          let index = await thisContract.getProposalIndex({pI: parseInt(allOpportunities[j].opportunityId)})
                            if (index != -1){
                                exists = true
                            } else {
                                exists = false
                            }
                            console.log('opp exists', exists)
                        } catch (err) {
                            console.log('error getting proposal index', err)
                            exists = false
                        }
                        if(exists){
                          let propFlags = await thisContract.getProposalFlags({pI: parseInt(allOpportunities[j].opportunityId)})
                          let status = getStatus(propFlags)
                          currentRecommendations.push({opportunity: allOpportunities[j], status: status, skillMatch: skillMatch, developerSkillMatch: developerSkillMatch, skillCount: skillCount, developerSkillCount: developerSkillCount, suitabilityScore: asuitabilityScore})
                         }
                        j++
                    }
                    setRecommendations(currentRecommendations)
                    console.log('xz recommendations', currentRecommendations)
            }

          }
          let mounted = true
          if(mounted){
            fetchData()
            .then((res) => {
                           
            })
          return() => mounted = false
          }
    }, [near]
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
                if(fr.status == "Passed"){
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
                    deadline={fr.opportunity.deadline}
                    budget={fr.opportunity.budget}
                  />
                )} else {
                  return null
                }
              }) : <Card className={classes.card}>
              <Typography variant="h5">No Opportunities Yet - Please Check Back Soon.</Typography>
            </Card> }
          
        </Grid>
        </div>
        <Footer />
        </>
    )
}