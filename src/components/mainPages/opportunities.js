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
import { CircularProgress } from '@material-ui/core'

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
    const [finished, setFinished] = useState(false)
    const [active, setActive] = useState(false)
   
    

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      didRegistryContract, 
      near,
      appIdx,
      currentDaosList,
      isUpdated
    } = state

    const {
      contractId
    } = useParams()


    useEffect(
        () => {
          if(isUpdated){}
          if(currentDaosList && currentDaosList.length > 0){
            let i = 0
            while (i < currentDaosList.length){
              if(currentDaosList[i].contractId == contractId){
                currentDaosList[i].status == 'active' ? setActive(true) : setActive(false)
                break
              }
              i++
            }
          }

          async function fetchData() {
           
            setFinished(false)
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
              thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, near, didRegistryContract)
           
              opportunities = await thisCurDaoIdx.get('opportunities', thisCurDaoIdx.id)
              console.log('opportunities', opportunities)
              if(opportunities && opportunities.opportunities.length > 0){
                setaOpportunities(opportunities.opportunities)
              }

              // Suitability Score

              // 1. Build complete list of all opportuntities for all DAOs
              let allOpportunities = []
              let i = 0
              
              if(opportunities){
                while (i < opportunities.opportunities.length){
                  allOpportunities.push(opportunities.opportunities[i])
                  i++
                }
              }
              console.log('allopps', allOpportunities)

              // 2. Retrieve current persona data
              let personaAccount = new nearAPI.Account(near.connection, accountId)
              let thisCurPersonaIdx
              try{
                thisCurPersonaIdx = await ceramic.getCurrentUserIdx(personaAccount, appIdx, near, didRegistryContract)
              } catch (err) {
                console.log('error retrieving idx', err)
              }
              let currentPersona = await thisCurPersonaIdx.get('profile', thisCurPersonaIdx.id)

              // 3. Initialize recommendations array
              let currentRecommendations = []
            
              // 4. For each opportunity, compare opportunity skillset requirements to persona skillsets and add to recommendations array if the same
              // calculate a suitability percentage from skills required (true) (total skills possessed / total skills)
              let skillMatch
              let combinedOpportunitySkills = []

              // Get complete list of Persona Skills
              let combinedPersonaSkills = []
              if(currentPersona && Object.keys(currentPersona).length > 0){
                for (const [key, value] of Object.entries(currentPersona.developerSkillSet)){
                  if(value){
                    combinedPersonaSkills.push(key)
                  }
                }
                for (const [key, value] of Object.entries(currentPersona.skillSet)){
                  if(value){
                    combinedPersonaSkills.push(key)
                  }
                }
              }

              if (currentPersona && currentPersona.personaSkills.length > 0){
                currentPersona.personaSkills.map((values, index) => {
                  if(values.name){
                    combinedPersonaSkills.push(values.name)
                  }
                })
              }

              if (currentPersona && currentPersona.personaSpecificSkills.length > 0){
                currentPersona.personaSpecificSkills.map((values, index) => {
                  if(values.name){
                    combinedPersonaSkills.push(values.name)
                  }
                })
              }

              console.log('combinedpersonaskills', combinedPersonaSkills)

              let j = 0

              while (j < allOpportunities.length){
                  //reset counters for each iteration through loop

                  skillMatch = 0

                  for (const [key, value] of Object.entries(allOpportunities[j].desiredDeveloperSkillSet)){
                    if(value){
                      combinedOpportunitySkills.push(key)
                    }
                  }
                  for (const [key, value] of Object.entries(allOpportunities[j].desiredSkillSet)){
                    if(value){
                      combinedOpportunitySkills.push(key)
                    }
                  }
                  if (allOpportunities && allOpportunities[j].opportunitySkills.length > 0){
                    allOpportunities[j].opportunitySkills.map((values, index) => {
                      if(values.name){
                        combinedOpportunitySkills.push(values.name)
                      }
                    })
                  }
            

                  let k = 0
                  while (k < combinedOpportunitySkills.length){
                    let n = 0
                    while (n < combinedPersonaSkills.length){
                      if (combinedPersonaSkills[n] == combinedOpportunitySkills[k]){
                        skillMatch++
                      }
                      n++
                    }
                    k++
                  }

                  let asuitabilityScore = ((skillMatch/combinedOpportunitySkills.length)*100).toFixed(0)
                  setSuitabilityScore(asuitabilityScore)

                  let thisContract = await dao.initDaoContract(state.wallet.account(), allOpportunities[j].contractId)
                  console.log('thiscontract', thisContract)
                  // confirm proposal exists
                  let exists
                  try{
                    let index = await thisContract.getProposal({proposalId: parseInt(allOpportunities[j].opportunityId)})
                      if (index){
                          exists = true
                      } else {
                          exists = false
                      }
                    
                  } catch (err) {
                      console.log('error getting proposal', err)
                      exists = false
                  }

                  if(exists){
                    let propFlags = await thisContract.getProposalFlags({proposalId: parseInt(allOpportunities[j].opportunityId)})
                    let status = getStatus(propFlags)
                    currentRecommendations.push({opportunity: allOpportunities[j], status: status, skillMatch: skillMatch, allSkills: combinedOpportunitySkills.length, suitabilityScore: asuitabilityScore})
                    }
                  j++
              }
              console.log('currentrecs', currentRecommendations)
              setRecommendations(currentRecommendations)      
            }
          }

          let mounted = true
          if(mounted){
            fetchData()
            .then((res) => {
              setFinished(true)
            })
          return() => mounted = false
          }
    }, [near, isUpdated]
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
        <Grid container alignItems="center" justifyContent="center" spacing={0}>
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
          {finished && active ?
            recommendations && recommendations.length > 0 ?
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
                    skillMatch={fr.skillMatch}
                    allSkills={fr.allSkills}
                    suitabilityScore={fr.suitabilityScore}
                    deadline={fr.opportunity.deadline}
                    budget={fr.opportunity.budget}
                 
                  />
                )} else {
                  return null
                }
              }) 
              : 
              active ?
                <Card className={classes.card}>
                  <Typography variant="h5">No Opportunities Yet - Please Check Back Soon.</Typography>
                </Card>
              :
              finished && !active ?
              <Card className={classes.card}>
                <Typography variant="h5">This Community is Inactive. No active opportunities available.</Typography>
              </Card>
              : null
              : <div style={{margin: 'auto', width:'200px', marginTop:'20px'}}>
                  <CircularProgress />
                </div>
            }
          
        </Grid>
        </div>
        <Footer />
        </>
    )
}