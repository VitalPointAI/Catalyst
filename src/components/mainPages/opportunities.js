import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { Header } from '../Header/header'
import * as nearAPI from 'near-api-js'
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
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Switch from '@material-ui/core/Switch'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    card: {
      margin: 'auto',
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
    const [opportunities, setOpportunities] = useState([])
    const [suitabilityScore, setSuitabilityScore] = useState()
    const [finished, setFinished] = useState(false)
    const [active, setActive] = useState(false)
    const [activeOnly, setActiveOnly] = useState(true)
    const [contract, setContract] = useState()
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [memberStatus, setMemberStatus] = useState()
    const [timerStarted, setTimerStarted] = useState(false)
    const [allOpportunities, setAllOpportunities] = useState([])

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      didRegistryContract,
      daoFactory,
      near,
      appIdx,
      currentDaosList,
      isUpdated,
      wallet,
      nearPrice
    } = state

    const {
      contractId
    } = useParams()

    
    useEffect(
      () => {
        let timer

        async function updateNearPrice() {
            try {
              let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
              update('', {nearPrice: getNearPrice.data.near.usd})
            } catch (err) {
              console.log('get near price issue', err)
            }
        }
  
        function stop() {
          if (timer) {
              clearInterval(timer)
              timer = 0
          }
        }

        timer = setInterval(updateNearPrice, 60000)
        setTimerStarted(true)
      
        return () => {
          setTimerStarted(false)
          stop()
        }

      }, []
    )

    useEffect(
      () => {
        async function initialize() {
          if(wallet && near && appIdx && didRegistryContract){
            let thisContract = await dao.initDaoContract(wallet.account(), contractId)
            setContract(thisContract)
            try{
              let daoAccount = new nearAPI.Account(near.connection, contractId)
              let thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, near, didRegistryContract)
              setCurDaoIdx(thisCurDaoIdx)
            } catch (err) {
              console.log('problem getting curdaoidx', err)
              return false
            }
          }
        }

        initialize()

      }, [wallet, near]
    )

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

            if(contract){
             
              try {
                let thisMemberInfo = await contract.getMemberInfo({member: accountId})
                let thisMemberStatus = await contract.getMemberStatus({member: accountId})
                if(thisMemberStatus && thisMemberInfo[0].active){
                  setMemberStatus(true)
                } else {
                  setMemberStatus(false)
                }
              } catch (err) {
                console.log('no member info yet')
              }
  
            }

            if(didRegistryContract && near && contractId && daoFactory && appIdx){
             
              let curDid = await ceramic.getDid(contractId, daoFactory, didRegistryContract )
              let opportunities = await appIdx.get('opportunities', curDid)
             
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
              

              // 2. Retrieve current persona data
              
              let personaDid = await ceramic.getDid(accountId, daoFactory, didRegistryContract)
              let currentPersona = await appIdx.get('profile', personaDid)

              // 3. Initialize opportunitiess array
              let currentOpportunities = []
            
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
                    currentOpportunities.push({opportunity: allOpportunities[j], status: status, skillMatch: skillMatch, allSkills: combinedOpportunitySkills.length, suitabilityScore: asuitabilityScore})
                    }
                  j++
              }
           
              setAllOpportunities(currentOpportunities)

              let activeOpportunities = []
              let z = 0
              while (z < currentOpportunities.length){
                  if(currentOpportunities[z].opportunity.status == true
                    && currentOpportunities[z].opportunity.budget > 0 
                    && new Date(currentOpportunities[z].opportunity.deadline).getTime() > Date.now()){
                      activeOpportunities.push(currentOpportunities[z])
                  } 
              z++
              }
         
              setOpportunities(activeOpportunities)      
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
    }, [near, contract, isUpdated]
    )

    const searchData = async (pattern) => {
      if (!pattern) {
        let contractDid = await ceramic.getDid(contractId, daoFactory, didRegistryContract)
        let opportunities = await appIdx.get('opportunities', contractDid)
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

  const handleStatusChange = async (event) => {
    setActiveOnly(event.target.checked)
    
    if(event.target.checked){
        let statusRecs = []
        setOpportunities(statusRecs)
        let i = 0
        while (i < opportunities.length){
            if(opportunities[i].opportunity.status == true
              && opportunities[i].opportunity.budget > 0 
              && new Date(opportunities[i].opportunity.deadline).getTime() > Date.now()){
                statusRecs.push(opportunities[i])
            } 
        i++
        }
        setOpportunities(statusRecs)
    } else {
      let statusRecs = []
      setOpportunities(statusRecs)
      let i = 0
      while (i < allOpportunities.length){
        if(allOpportunities[i].opportunity.status == true ||
          allOpportunities[i].opportunity.status == false)
        {
            statusRecs.push(allOpportunities[i])
        } 
      i++
      }
      setOpportunities(statusRecs)
    }
  }
    
    return (
        <>
        <div className={classes.root}>
        <Header state={state}/>
        <Grid container alignItems="center" justifyContent="space-between" spacing={0} >
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'30px'}}>
            <Typography variant='h3' style={{marginTop: '20px'}}>Community Opportunities</Typography>
            <Typography variant='body1' style={{padding: '5px'}}>These are the opportunitites currently available to the community.</Typography>
          </Grid>
          <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
          </Grid>
          <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
          <SearchBar
              placeholder="Search"
              onChange={(e) => searchData(e.target.value)}
          />
          </Grid>
          <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
          </Grid>
        </Grid>
       
        <Grid container spacing={1} justifyContent="center" alignItems="flex-start" style={{paddingLeft:'40px', paddingRight:'40px'}}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <FormControl component="fieldset" style={{flexDirection: 'row'}} >
            <FormLabel component="legend" style={{marginTop:'10px', marginRight:'10px'}}>Filters:</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={activeOnly} onChange={handleStatusChange} name="onlyActiveOpportunities" />}
                label="Active"
              />
            </FormGroup>
          </FormControl>
        </Grid>
          {finished && active ?
            opportunities && opportunities.length > 0 ?
              opportunities.map((fr, i) => {
                if(fr.status == "Passed"){
                return(
                  <OpportunityCard 
                    key={i}
                    creator={fr.opportunity.proposer}
                    created={fr.opportunity.submitDate}
                    updated={fr.opportunity.updatedDate}
                    usd={fr.opportunity.usd ? fr.opportunity.usd : 0}
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
                    contract={contract}
                    curDaoIdx={curDaoIdx}
                    memberStatus={memberStatus}
                    status={fr.status}
                
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
              : <div style={{margin: 'auto', width:'200px', marginTop:'20px', textAlign: 'center'}}>
                  <CircularProgress />
                </div>
            }
       
      </Grid>
      </div>
      <Footer />
      </>
    )
}