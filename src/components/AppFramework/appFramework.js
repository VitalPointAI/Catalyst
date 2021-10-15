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
  synchMember,
  synchDaos } from '../../state/near'

import ActionSelector from '../ActionSelector/actionSelector'
import ProposalList from '../ProposalList/proposalList'
import RightSideDrawer from './RightSideDrawer'
import Footer from '../../components/common/Footer/footer'
import { Header } from '../Header/header'
import Initialize from '../Initialize/initialize'
import RandomPhrase from '../common/RandomPhrase/randomPhrase'
import WarningConfirmation from '../Confirmation/warningConfirmation';
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import { dao } from '../../utils/dao'
import { ceramic } from '../../utils/ceramic'
import { COMMUNITY_ARRIVAL } from '../../state/near'
import { Steps, Hints } from "intro.js-react"


import { NEW_SPONSOR, NEW_CANCEL, DAO_FIRST_INIT, NEW_PROPOSAL, NEW_PROCESS, NEW_VOTE, NEW_DONATION, NEW_EXIT, 
  NEW_DELEGATION, WARNING_FLAG,NEW_REVOCATION, INACTIVATE_COMMUNITY, NEW_INACTIVATION, hasKey } from '../../state/near'

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
    const [nearPrice, setNearPrice] = useState()
   // const [change, setChange] = useState(false)

    const [tabValue, setTabValue] = useState('1')
    const [daoContract, setDaoContract] = useState()
    const [allMemberInfo, setAllMemberInfo] = useState([])
    const [contractIdx, setContractIdx] = useState()
    const [didsContract, setDidsContract] = useState()
    const [memberStatus, setMemberStatus] = useState()
    const [memberInfo, setMemberInfo] = useState()
    const [allProposals, setAllProposals] = useState([])
    const [currentPeriod, setCurrentPeriod] = useState()
    const [curUserIdx, setCurUserIdx] = useState()
    const [tokenName, setTokenName] = useState()
    const [notificationIndicator, setNotificationIndicator] = useState(false)
    const [summoner, setSummoner] = useState()
    const [totalShares, setTotalShares] = useState()
    const [escrowBalance, setEscrowBalance] = useState()
    const [guildBalance, setGuildBalance] = useState()
    const [depositToken, setDepositToken] = useState()
    const [proposalDeposit, setProposalDeposit] = useState()
    const [periodDuration, setPeriodDuration] = useState()
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [initialized, setInitialized] = useState()
    const [initLoad, setInitLoad] = useState(false)
    const [started, setStarted] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)
    const [stepsEnabled, setStepsEnabled] = useState(false)
    const [appbarStepsEnabled, setAppbarStepsEnabled] = useState(false)
    const [tabTutorialEnabled, setTabTutorialEnabled] = useState(false)
    const [timerStarted, setTimerStarted] = useState(false)
    const [triggersActioned, setTriggersActioned] = useState(false)
    const [restInitialized, setRestInitialized] = useState(false)
    const [essentialsInitialized, setEssentialsInitialized] = useState(false)
    const [triggerSteps, setStepsTriggered] = useState(0)
    const [loaded, setLoaded] = useState(false)
    const [remainingDelegates, setRemainingDelegates] = useState()
    const [votingPeriodLength, setVotingPeriodLength] = useState()
    const [gracePeriodLength, setGracePeriodLength] = useState()
    const [neededVotes, setNeededVotes] = useState()
    const [active, setActive] = useState(false)
    const [totalMembers, setTotalMembers] = useState()
    const classes = useStyles()

    const {
      tributeToken,
      tributeOffer,
      processingReward,
      handleProposalEventChange,
      handleUserBalanceChanges,
      minSharePrice,
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
      currentDaosList
    } = state
    
    const {
      contractId
    } = useParams()

    const matches = useMediaQuery('(max-width:500px)')

    let steps=[{
      intro:
      <> 
      <Typography>Welcome to the Community Page! Here you can join the community, create, and vote on proposals.</Typography>
      <br/>
      <Typography>You can also find community specific opportunities by visitng the communities opportunity page.</Typography>
      </>
    },
  {
    intro: "This is a phantom step to denote the end of steps in this component. If it is displayed, there is an error"
  }]

    useEffect(
      () => {

        let newVisit = get(COMMUNITY_ARRIVAL, [])
        let warningFlag = get(WARNING_FLAG, [])
        if(!newVisit[0] && warningFlag[0]){
          setStepsEnabled(true)
          newVisit.push({status: 'true'})
          set(COMMUNITY_ARRIVAL, newVisit)
        }
        let timer

        async function refreshCurrentPeriod() {
            try {
              let contract = await dao.initDaoContract(wallet.account(), contractId)
              let period = await contract.getCurrentPeriod()
              setCurrentPeriod(period)
              if(curDaoIdx){
                await renewProposals(curDaoIdx, contract)
              }
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

        if(wallet && triggersActioned){
          timer = setInterval(refreshCurrentPeriod, 10000)
          setTimerStarted(true)
        
          return () => {
            setTimerStarted(false)
          
            stop()
          }
        }

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
      }, [wallet, triggersActioned, curDaoIdx, triggerSteps]
    )
    
    useEffect(
      () => {
       
          async function fetchEssentials() {
           
            if(didRegistryContract && near){

              if(contractId){
                let curDaoIdx
                let daoAccount
                let contract
                try{
                  daoAccount = new nearAPI.Account(near.connection, contractId)
                } catch (err) {
                  console.log('no account', err)
                  return false
                }
               
                try{
                  curDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                
                  setCurDaoIdx(curDaoIdx)
                  
                } catch (err) {
                  console.log('problem getting curdaoidx', err)
                  return false
                }
                
                try{
                  contract = await dao.initDaoContract(state.wallet.account(), contractId)
                
                  setDaoContract(contract)
                } catch (err) {
                  console.log('problem initializing dao contract', err)
                  return false
                }
              }
              return true
            }
          }

          fetchEssentials()
          .then((res) => {
            res ? setEssentialsInitialized(true) : setEssentialsInitialized(false)
          })

        }, [state]
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
                        daoContract,
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
                            await renewProposals(curDaoIdx, daoContract)
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
                        daoContract, 
                        'Democracy', 
                        state.accountId,
                        firstInit[c].shares,
                        transactionHash)
                        
                      if (logged) {
                        del(DAO_FIRST_INIT)
                        await renewProposals(curDaoIdx, daoContract)
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
                          daoContract, 
                          newProposal[d].proposalId,
                          contractId,
                          transactionHash
                          )
                          
                        if (loggedProposal) {
                          del(NEW_PROPOSAL)
                          await renewProposals(curDaoIdx, daoContract)
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
                          daoContract,
                          contractId,
                          newSponsor[f].proposalId,
                          transactionHash)
                          
                        if (loggedSponsor) {
                        del(NEW_SPONSOR)
                        await renewProposals(curDaoIdx, daoContract)
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
                        daoContract,
                        contractId,
                        newProcess[g].proposalId,
                        newProcess[g].type,
                        transactionHash
                        )
                        
                      if (loggedProcess) {
                        del(NEW_PROCESS)
                        await renewProposals(curDaoIdx, daoContract)
                      }
                    }
                    g++
                  }
   
                  // check for new votes
                  let newVotes = get(NEW_VOTE, [])
              
                  let x = 0
                  while(x < newVotes.length){
                    if(newVotes[x].contractId==contractId && newVotes[x].new == true){
                      
                      let loggedVote = await logVoteEvent(
                        curDaoIdx,
                        contractId,
                        daoContract, 
                        newVotes[x].proposalId,
                        accountId
                        )
                        
                      if (loggedVote) {
                        del(NEW_VOTE)
                        await renewProposals(curDaoIdx, daoContract)
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
                        daoContract,
                        contractId,
                        newCancel[h].proposalId,
                        transactionHash)
                        
                      if (loggedCancel) {
                        del(NEW_CANCEL)
                        await renewProposals(curDaoIdx, daoContract)
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
                        daoContract,
                        newDonation[y].donationId,
                        newDonation[y].contractId,
                        transactionHash)
                        
                      if (loggedDonation) {
                        del(NEW_DONATION)
                        await renewProposals(curDaoIdx, daoContract)
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
                        daoContract,
                        newDelegation[l].delegator,
                        newDelegation[l].receiver,
                        transactionHash)
                        
                      if (loggedDelegation) {
                        del(NEW_DELEGATION)
                        await renewProposals(curDaoIdx, daoContract)
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
                        daoContract,
                        newRevocation[m].delegator,
                        newRevocation[m].receiver,
                        transactionHash)
                        
                      if (loggedRevocation) {
                        del(NEW_REVOCATION)
                        await renewProposals(curDaoIdx, daoContract)
                      }
                    }
                    m++
                  }

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
                      let synched = await synchProposalEvent(curDaoIdx, daoContract)
                      setAllProposals(synched.events)
                    } catch (err) {
                      console.log('no proposals yet', err)
                    }

                    try {
                      let synched = await synchMember(curDaoIdx, daoContract, contractId, accountId, false)
                      
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
        

        if(essentialsInitialized){
          actionTriggers()
          .then((res) => {
            res ? setTriggersActioned(true) : setTriggersActioned(false)
            setLoaded(true)
          })
        }

      }, [essentialsInitialized]
    )

    useEffect(
      () => {
       
          async function fetchData() {

                  //************ LOAD COMMUNITY SETTINGS AND INFORMATION */
                     
                  try{
                    let result = await curDaoIdx.get('daoProfile', curDaoIdx.id)
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

                  let init = await daoContract.getInit()
                  setInitialized(init)
                  setInitLoad(true)

                  if(init){
                      let thisMemberInfo
                      let thisMemberStatus
                      
                      try {
                        thisMemberInfo = await daoContract.getMemberInfo({member: accountId})
                        thisMemberStatus = await daoContract.getMemberStatus({member: accountId})
                      
                        setMemberInfo(thisMemberInfo)
                        if(thisMemberStatus && thisMemberInfo[0].active){
                          setMemberStatus(true)
                        } else {
                          setMemberStatus(false)
                        }
                      } catch (err) {
                        console.log('no member info yet')
                      }
          
                      try {
                        let owner = await daoContract.getSummoner()
                        setSummoner(owner)
                      } catch (err) {
                        console.log('no summoner yet')
                      }
          
                      try {
                        let shares = await daoContract.getTotalShares()
                        setTotalShares(shares)
                      } catch (err) {
                        console.log('no total shares yet')
                      }
          
                      try {
                        let token = await daoContract.getDepositToken()
                        setDepositToken(token)
                        setTokenName(token)
                        update('', { tokenName: token})
                        update('', { depositToken: token})
                      } catch (err) {
                        console.log('no deposit token yet')
                      }

                      try {
                        let needed = await daoContract.getNeededVotes()
                        setNeededVotes(needed)
                    
                        update('', {neededVotes: needed})
                      } catch (err) {
                        console.log('no needed votes yet')
                      }
                          
                      try {
                        let deposit = await daoContract.getProposalDeposit()
                     
                        setProposalDeposit(formatNearAmount(deposit))
                        update('', { proposalDeposit: formatNearAmount(deposit) })
                      } catch (err) {
                        console.log('no proposal deposit yet')
                      }

                      try{
                        let platformaccount = await daoContract.getPlatformAccount()
                     
                      } catch (err) {
                        console.log('no platformaccount yet')
                      }

                      try {
                        let thisCurrentShare = await daoContract.getCurrentShare({member: accountId})
                     
                        setCurrentShare(thisCurrentShare)
                        setFairShareLabel('Current Share: ' + formatNearAmount(thisCurrentShare, 3) + 'Ⓝ')
                      } catch (err) {
                        console.log('no current share yet')
                      }

                      try{
                        let delegates = await daoContract.getRemainingDelegates({member: accountId})
                       
                        setRemainingDelegates(delegates)
                      } catch (err) {
                        console.log('no remaining delegates info yet')
                      }

                      try{
                        let memberCount = await daoContract.getTotalMembers()
                        setTotalMembers(memberCount)
                      } catch (err) {
                        console.log('no members yet')
                      }
          
                      try {
                        let duration = await daoContract.getPeriodDuration()
                        setPeriodDuration(duration)
                      } catch (err) {
                        console.log('no period duration yet')
                      }

                      try {
                        let settings = await daoContract.getInitSettings()
                    
                        setVotingPeriodLength(parseFloat(settings[0][2]))
                        setGracePeriodLength(parseFloat(settings[0][3]))
                      } catch(err) {
                        console.log('no settings yet')
                      }
                    
                      let ebalance
                      let escrowRow
                      try {
                        ebalance = await daoContract.getEscrowTokenBalances()
                      
                        setEscrowBalance(ebalance)

                        if(ebalance && active) {
                          for (let i = 0; i < ebalance.length; i++) {
                            escrowRow = (<>{formatNearAmount(ebalance[i].balance, 3)} {ebalance[i].token}</>)
                          }
                        } else {
                          escrowRow = '0 Ⓝ'
                        }
                        setEscrowBalanceChip(<>{escrowRow}</>)
                      } catch (err) {
                        console.log('no escrow balance')
                      }
          
                      let gbalance
                      let guildRow
                      try {
                        gbalance = await daoContract.getGuildTokenBalances()
                     
                        setGuildBalance(gbalance)

                        if(gbalance && active) {
                          for (let i = 0; i < gbalance.length; i++) {
                            guildRow = (<>{formatNearAmount(gbalance[i].balance,3)} {gbalance[i].token}</>)
                          }
                        } else {
                          guildRow = '0 Ⓝ'
                        }
                        setGuildBalanceChip(<>{guildRow}</>)
                        setNotificationIndicator(true)
                      } catch (err) {
                        console.log('no guild balance')
                      }
          
                      if(thisMemberStatus && thisMemberInfo !== undefined) {
                        thisMemberInfo[0].active ? setMemberIcon(<CheckCircleIcon />) : setMemberIcon(<NotInterestedIcon />)
                        setSharesLabel('Shares: ' + thisMemberInfo[0].shares)
                        setLootLabel('Loot: ' + thisMemberInfo[0].loot)
                      }
  
                      let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
                      setNearPrice(getNearPrice.data.near.usd)
                      update('', nearPrice)
                      
                      if(currentPeriod == undefined || currentPeriod == 0){
                        try {
                          let period = await daoContract.getCurrentPeriod()
                            setCurrentPeriod(period)
                        } catch (err) {
                          console.log('get period issue', err)
                        }
                      }
                  }
                }
              
      //      }  
       //   }
      
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
}, [essentialsInitialized]
    )

    function handleTabValueState(value) {
      setTabValue(value)
    }

    async function renewProposals(curDaoIdx, contract){
      try {
        let synched = await synchProposalEvent(curDaoIdx, contract)
        setAllProposals(synched.events)
      } catch (err) {
        console.log('no proposals yet', err)
      }
    }

    async function handleGuildBalanceChanges() {
      try {
        let currentGuildBalance = await daoContract.getGuildTokenBalances()
        if(currentGuildBalance) {
          setGuildBalance(formatNearAmount(currentGuildBalance, 4))
        }
        return true
      } catch (err) {
        return false
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
    async function handleEscrowBalanceChanges() {
      try {
        let currentEscrowBalance = await daoContract.getEscrowTokenBalances()
        if(currentEscrowBalance) {
          setEscrowBalance(formatNearAmount(currentEscrowBalance, 4))
        }
        return true
      } catch (err) {
        return false
      }
    }

    function handleUpdate(property){
      setIsUpdated(property)
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
            {initLoad == false ? <div className={classes.centered}>
            <CircularProgress/><br></br>
            <Typography variant="h6">Setting Things Up...</Typography>
            <RandomPhrase />
            </div> :
            initialized == 'done' ? (
              <>
                <Steps
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
              {matches ? (<>
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
                      handleProposalEventChange={handleProposalEventChange}
                      handleEscrowBalanceChanges={handleEscrowBalanceChanges}
                      handleGuildBalanceChanges={handleGuildBalanceChanges}
                      handleUserBalanceChanges={handleUserBalanceChanges}
                      handleTabValueState={handleTabValueState}
                      accountId={state.accountId}
                      tokenName={tokenName}
                      depositToken={depositToken}
                      minSharePrice={minSharePrice}
                      daoContract={daoContract}
                      proposalDeposit={proposalDeposit}
                      didsContract={didsContract}
                      contractIdx={contractIdx}
                      curUserIdx={curUserIdx}
                      memberStatus={memberStatus}
                      fairShare={currentShare}
                      loaded={loaded}
                      currentDaosList={currentDaosList}
                    />
                  </Grid>
              
            </Grid></>
              )
              : (<>
            <Grid container justifyContent="space-evenly" alignItems="center" style={{marginBottom:'15px'}} spacing={0}>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <div style={{marginLeft: '10px'}}>
                <ActionSelector
                  enable={appbarStepsEnabled} 
                  returnFunction={handleReturn}
                  handleProposalEventChange={handleProposalEventChange}
                  handleEscrowBalanceChanges={handleEscrowBalanceChanges}
                  handleGuildBalanceChanges={handleGuildBalanceChanges}
                  handleUserBalanceChanges={handleUserBalanceChanges}
                  handleTabValueState={handleTabValueState}
                  accountId={state.accountId}
                  tokenName={tokenName}
                  depositToken={depositToken}
                  minSharePrice={minSharePrice}
                  daoContract={daoContract}
                  proposalDeposit={proposalDeposit}
                  didsContract={didsContract}
                  contractIdx={contractIdx}
                  curUserIdx={curUserIdx}
                  memberStatus={memberStatus}
                  fairShare={currentShare}
                  loaded={loaded}
                  currentDaosList={currentDaosList}
                />
              </div>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="right">                
                <Chip variant="outlined" label="Member" icon={memberIcon} />
                <Chip variant="outlined" label={sharesLabel}  />
                <Chip variant="outlined" label={fairShareLabel}  />
              </Grid>
            </Grid></>
              )}
          <Card align="center" style={{width: '100%'}}>
          <div style={{float:'right', marginBottom: '-30px'}}>
            <RightSideDrawer
              state={state}
              currentPeriod={currentPeriod}
              accountId={state.accountId} 
              contract={daoContract}
             
              summoner={summoner}
              totalMembers={allMemberInfo.length}
              proposalDeposit={proposalDeposit}
              tokenName={tokenName}
              depositToken={depositToken}
            />
          </div>
            <Grid container justifyContent="center" alignItems="center" spacing={1} className={classes.top}>
           
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                <Typography variant="overline" style={{fontSize: '55%', fontWeight: 'bold'}} color="textPrimary" align="center">Fund: {guildBalanceChip} {guildBalance && guildBalance.length > 0 ? guildBalance[0].balance > 0 && active ? '($' + (parseFloat(formatNearAmount(guildBalance[0].balance)) * nearPrice).toFixed(2) + ' USD)' : '($0.00 USD)' : <LinearProgress /> } </Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                <Typography variant="overline" style={{fontSize: '55%', fontWeight: 'bold'}} color="textPrimary" align="center">Escrow: {escrowBalanceChip} {escrowBalance && escrowBalance.length > 0 ? escrowBalance[0].balance > 0 && active ? '($' + (parseFloat(formatNearAmount(escrowBalance[0].balance)) * nearPrice).toFixed(2) + ' USD)' : '($0.00 USD)' : <LinearProgress />  }</Typography>
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
                contractId={contractId}
                curDaoIdx={curDaoIdx}
                proposalEvents={allProposals}
                allMemberInfo={allMemberInfo}
                contract={daoContract}
                memberStatus={memberStatus}
                proposalDeposit={proposalDeposit}
                handleUpdate={handleUpdate}
                isUpdated={isUpdated}
                totalShares={totalShares}
                currentMemberInfo={memberInfo}
                guildBalance={guildBalance}
                escrowBalance={escrowBalance}
                handleTabValueState={handleTabValueState}
                tabValue={tabValue}
                handleProposalEventChange={handleProposalEventChange}
                handleGuildBalanceChanges={handleGuildBalanceChanges}
                handleEscrowBalanceChanges={handleEscrowBalanceChanges}
                memberStatus={memberStatus}
                depositToken={depositToken}
                tributeToken={tributeToken}
                tributeOffer={tributeOffer}
                processingReward={processingReward}
                currentPeriod={currentPeriod}
                periodDuration={periodDuration}
                proposalComments={proposalComments}
                summoner={summoner}
                contractIdx={contractIdx}
                curUserIdx={curUserIdx}
                didsContract={didsContract}
                contractId={contractId}
                appIdx={appIdx}
                appClient={appClient}
                notificationIndicator = {notificationIndicator}
                loaded={loaded}
                remainingDelegates={remainingDelegates}
                votingPeriodLength={votingPeriodLength}
                gracePeriodLength={gracePeriodLength}
                totalMembers={totalMembers}
              />
              : <div style={{margin: 'auto', width: '200px'}}><CircularProgress /></div>}
            </Grid>
          </Grid>
          </>
          ) : <Initialize 
                summoner={summoner}
              />
          }
        </Grid>
       
        </div>
        <Footer />
        </>
    )
    
}