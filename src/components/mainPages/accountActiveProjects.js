import React, { useEffect, useState, useContext, useRef } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useParams } from 'react-router'
import { dao } from '../../utils/dao'
import { getStatus, generateId, formatDateString } from '../../state/near'
import { ceramic } from '../../utils/ceramic'
import Communities from '../Communities/communities'
import CommunityCount from '../CommunityCount/communityCount'
import MemberCommunityCount from '../MemberCommunityCount/memberCommunityCount'
import MemberCommunities from '../MemberCommunities/memberCommunities'
import AccountInfo from '../AccountInfo/accountInfo'
import OpportunityCard from '../Cards/OpportunityCard/OpportunityCard'

// Material UI
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import './dashboard.css'

const defaultLogo = require('../../img/default_logo.png')

export default function ActiveProjectsByAccount(props) {

    const [memberData, setMemberData] = useState()
    const [proposalData, setProposalData] = useState()
    const [contractId, setContractId] = useState('')
    const [memberCommunities, setMemberCommunities] = useState()
   
    const [first, setFirst] = useState(true)
    const [logo, setLogo] = useState(defaultLogo)
    const [value, setValue] = useState('1')
    const [recommendations, setRecommendations] = useState([])
    const [suitabilityScore, setSuitabilityScore] = useState()
    const [recommendationsLoaded, setRecommendationsLoaded] = useState(false)
    const [opportunityProposalDetailsClicked, setOpportunityProposalDetailsClicked] = useState(false)
    const [opportunityId, setOpportunityId] = useState()
    const [proposer, setProposer] = useState()
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [memberDaos, setMemberDaos] = useState([])

    const [summonerProjects, setSummonerProjects] = useState([])
    const [inactiveSummonerProjects, setInactiveSummonerProjects] = useState([])

    
    const [oppsLoaded, setOppsLoaded] = useState(false)

    const [anchorEl, setAnchorEl] = useState(null)

    const { state, dispatch, update } = useContext(appStore)
   
    const matches = useMediaQuery('(max-width:500px)')

    let communities = []
    
    const {
      accountId,
      currentDaosList,
      inactiveDaosList,
      currentActiveDaos,
      near,
      wallet,
      appIdx,
      didRegistryContract,
      did,
      daoFactory,
      isUpdated
    } = state

    const {
      summoner
    } = useParams()

    useEffect(() => {
      async function fetchSummonerProjects() {
        if(isUpdated){}
        let currentSummonerProjects = []
        if(currentActiveDaos){
          for(let x = 0; x < currentActiveDaos.length; x++){
            if(currentActiveDaos[x].summoner == summoner){
              currentSummonerProjects.push(currentActiveDaos[x])
            }
          }
          setSummonerProjects(currentSummonerProjects)
        }
      }
      fetchSummonerProjects()
      .then((res) => {

      })
    }, [currentActiveDaos, isUpdated])

    useEffect(() => {
      async function fetchInactiveSummonerProjects() {
        if(isUpdated){}
        let currentInactiveSummonerProjects = []
        if(inactiveDaosList){
          for(let x = 0; x < inactiveDaosList.length; x++){
            if(inactiveDaosList[x].summoner == summoner){
              currentInactiveSummonerProjects.push(inactiveDaosList[x])
            }
          }
          setInactiveSummonerProjects(currentInactiveSummonerProjects)
        }
      }

      fetchInactiveSummonerProjects()
      .then((res) => {
        
      })
    }, [inactiveDaosList, isUpdated])
    
    useEffect(
        () => {
            async function fetchMemberData() {
                let contract
                let memberDaos = []
                if(currentDaosList){
                  let j = 0
                  while (j < currentDaosList.length){
                      try{
                          contract = await dao.initDaoContract(state.wallet.account(), currentDaosList[j].contractId)
                        } catch (err) {
                          console.log('problem initializing dao contract', err)
                        }
    
                      let thisMemberStatus
                      let thisMemberInfo
                      try {
                        thisMemberInfo = await contract.getMemberInfo({member: accountId})
                        thisMemberStatus = await contract.getMemberStatus({member: accountId})
                      
                        if(thisMemberStatus && thisMemberInfo[0].active){
                          memberDaos.push(currentDaosList[j])
                        } 
                      } catch (err) {
                        console.log('no member info yet')
                      }
                  j++
                  }
                  setMemberDaos(memberDaos)
                  
                  if(currentDaosList.length > 0){
                      let i = 0
                      while (i < currentDaosList.length){
                          if(currentDaosList[i].summoner == accountId){
                              let name = currentDaosList[i].contractId.split('.')
                              communities.push({contractId: currentDaosList[i].contractId, communityName: name[0]})
                              setMemberCommunities(communities)
                          }
                      i++
                      }
                  }
                }
            }
            
            fetchMemberData()
            .then((res) => {
  
            })
  
        }, [currentDaosList]
    )
    
    useEffect(
        () => {          
            if(isUpdated){}  
            async function fetchTab1Data(){
                    setOppsLoaded(false)
                    // Persona Opportunity Recommendations

                    // 1. Build complete list of all opportuntities for all active DAOs
                    let allOpportunities = []
                    if(currentDaosList && currentDaosList.length > 0){
                        let i = 0
                        while (i < currentDaosList.length){
                            if(currentDaosList[i].status == 'active'){
                                let singleDaoOpportunity
                                try{
                                        let contractDid = await ceramic.getDid(currentDaosList[i].contractId, daoFactory, didRegistryContract)
                                        singleDaoOpportunity = await appIdx.get('opportunities', currentDaosList[i].did)
                                        
                                    } catch (err) {
                                        console.log('error loading singledao opportunity', err)
                                    }

                                    if(singleDaoOpportunity && Object.keys(singleDaoOpportunity).length > 0){
                                        let j = 0
                                        while (j < singleDaoOpportunity.opportunities.length){
                                        allOpportunities.push(singleDaoOpportunity.opportunities[j])
                                        j++
                                        }
                                    }
                              //  }
                            }
                        i++
                        }
                    }
                    console.log('all opportunities', allOpportunities)

                    // 2. Retrieve current persona data
                    let currentPersona
                    //let personaDid = await ceramic.getDid(accountId, daoFactory, didRegistryContract)
                    if(did){
                        currentPersona = await appIdx.get('profile', did)
                        console.log('all opp persona', currentPersona)
                    }

                    // 3. Initialize recommendations array
                    let currentRecommendations = []

                    // 3. For each opportunity, compare opportunity skillset requirements to persona skillsets and add to recommendations array if the same
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
                        console.log('combinedopportunityskills', combinedOpportunitySkills)

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
                           if (!asuitabilityScore){
                            asuitabilityScore = 0
                        }
                        setSuitabilityScore(asuitabilityScore)
                        console.log('suitability score', asuitabilityScore)
                        let thisContract = await dao.initDaoContract(state.wallet.account(), allOpportunities[j].contractId)
                        let propFlags
                        // confirm proposal exists
                        let exists
                        try{
                            let index = await thisContract.getProposal({proposalId: parseInt(allOpportunities[j].opportunityId)})
                            if (index){
                                exists = true
                            } else {
                                exists = false
                            }
                            console.log('opp exists', exists)
                        } catch (err) {
                            console.log('error getting proposal', err)
                            exists = false
                        }
                        if(exists){
                            console.log('here all ops', allOpportunities[j])
                            propFlags = await thisContract.getProposalFlags({proposalId: parseInt(allOpportunities[j].opportunityId)})
                            
                            let status = getStatus(propFlags)
                            
                            let contractDid = await ceramic.getDid(allOpportunities[j].contractId, daoFactory, didRegistryContract)
                            let result
                            if(contractDid){
                                result = await appIdx.get('daoProfile', contractDid)
                            }
                            if(result && status == 'Passed' && allOpportunities[j].budget > 0 && Date.now() <= new Date(allOpportunities[j].deadline)){
                                currentRecommendations.push({
                                    opportunity: allOpportunities[j],
                                    status: status,
                                    communityLogo: result.logo,
                                    communityName: result.name,
                                    communityPurpose: result.purpose,
                                    baseReward: parseFloat(allOpportunities[j].reward), 
                                    skillMatch: skillMatch, 
                                    allSkills: combinedOpportunitySkills.length,
                                    suitabilityScore: asuitabilityScore})
                            }
                        }
                        j++
                    }
                    
                    setRecommendations(currentRecommendations)
                    setRecommendationsLoaded(true)
                    console.log('recommendations', currentRecommendations)
            
            }
            let mounted = true
            if(mounted){
                fetchTab1Data()
                .then(res => {
                    setOppsLoaded(true)
                })
                return () => {
                mounted = false
            } 
        }
    }, [currentDaosList, isUpdated]
    )

    function handleExpanded() {
        setAnchorEl(null)
    }

    return (
        <>
        <Grid container justifyContent="center" alignItems="flex-start" spacing={1} style={{padding: '5px'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '15px', marginBottom: '15px'}}>
               <AccountInfo />
            </Grid>
            {summonerProjects && summonerProjects.length > 0 ?
              <MemberCommunities memberDaos={summonerProjects} />
            : <Typography variant="body1">We currently have no projects in progress. Please check back.</Typography>
            }
            {inactiveSummonerProjects && inactiveSummonerProjects.length > 0 ?
            <Accordion>
               <AccordionSummary
                 expandIcon={<ExpandMoreIcon />}
                 aria-controls="panel2a-content"
                 id="panel2a-header"
               >
                <Typography variant="body1">Inactive Projects</Typography>
               </AccordionSummary>
               <AccordionDetails>
               <Grid container justifyContent="center" alignItems="center" spacing={1}>
                 <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>                      
                     <MemberCommunities memberDaos={inactiveSummonerProjects} />
                 </Grid>
               </Grid>
               </AccordionDetails>
             </Accordion>
             : null }
        </Grid>
        </>
    )
}