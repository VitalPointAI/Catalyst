import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { utils } from 'near-api-js'
import { cancelProposal, processProposal, submitVote, GAS, synchMember, getStatus } from '../../state/near'

import MemberCard from '../MemberCard/memberCard'
import ProposalCard from '../ProposalCard/proposalCard'
import MemberProposalForm from '../EditProposal/editMemberProposal'
import MemberProposalDetails from '../ProposalDetails/memberProposalDetails'
import FundingProposalForm from '../EditProposal/editFundingProposal'
import FundingProposalDetails from '../ProposalDetails/fundingProposalDetails'
import SponsorConfirmation from '../Confirmation/sponsorConfirmation'
import DonationConfirmation from '../Confirmation/donationConfirmation'
import RageQuit from '../RageQuit/rageQuit'

// Material UI Components
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Tabs from '@material-ui/core/Tabs'
import TabContext from '@material-ui/lab/TabContext'
import Tab from '@material-ui/core/Tab'
import TabPanel from '@material-ui/lab/TabPanel'
import Paper from '@material-ui/core/Paper'
import Badge from '@material-ui/core/Badge'
import PeopleAltIcon from '@material-ui/icons/PeopleAlt'
import ListAltIcon from '@material-ui/icons/ListAlt'
import HowToVoteIcon from '@material-ui/icons/HowToVote'
import QueueIcon from '@material-ui/icons/Queue'
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor: theme.palette.background.paper,
    marginBottom: '5px'
  },
  bottom: {
    marginBottom: '20px'
  }
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}))(Badge);

export default function ProposalList(props) {
  const [avatar, setAvatar] = useState()
  const [name, setName] = useState()
  const [intro, setIntro] = useState('')

  const [loaded, setLoaded] = useState(false)
  const [proposalList, setProposalList] = useState([])
  const [votingList, setVotingList] = useState([])
  const [queueList, setQueueList] = useState([])
  const [processedList, setProcessedList] = useState([])
  const [userVote, setUserVote] = useState()
  const [memberCount, setMemberCount] = useState(0)
  const [proposalCount, setProposalCount] = useState(0)
  const [voteCount, setVoteCount] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)
  const [queueCount, setQueueCount] = useState(0)
  const [memberProposalDetailsClicked, setMemberProposalDetailsClicked] = useState(false)
  const [memberProposalDetailsEmptyClicked, setMemberProposalDetailsEmptyClicked] = useState(false)
  const [memberProposalId, setMemberProposalId] = useState('')
  const [fundingProposalDetailsClicked, setFundingProposalDetailsClicked] = useState(false)
  const [fundingProposalDetailsEmptyClicked, setFundingProposalDetailsEmptyClicked] = useState(false)
  const [fundingProposalId, setFundingProposalId] = useState('')
  const [sponsorConfirmationClicked, setSponsorConfirmationClicked] = useState(false)
  const [proposalIdentifier, setProposalIdentifier] = useState()
  const [expanded, setExpanded] = useState(false)
  const [rageQuitClicked, setRageQuitClicked] = useState(false)
  const [cancelFinish, setCancelFinish] = useState(true)
  const [processFinish, setProcessFinish] = useState(true)
  const [fundingProposalStatus, setFundingProposalStatus] = useState()
  const [memberProposalStatus, setMemberProposalStatus] = useState()
  const [done, setDone] = useState(true)
  const [memberProposalType, setMemberProposalType] = useState()
  const [sponsorProposalType, setSponsorProposalType] = useState()
  const [paymentRequested, setPaymentRequested] = useState()
  
  const classes = useStyles()
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.only('xs'))

  const { state, dispatch, update } = useContext(appStore);

  const {
    didRegistryContract,
    appIdx,
    accountId,
    wallet
  } = state

  const {
    proposalEvents,
    memberStatus,
    curDaoIdx,
    daoDid,
    contract,
    contractId,
    proposalDeposit,
    allMemberInfo,
    handleUpdate,
    isUpdated,

    tabValue,
    handleTabValueState,
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    handleSnackBarOpen,
    handleSuccessMessage,
    handleErrorMessage,
    snackBarOpen,
    snackBarHandleClose,
    severity,
    successMessage,
    errorMessage,
  
    
    depositToken,
    tributeToken,
    tributeOffer,
    
    currentPeriod,
    periodDuration,
    proposalComments,
    
 
    
    getCurrentPeriod,
    summoner,
    contractIdx,
    curUserIdx,
    appClient
  } = props
console.log('prop list curdaoidx', curDaoIdx)
  useEffect(() => {

    if(allMemberInfo){
      setMemberCount(allMemberInfo.length)
    }
   
    async function fetchData() {
      let i = 0
      let result
      while (i < proposalEvents.length) {
          try{
            result = await getUserVote(proposalEvents[i].proposalId)
          } catch (err) {
            console.log('problem getting user vote', err)
          }
          proposalEvents[i].vote = result
          proposalEvents[i].voted = result == 'yes' || result == 'no'? true : false
          i++
      }

      let newLists = await resolveStatus(proposalEvents)
      console.log('newlists', newLists)
      setProposalList(newLists.allProposals)
      setVotingList(newLists.votingProposals)
      setQueueList(newLists.queueProposals)
      setProcessedList(newLists.processedProposals)
      setProposalCount(newLists.allProposals.length)
      setVoteCount(newLists.votingProposals.length)
      setProcessedCount(newLists.processedProposals.length)
      setQueueCount(newLists.queueProposals.length)

      if(newLists.processedProposals.length > 0){
        console.log('newlist processed', newLists.processedProposals)
        let i = 0
        while (i < newLists.processedProposals.length){
          console.log('prop type here newlist processed', newLists.processedProposals)
          console.log('prop type here', newLists.processedProposals[i][0].proposalType)
          if(newLists.processedProposals[i][0].proposalType == 'Member'){
            console.log('here I am')
            await synchMember(curDaoIdx, contract, contractId, newLists.processedProposals[i][0].applicant)
          }
          i++
        }

      
      }

      
    }
    
    if(proposalEvents && proposalEvents.length > 0){
      console.log('proposalEvents', proposalEvents)
      fetchData()
    }

    
  
    
   
  },[proposalEvents, allMemberInfo, currentPeriod])

  const handleTabChange = (event, newValue) => {
      handleTabValueState(newValue);
  }

  function handleExpanded() {
    setExpanded(!expanded)
  }

  const handleSponsorConfirmationClick = (requestId, proposalType, funding) => {
    setProposalIdentifier(requestId)
    setSponsorProposalType(proposalType)
    setPaymentRequested(funding)
    handleTabValueState(tabValue)
    setSponsorConfirmationClicked(true)
  }

  const handleRageQuitClick = () => {
    handleExpanded()
    setRageQuitClicked(true)
  }

  function handleSponsorConfirmationClickState(property) {
    setSponsorConfirmationClicked(property)
  }

  function handleRageQuitClickState(property) {
      setRageQuitClicked(property)
  }

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />
  }

  async function handleCancelAction(proposalId, proposalDeposit, tribute) {
    setCancelFinish(false)
    try{
      await cancelProposal(contract, contractId, proposalId, proposalDeposit, tribute)
    } catch (err) {
      console.log('problem cancelling proposal', err)
      handleErrorMessage('There was a problem cancelling the proposal.', 'error')
      handleSnackBarOpen(true)
    }
  }

  async function handleProcessAction(proposalId, proposalType) {
    setProcessFinish(false)
    try{
      await processProposal(contract, contractId, proposalId, proposalType) 
    } catch (err) {
        console.log('problem processing proposal', err)
        handleErrorMessage('There was a problem processing the proposal.', 'error')
        handleSnackBarOpen(true)
    }
  }

  async function handleVotingAction(proposalId, vote) {
      setDone(false)
      try{
        await submitVote(contract, contractId, proposalId, vote)
      } catch (err) {
        console.log('problem with vote', err)
        handleErrorMessage('There was a problem with voting.', 'error')
        handleSnackBarOpen(true)
      }
  }
 

  function getProposalType(flags) {
    // flags [sponsored, processed, didPass, cancelled, whitelist, guildkick, member, commitment, opportunity]
    let type = ''
    if(flags[4]) {
    type = 'Whitelist'
    }
    if(flags[5]) {
    type = 'GuildKick'
    }
    if(flags[6]) {
    type = 'Member'
    }
    if(flags[7]) {
      type = 'Commitment'
    }
    if(flags[8]) {
      type = 'Opportunity'
    }
    if(flags[9]) {
      type = 'Tribute'
    }
    if(!flags[4] && !flags[5] && !flags[6] &&!flags[7] &&!flags[8] &&!flags[9]) {
    type = 'Payout'
    }
    return type
  }

  function getVotingPeriod(startPeriod, votePeriod) {
    let votingPeriod = currentPeriod >= startPeriod && currentPeriod <= votePeriod
    return votingPeriod
  }

  function getGracePeriod(votePeriod, grPeriod) {
      let gracePeriod = currentPeriod > votePeriod && currentPeriod <= grPeriod
      return gracePeriod
  }

  async function getUserVote(proposalIdentifier) {
    console.log('contract here', contract)
    let result = await contract.getMemberProposalVote({memberAddress: accountId, pI: parseInt(proposalIdentifier)})
    return result
  }

  function makeTime(timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(timestamp / 1000000);
    var day = date.getDate()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var monthName = date.toLocaleString('default', { month:'short' })
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();
    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    var formatDate = monthName + ' ' + day + ', ' + year
    return formatDate
  }

  async function resolveStatus(requests) {
    
    let status
    let proposalType
    let allProposals = []
    let votingProposals = []
    let queueProposals = []
    let processedProposals = []
    
    if (requests.length > 0) {
      requests.map((fr) => {
        console.log('request fr', fr)
        status = getStatus(fr.flags)
        proposalType = getProposalType(fr.flags)
        let isVotingPeriod = getVotingPeriod(fr.startingPeriod, fr.votingPeriod)
        let isGracePeriod = getGracePeriod(fr.votingPeriod, fr.gracePeriod)
        let disabled
        let isDisabled = isVotingPeriod ? disabled = false : disabled = true       

        if(status != 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled'){
          allProposals.push([{
            blockTimeStamp: fr.proposalSubmission,
            date: makeTime(fr.proposalSubmission),
            applicant: fr.applicant, 
            proposer: fr.proposer,
            sponsor: fr.sponsor,
            requestId: parseInt(fr.proposalId), 
            shares: fr.sharesRequested, 
            loot: fr.lootRequested, 
            tribute: fr.tributeOffered, 
            flags: fr.flags,
            yesVotes: fr.yesVote,
            noVotes: fr.noVote,
            funding: fr.paymentRequested,
            votingPeriod: parseInt(fr.votingPeriod),
            gracePeriod: parseInt(fr.gracePeriod),
            status: status,
            startingPeriod: parseInt(fr.startingPeriod),
            proposalType: proposalType,
            isGracePeriod: isGracePeriod,
            isVotingPeriod: isVotingPeriod,
            disabled: isDisabled,
            voted: fr.voted,
            vote: fr.vote
          }])
        }

        if(status == 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled' && (isVotingPeriod==true || isGracePeriod==true)){
          votingProposals.push([{
            blockTimeStamp: fr.proposalSubmission,
            date: makeTime(fr.proposalSubmission), 
            applicant: fr.applicant, 
            proposer: fr.proposer,
            sponsor: fr.sponsor,
            requestId: parseInt(fr.proposalId), 
            shares: fr.sharesRequested, 
            loot: fr.lootRequested, 
            tribute: fr.tributeOffered, 
            flags: fr.flags,
            yesVotes: fr.yesVote,
            noVotes: fr.noVote,
            funding: fr.paymentRequested,
            votingPeriod: parseInt(fr.votingPeriod),
            gracePeriod: parseInt(fr.gracePeriod),
            status: status,
            startingPeriod: parseInt(fr.startingPeriod),
            proposalType: proposalType,
            isGracePeriod: isGracePeriod,
            isVotingPeriod: isVotingPeriod,
            disabled: isDisabled,
            voted: fr.voted,
            vote: fr.vote
          }])
        }

        if(status == 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled' && currentPeriod > parseInt(fr.gracePeriod) && !isVotingPeriod && !isGracePeriod){
        
          queueProposals.push({
            blockTimeStamp: fr.proposalSubmission,
            date: makeTime(fr.proposalSubmission),
            applicant: fr.applicant, 
            proposer: fr.proposer,
            sponsor: fr.sponsor,
            requestId: parseInt(fr.proposalId),
            shares: fr.sharesRequested, 
            loot: fr.lootRequested, 
            tribute: fr.tributeOffered, 
            flags: fr.flags,
            yesVotes: fr.yesVote,
            funding: fr.paymentRequested,
            noVotes: fr.noVote,
            votingPeriod: parseInt(fr.votingPeriod),
            gracePeriod: parseInt(fr.gracePeriod),
            status: status,
            startingPeriod: parseInt(fr.startingPeriod),
            proposalType: proposalType,
            isGracePeriod: isGracePeriod,
            isVotingPeriod: isVotingPeriod,
            disabled: isDisabled,
            voted: fr.voted,
            vote: fr.vote
          })
        }

        if(status == 'Processed' || status != 'Cancelled' && (status =='Passed' || status == 'Not Passed')){
          processedProposals.push([{
            blockTimeStamp: fr.proposalSubmission,
            date: makeTime(fr.proposalSubmission),
            applicant: fr.applicant, 
            proposer: fr.proposer,
            sponsor: fr.sponsor,
            requestId: parseInt(fr.proposalId), 
            shares: fr.sharesRequested, 
            loot: fr.lootRequested, 
            tribute: fr.tributeOffered,
            funding: fr.paymentRequested, 
            flags: fr.flags,
            yesVotes: fr.yesVote,
            noVotes: fr.noVote,
            votingPeriod: parseInt(fr.votingPeriod),
            gracePeriod: parseInt(fr.gracePeriod),
            status: status,
            startingPeriod: parseInt(fr.startingPeriod),
            proposalType: proposalType,
            isGracePeriod: isGracePeriod,
            isVotingPeriod: isVotingPeriod,
            disabled: isDisabled,
            voted: fr.voted,
            vote: fr.vote
          }])
        }
      }) 
    }
    let propObject = {
      allProposals: allProposals,
      votingProposals: votingProposals,
      queueProposals: queueProposals,
      processedProposals: processedProposals
    }

  //   // process queued proposals
  //   if(propObject.queueProposals && propObject.queueProposals.length > 0){
  //     console.log('queue', propObject.queueProposals)
  //     for(let i=0; i < propObject.queueProposals.length; i++) {
  //       try{
  //         if(propObject.queueProposals[i].status !== 'Processed' && propObject.queueProposals[i].status !== 'Passed' && propObject.queueProposals[i].status !== 'Not Passed'){
  //         await handleProcessAction(contract, contractId, propObject.queueProposals[i].requestId, propObject.queueProposals[i].proposalType)
  //         }
  //       } catch (err) {
  //         console.log(err)
  //       }
  //    }
  //   }
    return propObject
  }

  let Members
  console.log('allmemberinfo', allMemberInfo)
  if (allMemberInfo && allMemberInfo.length > 0 && tabValue == '1') {
    Members = allMemberInfo.map((fr, i) => {
      console.log('fr', fr)
      return (
        <MemberCard 
          key={fr.memberId}
          accountId={accountId}
          accountName={fr.delegateKey}
          shares={fr.shares}
          memberCount={memberCount}
          summoner={summoner}
          curUserIdx={curUserIdx}
          didsContract={didRegistryContract}
          appIdx={appIdx}
          appClient={appClient}
          contractId={contractId}
          contractIdx={contractIdx}
          joined={fr.joined}
          updated={fr.updated}
          handleUpdate={handleUpdate}
          isUpdated={isUpdated}
        />
      )
    })
  }

  let Proposals
  if (proposalList && proposalList.length > 0 && tabValue == '2') {
    console.log('proposallist', proposalList)
    Proposals = proposalList.map((fr) => {
      return (
        <ProposalCard
          curDaoIdx={curDaoIdx}
          daoDid={daoDid}
          contract={contract}
          proposalDeposit={proposalDeposit}
          key={fr[0].requestId} 
          applicant={fr[0].applicant}
          memberStatus={memberStatus}
          created={fr[0].date}
          noVotes={fr[0].noVotes}
          yesVotes={fr[0].yesVotes}
          proposalType={fr[0].proposalType}
          proposer={fr[0].proposer}
          sponsor={fr[0].sponsor}
          requestId={fr[0].requestId}
          shares={fr[0].shares}
          tribute={fr[0].tribute}
          funding={fr[0].funding}
          loot={fr[0].loot}
          status={fr[0].status}
          accountId={accountId}
          cancelFinish={cancelFinish}
          tributeToken={tributeToken}
          currentPeriod={currentPeriod}
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
        />
      )
    })
  }

  let Votes
  if (votingList && votingList.length > 0 && tabValue == '3') {
   Votes = votingList.map((fr) => {
      return (
        <ProposalCard 
          curDaoIdx={curDaoIdx}
          key={fr[0].requestId} 
          applicant={fr[0].applicant}
          created={fr[0].date}
          noVotes={fr[0].noVotes}
          yesVotes={fr[0].yesVotes}
          proposalType={fr[0].proposalType}
          proposer={fr[0].proposer}
          sponsor={fr[0].sponsor}         
          requestId={fr[0].requestId}
          shares={fr[0].shares}
          tribute={fr[0].tribute}
          funding={fr[0].funding}
          loot={fr[0].loot}
          status={fr[0].status}
          accountId={accountId}
          isVotingPeriod={fr[0].isVotingPeriod}
          isGracePeriod={fr[0].isGracePeriod}
          voted={fr[0].voted}
          gracePeriod={fr[0].gracePeriod}
          votingPeriod={fr[0].votingPeriod}
          currentPeriod={currentPeriod}
          periodDuration={periodDuration}
          done={done}
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          handleVotingAction={handleVotingAction}
          handleRageQuitClick={handleRageQuitClick}
          summoner={summoner}
        />
      )
    })
  }

  let Queued
  console.log('queue list', queueList)
  if (queueList && queueList.length > 0 && tabValue == '4') {
    Queued = queueList.map((fr) => {
      return (
        <ProposalCard 
          curDaoIdx={curDaoIdx}
          key={fr.requestId} 
          applicant={fr.applicant}
          created={fr.date}
          noVotes={fr.noVotes}
          yesVotes={fr.yesVotes}
          proposalType={fr.proposalType}
          proposer={fr.proposer}
          sponsor={fr.sponsor}
          funding={fr.funding}
          requestId={fr.requestId}
          shares={fr.shares}
          tribute={fr.tribute}
          loot={fr.loot}
          status={fr.status}
          startingPeriod={fr.startingPeriod}
          currentPeriod={currentPeriod}
          gracePeriod={fr.gracePeriod}
          handleProcessAction={handleProcessAction}
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
        />
      )
    })
  } else {
    
  //why?????
  if (queueList && queueList.length > 1 && tabValue == '4') {
    Queued = queueList.map((fr) => {
      return (
        <ProposalCard 
          curDaoIdx={curDaoIdx}
          key={fr[0].requestId} 
          applicant={fr[0].applicant}
          created={fr[0].date}
          noVotes={fr[0].noVotes}
          yesVotes={fr[0].yesVotes}
          proposalType={fr[0].proposalType}
          proposer={fr[0].proposer}
          sponsor={fr[0].sponsor}
          funding={fr[0].funding}
          requestId={fr[0].requestId}
          shares={fr[0].shares}
          tribute={fr[0].tribute}
          loot={fr[0].loot}
          status={fr[0].status}
          startingPeriod={fr[0].startingPeriod}
          handleProcessAction={handleProcessAction}
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
        />
      )
    })
  }
}

  let Processed
  if (processedList && processedList.length > 0 && tabValue == '5') {
    Processed = processedList.map((fr) => {
      return (
        <ProposalCard  
          curDaoIdx={curDaoIdx}
          key={fr[0].requestId} 
          applicant={fr[0].applicant}
          created={fr[0].date}
          noVotes={fr[0].noVotes}
          yesVotes={fr[0].yesVotes}
          proposalType={fr[0].proposalType}
          proposer={fr[0].proposer}
          sponsor={fr[0].sponsor}
          funding={fr[0].funding}
          requestId={fr[0].requestId}
          shares={fr[0].shares}
          tribute={fr[0].tribute}
          loot={fr[0].loot}
          status={fr[0].status}
        
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
        />
      )
    })
  }
    
  return (
    <>
    <Paper square className={classes.root}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        aria-label="icon label tabs example"
       
      >
        <Tab 
          icon={     
            <StyledBadge badgeContent={memberCount} color="primary">
              <PeopleAltIcon fontSize='large'/>
            </StyledBadge>
          } 
          label="MEMBERS" 
          value="1"
        />
        <Tab 
          icon={
            <StyledBadge badgeContent={proposalCount} color="primary">
              <ListAltIcon fontSize='large'/>
            </StyledBadge>
          } 
          label="PROPOSALS" 
          value="2"
        />
        <Tab 
          icon={
            <StyledBadge badgeContent={voteCount} color="primary">
              <HowToVoteIcon fontSize='large'/>
            </StyledBadge>
          } 
          label="VOTING" 
          value="3"
        />
        <Tab 
          icon={
            <StyledBadge badgeContent={queueCount} color="primary">
              <QueueIcon fontSize='large'/>
            </StyledBadge>
          } 
          label="PROCESSING" 
          value="4"
        />
        <Tab
          icon={
            <StyledBadge badgeContent={processedCount} color="primary">
              <AssignmentTurnedInIcon fontSize='large'/>
            </StyledBadge>
          }
          label="COMPLETE" 
          value="5"
        />
      </Tabs>
    </Paper>
    <TabContext value={tabValue}>
      <TabPanel value="1" className={classes.root}>
        {Members}
      </TabPanel>
      <TabPanel value="2" className={classes.root}>
        {Proposals}
      </TabPanel>
      <TabPanel value="3" className={classes.root}>
        {Votes}
      </TabPanel>
      <TabPanel value="4" className={classes.root}>
        {Queued}
      </TabPanel>
      <TabPanel value="5" className={classes.root}>
        {Processed}
      </TabPanel>
    </TabContext>

       
    <Snackbar open={snackBarOpen} autoHideDuration={4000} onClose={snackBarHandleClose}>
    <Alert onClose={snackBarHandleClose} severity={severity}>
      {severity=='success' ? successMessage : errorMessage}
    </Alert>
    </Snackbar>

    {sponsorConfirmationClicked ? <SponsorConfirmation
      contract={contract}
      contractId={contractId}
      curDaoIdx={curDaoIdx}
      handleProposalEventChange={handleProposalEventChange}
      handleGuildBalanceChanges={handleGuildBalanceChanges}
      handleEscrowBalanceChanges={handleEscrowBalanceChanges}
      handleSponsorConfirmationClickState={handleSponsorConfirmationClickState} 
      handleTabValueState={handleTabValueState} 
      accountId={accountId} 
      depositToken={depositToken}
      getCurrentPeriod={getCurrentPeriod}
      proposalIdentifier={proposalIdentifier}
      paymentRequested={paymentRequested}
      sponsorProposalType={sponsorProposalType}
      handleSnackBarOpen={handleSnackBarOpen}
      handleErrorMessage={handleErrorMessage}
      handleSuccessMessage={handleSuccessMessage}
      proposalDeposit={proposalDeposit}/> : null }

    {rageQuitClicked ? <RageQuit
      contract={contract}
      handleProposalEventChange={handleProposalEventChange}
      handleRageQuitClickState={handleRageQuitClickState}
      accountId={accountId}
      /> : null }

    </>
  )
}