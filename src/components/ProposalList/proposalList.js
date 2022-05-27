import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app';
import { cancelProposal, 
  processProposal, 
  submitVote,
  synchMember, 
  getStatus,
  getProposalType, PROPOSAL_NOTIFICATION} from '../../state/near'
import {get, set, del} from '../../utils/storage'
import Fuse from 'fuse.js'

import MemberCard from '../Cards/MemberCard/memberCard'
import MemberProposalCard from '../ProposalCards/memberProposalCard'
import FundingProposalCard from '../ProposalCards/fundingProposalCard'
import CancelCommitmentProposalCard from '../ProposalCards/cancelCommitmentProposalCard';
import ConfigurationProposalCard from '../ProposalCards/configurationProposalCard';
import GuildKickProposalCard from '../ProposalCards/guildKickProposalCard'
import OpportunityProposalCard from '../ProposalCards/opportunityProposalCard'
import PayoutProposalCard from '../ProposalCards/payoutProposalCard'
import WhitelistProposalCard from '../ProposalCards/whitelistProposalCard'
import TributeProposalCard from '../ProposalCards/tributeProposalCard'

import SponsorConfirmation from '../Confirmation/sponsorConfirmation'
import RageQuit from '../RageQuit/rageQuit'
import SearchBar from '../../components/common/SearchBar/search'
import { Steps, Hints } from "intro.js-react"

// Material UI Components
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Tabs from '@material-ui/core/Tabs'
import Typography from '@material-ui/core/Typography'
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
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Switch from '@material-ui/core/Switch'
import { LinearProgress } from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    marginBottom: '5px',
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

  const { state, dispatch, update } = useContext(appStore);

  const {
    didRegistryContract,
    appIdx,
    curUserIdx,
    accountId,
    wallet,
    isUpdated,
    summoner,
    periodDuration,
    curDaoIdx,
    contract,
    proposalDeposit,
    votingPeriodLength,
    gracePeriodLength,
    depositToken,
    currentPeriod,
    totalShares,
    totalMembers,
    escrowBalance,
    guildBalance,
    memberStatus
  } = state

  const {
    returnFunction,
    enable,
    proposalEvents,
    allMemberInfo,
    currentMemberInfo,
    remainingDelegates,
    tabValue,
    handleTabValueState,
    getCurrentPeriod,
    notificationIndicator
  } = props

  const {
    contractId
  } = useParams()

  const [proposalList, setProposalList] = useState([])
  const [votingList, setVotingList] = useState([])
  const [queueList, setQueueList] = useState([])
  const [processedList, setProcessedList] = useState([])

  const [proposalCount, setProposalCount] = useState(0)
  const [voteCount, setVoteCount] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)
  const [queueCount, setQueueCount] = useState(0)
 
  const [sponsorConfirmationClicked, setSponsorConfirmationClicked] = useState(false)
  const [proposalIdentifier, setProposalIdentifier] = useState()
  const [expanded, setExpanded] = useState(false)
  const [rageQuitClicked, setRageQuitClicked] = useState(false)
  
  const [cancelFinish, setCancelFinish] = useState(true)
  const [processFinish, setProcessFinish] = useState(true)
  const [voteFinish, setVoteFinish] = useState(true)

  const [sponsorProposalType, setSponsorProposalType] = useState()
  const [paymentRequested, setPaymentRequested] = useState()
  const [membersArray, setMembersArray] = useState([])
  const [stepsEnabled, setStepsEnabled] = useState(false)
  
  const [onlyFundingCommitmentProposals, setOnlyFundingCommitmentProposals] = useState(true)
  const [onlyPayoutProposals, setOnlyPayoutProposals] = useState(true)
  const [onlyCancelCommitmentProposals, setOnlyCancelCommitmentProposals] = useState(true)
  const [onlyMemberProposals, setOnlyMemberProposals] = useState(true)
  const [onlyOpportunityProposals, setOnlyOpportunityProposals] = useState(true)
  const [onlyWhiteListProposals, setOnlyWhiteListProposals] = useState(true)
  const [onlyGuildKickProposals, setOnlyGuildKickProposals] = useState(true)
  const [onlyTributeProposals, setOnlyTributeProposals] = useState(true)
  const [onlyConfigurationProposals, setOnlyConfigurationProposals] = useState(true)
  const [onlyReputationFactorProposals, setOnlyReputationFactorProposals] = useState(true)
  const [onlyAssignRoleProposals, setOnlyAssignRoleProposals] = useState(true)
  const [onlyCommunityRoleProposals, setOnlyCommunityRoleProposals] = useState(true)
  const [onlyYourProposals, setOnlyYourProposals] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const classes = useStyles()
  const theme = useTheme()
  const matches = useMediaQuery('(max-width:500px)')


  useEffect(() => {

    if(allMemberInfo && allMemberInfo.length > 0){
      let members = _.sortBy(allMemberInfo, 'joined')
      setMembersArray(members)
    }
  
    async function fetchData() {
      if(isUpdated){}
      if(curDaoIdx && currentPeriod){
      
        let newLists = await resolveStatus(proposalEvents)
        console.log('proposalevents', proposalEvents)
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
      
    }

    if(notificationIndicator){
      handleNotificationArrival()
    }

    let mounted = true
     
      if(mounted){
        fetchData()
            .then((res) => {
             setLoaded(true)
            })
      return () => mounted = false
      }
    
   // }

  },[proposalEvents, allMemberInfo, notificationIndicator, isUpdated, curDaoIdx, currentPeriod])

  const handleTabChange = (event, newValue) => {
      if(newValue == '5'){
        setOnlyYourProposals(true)
      }
      handleTabValueState(newValue)
  }

  function handleExpanded() {
    setExpanded(!expanded)
  }

  const handleOnlyMemberProposalChange = (event) => {
    setOnlyMemberProposals(event.target.checked)
  }

  const handleOnlyFundingCommitmentProposalChange = (event) => {
    setOnlyFundingCommitmentProposals(event.target.checked)
  }

  const handleOnlyPayoutProposalChange = (event) => {
    setOnlyPayoutProposals(event.target.checked)
  }

  const handleOnlyCancelCommitmentProposalChange = (event) => {
    setOnlyCancelCommitmentProposals(event.target.checked)
  }

  const handleOnlyConfigurationProposalChange = (event) => {
    setOnlyConfigurationProposals(event.target.checked)
  }

  const handleNotificationArrival = () => {
    let notificationFlag = get(PROPOSAL_NOTIFICATION, [])
    if(notificationFlag[0]){
      handleTabChange(null, '2')
     }
  }

  const handleOnlyTributeProposalChange = (event) => {
    setOnlyTributeProposals(event.target.checked)
  }

  const handleOnlyCommunityRoleProposalChange = (event) => {
    setOnlyCommunityRoleProposals(event.target.checked)
  }

  const handleOnlyAssignRoleProposalChange = (event) => {
    setOnlyAssignRoleProposals(event.target.checked)
  }

  const handleOnlyWhitelistProposalChange = (event) => {
    setOnlyWhiteListProposals(event.target.checked)
  }

  const handleOnlyGuildKickProposalChange = (event) => {
    setOnlyGuildKickProposals(event.target.checked)
  }

  const handleOnlyReputationFactorProposalChange = (event) => {
    setOnlyReputationFactorProposals(event.target.checked)
  }

  const handleOnlyOpportunityProposalChange = (event) => {
    setOnlyOpportunityProposals(event.target.checked)
  }

  const handleOnlyYourProposalChange = (event) => {
    setOnlyYourProposals(event.target.checked)
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

  async function handleCancelAction(proposalId, loot, tribute) {
    setCancelFinish(false)
    try{
      await cancelProposal(contract, contractId, proposalId, loot, tribute)
    } catch (err) {
      console.log('problem cancelling proposal', err)
    }
  }

  async function handleProcessAction(proposalId, proposalType, applicant) {
    setProcessFinish(false)
    try{
      await processProposal(contract, contractId, proposalId, proposalType, curDaoIdx, applicant) 
    } catch (err) {
        console.log('problem processing proposal', err)
    }
  }

  async function handleVotingAction(proposalId, vote) {
    setVoteFinish(false)
    try{
      await submitVote(contract, contractId, proposalId, vote)
    } catch (err) {
      console.log('problem with vote', err)
    }
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

  
function typeFilter(item){

  if(onlyYourProposals){
    if(item[0].proposalType == 'Member' && onlyMemberProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'Payout' && onlyPayoutProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'CancelCommit' && onlyCancelCommitmentProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'Commitment' && onlyFundingCommitmentProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'Opportunity' && onlyOpportunityProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'Tribute' && onlyTributeProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'Whitelist' && onlyWhiteListProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'GuildKick' && onlyGuildKickProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'CommunityRole' && onlyCommunityRoleProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'AssignRole' && onlyAssignRoleProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'ReputationFactor' && onlyReputationFactorProposals && item[0].applicant == accountId) return true
    if(item[0].proposalType == 'Configuration' && onlyConfigurationProposals && item[0].applicant == accountId) return true
    return false
  } else {
    if(item[0].proposalType == 'Member' && onlyMemberProposals) return true
    if(item[0].proposalType == 'Payout' && onlyPayoutProposals) return true
    if(item[0].proposalType == 'CancelCommit' && onlyCancelCommitmentProposals) return true
    if(item[0].proposalType == 'Commitment' && onlyFundingCommitmentProposals) return true
    if(item[0].proposalType == 'Opportunity' && onlyOpportunityProposals) return true
    if(item[0].proposalType == 'Tribute' && onlyTributeProposals) return true
    if(item[0].proposalType == 'Whitelist' && onlyWhiteListProposals) return true
    if(item[0].proposalType == 'GuildKick' && onlyGuildKickProposals) return true
    if(item[0].proposalType == 'CommunityRole' && onlyCommunityRoleProposals) return true
    if(item[0].proposalType == 'AssignRole' && onlyAssignRoleProposals) return true
    if(item[0].proposalType == 'ReputationFactor' && onlyReputationFactorProposals) return true
    if(item[0].proposalType == 'Configuration' && onlyConfigurationProposals) return true
    return false
  }
  
}

function getVotingPeriod(votePeriod, grPeriod, finalized) {
  if(!finalized){
    if((currentPeriod >= votePeriod && currentPeriod < grPeriod)){
      return true
    }  else {
      return false
    }
  } else {
    return false
  }
}

function getGracePeriod(grPeriod) {
  if(currentPeriod >= grPeriod && currentPeriod <= (grPeriod + gracePeriodLength)){
    return true
  } else {
    return false
  }
}

function getAfterVoting(grPeriod){
  if(currentPeriod > grPeriod){
    return true
  }
  return false
}

  async function resolveStatus(requests) {
    
    let status
    let proposalType
    let allProposals = []
    let votingProposals = []
    let queueProposals = []
    let processedProposals = []

    let streamProposals = await curDaoIdx.get('proposals', curDaoIdx.id)
   
    if (requests.length > 0) {
      requests.map((fr) => {
       
       console.log('fr', fr)
      
        let i = 0
        let currentStreamProposal
        while (i < streamProposals.events.length){
          if (streamProposals.events[i].proposalId == fr.proposalId){
            currentStreamProposal = streamProposals.events[i]
            break
          }
        i++
        }
      
        proposalType = getProposalType(fr.flags)

        let isFinalized = fr.voteFinalized != 0 ? true : false
        let isVotingPeriod = getVotingPeriod(fr.votingPeriod, fr.gracePeriod, isFinalized)
        let isGracePeriod = getGracePeriod(fr.gracePeriod, isFinalized)
        let disabled = isVotingPeriod ? false : true
        let afterVoting = getAfterVoting(fr.gracePeriod)
        status = getStatus(fr.flags, isFinalized, isVotingPeriod, isGracePeriod, afterVoting)
        console.log('proposal status', status)
        
        let finalizedProposal = {
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
          disabled: disabled,
          vote: fr.vote,
          referenceIds: fr.referenceIds,
          configuration: fr.configuration,
          roleConfiguation: fr.roleConfiguation,
          reputationConfiguration: fr.reputationConfiguration,
          roles: fr.roleNames,
          isFinalized: isFinalized,
          memberRoleConfiguration: fr.memberRoleConfiguration,
          submitTransactionHash: currentStreamProposal && currentStreamProposal.submitTransactionHash ? currentStreamProposal.submitTransactionHash : '',
          cancelTransactionHash: currentStreamProposal && currentStreamProposal.cancelTransactionHash ? currentStreamProposal.cancelTransactionHash : '',
          processTransactionHash: currentStreamProposal && currentStreamProposal.processTransactionHash ? currentStreamProposal.processTransactionHash : '',
          sponsorTransactionHash: currentStreamProposal && currentStreamProposal.sponsorTransactionHash ? currentStreamProposal.sponsorTransactionHash : '',
          changeTransactionHash: currentStreamProposal && currentStreamProposal.changeTransactionHash ? currentStreamProposal.changeTransactionHash : '',
          functionName: fr.functionName,
          parameters: fr.parameters,
          tributeToken: fr.tributeToken
        }

        console.log('finalizedProposal', finalizedProposal)

        switch(true){
          case status == 'Submitted':
            allProposals.push([finalizedProposal])
            break
          case (status == 'Voting' || status == 'Grace'):
            votingProposals.push([finalizedProposal])
            break
          case status == 'Awaiting Finalization':
            queueProposals.push([finalizedProposal])
            break
          case (status == 'Passed' || status == 'Not Passed'):
            processedProposals.push([finalizedProposal])
            break
        }
      }) 
    }

    let propObject = {
      allProposals: allProposals,
      votingProposals: votingProposals,
      queueProposals: queueProposals,
      processedProposals: processedProposals
    }
    console.log('propObject', propObject)
    return propObject

  }
 
  
  let Members
  let Proposals
  let Votes
  let Queued
  let Processed
    switch(tabValue){
      case '1':
        if (membersArray && membersArray.length > 0){
          Members = membersArray.map((fr, i) => {
            return (
              <MemberCard 
                key={fr.memberId}
                accountName={fr.delegateKey}
                shares={fr.shares}
                loot={fr.loot}
                delegatedShares={fr.delegatedShares}
                receivedDelegations={fr.receivedDelegations}
                currentMemberInfo={currentMemberInfo}
                allMemberInfo={allMemberInfo}
                totalShares={totalShares}
                remainingDelegates={remainingDelegates} 
                joined={fr.joined}
              />
            )
          })
        }
        break
      case '2':
        if (proposalList && proposalList.length > 0){
          Proposals = proposalList.filter(typeFilter).reverse().map((fr) => {
            switch(fr[0].proposalType){
              case 'Member':
                return <MemberProposalCard 
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Commitment':
                return <FundingProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'CancelCommit':
                return <CancelCommitmentProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Configuration':
                return <ConfigurationProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'GuildKick':
                return <GuildKickProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Opportunity':
                return <OpportunityProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Payout':
                return <PayoutProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Whitelist':
                return <WhitelistProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Tribute':
                return <TributeProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              default:
                break
            }
          })
        }
        break
      case '3':
        if (votingList && votingList.length > 0){
          Votes = votingList.map((fr) => {
            switch(fr[0].proposalType){
              case 'Member':
                return <MemberProposalCard 
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Commitment':
                return <FundingProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'CancelCommit':
                return <CancelCommitmentProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Configuration':
                return <ConfigurationProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'GuildKick':
                return <GuildKickProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Opportunity':
                return <OpportunityProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Payout':
                return <PayoutProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Whitelist':
                return <WhitelistProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Tribute':
                return <TributeProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              default:
                break
            }
          })
        }
        break
      case '4':
        if (queueList && (Object.keys(queueList).length > 0 || queueList.length > 1)){
          Queued = queueList.map((fr) => {
            switch(fr[0].proposalType){
              case 'Member':
                return <MemberProposalCard 
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Commitment':
                return <FundingProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'CancelCommit':
                return <CancelCommitmentProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Configuration':
                return <ConfigurationProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'GuildKick':
                return <GuildKickProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Opportunity':
                return <OpportunityProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Payout':
                return <PayoutProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Whitelist':
                return <WhitelistProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Tribute':
                return <TributeProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              default:
                break
            }
          })
        }
        break
      case '5':
        if (processedList && processedList.length > 0){
          Processed = processedList.filter(typeFilter).map((fr) => {
            switch(fr[0].proposalType){
              case 'Member':
                return <MemberProposalCard 
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Commitment':
                return <FundingProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'CancelCommit':
                return <CancelCommitmentProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Configuration':
                return <ConfigurationProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'GuildKick':
                return <GuildKickProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Opportunity':
                return <OpportunityProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Payout':
                return <PayoutProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Whitelist':
                return <WhitelistProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              case 'Tribute':
                return <TributeProposalCard
                        allProps={fr[0]}
                        cancelFinish={cancelFinish}
                        voteFinish={voteFinish}
                        processFinish={processFinish}
                        queueList={queueList}
                        handleSponsorConfirmationClick={handleSponsorConfirmationClick}
                        handleCancelAction={handleCancelAction}
                        handleVotingAction={handleVotingAction}
                        handleProcessAction={handleProcessAction}
                        handleRageQuitClick={handleRageQuitClick}
                        />
                break
              default:
                break
            }
          })
        }
        break
      default:
        break
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
      
    }
  }

  const searchData = (pattern) => {
    if (!pattern) {
        let sortedData = _.sortBy(allMemberInfo, 'joined')
        setMembersArray(sortedData)
      
        return
    }
   
    
    const fuse = new Fuse(membersArray, {
        keys: ['delegateKey'],
        findAllMatches: true
    })
   

    const result = fuse.search(pattern)
    

    const matches = []
    if (!result.length) {
        setMembersArray([])
       
    } else {
        result.forEach(({item}) => {
            matches.push(item)
    })
  
        setMembersArray(matches)
       
    }
  }


  return (
    <>
   
    <Paper square className={classes.root}>
    {!matches && loaded && guildBalance && escrowBalance ? (
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        aria-label="icon label tabs example"
        variant="fullWidth"
      >
        <Tab 
          className='members'
          icon={     
            <StyledBadge badgeContent={totalMembers} color="primary" max={9999999}>
              <PeopleAltIcon fontSize='large'/>
            </StyledBadge>
          } 
          label="MEMBERS" 
          value="1"
        />
        <Tab 
          className='proposals'
          icon={
            <StyledBadge badgeContent={proposalCount} color="primary" max={9999999}>
              <ListAltIcon fontSize='large'/>
            </StyledBadge>
          } 
          label="PROPOSALS" 
          value="2"
        />
        <Tab 
          className='voting'
          icon={
            <StyledBadge badgeContent={voteCount} color="primary" max={9999999}>
              <HowToVoteIcon fontSize='large'/>
            </StyledBadge>
          } 
          label="VOTING" 
          value="3"
        />
        <Tab 
          className='finalization'
          icon={
            <StyledBadge badgeContent={queueCount} color="primary" max={9999999}>
              <QueueIcon fontSize='large'/>
            </StyledBadge>
          } 
          label="PROCESSING" 
          value="4"
        />
        <Tab
          className='processed'
          icon={
            <StyledBadge badgeContent={processedCount} color="primary" max={9999999}>
              <AssignmentTurnedInIcon fontSize='large'/>
            </StyledBadge>
          }
          label="COMPLETE" 
          value="5"
        />
        </Tabs>
      ) : <LinearProgress /> }
      {matches && loaded && guildBalance && escrowBalance ? (
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
            <StyledBadge badgeContent={totalMembers} color="primary" max={9999999}>
              <PeopleAltIcon fontSize='small'/>
            </StyledBadge>
          } 
          label="MEMBERS" 
          value="1"
        />
        <Tab 
          icon={
            <StyledBadge badgeContent={proposalCount} color="primary" max={9999999}>
              <ListAltIcon fontSize='small'/>
            </StyledBadge>
          } 
          label="PROPOSALS" 
          value="2"
        />
        <Tab 
          icon={
            <StyledBadge badgeContent={voteCount} color="primary" max={9999999}>
              <HowToVoteIcon fontSize='small'/>
            </StyledBadge>
          } 
          label="VOTING" 
          value="3"
        />
        <Tab 
          icon={
            <StyledBadge badgeContent={queueCount} color="primary" max={9999999}>
              <QueueIcon fontSize='small'/>
            </StyledBadge>
          } 
          label="PROCESSING" 
          value="4"
        />
        <Tab
          icon={
            <StyledBadge badgeContent={processedCount} color="primary" max={9999999}>
              <AssignmentTurnedInIcon fontSize='small'/>
            </StyledBadge>
          }
          label="COMPLETE" 
          value="5"
        />
      </Tabs>
      ) : <LinearProgress />}
     
    </Paper>
    <TabContext value={tabValue}>
    {loaded ?
      <>
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
             {Members}
          </Grid>
      </>)
      : null
      } 
  </Grid>
      
      </TabPanel>
      <TabPanel value="2" className={classes.root}>
      <Grid container spacing={1} justifyContent="flex-start" alignItems="center">
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <FormControl component="fieldset" >
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography variant="overline">Filter Proposals</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} style={{marginBottom: '5px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <FormGroup>
                  <FormHelperText>Choose the proposal types you want.</FormHelperText>
                  <FormControlLabel
                    control={<Switch checked={onlyYourProposals} onChange={handleOnlyYourProposalChange} name="onlyYourProposals" />}
                    label="Only Your Proposals"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyMemberProposals} onChange={handleOnlyMemberProposalChange} name="onlyMemberProposals" />}
                    label="Members"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyFundingCommitmentProposals} onChange={handleOnlyFundingCommitmentProposalChange} name="onlyFundingCommitmentProposals" />}
                    label="Funding Commitments"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyPayoutProposals} onChange={handleOnlyPayoutProposalChange} name="onlyPayoutProposals" />}
                    label="Payouts"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyOpportunityProposals} onChange={handleOnlyOpportunityProposalChange} name="onlyOpportunityProposals" />}
                    label="Opportunities"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyConfigurationProposals} onChange={handleOnlyConfigurationProposalChange} name="onlyConfigurationProposals" />}
                    label="Configuration"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyTributeProposals} onChange={handleOnlyTributeProposalChange} name="onlyTributeProposals" />}
                    label="Contributions"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyCommunityRoleProposals} onChange={handleOnlyCommunityRoleProposalChange} name="onlyCommunityRoleProposals" />}
                    label="Community Role"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyAssignRoleProposals} onChange={handleOnlyAssignRoleProposalChange} name="onlyAssignRoleProposals" />}
                    label="Assign Role"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyReputationFactorProposals} onChange={handleOnlyReputationFactorProposalChange} name="onlyReputationFactorProposals" />}
                    label="Reputation Factor"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyWhiteListProposals} onChange={handleOnlyWhitelistProposalChange} name="onlyWhiteListProposals" />}
                    label="Whitelist"
                  />
                  <FormControlLabel
                    control={<Switch checked={onlyGuildKickProposals} onChange={handleOnlyGuildKickProposalChange} name="onlyGuildKickProposals" />}
                    label="GuildKick"
                  /> 
                  <FormControlLabel
                    control={<Switch checked={onlyCancelCommitmentProposals} onChange={handleOnlyCancelCommitmentProposalChange} name="onlyCancelCommitmentProposals" />}
                    label="Cancel Commitments"
                  />
                </FormGroup>
                </Grid>
              </Grid>
            </AccordionDetails>
        </Accordion>
          
        </FormControl>
        </Grid>
        {onlyYourProposals ?
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <Typography variant="overline">Your Proposals</Typography>
          </Grid>
          : 
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <Typography variant="overline">All Proposals</Typography>
          </Grid>
          }
          {Proposals}
        
      </Grid>
      </TabPanel>
      <TabPanel value="3" className={classes.root}>
        {Votes}
      </TabPanel>
      <TabPanel value="4" className={classes.root}>
        {Queued}
      </TabPanel>
      <TabPanel value="5" className={classes.root}>
      <Grid container spacing={1} justifyContent="flex-start" alignItems="center">
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <FormControl component="fieldset" >
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography variant="overline">Filter Proposals</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} style={{marginBottom: '5px'}}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <FormGroup>
                    <FormHelperText>Choose the proposal types you want.</FormHelperText>
                    <FormControlLabel
                      control={<Switch checked={onlyYourProposals} onChange={handleOnlyYourProposalChange} name="onlyYourProposals" />}
                      label="Only Your Proposals"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyMemberProposals} onChange={handleOnlyMemberProposalChange} name="onlyMemberProposals" />}
                      label="Members"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyFundingCommitmentProposals} onChange={handleOnlyFundingCommitmentProposalChange} name="onlyFundingCommitmentProposals" />}
                      label="Funding Commitments"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyPayoutProposals} onChange={handleOnlyPayoutProposalChange} name="onlyPayoutProposals" />}
                      label="Payouts"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyOpportunityProposals} onChange={handleOnlyOpportunityProposalChange} name="onlyOpportunityProposals" />}
                      label="Opportunities"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyConfigurationProposals} onChange={handleOnlyConfigurationProposalChange} name="onlyConfigurationProposals" />}
                      label="Configuration"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyTributeProposals} onChange={handleOnlyTributeProposalChange} name="onlyTributeProposals" />}
                      label="Contributions"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyCommunityRoleProposals} onChange={handleOnlyCommunityRoleProposalChange} name="onlyCommunityRoleProposals" />}
                      label="Community Role"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyAssignRoleProposals} onChange={handleOnlyAssignRoleProposalChange} name="onlyAssignRoleProposals" />}
                      label="Assign Role"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyReputationFactorProposals} onChange={handleOnlyReputationFactorProposalChange} name="onlyReputationFactorProposals" />}
                      label="Reputation Factor"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyWhiteListProposals} onChange={handleOnlyWhitelistProposalChange} name="onlyWhiteListProposals" />}
                      label="Whitelist"
                    />
                    <FormControlLabel
                      control={<Switch checked={onlyGuildKickProposals} onChange={handleOnlyGuildKickProposalChange} name="onlyGuildKickProposals" />}
                      label="GuildKick"
                    /> 
                    <FormControlLabel
                      control={<Switch checked={onlyCancelCommitmentProposals} onChange={handleOnlyCancelCommitmentProposalChange} name="onlyCancelCommitmentProposals" />}
                      label="Cancel Commitments"
                    />
                  </FormGroup>
                  </Grid>
                </Grid>
              </AccordionDetails>
          </Accordion>
        
          </FormControl>
        </Grid>
        {onlyYourProposals ?
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Typography variant="overline">Your Completed Proposals</Typography>
        </Grid>
        : 
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Typography variant="overline">All Completed Proposals</Typography>
        </Grid>
        }
          {Processed}
     
      </Grid>
      </TabPanel>
      </>
      : <div style={{margin: 'auto', width:'200px', marginTop:'20px'}}>
          <CircularProgress />
      </div>}
    </TabContext>
 
    {sponsorConfirmationClicked ? <SponsorConfirmation
      contract={contract}
      contractId={contractId}
      curDaoIdx={curDaoIdx}
      handleSponsorConfirmationClickState={handleSponsorConfirmationClickState} 
      depositToken={depositToken}
      proposalIdentifier={proposalIdentifier}
      proposalDeposit={proposalDeposit}/> : null }
    
    {rageQuitClicked ? <RageQuit
      state={state}
      contractId={contractId}
      depositToken={depositToken}
      contract={contract}
      handleRageQuitClickState={handleRageQuitClickState}
      accountId={accountId}
      /> : null }

    </>
  )
}