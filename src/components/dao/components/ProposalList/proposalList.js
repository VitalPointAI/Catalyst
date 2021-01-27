import React, { useState, useEffect } from 'react'
import { utils } from 'near-api-js'
import { proposalEvent } from '../../../../utils/proposalEvents'
import { memberEvent } from '../../../../utils/memberEvent'
import MemberCard from '../MemberCard/memberCard'
import ProposalCard from '../ProposalCard/proposalCard'
import MemberProposalForm from '../MemberProposal/memberProposalForm'
import MemberProposalDetails from '../MemberProposal/memberProposalDetails'
import FundingProposalForm from '../FundingProposal/fundingProposalForm'
import FundingProposalDetails from '../FundingProposal/fundingProposalDetails'
import SponsorConfirmation from '../SponsorConfirmation/sponsorConfirmation'
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
  const [fundingProposalStatus, setFundingProposalStatus] = useState()
  const [memberProposalStatus, setMemberProposalStatus] = useState()
  const [snackBarOpen, setSnackBarOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState()
  const [severity, setSeverity] = useState()
  const [successMessage, setSuccessMessage] = useState()
  const [done, setDone] = useState(true)
  const [memberProposalType, setMemberProposalType] = useState()
  


  const classes = useStyles()
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.only('xs'))

  const { 
    accountId, 
    tabValue,
    handleTabValueState,
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    proposalEvents,
    memberStatus,
    depositToken,
    tributeToken,
    tributeOffer,
    proposalDeposit,
    currentPeriod,
    periodDuration,
    proposalComments,
    contract,
    daoContract,
    allMemberInfo,
    getCurrentPeriod
  } = props

  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      let i = 0
      while (i < proposalEvents.length) {
          let result
          try{
            result = await getUserVote(proposalEvents[i]._id)
          } catch (err) {
            console.log('problem getting user vote', err)
          }
          proposalEvents[i].vote = result
          proposalEvents[i].voted = result == 'yes' || result == 'no'? true : false
          i++
      }
        let newLists = await resolveStatus(proposalEvents)
        if(isMounted){
        setProposalList(newLists.allProposals)
        setVotingList(newLists.votingProposals)
        setQueueList(newLists.queueProposals)
        setProcessedList(newLists.processedProposals)
        setProposalCount(newLists.allProposals.length)
        setVoteCount(newLists.votingProposals.length)
        setProcessedCount(newLists.processedProposals.length)
        if(allMemberInfo){
          setMemberCount(allMemberInfo.length)
        }
      }
    }
    
    if(proposalEvents && proposalEvents.length > 0){
    fetchData()
      .then((res) => {
       
      })
    }
    return () => { isMounted = false } // use effect cleanup to set flag false if unmounted
  },[proposalEvents, currentPeriod])

  const handleTabChange = (event, newValue) => {
      handleTabValueState(newValue);
  }

  function handleExpanded() {
    setExpanded(!expanded)
  }

  const handleSponsorConfirmationClick = (requestId) => {
    setProposalIdentifier(requestId)
    handleTabValueState(tabValue)
    setSponsorConfirmationClicked(true)
  }

  const handleMemberProposalDetailsClick = async (id, applicant, status, proposer, proposalType) => {
    setMemberProposalStatus(status)
    setMemberProposalType(proposalType)
    if(accountId != applicant && proposalType == 'Member') {
        handleTabValueState(tabValue)
        setMemberProposalId(id)
        setMemberProposalDetailsClicked(true)
    }
    if(accountId == applicant){
        handleTabValueState(tabValue)
        setMemberProposalId(id)
        setMemberProposalDetailsEmptyClicked(true)
    }
    if(accountId != applicant && accountId == proposer && proposalType == 'GuildKick'){
      handleTabValueState(tabValue)
      setMemberProposalId(id)
      setMemberProposalDetailsEmptyClicked(true)
    }
  };

  const handleRageQuitClick = () => {
    handleExpanded()
    setRageQuitClicked(true)
  };

  function handleMemberProposalDetailsClickState(property) {
    setMemberProposalDetailsClicked(property)
  }

  function handleMemberProposalDetailsEmptyClickState(property) {
  setMemberProposalDetailsEmptyClicked(property)
  }

  const handleFundingProposalDetailsClick = async (id, applicant, status) => {
    console.log('click status', status)
    setFundingProposalStatus(status)
    if(accountId != applicant) {
        handleExpanded()
        handleTabValueState(tabValue)
        setFundingProposalId(id)
        setFundingProposalDetailsClicked(true)
        
    } else {
        handleExpanded()
        handleTabValueState(tabValue)
        setFundingProposalId(id)
        setFundingProposalDetailsEmptyClicked(true)
    }
  };

  function handleFundingProposalDetailsClickState(property) {
    setFundingProposalDetailsClicked(property)
  }

  function handleFundingProposalDetailsEmptyClickState(property) {
  setFundingProposalDetailsEmptyClicked(property)
  }

  function handleSponsorConfirmationClickState(property) {
    setSponsorConfirmationClicked(property)
  }

  function handleRageQuitClickState(property) {
      setRageQuitClicked(property)
  }

  function handleErrorMessage(message, severity) {
    setErrorMessage(message)
    setSeverity(severity)
  }

  function handleSuccessMessage(message, severity) {
    setSuccessMessage(message)
    setSeverity(severity)
  }

  function handleSnackBarOpen(property) {
    setSnackBarOpen(property)
  }
 
  const snackBarHandleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarOpen(false);
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />
  }


  async function handleCancelAction(proposalIdentifier, tribute) {
    setCancelFinish(false)
    let finished
    try{
    finished = await daoContract.cancelProposal({
        pI: proposalIdentifier
        }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount((parseInt(proposalDeposit)+parseInt(tribute)).toString()))
        try{
        let proposal = await contract.getProposal({proposalId: parseInt(proposalIdentifier)})
        let updated = await proposalEvent.recordEvent(
          proposal.pI, proposal.a, proposal.p, proposal.s, proposal.sR, proposal.lR, proposal.tO, proposal.tT, proposal.pR, proposal.pT, 
          proposal.sP, proposal.yV, proposal.nV, proposal.f, proposal.mT, proposal.pS, proposal.vP, proposal.gP, proposal.voteFinalized)
          if(updated){
            handleSuccessMessage('Successfully cancelled proposal.', 'success')
            handleSnackBarOpen(true)
          } else {
            handleErrorMessage('There was a problem cancelling the proposal.', 'error')
            handleSnackBarOpen(true)
          }
        } catch (err) {
          console.log('problem deleteing proposal record event', err)
          handleErrorMessage('There was a problem cancelling the proposal.', 'error')
          handleSnackBarOpen(true)
        }
    } catch (err) {
      console.log('problem cancelling proposal', err)
      handleErrorMessage('There was a problem cancelling the proposal.', 'error')
      handleSnackBarOpen(true)
    }
    if(finished) {
      await handleProposalEventChange()
      await handleEscrowBalanceChanges()
      await handleGuildBalanceChanges()
      setCancelFinish(true)
    }
  }

  async function handleProcessAction(proposalIdentifier, proposalType) {
    let finished
    try{
      finished = await daoContract.processProposal({
        pI: proposalIdentifier
        }, process.env.DEFAULT_GAS_VALUE)
          try{
          let proposal = await contract.getProposal({proposalId: parseInt(proposalIdentifier)})
          let updated = await proposalEvent.recordEvent(
            proposal.pI, proposal.a, proposal.p, proposal.s, proposal.sR, proposal.lR, proposal.tO, proposal.tT, proposal.pR, proposal.pT, 
            proposal.sP, proposal.yV, proposal.nV, proposal.f, proposal.mT, proposal.pS, proposal.vP, proposal.gP, proposal.voteFinalized)
          let memberAdded
          let memberUpdated
            if(proposalType == 'Member'){
              let member = await contract.getMemberInfo({member: proposal.a})
              if(member[0]) {
                let totalMembers = await contract.getTotalMembers()
                let id = parseInt(totalMembers)
                memberAdded = await memberEvent.recordMemberEvent(
                  id, member[0].delegateKey, member[0].shares, member[0].loot, member[0].existing, member[0].highestIndexYesVote, member[0].jailed, member[0].joined, member[0].updated) 
              }
              } else {
            let member = await contract.getMemberInfo({member: accountId})
            console.log('member processed', member)
            memberUpdated = await memberEvent.updateMemberEvent(
            member[0].delegateKey, member[0].shares, member[0].loot, member[0].existing, member[0].highestIndexYesVote, member[0].jailed, member[0].joined, member[0].updated)
            }
           

            if(updated && memberUpdated){
              handleSuccessMessage('Successfully processed proposal.', 'success')
              handleSnackBarOpen(true)
            } else {
              handleErrorMessage('There was a problem processing the proposal.', 'error')
              handleSnackBarOpen(true)
            }
          } catch (err) {
            console.log('problem recording the process proposal event', err)
            handleErrorMessage('There was a problem processing the proposal.', 'error')
            handleSnackBarOpen(true)
          }
      } catch (err) {
        console.log('problem processing proposal', err)
        handleErrorMessage('There was a problem processing the proposal.', 'error')
        handleSnackBarOpen(true)
      }
      if(finished) {
        await handleProposalEventChange()
        await handleEscrowBalanceChanges()
        await handleGuildBalanceChanges()
      }
  }

  async function handleYesVotingAction(proposalIdentifier) {
    setDone(false)
    let finished
    try{
      finished = await contract.submitVote({
        pI: proposalIdentifier,
        vote: 'yes'
        }, process.env.DEFAULT_GAS_VALUE)
          try{
          let proposal = await contract.getProposal({proposalId: parseInt(proposalIdentifier)})
          console.log('proposal in yes vote', proposal)
          let updated = await proposalEvent.recordEvent(
            proposal.pI, proposal.a, proposal.p, proposal.s, proposal.sR, proposal.lR, proposal.tO, proposal.tT, proposal.pR, proposal.pT, 
            proposal.sP, proposal.yV, proposal.nV, proposal.f, proposal.mT, proposal.pS, proposal.vP, proposal.gP, proposal.voteFinalized)
          
          let member = await contract.getMemberInfo({member: accountId})
          console.log('member from yes vote', member)
          let memberUpdated = await memberEvent.updateMemberEvent(
          member[0].delegateKey, member[0].shares, member[0].loot, member[0].existing, member[0].highestIndexYesVote, member[0].jailed, member[0].joined, member[0].updated)

            if(updated && memberUpdated){
              handleSuccessMessage('Successfully voted.', 'success')
              handleSnackBarOpen(true)
            } else {
              handleErrorMessage('There was a problem with voting.', 'error')
              handleSnackBarOpen(true)
            }
          } catch (err) {
            console.log('problem recording the vote event', err)
            handleErrorMessage('There was a problem with voting.', 'error')
            handleSnackBarOpen(true)
          }
      } catch (err) {
        console.log('problem with vote', err)
        handleErrorMessage('There was a problem with voting.', 'error')
        handleSnackBarOpen(true)
      }
      if(finished) {
        setDone(true)
        await handleProposalEventChange()
        await handleEscrowBalanceChanges()
        await handleGuildBalanceChanges()
      }
  }

async function handleNoVotingAction(proposalIdentifier) {
    setDone(false)
    let finished
    try{
      finished = await contract.submitVote({
        pI: proposalIdentifier,
        vote: 'no'
        }, process.env.DEFAULT_GAS_VALUE)
          try{
          let proposal = await contract.getProposal({proposalId: parseInt(proposalIdentifier)})
          console.log('proposal in no vote', proposal)
          let updated = await proposalEvent.recordEvent(
            proposal.pI, proposal.a, proposal.p, proposal.s, proposal.sR, proposal.lR, proposal.tO, proposal.tT, proposal.pR, proposal.pT, 
            proposal.sP, proposal.yV, proposal.nV, proposal.f, proposal.mT, proposal.pS, proposal.vP, proposal.gP, proposal.voteFinalized)
          
          let member = await contract.getMemberInfo({member: accountId})
          console.log('member from no vote', member)
          let memberUpdated = await memberEvent.updateMemberEvent(
          member[0].delegateKey, member[0].shares, member[0].loot, member[0].existing, member[0].highestIndexYesVote, member[0].jailed, member[0].joined, member[0].updated)
          
            if(updated && memberUpdated){
              handleSuccessMessage('Successfully voted.', 'success')
              handleSnackBarOpen(true)
            } else {
              handleErrorMessage('There was a problem with voting.', 'error')
              handleSnackBarOpen(true)
            }
          } catch (err) {
            console.log('problem recording the vote event', err)
            handleErrorMessage('There was a problem with voting.', 'error')
            handleSnackBarOpen(true)
          }
      } catch (err) {
        console.log('problem with vote', err)
        handleErrorMessage('There was a problem with voting.', 'error')
        handleSnackBarOpen(true)
      }
      if(finished) {
        setDone(true)
        await handleProposalEventChange()
        await handleEscrowBalanceChanges()
        await handleGuildBalanceChanges()
      }
}

  function getStatus(flags) {
    // flags [sponsored, processed, didPass, cancelled, whitelist, guildkick, member]
    let status = ''
    if(!flags[0] && !flags[1] && !flags[2] && !flags[3]) {
    status = 'Submitted'
    }
    if(flags[0] && !flags[1] && !flags[2] && !flags[3]) {
    status = 'Sponsored'
    }
    if(flags[0] && flags[1] && !flags[2] && !flags[3]) {
    status = 'Processed'
    }
    if(flags[0] && flags[1] && flags[2] && !flags[3]) {
    status = 'Passed'
    }
    if(flags[0] && flags[1] && !flags[2] && !flags[3]) {
    status = 'Not Passed'
    }
    if(flags[3]) {
    status = 'Cancelled'
    }
    return status
  }

  function getProposalType(flags) {
    // flags [sponsored, processed, didPass, cancelled, whitelist, guildkick, member]
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
    if(!flags[4] && !flags[5] && !flags[6]) {
    type = 'Funding'
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

  function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
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
            requestId: parseInt(fr._id), 
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
            requestId: parseInt(fr._id), 
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

        if(status == 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled' && currentPeriod > parseInt(fr.startingPeriod) && isVotingPeriod == false && isGracePeriod == false){
        
          queueProposals.push({
            blockTimeStamp: fr.proposalSubmission,
            date: makeTime(fr.proposalSubmission),
            applicant: fr.applicant, 
            proposer: fr.proposer,
            sponsor: fr.sponsor,
            requestId: parseInt(fr._id),
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
            requestId: parseInt(fr._id), 
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
    // process queued proposals
    if(propObject.queueProposals && propObject.queueProposals.length > 0){
      console.log('queue', propObject.queueProposals)
      for(let i=0; i < propObject.queueProposals.length; i++) {
        try{
          if(propObject.queueProposals[i].status !== 'Processed' && propObject.queueProposals[i].status !== 'Passed' && propObject.queueProposals[i].status !== 'Not Passed'){
          await handleProcessAction(propObject.queueProposals[i].requestId, propObject.queueProposals[i].proposalType)
          }
        } catch (err) {
          console.log(err)
        }
     }
    }
    return propObject
  }

  let Members
  if (allMemberInfo && allMemberInfo.length > 0 && tabValue == '1') {
    Members = allMemberInfo.map((fr, i) => {
      return (
        <MemberCard 
          key={fr._id}
          name={fr.delegateKey}
          shares={fr.shares}
          memberCount={memberCount}
          joined={makeTime(parseInt(fr.joined))}
        />
      )
    })
  }

  let Proposals
  if (proposalList && proposalList.length > 0 && tabValue == '2') {
    Proposals = proposalList.map((fr) => {
      return (
        <ProposalCard
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
          cancelFinish={cancelFinish}
          tributeToken={tributeToken}
          currentPeriod={currentPeriod}
          handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
        />
      )
    })
  }

  let Votes
  if (votingList && votingList.length > 0 && tabValue == '3') {
   Votes = votingList.map((fr) => {
      return (
        <ProposalCard 
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
          handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          handleYesVotingAction={handleYesVotingAction}
          handleNoVotingAction={handleNoVotingAction}
          handleRageQuitClick={handleRageQuitClick}
        />
      )
    })
  }

  let Processed
  if (processedList && processedList.length > 0 && tabValue == '4') {
    Processed = processedList.map((fr) => {
      return (
        <ProposalCard 
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
          accountId={accountId}
          handleMemberProposalDetailsClick={handleMemberProposalDetailsClick}
          handleFundingProposalDetailsClick={handleFundingProposalDetailsClick}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
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
        textColor="secondary"
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
          label="NEW PROPOSALS" 
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
            <StyledBadge badgeContent={processedCount} color="primary">
              <AssignmentTurnedInIcon fontSize='large'/>
            </StyledBadge>
          }
          label="COMPLETE" 
          value="4"
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
        {Processed}
      </TabPanel>
    </TabContext>

       
    <Snackbar open={snackBarOpen} autoHideDuration={4000} onClose={snackBarHandleClose}>
    <Alert onClose={snackBarHandleClose} severity={severity}>
      {severity=='success' ? successMessage : errorMessage}
    </Alert>
    </Snackbar>

    
    {memberProposalDetailsEmptyClicked ? <MemberProposalForm
      contract={contract}
      memberProposalId={memberProposalId}
      memberProposalType={memberProposalType}
      status={memberProposalStatus}
      accountId={accountId}
      handleProposalDetailsEmptyClickState={handleMemberProposalDetailsEmptyClickState}  
      handleTabValueState={handleTabValueState}/> : null }
    
    {memberProposalDetailsClicked ? <MemberProposalDetails
      contract={contract}
      memberStatus={memberStatus}
      memberProposalType={memberProposalType}
      memberProposalId={memberProposalId}
      accountId={accountId}
      status={memberProposalStatus}
      proposalComments={proposalComments}
      handleProposalDetailsClickState={handleMemberProposalDetailsClickState}  
      handleTabValueState={handleTabValueState}/> : null }
  
    {fundingProposalDetailsEmptyClicked ? <FundingProposalForm
      contract={contract}
      fundingProposalId={fundingProposalId}
      status={fundingProposalStatus}
      accountId={accountId}
      handleProposalDetailsEmptyClickState={handleFundingProposalDetailsEmptyClickState}  
      handleTabValueState={handleTabValueState}/> : null }
  
    {fundingProposalDetailsClicked ? <FundingProposalDetails
      contract={contract}
      memberStatus={memberStatus}
      fundingProposalId={fundingProposalId}
      proposalComments={proposalComments}
      status={fundingProposalStatus}
      accountId={accountId}
      handleProposalDetailsClickState={handleFundingProposalDetailsClickState}  
      handleTabValueState={handleTabValueState}/> : null }

    {sponsorConfirmationClicked ? <SponsorConfirmation
      contract={contract} 
      handleProposalEventChange={handleProposalEventChange}
      handleGuildBalanceChanges={handleGuildBalanceChanges}
      handleEscrowBalanceChanges={handleEscrowBalanceChanges}
      handleSponsorConfirmationClickState={handleSponsorConfirmationClickState} 
      handleTabValueState={handleTabValueState} 
      accountId={accountId} 
      depositToken={depositToken}
      getCurrentPeriod={getCurrentPeriod}
      proposalIdentifier={proposalIdentifier}
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