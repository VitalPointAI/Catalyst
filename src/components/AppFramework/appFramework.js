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
  synchProposalEvent, 
  synchMember } from '../../state/near'

import ActionSelector from '../ActionSelector/actionSelector'
import ProposalList from '../ProposalList/proposalList'
import RightSideDrawer from './RightSideDrawer'
import Footer from '../../components/common/Footer/footer'
import { Header } from '../Header/header'
import Initialize from '../Initialize/initialize'

import { dao } from '../../utils/dao'
import { ceramic } from '../../utils/ceramic'

import { NEW_SPONSOR, NEW_CANCEL, DAO_FIRST_INIT, NEW_PROPOSAL, NEW_PROCESS, NEW_VOTE, NEW_DONATION } from '../../state/near'

// Material UI imports
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Chip from '@material-ui/core/Chip'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import CircularProgress from '@material-ui/core/CircularProgress'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 'auto',
    marginBottom: 50,
    minHeight: 550,
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
    const [memberIcon, setMemberIcon] = useState(<NotInterestedIcon />)
    const [guildBalanceChip, setGuildBalanceChip] = useState()
    const [escrowBalanceChip, setEscrowBalanceChip] = useState()
    const [nearPrice, setNearPrice] = useState()
    const [change, setChange] = useState(false)

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
    
    const classes = useStyles()
    
    const {
      handleSnackBarOpen,
      handleSuccessMessage,
      handleErrorMessage,
      snackBarOpen,
      severity,
      errorMessage,
      successMessage,
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
    } = state
    
    const {
      contractId
    } = useParams()
    
    useEffect(
      () => {

          async function fetchData() {
            
            if(didRegistryContract && near){
              if(contractId){
                let thisCurDaoIdx
                let daoAccount = new nearAPI.Account(near.connection, contractId)
                   console.log('daoAccount', daoAccount)
                   console.log('appidx', appIdx)
                   console.log('contract', didRegistryContract)
                thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                console.log('thiscurdaoidx', thisCurDaoIdx)
                setCurDaoIdx(thisCurDaoIdx)
           
                let contract = await dao.initDaoContract(state.wallet.account(), contractId)
                setDaoContract(contract)

                // *********CHECK FOR TRIGGERS AND EXECUTE*************

                   // check for first init to log summon and member events
                   let firstInit = get(DAO_FIRST_INIT, [])
              
                   let c = 0
                   while(c < firstInit.length){
                     if(firstInit[c].contractId==contractId && firstInit[c].init == true){
                       let logged = await logInitEvent(
                         contractId, 
                         thisCurDaoIdx, 
                         contract, 
                         'Democracy', 
                         state.accountId)
                         
                       if (logged) {
                         firstInit[c].init = false
                         set(DAO_FIRST_INIT, firstInit)
                         setChange(!change)
                       }
                     }
                     c++
                   }
   
                   // check for successfully added new proposal to log it
                   let newProposal = get(NEW_PROPOSAL, [])
                 
                   let d = 0
                   while(d < newProposal.length){
                     if(newProposal[d].contractId==contractId && newProposal[d].new == true){
                       let loggedProposal = await logProposalEvent(
                         thisCurDaoIdx, 
                         contract, 
                         newProposal[d].proposalId
                         )
                         
                       if (loggedProposal) {
                         newProposal[d].new = false
                         set(NEW_PROPOSAL, newProposal)
                         setChange(!change)
                       }
                     }
                     d++
                   }
   
                   // check for successfully added new sponsor event to log it
                   let newSponsor = get(NEW_SPONSOR, [])
                 
                   let f = 0
                   while(f < newSponsor.length){
                     if(newSponsor[f].contractId==contractId && newSponsor[f].new == true){
                       let loggedSponsor = await logSponsorEvent(
                         thisCurDaoIdx, 
                         contract, 
                         newSponsor[f].proposalId)
                         
                       if (loggedSponsor) {
                         newSponsor[f].new = false
                         set(NEW_SPONSOR, newSponsor)
                         setChange(!change)
                       }
                     }
                     f++
                   }
                   
                    // check for new proposals to process
                    let newProcess = get(NEW_PROCESS, [])
                 
                    let g = 0
                    while(g < newProcess.length){
                      if(newProcess[g].contractId==contractId && newProcess[g].new == true){
                        let loggedProcess = await logProcessEvent(
                          thisCurDaoIdx, 
                          contract,
                          contractId,
                          newProcess[g].proposalId,
                          newProcess[g].type,
                          accountId
                          )
                          
                        if (loggedProcess) {
                          newProcess[g].new = false
                          set(NEW_PROCESS, newProcess)
                          setChange(!change)
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
                           thisCurDaoIdx, 
                           contract, 
                           newVotes[x].proposalId,
                           accountId
                           )
                           
                         if (loggedVote) {
                           newVotes[x].new = false
                           set(NEW_VOTE, newVotes)
                           setTabValue(newVotes[x].tabValue)
                           setChange(!change)
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
                           thisCurDaoIdx, 
                           contract, 
                           newCancel[h].proposalId)
                           
                         if (loggedCancel) {
                           newCancel[h].new = false
                           set(NEW_CANCEL, newCancel)
                           setChange(!change)
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
                         thisCurDaoIdx, 
                         contract,
                         newDonation[y].donationId,
                         newDonation[y].contractId)
                         
                       if (loggedDonation) {
                         newDonation[y].new = false
                         set(NEW_DONATION, newDonation)
                         setChange(!change)
                       }
                     }
                     y++
                   }

                  // For debugging
                  //  let proposalCheck= await contract.getProposal({proposalId: 0})
                  //  console.log('proposalCheck', proposalCheck)

                //************SYNCH PROPOSALS AND CONTRACT AND MEMBERS */

                  try {
                    let synched = await synchProposalEvent(thisCurDaoIdx, contract)
                    if(synched){
                      let proposals = await thisCurDaoIdx.get('proposals', thisCurDaoIdx.id)
                      setAllProposals(proposals.events)
                    }
                  } catch (err) {
                    console.log('no proposals yet', err)
                  }

                  try {
                    let synched = await synchMember(thisCurDaoIdx, contract, contractId, accountId)
                    console.log('synched', synched)
                    if(synched){
                      let members = await thisCurDaoIdx.get('members', thisCurDaoIdx.id)
                      setAllMemberInfo(members.events)
                    }
                  } catch (err) {
                    console.log('no members yet', err)
                  }

                //************ LOAD COMMUNITY SETTINGS AND INFORMATION */
                     
                try{
                  let result = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)
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

                // try {
                // let memberInfo = await thisCurDaoIdx.get('members', thisCurDaoIdx.id)
                // console.log('memberInfo', memberInfo)
                // setAllMemberInfo(memberInfo.events)
                // } catch (err) {
                //   console.log('no memberinfo yet', err)
                // }
                    
                let init = await contract.getInit()
                setInitialized(init)
                setInitLoad(true)

                if(initialized){
                    let thisMemberInfo
                    let thisMemberStatus
        
                    try {
                      thisMemberStatus = await contract.getMemberStatus({member: accountId})
                      setMemberStatus(thisMemberStatus)
                    } catch (err) {
                      console.log('no member status yet')
                    }
                    
                    try {
                      thisMemberInfo = await contract.getMemberInfo({member: accountId})
                      console.log('thismemberinfo', thisMemberInfo)
                      setMemberInfo(thisMemberInfo)
                    } catch (err) {
                      console.log('no member info yet')
                    }
        
                    try {
                      let owner = await contract.getSummoner()
                      setSummoner(owner)
                    } catch (err) {
                      console.log('no summoner yet')
                    }
        
                    try {
                      let shares = await contract.getTotalShares()
                      setTotalShares(shares)
                    } catch (err) {
                      console.log('no total shares yet')
                    }
        
                    try {
                      let token = await contract.getDepositToken()
                      setDepositToken(token)
                      setTokenName(token)
                    } catch (err) {
                      console.log('no deposit token yet')
                    }
                        
                    try {
                      let deposit = await contract.getProposalDeposit()
                      setProposalDeposit(deposit)
                    } catch (err) {
                      console.log('no proposal deposit yet')
                    }
        
                    try {
                      let duration = await contract.getPeriodDuration()
                      setPeriodDuration(duration)
                    } catch (err) {
                      console.log('no period duration yet')
                    }
                  
                    let ebalance
                    try {
                      ebalance = await contract.getEscrowTokenBalances()
                      setEscrowBalance(ebalance)
                    } catch (err) {
                      console.log('no escrow balance')
                    }
        
                    let gbalance
                    try {
                      gbalance = await contract.getGuildTokenBalances()
                      setGuildBalance(gbalance)
                    } catch (err) {
                      console.log('no guild balance')
                    }
        
                    if(thisMemberStatus && thisMemberInfo !== undefined) {
                      setMemberIcon(<CheckCircleIcon />)
                      setSharesLabel('Shares: ' + thisMemberInfo[0].shares)
                      setLootLabel('Loot: ' + thisMemberInfo[0].loot)
                    }
        
                    let guildRow
                    if(gbalance) {
                      for (let i = 0; i < gbalance.length; i++) {
                        guildRow = (<>{gbalance[i].balance} {gbalance[i].token}</>)
                      }
                    } else {
                      guildRow = '0 Ⓝ'
                    }
                    setGuildBalanceChip(<>{guildRow}</>)
                      
                    let escrowRow
                    if(ebalance) {
                      for (let i = 0; i < ebalance.length; i++) {
                        escrowRow = (<>{ebalance[i].balance} {ebalance[i].token}</>)
                      }
                    } else {
                      escrowRow = '0 Ⓝ'
                    }
                    setEscrowBalanceChip(<>{escrowRow}</>)
                      
                    let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
                    setNearPrice(getNearPrice.data.near.usd)
                    update('', nearPrice)
                    
                    if(currentPeriod == undefined || currentPeriod == 0){
                      try {
                        let period = await contract.getCurrentPeriod()
                          setCurrentPeriod(period)
                      } catch (err) {
                        console.log('get period issue', err)
                      }
                    }
                    
                  //***********START PERIOD REFRESH TIMER */
                    if(started==false){
                      setTimeout(async function refreshCurrentPeriod() {
                        try {
                          let period = await contract.getCurrentPeriod()
                          setCurrentPeriod(period)
                        } catch (err) {
                          console.log('get period issue', err)
                        }
                        if(started == false){
                          setTimeout(refreshCurrentPeriod, 20000)
                          setStarted(true)
                        }
                      }, 20000)
                    }
                  
                }
                
              }    
            }  
          }

          fetchData()
          .then((res) => {
          })
  
      }, [initialized, didRegistryContract, near, change, currentPeriod]
    )

    function handleTabValueState(value) {
      setTabValue(value)
    }

    async function handleGuildBalanceChanges() {
      try {
        let currentGuildBalance = await daoContract.getGuildTokenBalances()
        if(currentGuildBalance) {
          setGuildBalance(currentGuildBalance)
        }
        return true
      } catch (err) {
        return false
      }
    }

    async function handleEscrowBalanceChanges() {
      try {
        let currentEscrowBalance = await daoContract.getEscrowTokenBalances()
        if(currentEscrowBalance) {
          setEscrowBalance(currentEscrowBalance)
        }
        return true
      } catch (err) {
        return false
      }
    }
    
    return (
      <>
            <div className={classes.root}>
            <Header state={state} />
            <Grid container style={{padding:'20px'}}>
            {initLoad == false ? <CircularProgress /> :
            initialized == 'done' ? (
              <>
            <Grid container justify="space-evenly" alignItems="center" style={{marginBottom:'15px'}} spacing={0}>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <div style={{marginLeft: '10px'}}>
                <ActionSelector 
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
                />
              </div>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <div style={{float:'right'}}>
              {summoner == state.accountId ? (
                <div style={{float:'right',marginTop:'-5px',marginLeft:'5px'}}>
                <RightSideDrawer
                  state={state}
                  accountId={state.accountId} 
                  contract={daoContract}
                  handleErrorMessage={handleErrorMessage} 
                  handleSuccessMessage={handleSuccessMessage}
                  handleSnackBarOpen={handleSnackBarOpen} 
                />
                </div>
                ) : null }
                <Chip variant="outlined" label="Member" icon={memberIcon} />
                <Chip variant="outlined" label={lootLabel}  />
                <Chip variant="outlined" label={sharesLabel}  />
                <Chip variant="outlined" icon={<AccessTimeIcon />} label={'Period: ' + currentPeriod} />
               
                </div>
              </Grid>
            </Grid>
        
          <Grid container justify="center" alignItems="center" spacing={1} className={classes.top}> 
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Typography variant="h6" color="textPrimary" align="center">Fund: {guildBalanceChip} {guildBalance && guildBalance.length > 0 ? guildBalance[0].balance > 0 ? '($' + (parseInt(guildBalance[0].balance) * nearPrice).toFixed(2) + ' USD)' : '($0.00 USD)' : null } </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Typography variant="h6" color="textPrimary" align="center">Escrow: {escrowBalanceChip} {escrowBalance && escrowBalance.length > 0 ? escrowBalance[0].balance > 0 ? '($' + (parseInt(escrowBalance[0].balance) * nearPrice).toFixed(2) + ' USD)' : '($0.00 USD)' : null }</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Typography variant="h6" color="textPrimary" align="center">Total Shares: {totalShares}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
              <Typography variant="h6" color="textPrimary" align="center">Share Value: {guildBalance && guildBalance.length > 0 ? guildBalance[0].balance > 0 ? '$' + ((guildBalance[0].balance/totalShares)*nearPrice).toFixed(2) + ' USD' : '$0.00 USD' : null }</Typography>
            </Grid>
          </Grid>
          
          <Divider variant="middle" align="center" style={{width:'75%', margin: 'auto'}}/>

          <Grid container justify="space-evenly" alignItems="center" spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
              <ProposalList
                contractId={contractId}
                curDaoIdx={curDaoIdx}
               // daoDid={did}
                proposalEvents={allProposals}
                allMemberInfo={allMemberInfo}
                contract={daoContract}
                memberStatus={memberStatus}
                proposalDeposit={proposalDeposit}
               
        

                guildBalance={guildBalance}
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
               
               
                handleSnackBarOpen={handleSnackBarOpen}
                handleSuccessMessage={handleSuccessMessage}
                handleErrorMessage={handleErrorMessage}
                summoner={summoner}
                contractIdx={contractIdx}
                curUserIdx={curUserIdx}
                didsContract={didsContract}
                contractId={contractId}
                appIdx={appIdx}
                appClient={appClient}
              />
            </Grid>
          </Grid>
          </>
          ) : <Initialize 
                summoner={summoner}
                handleSnackBarOpen={handleSnackBarOpen}
                handleSuccessMessage={handleSuccessMessage}
                handleErrorMessage={handleErrorMessage}
              />
          }
        </Grid>
       
        </div>
        <Footer />
        </>
    )
    
}