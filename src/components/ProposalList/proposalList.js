import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { cancelProposal, processProposal, submitVote, GAS, synchMember, getStatus } from '../../state/near'
import Fuse from 'fuse.js'
import MemberCard from '../MemberCard/memberCard'
import ProposalCard from '../ProposalCard/proposalCard'
import SponsorConfirmation from '../Confirmation/sponsorConfirmation'
import RageQuit from '../RageQuit/rageQuit'
import SearchBar from '../../components/common/SearchBar/search'

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
import Grid from '@material-ui/core/Grid'

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
  const [membersArray, setMembersArray] = useState([])
  
  const classes = useStyles()
  const theme = useTheme()
  const matches = useMediaQuery('(max-width:500px)')

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
    totalShares,
    currentMemberInfo,

    tabValue,
    handleTabValueState,
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
  
    
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

  useEffect(() => {

    if(allMemberInfo){
      setMemberCount(allMemberInfo.length)
    }
    if(allMemberInfo && allMemberInfo.length > 0){
      let members = _.sortBy(allMemberInfo, 'joined')
      setMembersArray(members)
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
      currentPeriod
      
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
      
        let i = 0
        while (i < newLists.processedProposals.length){
        
          if(newLists.processedProposals[i][0].proposalType == 'Member'){
            
            await synchMember(curDaoIdx, contract, contractId, newLists.processedProposals[i][0].applicant)
          }
          i++
        }

      
      }

      
    }
    let mounted = true
    // if(proposalEvents && proposalEvents.length > 0){
    //   console.log('proposalEvents', proposalEvents)
     
      if(mounted){
        fetchData()
            .then((res) => {
             
            })
      return () => mounted = false
      }
    
   // }

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

  async function handleCancelAction(proposalId, loot, tribute) {
    setCancelFinish(false)
    try{
      await cancelProposal(contract, contractId, proposalId, loot, tribute)
    } catch (err) {
      console.log('problem cancelling proposal', err)
    }
  }

  async function handleProcessAction(proposalId, proposalType) {
    setProcessFinish(false)
    try{
      await processProposal(contract, contractId, proposalId, proposalType, curDaoIdx) 
    } catch (err) {
        console.log('problem processing proposal', err)
    }
  }

  async function handleVotingAction(proposalId, vote) {
      setDone(false)
      try{
        await submitVote(contract, contractId, proposalId, vote)
      } catch (err) {
        console.log('problem with vote', err)
      }
  }
 

  function getProposalType(flags) {
    // flags [sponsored, processed, didPass, cancelled, whitelist, guildkick, member, commitment, opportunity, tribute, configuration]
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
    if(flags[10]) {
      type = 'Configuration'
    }
    if(!flags[4] && !flags[5] && !flags[6] &&!flags[7] &&!flags[8] &&!flags[9] &&!flags[10]) {
    type = 'Payout'
    }
    return type
  }

  function getVotingPeriod(startPeriod, votePeriod, isFinalized) {
    let votingPeriod = currentPeriod >= startPeriod && currentPeriod <= votePeriod && !isFinalized
    return votingPeriod
  }

  function getGracePeriod(votePeriod, grPeriod, isFinalized) {
      let gracePeriod = currentPeriod > votePeriod && currentPeriod <= grPeriod && isFinalized
      return gracePeriod
  }

  async function getUserVote(proposalIdentifier) {
    
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
     console.log('requests fr', fr)
        status = getStatus(fr.flags)
        proposalType = getProposalType(fr.flags)
        let isFinalized = fr.voteFinalized != 0 ? true : false
        let isVotingPeriod = getVotingPeriod(fr.startingPeriod, fr.votingPeriod, isFinalized)
        let isGracePeriod = getGracePeriod(fr.votingPeriod, fr.gracePeriod, isFinalized)
        let disabled
        let isDisabled = isVotingPeriod ? disabled = false : disabled = true       

  //  if(status != 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled'){
          if(status == 'Submitted'){
          allProposals.push([{
            blockTimeStamp: fr.proposalSubmission,
            date: makeTime(fr.proposalSubmission),
            applicant: fr.applicant, 
            proposer: fr.proposer,
            sponsor: fr.sponsor,
            requestId: parseInt(fr.proposalId), 
            shares: fr.sharesRequested,
            delegatedShares: fr.delegatedShares,
            receivedDelegations: fr.receivedDelegations,
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
            vote: fr.vote,
            configuration: fr.configuration,
            submitTransactionHash: fr.submitTransactionHash,
            cancelTransactionHash: fr.cancelTransactionHash,
            processTransactionHash: fr.processTransactionHash,
            sponsorTransactionHash: fr.sponsorTransactionHash
          }])
        }

   //     if(status == 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled' && (isVotingPeriod==true || isGracePeriod==true)){
        if(status == 'Sponsored' && (isVotingPeriod==true || isGracePeriod==true)){
          votingProposals.push([{
            blockTimeStamp: fr.proposalSubmission,
            date: makeTime(fr.proposalSubmission), 
            applicant: fr.applicant, 
            proposer: fr.proposer,
            sponsor: fr.sponsor,
            requestId: parseInt(fr.proposalId), 
            shares: fr.sharesRequested, 
            delegatedShares: fr.delegatedShares,
            receivedDelegations: fr.receivedDelegations,
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
            vote: fr.vote,
            configuration: fr.configuration,
            submitTransactionHash: fr.submitTransactionHash,
            cancelTransactionHash: fr.cancelTransactionHash,
            processTransactionHash: fr.processTransactionHash,
            sponsorTransactionHash: fr.sponsorTransactionHash
          }])
        }

    //    if(status == 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled' && currentPeriod > parseInt(fr.gracePeriod) && !isVotingPeriod && !isGracePeriod){
          if(status == 'Awaiting Finalization' && currentPeriod > parseInt(fr.gracePeriod) && !isVotingPeriod && !isGracePeriod){
          queueProposals.push({
            blockTimeStamp: fr.proposalSubmission,
            date: makeTime(fr.proposalSubmission),
            applicant: fr.applicant, 
            proposer: fr.proposer,
            sponsor: fr.sponsor,
            requestId: parseInt(fr.proposalId),
            shares: fr.sharesRequested,
            delegatedShares: fr.delegatedShares,
            receivedDelegations: fr.receivedDelegations,
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
            vote: fr.vote,
            configuration: fr.configuration,
            submitTransactionHash: fr.submitTransactionHash,
            cancelTransactionHash: fr.cancelTransactionHash,
            processTransactionHash: fr.processTransactionHash,
            sponsorTransactionHash: fr.sponsorTransactionHash
          })
        }

       // if(status == 'Awaiting Finalization' || status != 'Cancelled' && (status =='Passed' || status == 'Not Passed')){
          if(status == 'Passed' || status == 'Not Passed') {
          processedProposals.push([{
            blockTimeStamp: fr.proposalSubmission,
            date: makeTime(fr.proposalSubmission),
            applicant: fr.applicant, 
            proposer: fr.proposer,
            sponsor: fr.sponsor,
            requestId: parseInt(fr.proposalId), 
            shares: fr.sharesRequested,
            delegatedShares: fr.delegatedShares,
            receivedDelegations: fr.receivedDelegations,
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
            vote: fr.vote,
            configuration: fr.configuration,
            submitTransactionHash: fr.submitTransactionHash,
            cancelTransactionHash: fr.cancelTransactionHash,
            processTransactionHash: fr.processTransactionHash,
            sponsorTransactionHash: fr.sponsorTransactionHash
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

  if (allMemberInfo && allMemberInfo.length > 0 && tabValue == '1') {
    Members = allMemberInfo.map((fr, i) => {
     
      return (
        <MemberCard 
          key={fr.memberId}
          accountId={accountId}
          accountName={fr.delegateKey}
          shares={fr.shares}
          delegatedShares={fr.delegatedShares}
          receivedDelegations={fr.receivedDelegations}
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
          active={fr.active}
          totalShares={totalShares}
          currentMemberInfo={currentMemberInfo}
        />
      )
    })
  }

  let Proposals
  if (proposalList && proposalList.length > 0 && tabValue == '2') {
  
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
          submitTransactionHash={fr[0].submitTransactionHash}
          cancelTransactionHash={fr[0].cancelTransactionHash}
          processTransactionHash={fr[0].processTransactionHash}
          sponsorTransactionHash={fr[0].sponsorTransactionHash}
          configuration={fr[0].configuration}
          accountId={accountId}
          cancelFinish={cancelFinish}
          tributeToken={tributeToken}
          currentPeriod={currentPeriod}
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
          contract={contract}
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
          submitTransactionHash={fr[0].submitTransactionHash}
          cancelTransactionHash={fr[0].cancelTransactionHash}
          processTransactionHash={fr[0].processTransactionHash}
          sponsorTransactionHash={fr[0].sponsorTransactionHash}
          done={done}
          configuration={fr[0].configuration}
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          handleVotingAction={handleVotingAction}
          handleRageQuitClick={handleRageQuitClick}
          summoner={summoner} 
          contract={contract}
        />
      )
    })
  }

  let Queued
 
  if (queueList && Object.keys(queueList).length > 0 && tabValue == '4') {
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
          submitTransactionHash={fr.submitTransactionHash}
          cancelTransactionHash={fr.cancelTransactionHash}
          processTransactionHash={fr.processTransactionHash}
          sponsorTransactionHash={fr.sponsorTransactionHash}
          handleProcessAction={handleProcessAction}
          configuration={fr.configuration}
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
          queueList={queueList}
          contract={contract}
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
          configuration={fr[0].configuration}
          submitTransactionHash={fr[0].submitTransactionHash}
          cancelTransactionHash={fr[0].cancelTransactionHash}
          processTransactionHash={fr[0].processTransactionHash}
          sponsorTransactionHash={fr[0].sponsorTransactionHash}
          handleProcessAction={handleProcessAction}
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
          contract={contract}
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
          requestId={parseInt(fr[0].requestId)}
          shares={fr[0].shares}
          tribute={fr[0].tribute}
          loot={fr[0].loot}
          status={fr[0].status}
          configuration={fr[0].configuration}
          submitTransactionHash={fr[0].submitTransactionHash}
          cancelTransactionHash={fr[0].cancelTransactionHash}
          processTransactionHash={fr[0].processTransactionHash}
          sponsorTransactionHash={fr[0].sponsorTransactionHash}
        
          // handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          // handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
          contract={contract}
        />
      )
    })
  }

  let dataArray = []
  function makeArray(data){
    let i = 0
    let exists
    if(data != false){
        while(i < dataArray.length){
            if(dataArray[i].contractId == data.contractId){
                exists = true
            }
            i++
        }
        if(!exists){
            dataArray.push(data)
            setSearchArray(dataArray)
        }
        console.log('search array', searchArray)
    }
  }

  const searchData = (pattern) => {
    if (!pattern) {
        let sortedData = _.sortBy(allMemberInfo, 'joined')
        setMembersArray(sortedData)
      
        return
    }
    console.log('searchData', membersArray)
    
    const fuse = new Fuse(membersArray, {
        keys: ['delegateKey'],
        findAllMatches: true
    })
    console.log('fuse', fuse)

    const result = fuse.search(pattern)
    console.log('fuse result', result)

    const matches = []
    if (!result.length) {
        setMembersArray([])
       
    } else {
        result.forEach(({item}) => {
            matches.push(item)
    })
    console.log('matches', matches)
        setMembersArray(matches)
       
    }
  }
    
  return (
    <>
    <Paper square className={classes.root}>
    {!matches ? (
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
       
        indicatorColor="primary"
        aria-label="icon label tabs example"
        variant="fullWidth"
        
       
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
      ) : null }
      {matches ? (
        <Tabs
        value={tabValue}
        onChange={handleTabChange}
       
        indicatorColor="primary"
        aria-label="icon label tabs example"
        variant="scrollable"
        scrollButtons="auto"
       
      >
        <Tab 
        icon={     
          <StyledBadge badgeContent={memberCount} color="primary">
            <PeopleAltIcon fontSize='small'/>
          </StyledBadge>
        } 
        label="MEMBERS" 
        value="1"
      />
      <Tab 
        icon={
          <StyledBadge badgeContent={proposalCount} color="primary">
            <ListAltIcon fontSize='small'/>
          </StyledBadge>
        } 
        label="PROPOSALS" 
        value="2"
      />
      <Tab 
        icon={
          <StyledBadge badgeContent={voteCount} color="primary">
            <HowToVoteIcon fontSize='small'/>
          </StyledBadge>
        } 
        label="VOTING" 
        value="3"
      />
      <Tab 
        icon={
          <StyledBadge badgeContent={queueCount} color="primary">
            <QueueIcon fontSize='small'/>
          </StyledBadge>
        } 
        label="PROCESSING" 
        value="4"
      />
      <Tab
        icon={
          <StyledBadge badgeContent={processedCount} color="primary">
            <AssignmentTurnedInIcon fontSize='small'/>
          </StyledBadge>
        }
        label="COMPLETE" 
        value="5"
      />
      </Tabs>
      ) : null}
     
    </Paper>
    <TabContext value={tabValue}>
      <TabPanel value="1" >
      <Grid container alignItems="center" justifyContent="space-between" spacing={3} style={{padding: '20px'}} >
      { membersArray && membersArray.length > 0 ? 
          (<>
    
            <Grid container alignItems="center" justifyContent="space-between" spacing={0} >
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <SearchBar
                    placeholder="Search"
                    onChange={(e) => searchData(e.target.value)}
                />
              </Grid>
            </Grid>
          <Grid container alignItems="center" justifyContent="space-evenly" spacing={3} style={{padding: '20px'}}>
              {membersArray.map((fr, i) => (
                  <MemberCard 
                    key={fr.memberId}
                    accountId={accountId}
                    accountName={fr.delegateKey}
                    shares={fr.shares}
                    delegatedShares={fr.delegatedShares}
                    receivedDelegations={fr.receivedDelegations}
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
                    active={fr.active}
                    totalShares={totalShares}
                    currentMemberInfo={currentMemberInfo}
                    contract={contract}
                    allMemberInfo={allMemberInfo}
                  />
                ) 
              )}
          </Grid>
      </>)
      : null
      } 
  </Grid>
      
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
      proposalDeposit={proposalDeposit}/> : null }

    {rageQuitClicked ? <RageQuit
      state={state}
      contractId={contractId}
      depositToken={depositToken}
      contract={contract}
      handleProposalEventChange={handleProposalEventChange}
      handleRageQuitClickState={handleRageQuitClickState}
      accountId={accountId}
      /> : null }

    </>
  )
}