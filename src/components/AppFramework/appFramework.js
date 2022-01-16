import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { useParams } from 'react-router-dom'
import * as nearAPI from 'near-api-js'
import { get, set, del } from '../../utils/storage'
import { logInitEvent, 
  logProposalEvent, 
  logSponsorEvent, 
  logCancelEvent, 
  logProcessEvent, 
  logVoteEvent,
  logDonationEvent,
  logDelegationEvent,
  logExitEvent,
  logInactivateCommunity,
  inactivateCommunity,
  synchProposalEvent,
  logProposalChange,
  synchMember,
  synchDaos, 
  synchBudgets,
  networkId,
  tokenFactoryContractName,
  REGISTRY_API_URL} from '../../state/near'

import FungibleTokens from '../../utils/fungibleTokens'
const { getMetadata, getBalanceOf } = FungibleTokens;

import ActionSelector from '../ActionSelector/actionSelector'
import ProposalList from '../ProposalList/proposalList'
import RightSideDrawer from './RightSideDrawer'
import Footer from '../../components/common/Footer/footer'
import { Header } from '../Header/header'
import Initialize from '../Initialize/initialize'
import FTInitialize from '../Initialize/ftInitialize'
import RandomPhrase from '../common/RandomPhrase/randomPhrase'
import WarningConfirmation from '../Confirmation/warningConfirmation';
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import { dao } from '../../utils/dao'
import { ft } from '../../utils/ft'
import { ceramic } from '../../utils/ceramic'
import { COMMUNITY_ARRIVAL } from '../../state/near'
import { Steps, Hints } from "intro.js-react"


import { ACCOUNT_HELPER_URL, NEW_SPONSOR, NEW_CANCEL, DAO_FIRST_INIT, FT_FIRST_INIT, NEW_PROPOSAL, NEW_PROCESS, NEW_VOTE, NEW_DONATION, NEW_EXIT, 
  NEW_DELEGATION, WARNING_FLAG, NEW_REVOCATION, NEW_CHANGE_PROPOSAL, INACTIVATE_COMMUNITY, NEW_INACTIVATION, hasKey } from '../../state/near'

// Material UI imports
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Chip from '@material-ui/core/Chip'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import CircularProgress from '@material-ui/core/CircularProgress'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Card from '@material-ui/core/Card'
import LinearProgress from '@material-ui/core/LinearProgress'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  centered: {
    width: '200px',
    height: '100px',
    textAlign: 'center',
    position: 'fixed',
    top: '50%',
    left: '50%',
    marginTop: '-100px',
    marginLeft: '-100px'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
    top: {
      marginBottom: '10px',
      fontSize: '24px'
    },
  }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function AppFramework(props) {

    const { state, dispatch, update } = useContext(appStore)

    const [sharesLabel, setSharesLabel] = useState('Shares: 0')
    const [lootLabel, setLootLabel] = useState('Loot: 0')
    const [fairShareLabel, setFairShareLabel] = useState('Current Share: 0')
    const [memberIcon, setMemberIcon] = useState(<NotInterestedIcon />)
    const [guildBalanceChip, setGuildBalanceChip] = useState()
    const [escrowBalanceChip, setEscrowBalanceChip] = useState()
    const [currentShare, setCurrentShare] = useState()
  

    const [tabValue, setTabValue] = useState('1')
    
    const [allMemberInfo, setAllMemberInfo] = useState([])
    const [memberInfo, setMemberInfo] = useState()
    const [allProposals, setAllProposals] = useState([])
  
    const [notificationIndicator, setNotificationIndicator] = useState(false)
  
    const [totalShares, setTotalShares] = useState()  
   
    const [initLoad, setInitLoad] = useState(false)
    
    const [stepsEnabled, setStepsEnabled] = useState(false)
    const [appbarStepsEnabled, setAppbarStepsEnabled] = useState(false)
    const [tabTutorialEnabled, setTabTutorialEnabled] = useState(false)

    const [timerStarted, setTimerStarted] = useState(false)
    const [priceTimerStarted, setPriceTimerStarted] = useState(false)

    const [triggersActioned, setTriggersActioned] = useState(false)
    const [restInitialized, setRestInitialized] = useState(false)
    const [essentialsInitialized, setEssentialsInitialized] = useState(false)

    const [triggerSteps, setStepsTriggered] = useState(0)
    const [loaded, setLoaded] = useState(false)
    const [remainingDelegates, setRemainingDelegates] = useState()
    
    const [synchComplete, setSynchComplete] = useState(false)
    const [currentDaoAccount, setCurrentDaoAccount] = useState()
    const [approvedTokens, setApprovedTokens] = useState([])
    const [ftContract, setFTContract] = useState()
    const [contractType, setContractType] = useState()
    const [currentTreasuryTotal, setCurrentTreasuryTotal] = useState()
    const [escrowCurrentTreasuryTotal, setEscrowCurrentTreasuryTotal] = useState()
    const [date, setDate] = useState()

    const classes = useStyles()

    const {
      proposalComments,
      appClient,
    } = props

    const { 
      appIdx,
      didRegistryContract,
      near,
      accountId,
      daoFactory,
      wallet,
      isUpdated,
      currentDaosList,
      nearPrice,
      proposalDeposit,
      depositToken,
      tokenName,
      summoner,
      votingPeriodLength,
      gracePeriodLength,
      curDaoIdx,
      contract,
      active,
      currentPeriod,
      periodDuration,
      initialized,
      guildBalance,
      escrowBalance,
      currentMemberStatus,
      neededVotes,
      totalMembers,
      memberStatus
    } = state
    
    const {
      contractId
    } = useParams()
  

    const matches = useMediaQuery('(max-width:500px)')

  //   let steps=[{
  //     intro:
  //     <> 
  //     <Typography>Welcome to the Community Page! Here you can join the community, create, and vote on proposals.</Typography>
  //     <br/>
  //     <Typography>You can also find community specific opportunities by visitng the communities opportunity page.</Typography>
  //     </>
  //   },
  // {
  //   intro: "This is a phantom step to denote the end of steps in this component. If it is displayed, there is an error"
  // }]

  useEffect(
    () => {
      
        async function fetchEssentials() {

          if(didRegistryContract && near){

            if(contractId){
              let thisCurDaoIdx
              let daoAccount
              let contract
              try{
                daoAccount = new nearAPI.Account(near.connection, contractId)
              } catch (err) {
                console.log('no account', err)
                return false
              }
              
              try{
                thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, near, didRegistryContract)
              } catch (err) {
                console.log('problem getting curdaoidx', err)
                return false
              }
              
              try{
                contract = await dao.initDaoContract(state.wallet.account(), contractId)
              } catch (err) {
                console.log('problem initializing dao contract', err)
                return false
              }
              update('', {
                curDaoIdx: thisCurDaoIdx,
                daoAccount: daoAccount,
                contract: contract
              }, () => {
               
              })
             
            }
            
            return true
          }
        }

        fetchEssentials()
        .then((res) => {
          console.log('res', res)
          res ? setEssentialsInitialized(true) : setEssentialsInitialized(false)
        })

      }, [didRegistryContract, near]
  )

  useEffect(
    () => {
      let timer
      async function getPrice(){
        let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
        if(getNearPrice.data.near.usd != nearPrice){
          update('', {nearPrice:getNearPrice.data.near.usd})
        }
      }

      function stop() {
        if (timer) {
            clearInterval(timer)
            timer = 0
        }
      }

      timer = setInterval(getPrice, 5000)
      setPriceTimerStarted(true)
      
      return () => {
        setPriceTimerStarted(false)
        stop()
      }
    },[]
  )

  useEffect(
    () => {
      let newVisit = get(COMMUNITY_ARRIVAL, [])
      let warningFlag = get(WARNING_FLAG, [])
      if(!newVisit[0] && warningFlag[0]){
        setStepsEnabled(true)
        newVisit.push({status: 'true'})
        set(COMMUNITY_ARRIVAL, newVisit)
      }
    }, []
  )

  useEffect(
    () => {
      if(currentDaosList && currentDaosList.length > 0){
        let i = 0
        while (i < currentDaosList.length){
          if(currentDaosList[i].contractId == contractId){
            currentDaosList[i].status == 'active' ? update('', {active: true}) : update('', {active: false}) 
            break
          }
          i++
        }
      }
    },[currentDaosList]
  )
    
  useEffect(
    () => {
      async function actionTriggers() {

        let urlVariables = window.location.search
        const urlParameters = new URLSearchParams(urlVariables)
        let transactionHash = urlParameters.get('transactionHashes')
      

          // *********CHECK FOR TRIGGERS AND EXECUTE*************

                // Step 1 in leaving community: check for successfully added exit and log it
                let newExit = get(NEW_EXIT, [])
                              
                let a = 0
                while(a < newExit.length){
                  if(newExit[a].contractId==contractId && newExit[a].new == true){
                    let loggedExit = await logExitEvent(
                      contractId,
                      curDaoIdx, 
                      contract,
                      newExit[a].account,
                      transactionHash)
                      
                    if (loggedExit) {
                    
                      del(NEW_EXIT)
                      // check for and action any community inactivations
                      let inactivation = get(INACTIVATE_COMMUNITY, [])
                      
                      let t = 0
                      while(t < inactivation.length){
                        let aa = 0
                        let stillExists = false
                          while(aa < currentDaosList.length){
                            if(currentDaosList[aa].contractId == inactivation[t].contractId){
                              stillExists = true
                              break
                            }
                            aa++
                          }
                        if(!stillExists){
                          del(INACTIVATE_COMMUNITY)
                          await renewProposals(curDaoIdx, contract)
                          break
                        } else {
                          if(inactivation[t].contractId==contractId && inactivation[t].new == true){
                            let inactivated = await inactivateCommunity(
                              daoFactory,
                              contractId, 
                              accountId
                            )
                          }
                        }
                        t++
                      }
                    }
                  }
                  a++
                }

                // check for successfully inactivated community and log it then redirect to dashboard as contract account is gone
                let newInactivation = get(NEW_INACTIVATION, [])
              
                let u = 0
                while(u < newInactivation.length){
                  if(newInactivation[u].contractId==contractId && newInactivation[u].new == true){
                    let loggedInactivation = await logInactivateCommunity(
                      contractId,
                      appIdx, 
                      accountId,
                      transactionHash)
                      
                    if (loggedInactivation) {
                      del(NEW_INACTIVATION)
                      del(INACTIVATE_COMMUNITY)
                      window.location.assign('/')
                    }
                  }
                  u++
                }


                // check for first init to log summon and member events
                let firstInit = get(DAO_FIRST_INIT, [])
                
                let c = 0
                while(c < firstInit.length){
    
                  if(firstInit[c].contractId==contractId && firstInit[c].init == true){
                  
                    let logged = await logInitEvent(
                      contractId, 
                      curDaoIdx, 
                      contract, 
                      'Democracy', 
                      state.accountId,
                      firstInit[c].shares,
                      transactionHash)
                      
                    if (logged) {
                      del(DAO_FIRST_INIT)
                      await renewProposals(curDaoIdx, contract)
                    }
                  }
                  c++
                }

                // check for successfully added new proposal to log it
                let newProposal = get(NEW_PROPOSAL, [])
              
                let d = 0
                while(d < newProposal.length){
                  if(newProposal[d].contractId==contractId && newProposal[d].new == true){
                    if(!transactionHash){
                      del(NEW_PROPOSAL)
                    } else {
                      let loggedProposal = await logProposalEvent(
                        curDaoIdx, 
                        contract, 
                        newProposal[d].proposalId,
                        contractId,
                        transactionHash
                        )
                        
                      if (loggedProposal) {
                        del(NEW_PROPOSAL)
                        await renewProposals(curDaoIdx, contract)
                      }
                    }
                  }
                  d++
                }
  
                // check for successfully added new sponsor event to log it
                let newSponsor = get(NEW_SPONSOR, [])
              
                let f = 0
                while(f < newSponsor.length){
                  if(newSponsor[f].contractId==contractId && newSponsor[f].new == true){
                    if(!transactionHash){
                      del(NEW_SPONSOR)
                    } else {
                      let loggedSponsor = await logSponsorEvent(
                        curDaoIdx, 
                        contract,
                        contractId,
                        newSponsor[f].proposalId,
                        transactionHash)
                        
                      if (loggedSponsor) {
                      del(NEW_SPONSOR)
                      await renewProposals(curDaoIdx, contract)
                      }
                    }
                  }
                  f++
                }
                  
                //check for new proposals to process
                let newProcess = get(NEW_PROCESS, [])
            
                let g = 0
                while(g < newProcess.length){
                  if(newProcess[g].contractId==contractId && newProcess[g].new == true){
                    let loggedProcess = await logProcessEvent(
                      near,
                      appIdx,
                      didRegistryContract,
                      curDaoIdx, 
                      contract,
                      contractId,
                      newProcess[g].proposalId,
                      newProcess[g].type,
                      transactionHash
                      )
                    
                    if (loggedProcess) {
                      if(newProcess[g].type == 'GuildKick' || newProcess[g].type == 'Tribute') {
                        try {
                          let synched = await synchMember(curDaoIdx, contract, contractId, newProcess[g].applicant, true)
                        } catch (err) {
                          console.log('no members yet', err)
                        }
                      }
                      del(NEW_PROCESS)
                      await renewProposals(curDaoIdx, contract)
                    }
                  }
                  g++
                }

                // check for proposal change event to log it
                let newChange = get(NEW_CHANGE_PROPOSAL, [])
              
                let aa = 0
                while(aa < newChange.length){
                  if(newChange[aa].contractId==contractId && newChange[aa].new == true){
                    if(!transactionHash){
                      del(NEW_CHANGE_PROPOSAL)
                    } else {
                      let loggedChange = await logProposalChange(
                        curDaoIdx, 
                        contract,
                        contractId,
                        newChange[aa].fundingRequested,
                        newChange[aa].fundingToken,
                        transactionHash)
                        
                      if (loggedChange) {
                      del(NEW_CHANGE_PROPOSAL)
                      await renewProposals(curDaoIdx, contract)
                      }
                    }
                  }
                  aa++
                }
  
                // check for new votes
                let newVotes = get(NEW_VOTE, [])
            
                let x = 0
                while(x < newVotes.length){
                  if(newVotes[x].contractId==contractId && newVotes[x].new == true){
                    
                    let loggedVote = await logVoteEvent(
                      curDaoIdx,
                      contractId,
                      contract, 
                      newVotes[x].proposalId,
                      accountId
                      )
                      
                    if (loggedVote) {
                      del(NEW_VOTE)
                      await renewProposals(curDaoIdx, contract)
                    }
                  }
                  x++
                }

                // check for cancelled proposal event
                let newCancel = get(NEW_CANCEL, [])
                let h = 0
                while(h < newCancel.length){
                  if(newCancel[h].contractId==contractId && newCancel[h].new == true){
                    let loggedCancel = await logCancelEvent(
                      curDaoIdx, 
                      contract,
                      contractId,
                      newCancel[h].proposalId,
                      transactionHash)
                      
                    if (loggedCancel) {
                      del(NEW_CANCEL)
                      await renewProposals(curDaoIdx, contract)
                    }
                  }
                  h++
                }
                
                // check for successfully added donation log it
                let newDonation = get(NEW_DONATION, [])
              
                let y = 0
                while(y < newDonation.length){
                  if(newDonation[y].contractId==contractId && newDonation[y].new == true){
                    let loggedDonation = await logDonationEvent(
                      curDaoIdx, 
                      contract,
                      newDonation[y].donationId,
                      newDonation[y].contractId,
                      transactionHash)
                      
                    if (loggedDonation) {
                      del(NEW_DONATION)
                      await renewProposals(curDaoIdx, contract)
                    }
                  }
                  y++
                }

                // check for successfully added delegation and log it
                let newDelegation = get(NEW_DELEGATION, [])
              
                let l = 0
                while(l < newDelegation.length){
                  if(newDelegation[l].contractId==contractId && newDelegation[l].new == true){
                    let loggedDelegation = await logDelegationEvent(
                      contractId,
                      curDaoIdx, 
                      contract,
                      newDelegation[l].delegator,
                      newDelegation[l].receiver,
                      transactionHash)
                      
                    if (loggedDelegation) {
                      del(NEW_DELEGATION)
                      await renewProposals(curDaoIdx, contract)
                    }
                  }
                  l++
                }

                // check for successfully added revoke delegation and log it
                let newRevocation = get(NEW_REVOCATION, [])
            
                let m = 0
                while(m < newRevocation.length){
                  if(newRevocation[m].contractId==contractId && newRevocation[m].new == true){
                    let loggedRevocation = await logDelegationEvent(
                      contractId,
                      curDaoIdx, 
                      contract,
                      newRevocation[m].delegator,
                      newRevocation[m].receiver,
                      transactionHash)
                      
                    if (loggedRevocation) {
                      del(NEW_REVOCATION)
                      await renewProposals(curDaoIdx, contract)
                    }
                  }
                  m++
                }

              return true
      }
      

      if(essentialsInitialized){
        actionTriggers()
        .then((res) => {
          res ? setTriggersActioned(true) : setTriggersActioned(false)
        })
      }

    }, [essentialsInitialized]
  )

  useEffect(
    () => {
      async function actionSynch() {
        //************SYNCH PROPOSALS AND CONTRACT AND MEMBERS */
        // has to occur after all triggers so everything is logged
        // otherwise will erase transaction hashes as they aren't
        // retrievable from the contract
        let daosynch = false
        try {
          daosynch = await synchDaos(state)
        } catch (err) {
          console.log('dao synch error', err)
        }

        if(daosynch){
          try {
            let synched = await synchProposalEvent(curDaoIdx, contract)
            setAllProposals(synched.events)
          } catch (err) {
            console.log('no proposals yet', err)
          }

          try {
            let synched = await synchMember(curDaoIdx, contract, contractId, accountId, false)
            
            if(synched){
              let members = await curDaoIdx.get('members', curDaoIdx.id)
              setAllMemberInfo(members.events)
            }
          } catch (err) {
            console.log('no members yet', err)
          }
        }
        
        return true
      }

      if(triggersActioned){
        actionSynch()
        .then((res) => {
          res ? setSynchComplete(true) : setSynchComplete(false)
          setLoaded(true)
        })
      }
    }, [triggersActioned]
  )

  useEffect(
    () => {
      async function updateCommunityData(){

        if(contract){
          let token
          let platformAccount
          let init
          try{
            token = await contract.getDepositToken()
          } catch (err) {
            console.log('error getting deposit token', err)
          }

          try{
            platformAccount = await contract.getPlatformAccount()
          } catch (err) {
            console.log('error getting platform account')
          }

          try{
            init = await contract.getInit()
            update('', {initialized: init})
            setInitLoad(true)
          } catch (err) {
            console.log('getinit error', err)
          }

          try {
            let settings = await contract.getInitSettings()
            let summoner = settings[0][0]
            let periodDuration = parseFloat(settings[0][1])
            let votingPeriodLength = parseFloat(settings[0][2])
            let gracePeriodLength = parseFloat(settings[0][3])
            let proposalDeposit = formatNearAmount(settings[0][4])
            let dilutionBound = parseFloat(settings[0][5])
            let voteThreshold = parseFloat(settings[0][6])
            let summoningTime = parseFloat(settings[0][7])
            let platformPercent = settings[0][8]

            update('', {
              summoner: summoner,
              periodDuration: periodDuration,
              votingPeriodLength: votingPeriodLength,
              gracePeriodLength: gracePeriodLength,
              tokenName: token,
              depositToken: token,
              proposalDeposit: proposalDeposit,
              dilutionBound: dilutionBound,
              voteThreshold: voteThreshold,
              summoningTime: summoningTime,
              platformPercent: platformPercent,
              platformAccount: platformAccount
            })
          
          } catch(err) {
            console.log('no settings yet')
          }         
        }
      }

      updateCommunityData()
        .then((res) => {

        })

    }, [contract]
  )

  useEffect(
    () => {
      
        async function fetchData() {
          if(isUpdated){}
          //************ LOAD COMMUNITY SETTINGS AND INFORMATION */
              
                  try{
                    let daoDid = await ceramic.getDid(contractId, daoFactory, didRegistryContract)
                    let result = await appIdx.get('daoProfile', daoDid)
                    if(result){
                      result.name ? setName(result.name) : setName('')
                      result.date ? setDate(result.date) : setDate('')
                      result.logo ? setLogo(result.logo) : setLogo(imageName)
                      result.purpose ? setPurpose(result.purpose) : setPurpose('')
                      result.category ? setCategory(result.category) : setCategory('')
                    }
                  } catch (err) {
                    console.log('problem retrieving DAO profile')
                  }
                
                if(initialized){
                    let thisMemberInfo
                    let thisMemberStatus
                    
                    try {
                      thisMemberInfo = await contract.getMemberInfo({member: accountId}) 
                      thisMemberStatus = await contract.getMemberStatus({member: accountId})
                      setMemberInfo(thisMemberInfo)
                      if(thisMemberStatus && thisMemberInfo[0].active){
                        update('', {memberStatus: true})
                      } else {
                        update('', {memberStatus: false})
                      }

                      if(thisMemberStatus && thisMemberInfo !== undefined) {
                        thisMemberInfo[0].active ? setMemberIcon(<CheckCircleIcon />) : setMemberIcon(<NotInterestedIcon />)
                        setSharesLabel('Shares: ' + thisMemberInfo[0].shares)
                        setLootLabel('Loot: ' + thisMemberInfo[0].loot)
                      }

                    } catch (err) {
                      console.log('no member info yet')
                    }
        
                    try {
                      let shares = await contract.getTotalShares()
                      setTotalShares(shares)
                    } catch (err) {
                      console.log('no total shares yet')
                    }

                    try {
                      let tokens = await contract.getApprovedTokens()
                      setApprovedTokens(tokens)
                      
                    } catch (err) {
                      console.log('no approved tokens yet')
                    }
        
                    try {
                      let needed = await contract.getNeededVotes()
                      update('', {neededVotes: needed})
                    } catch (err) {
                      console.log('no needed votes yet')
                    }

                    try {
                      let thisCurrentShare = await contract.getCurrentShare({member: accountId})
                      setCurrentShare(thisCurrentShare)
                      setFairShareLabel('Current Share: ' + formatNearAmount(thisCurrentShare, 3) + 'Ⓝ')
                    } catch (err) {
                      console.log('no current share yet')
                    }

                    try{
                      let delegates = await contract.getRemainingDelegates({member: accountId})
                      setRemainingDelegates(delegates)
                    } catch (err) {
                      console.log('no remaining delegates info yet')
                    }

                    try{
                      let memberCount = await contract.getTotalMembers()
                      update('', {totalMembers: memberCount})
                    } catch (err) {
                      console.log('no members yet')
                    }                  
                    
                    if(currentPeriod == undefined || currentPeriod == 0){
                      try {
                        let period = await contract.getCurrentPeriod()
                        update('', {currentPeriod: period})
                      } catch (err) {
                        console.log('get period issue', err)
                      }
                    }
                }
              
            }
    
    let mounted = true
    if(mounted && essentialsInitialized){
      fetchData()
      .then((res) => {
            setRestInitialized(true)
         
      })

      return () => {
        mounted = false
      } 
    }
}, [essentialsInitialized, contract, initialized, isUpdated]
  )

  useEffect(
    () => {
      async function fetchBalances() {
        if(isUpdated){}
        let ebalance
        let escrowRow
        try {
          ebalance = await contract.getEscrowTokenBalances()
          update('', {escrowBalance: ebalance})
  
          let EscrowAccounts
          let escrowResult
          let escrowTokenUSDValue
          if(ebalance && ebalance.length > 0){
            EscrowAccounts = await Promise.all(ebalance.map(async(element, index) => {
              if(element.token == 'Ⓝ'){
                escrowTokenUSDValue = (parseFloat(formatNearAmount(element.balance, 3))*nearPrice).toFixed(2)
                setEscrowCurrentTreasuryTotal(escrowTokenUSDValue)
              
                return (
                  <ListItem alignItems="space-between" key={element.id}>
                      <ListItemAvatar>
                        <Avatar>Ⓝ</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={`${formatNearAmount(element.balance, 3)} ($${escrowTokenUSDValue} USD)`} 
                      secondary={element.token} />
                  </ListItem>
                )
              } else {
              escrowResult = await getMetadata(element.token)
              return (
                <ListItem key={element.id}>
                  <ListItemAvatar>
                    <Avatar src={escrowResult.icon} />
                  </ListItemAvatar>
                  <ListItemText primary={`${formatNearAmount(element.balance, 3)}`} 
                      secondary={escrowResult.symbol}/>
                </ListItem>
              )
              }
            }))
          } else {
            EscrowAccounts = (
              <ListItem alignItems="space-between" key={element.id}>
                <ListItemAvatar>
                  <Avatar>Ⓝ</Avatar>
                </ListItemAvatar>
                <ListItemText primary="0 ($0.00 USD)" 
                secondary="Ⓝ" />
              </ListItem>
            )
          }
  
          if(active) {
            escrowRow = (
              <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>Escrow</Typography>
                <Typography className={classes.heading} style={{marginLeft: '15px'}}>${escrowTokenUSDValue} USD</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense="true">
                {EscrowAccounts}
                </List>
              </AccordionDetails>
            </Accordion>
            )
          }
          setEscrowBalanceChip(<>{escrowRow}</>)
        } catch (err) {
          console.log('no escrow balance')
        }
  
        let gbalance
        let guildRow
        try {
          gbalance = await contract.getGuildTokenBalances()
          update('', {guildBalance: gbalance})
  
          let Accounts
          let result
          let tokenUSDValue
          if(gbalance && gbalance.length > 0){
            Accounts = await Promise.all(gbalance.map(async(element, index) => {
          
              if(element.token == 'Ⓝ'){
                tokenUSDValue = (parseFloat(formatNearAmount(element.balance, 3))*nearPrice).toFixed(2)
                setCurrentTreasuryTotal(tokenUSDValue)
                return (
                  <ListItem alignItems="space-between" key={element.id}>
                      <ListItemAvatar>
                        <Avatar>Ⓝ</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={`${formatNearAmount(element.balance, 3)} ($${tokenUSDValue} USD)`} 
                      secondary={element.token} />
                  </ListItem>
                )
              } else {
              result = await getMetadata(element.token)
              return (
                <ListItem key={element.id}>
                  <ListItemAvatar>
                    <Avatar src={result.icon} />
                  </ListItemAvatar>
                  <ListItemText primary={`${formatNearAmount(element.balance, 3)}`} 
                      secondary={result.symbol}/>
                </ListItem>
              )
              }
            }))
          } else {
            Accounts = (
              <ListItem alignItems="space-between" key={element.id}>
                <ListItemAvatar>
                  <Avatar>Ⓝ</Avatar>
                </ListItemAvatar>
                <ListItemText primary="0 ($0.00 USD)" 
                secondary="Ⓝ" />
              </ListItem>
            )
          }
  
          if(active) {
          guildRow = (
            <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Treasury</Typography>
              <Typography className={classes.heading} style={{marginLeft: '15px'}}>${tokenUSDValue} USD</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense="true">
              {Accounts}
              </List>
            </AccordionDetails>
          </Accordion>
            )
          }
          
          setGuildBalanceChip(<>{guildRow}</>)
          
        } catch (err) {
          console.log('no guild balance')
        }  
      }

      fetchBalances()
      .then((res) => {

      })

    }, [nearPrice, essentialsInitialized, contract, isUpdated]
  )

  useEffect(
    () => {        
      let timer
     
      async function refreshCurrentPeriod() {
          try {
              let period = await contract.getCurrentPeriod()
              update('', {currentPeriod: period})
              await renewProposals(curDaoIdx, contract)
          } catch (err) {
            console.log('get period issue', err)
          }

      }

      function stop() {
        if (timer) {
            clearInterval(timer)
            timer = 0
        }
      }
    
      if(contract && periodDuration && curDaoIdx){
        if(!timerStarted){
          timer = setInterval(refreshCurrentPeriod, periodDuration * 1000)
          console.log('running')
          setTimerStarted(true)
        }
      }

      return () => {
        setTimerStarted(false)
        stop()
      }

    }, [contract, curDaoIdx, periodDuration]
  )

    function handleTabValueState(value) {
      setTabValue(value)
    }

    async function getLikelyTokenContracts(accountId) {
      //let result = await axios.get(`${ACCOUNT_HELPER_URL}/account/${accountId}/likelyTokens`)
      let result = await axios.get('https://near-contract-helper.onrender.com/account/${accountId}/likelyTokens')
      return result
    }

    async function renewProposals(curDaoIdx, contract){
      try {
        let synched = await synchProposalEvent(curDaoIdx, contract)
        setAllProposals(synched.events)
      } catch (err) {
        console.log('no proposals yet', err)
      }
    }

    function handleWarningReturn(){
      let warningFlag = get(WARNING_FLAG, [])
      if(!warningFlag[0]){
        warningFlag.push({accepted: 'true'})
        set(WARNING_FLAG, warningFlag)
        
      }
      setStepsTriggered(triggerSteps + 1)
    }
  
    const options = {
      doneLabel: 'Next',
      showButtons: true,
      overlayOpacity: 0.5,
      scrollTo: 'element',
      skipLabel: "Skip",
      showProgress: true
    }

    function onStepsComplete(){
      setStepsEnabled(false)
      setAppbarStepsEnabled(true)
    }

    function onStepsExit(){
      setStepsEnabled(false)
    }

    function handleReturn(proposalIdentifier){
      if(proposalIdentifier == 'actionSelect'){
        setTabTutorialEnabled(true)
        setAppbarStepsEnabled(false)
      }
      else if(proposalIdentifier=='propList'){
        setTabTutorialEnabled(false)
      }
    }

    return (
      <>
            <div className={classes.root}>
            <WarningConfirmation
              returnFunction = {handleWarningReturn}
            /> 
            <Header state={state} />
            <Grid container style={{padding:'20px'}}>

            {initLoad == false ? (
              <div className={classes.centered}>
                <CircularProgress/><br></br>
                <Typography variant="h6">Setting Things Up...</Typography>
                <RandomPhrase />
              </div> 
            ) :
            
               initialized == 'done' ? (
                <>
                  {/* <Steps
                      enabled={stepsEnabled}
                      initialStep={0}
                      onBeforeChange={(index)=> 
                        {
                          if(index == 1){onStepsComplete()}
                        }
                      }
                      onComplete={()=>onStepsComplete()}
                      onExit={()=>onStepsExit()}
                      steps={steps}
                      options={options}
                      /> 
                  */}

                {matches ? (
                  <>
                  <Grid container justifyContent="space-evenly" alignItems="center" style={{marginBottom:'15px'}} spacing={0}>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center" style={{marginBottom: '15px'}}>                    
                      <Chip variant="outlined" label="Member" icon={memberIcon} />
                      <Chip variant="outlined" label={sharesLabel}  />
                      <Chip variant="outlined" label={fairShareLabel}  />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                      <ActionSelector 
                        enable={appbarStepsEnabled}
                        returnFunction={handleReturn}
                        handleTabValueState={handleTabValueState}
                        fairShare={currentShare}
                        loaded={loaded}
                        approvedTokens={approvedTokens}
                      />
                    </Grid>
                  </Grid>
                  </>
                ) : (
                  <>
                  <Grid container justifyContent="space-evenly" alignItems="center" style={{marginBottom:'15px'}} spacing={0}>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                    <div style={{marginLeft: '10px'}}>
                      <ActionSelector
                        enable={appbarStepsEnabled} 
                        returnFunction={handleReturn}
                        handleTabValueState={handleTabValueState}
                        fairShare={currentShare}
                        loaded={loaded}
                        approvedTokens={approvedTokens}
                      />
                    </div>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="right">                
                      <Chip variant="outlined" label="Member" icon={memberIcon} />
                      <Chip variant="outlined" label={sharesLabel}  />
                      <Chip variant="outlined" label={fairShareLabel}  />
                    </Grid>
                  </Grid>
                  </>
                  )
                }
              
                <Card align="center" style={{width: '100%'}}>
                <div style={{float:'right', marginBottom: '-30px'}}>
                  <RightSideDrawer
                    state={state}
                    currentPeriod={currentPeriod}
                    accountId={accountId} 
                    contract={contract}
                    summoner={summoner}
                    totalMembers={allMemberInfo.length}
                    proposalDeposit={proposalDeposit}
                    tokenName={tokenName}
                    depositToken={depositToken}
                  />
                </div>
                  <Grid container justifyContent="center" alignItems="center" spacing={1} className={classes.top}>
                
                    <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                      <Typography variant="overline" style={{fontSize: '55%', fontWeight: 'bold'}} color="textPrimary" align="center">{guildBalanceChip} </Typography>
                      
                      </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                      <Typography variant="overline" style={{fontSize: '55%', fontWeight: 'bold'}} color="textPrimary" align="center">{escrowBalanceChip} </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                      <Typography variant="overline" style={{fontSize: '55%', fontWeight: 'bold'}} color="textPrimary" align="center">Total Shares: {totalShares ? totalShares : <LinearProgress />}</Typography>
                    </Grid>
                  </Grid>
                </Card>
                <Divider variant="middle" align="center" style={{width:'75%', margin: 'auto'}}/>

                <Grid container justifyContent="space-evenly" alignItems="center" spacing={1} >
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                
                {loaded ?
                  <ProposalList
                    returnFunction={handleReturn}
                    enable={tabTutorialEnabled}
                    proposalEvents={allProposals}
                    allMemberInfo={allMemberInfo}
                    currentMemberInfo={memberInfo}
                    handleTabValueState={handleTabValueState}
                    tabValue={tabValue}
                    proposalComments={proposalComments}
                    notificationIndicator = {notificationIndicator}
                    remainingDelegates={remainingDelegates}
                    approvedTokens={approvedTokens}
                  />
                  : (
                    <div style={{margin: 'auto', width: '200px'}}>
                    <CircularProgress />
                    </div>
                    )
                }

                </Grid>
                </Grid>
                </>
              ) : <Initialize summoner={summoner} />

              
          }
        </Grid>
       
        </div>
        <Footer />
        </>
    )
    
}