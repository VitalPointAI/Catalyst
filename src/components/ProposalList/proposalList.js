import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { cancelProposal, 
  processProposal, 
  submitVote,
  synchMember, 
  getStatus,
  getProposalType, PROPOSAL_NOTIFICATION} from '../../state/near'
import {get, set, del} from '../../utils/storage'
import Fuse from 'fuse.js'
import MemberCard from '../MemberCard/memberCard'
import ProposalCard from '../ProposalCard/proposalCard'
import SponsorConfirmation from '../Confirmation/sponsorConfirmation'
import RageQuit from '../RageQuit/rageQuit'
import SearchBar from '../../components/common/SearchBar/search'
import { Steps, Hints } from "intro.js-react";
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
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';
import { LinearProgress } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress'

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
  const [avatar, setAvatar] = useState()
  const [name, setName] = useState()
  const [intro, setIntro] = useState('')

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
  const [stepsEnabled, setStepsEnabled] = useState(false)
  const [options, setOptions] = useState( {
    doneLabel: 'Finish',                                
    showButtons: true,
    overlayOpacity: 0.5,
    scrollTo: 'element',
    skipLabel: "Skip",
    showProgress: true
  })
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

  const { state, dispatch, update } = useContext(appStore);

  const {
    didRegistryContract,
    appIdx,
    accountId,
    wallet
  } = state

  const {
    returnFunction, 
    enable, 
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
    guildBalance,
    remainingDelegates,
    votingPeriodLength,
    gracePeriodLength,
    escrowBalance,
    totalMembers,

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
    appClient,

    notificationIndicator
  } = props

  useEffect(() => {
    setStepsEnabled(enable)

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
      let didVote = false
      
      while (i < proposalEvents.length) {
      
          try{
            result = await getUserVote(proposalEvents[i].proposalId)
           
            proposalEvents[i].vote = result
            if (result == 'yes' || result == 'no'){
              didVote = true
            } else {
              didVote = false
            }
          } catch (err) {
            console.log('problem getting user vote', err)
            didVote = false
          }
    
        
       
        proposalEvents[i].voted = didVote
        i++
      }
      currentPeriod
      if(curDaoIdx){
      
        let newLists = await resolveStatus(proposalEvents)
     
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

  },[proposalEvents, allMemberInfo, notificationIndicator, currentPeriod, curDaoIdx, enable])

  const handleTabChange = (event, newValue) => {
      handleTabValueState(newValue);
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

  async function handleProcessAction(proposalId, proposalType, applicant) {
    setProcessFinish(false)
    try{
      await processProposal(contract, contractId, proposalId, proposalType, curDaoIdx, applicant) 
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

  function getVotingPeriod(startPeriod, votePeriod, grPeriod, isFinalized) {
       if((currentPeriod >= votePeriod && currentPeriod < grPeriod)){
      return true
    }  else {
      return false
    }
  }

  function getGracePeriod(grPeriod, isFinalized) {
    if(currentPeriod >= grPeriod && currentPeriod <= (grPeriod + gracePeriodLength)){
      return true
    } else {
      return false
    }
     return gracePeriod
  }

  async function getUserVote(proposalIdentifier) {
    let result = await contract.getMemberProposalVote({memberAddress: accountId, proposalId: parseInt(proposalIdentifier)})
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
       
        status = getStatus(fr.flags)
      
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
        let isVotingPeriod = getVotingPeriod(fr.startingPeriod, fr.votingPeriod, fr.gracePeriod, isFinalized)
      
        let isGracePeriod = getGracePeriod(fr.gracePeriod, isFinalized)
      

        if (status != 'Passed' || status != 'Not Passed'){
      
          if ((status == 'Sponsored' && isFinalized && !isVotingPeriod && !isGracePeriod) || (status=='Sponsored' && currentPeriod > (fr.gracePeriod + gracePeriodLength))){
            status = 'Awaiting Finalization'
          }
        }
      
        
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
          }])
        }

   //     if(status == 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled' && (isVotingPeriod==true || isGracePeriod==true)){
        if(status == 'Sponsored'){
        
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
            isFinalized: isFinalized,
            disabled: isDisabled,
            voted: fr.voted,
            vote: fr.vote,
            referenceIds: fr.referenceIds,
            configuration: fr.configuration,
            roleConfiguation: fr.roleConfiguation,
            reputationConfiguration: fr.reputationConfiguration,
            roles: fr.roleNames,
            memberRoleConfiguration: fr.memberRoleConfiguration,
            submitTransactionHash: currentStreamProposal && currentStreamProposal.submitTransactionHash ? currentStreamProposal.submitTransactionHash : '',
            cancelTransactionHash: currentStreamProposal && currentStreamProposal.cancelTransactionHash ? currentStreamProposal.cancelTransactionHash : '',
            processTransactionHash: currentStreamProposal && currentStreamProposal.processTransactionHash ? currentStreamProposal.processTransactionHash : '',
            sponsorTransactionHash: currentStreamProposal && currentStreamProposal.sponsorTransactionHash ? currentStreamProposal.sponsorTransactionHash : '',
            changeTransactionHash: currentStreamProposal && currentStreamProposal.changeTransactionHash ? currentStreamProposal.changeTransactionHash : '',
            functionName: fr.functionName,
            parameters: fr.parameters,
            tributeToken: fr.tributeToken
          }])
        }

    //    if(status == 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled' && currentPeriod > parseInt(fr.gracePeriod) && !isVotingPeriod && !isGracePeriod){
       
        if(status == 'Awaiting Finalization'){
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
            isFinalized: isFinalized,
            disabled: isDisabled,
            voted: fr.voted,
            vote: fr.vote,
            referenceIds: fr.referenceIds,
            configuration: fr.configuration,
            roleConfiguation: fr.roleConfiguation,
            reputationConfiguration: fr.reputationConfiguration,
            roles: fr.roleNames,
            memberRoleConfiguration: fr.memberRoleConfiguration,
            submitTransactionHash: currentStreamProposal && currentStreamProposal.submitTransactionHash ? currentStreamProposal.submitTransactionHash : '',
            cancelTransactionHash: currentStreamProposal && currentStreamProposal.cancelTransactionHash ? currentStreamProposal.cancelTransactionHash : '',
            processTransactionHash: currentStreamProposal && currentStreamProposal.processTransactionHash ? currentStreamProposal.processTransactionHash : '',
            sponsorTransactionHash: currentStreamProposal && currentStreamProposal.sponsorTransactionHash ? currentStreamProposal.sponsorTransactionHash : '',
            changeTransactionHash: currentStreamProposal && currentStreamProposal.changeTransactionHash ? currentStreamProposal.changeTransactionHash : '',
            functionName: fr.functionName,
            parameters: fr.parameters,
            tributeToken: fr.tributeToken
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
            isFinalized: isFinalized,
            disabled: isDisabled,
            voted: fr.voted,
            vote: fr.vote,
            referenceIds: fr.referenceIds,
            configuration: fr.configuration,
            roleConfiguation: fr.roleConfiguation,
            reputationConfiguration: fr.reputationConfiguration,
            roles: fr.roleNames,
            memberRoleConfiguration: fr.memberRoleConfiguration,
            submitTransactionHash: currentStreamProposal && currentStreamProposal.submitTransactionHash ? currentStreamProposal.submitTransactionHash : '',
            cancelTransactionHash: currentStreamProposal && currentStreamProposal.cancelTransactionHash ? currentStreamProposal.cancelTransactionHash : '',
            processTransactionHash: currentStreamProposal && currentStreamProposal.processTransactionHash ? currentStreamProposal.processTransactionHash : '',
            sponsorTransactionHash: currentStreamProposal && currentStreamProposal.sponsorTransactionHash ? currentStreamProposal.sponsorTransactionHash : '',
            changeTransactionHash: currentStreamProposal && currentStreamProposal.changeTransactionHash ? currentStreamProposal.changeTransactionHash : '',
            functionName: fr.functionName,
            parameters: fr.parameters,
            tributeToken: fr.tributeToken
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
          loot={fr.loot}
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
          remainingDelegates={remainingDelegates}
          gracePeriodLength={gracePeriodLength}
          votingPeriodLength={votingPeriodLength}
          isFinalized={fr.isFinalized}
          totalMembers={totalMembers}
        />
      )
    })
  }

  let Proposals
  if (proposalList && proposalList.length > 0 && tabValue == '2') {
 
    Proposals = proposalList.filter(typeFilter).reverse().map((fr) => {
     
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
          vote={fr[0].vote}
          referenceIds={fr[0].referenceIds}
          startingPeriod={fr[0].startingPeriod}
          submitTransactionHash={fr[0].submitTransactionHash}
          cancelTransactionHash={fr[0].cancelTransactionHash}
          processTransactionHash={fr[0].processTransactionHash}
          sponsorTransactionHash={fr[0].sponsorTransactionHash}
          changeTransactionHash={fr[0].changeTransactionHash}
          configuration={fr[0].configuration}
          functionName={fr[0].functionName}
          parameters={fr[0].parameters}
          accountId={accountId}
          cancelFinish={cancelFinish}
          tributeToken={fr[0].tributeToken}
          currentPeriod={currentPeriod}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
          contract={contract}
          guildBalance={guildBalance}
          escrowBalance={escrowBalance}
          votingPeriod={fr[0].votingPeriod}
          gracePeriod={fr[0].gracePeriod}
          gracePeriodLength={gracePeriodLength}
          votingPeriodLength={votingPeriodLength}
          isFinalized={fr[0].isFinalized}
          totalMembers={totalMembers}
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
          vote={fr[0].vote}
          gracePeriod={fr[0].gracePeriod}
          votingPeriod={fr[0].votingPeriod}
          referenceIds={fr[0].referenceIds}
          functionName={fr[0].functionName}
          parameters={fr[0].parameters}
          currentPeriod={currentPeriod}
          periodDuration={periodDuration}
          submitTransactionHash={fr[0].submitTransactionHash}
          cancelTransactionHash={fr[0].cancelTransactionHash}
          processTransactionHash={fr[0].processTransactionHash}
          sponsorTransactionHash={fr[0].sponsorTransactionHash}
          changeTransactionHash={fr[0].changeTransactionHash}
          done={done}
          configuration={fr[0].configuration}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          handleVotingAction={handleVotingAction}
          handleRageQuitClick={handleRageQuitClick}
          summoner={summoner} 
          contract={contract} 
          guildBalance={guildBalance}
          escrowBalance={escrowBalance}
          memberStatus={memberStatus}
          startingPeriod={fr[0].startingPeriod}
          gracePeriodLength={gracePeriodLength}
          votingPeriodLength={votingPeriodLength}
          isFinalized={fr.isFinalized}
          totalMembers={totalMembers}
          tributeToken={fr[0].tributeToken}
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
          vote={fr.vote}
          startingPeriod={fr.startingPeriod}
          currentPeriod={currentPeriod}
          gracePeriod={fr.gracePeriod}
          referenceIds={fr.referenceIds}
          submitTransactionHash={fr.submitTransactionHash}
          cancelTransactionHash={fr.cancelTransactionHash}
          processTransactionHash={fr.processTransactionHash}
          sponsorTransactionHash={fr.sponsorTransactionHash}
          changeTransactionHash={fr.changeTransactionHash}
          handleProcessAction={handleProcessAction}
          configuration={fr.configuration}
          functionName={fr.functionName}
          parameters={fr.parameters}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
          queueList={queueList}
          contract={contract}
          guildBalance={guildBalance}
          escrowBalance={escrowBalance}
          memberStatus={memberStatus}
          votingPeriod={fr.votingPeriod}
          gracePeriodLength={gracePeriodLength}
          votingPeriodLength={votingPeriodLength}
          isFinalized={fr.isFinalized}
          totalMembers={totalMembers}
          tributeToken={fr.tributeToken}
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
          vote={fr[0].vote}
          startingPeriod={fr[0].startingPeriod}
          configuration={fr[0].configuration}
          referenceIds={fr[0].referenceIds}
          functionName={fr[0].functionName}
          parameters={fr[0].parameters}
          submitTransactionHash={fr[0].submitTransactionHash}
          cancelTransactionHash={fr[0].cancelTransactionHash}
          processTransactionHash={fr[0].processTransactionHash}
          sponsorTransactionHash={fr[0].sponsorTransactionHash}
          changeTransactionHash={fr[0].changeTransactionHash}
          handleProcessAction={handleProcessAction}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
          contract={contract} 
          guildBalance={guildBalance}
          escrowBalance={escrowBalance}
          memberStatus={memberStatus}
          votingPeriod={fr[0].votingPeriod}
          gracePeriod={fr[0].gracePeriod}
          gracePeriodLength={gracePeriodLength}
          votingPeriodLength={votingPeriodLength}
          isFinalized={fr[0].isFinalized}
          totalMembers={totalMembers}
          tributeToken={fr[0].tributeToken}
        />
      )
    })
  }
}


  let Processed
  if (processedList && processedList.length > 0 && tabValue == '5') {
    Processed = processedList.filter(typeFilter).map((fr) => {
     
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
          vote={fr[0].vote}
          configuration={fr[0].configuration}
          referenceIds={fr[0].referenceIds}
          functionName={fr[0].functionName}
          parameters={fr[0].parameters}
          submitTransactionHash={fr[0].submitTransactionHash}
          cancelTransactionHash={fr[0].cancelTransactionHash}
          processTransactionHash={fr[0].processTransactionHash}
          sponsorTransactionHash={fr[0].sponsorTransactionHash}
          changeTransactionHash={fr[0].changeTransactionHash}
          handleSponsorConfirmationClick={handleSponsorConfirmationClick}
          handleCancelAction={handleCancelAction}
          summoner={summoner}
          contract={contract}
          guildBalance={guildBalance}
          escrowBalance={escrowBalance}
          memberStatus={memberStatus}
          startingPeriod={fr[0].startingPeriod}
          votingPeriod={fr[0].votingPeriod}
          gracePeriod={fr[0].gracePeriod}
          gracePeriodLength={gracePeriodLength}
          votingPeriodLength={votingPeriodLength}
          isFinalized={fr[0].isFinalized}
          totalMembers={totalMembers}
          tributeToken={fr[0].tributeToken}
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
  function onStepsComplete(){
    setStepsEnabled(false)
    returnFunction('propList')
    handleTabChange(null, '1')
  }
  function onStepsExit(){
    setStepsEnabled(false)
  }
  // let steps=[
  //   {
  //     element: '.members',
  //     intro: <>
  //            <Typography>The community page is split into several tabs. The first of which is this one: the members tab.</Typography>
  //           <br/>
  //            <Typography>Here you can find all the members in a community, sorted by their respective voting shares. Clicking on any member’s card will reveal their Persona details.</Typography>
  //           </>,
  //     position:'top'
  //   },
  //   {
  //     element: '.proposals',
  //     intro:<> 
  //           <Typography>The proposals tab is where all new proposals end up. Here you can add details to your proposals, and engage in discussion.</Typography>
  //           <br/>
  //           <Typography>Members can also sponsor proposals here to move them into voting. </Typography>
  //           </>,
  //     position:'top'
  //   },
  //   {
  //     element: '.voting',
  //     intro: <>
  //            <Typography>Once sponsored, proposals move to this tab.</Typography>
  //            <br/>
  //            <Typography>Here, community members can vote on the proposals to pass or fail.</Typography>
  //            </>,
  //     position:'top'
  //   },
  //   {
  //     element: '.finalization',
  //     intro: <Typography>Here proposals will sit as they wait for a user to click ‘Finalize,’ which records it on the NEAR blockchain.</Typography>,
  //     position:'bottom'
  //   },
  //   {
  //     element: '.processed',    
  //     intro: <Typography>This is the final destination of all proposals. Whether they pass or fail, proposals which have completed voting and finalization will appear under this tab. </Typography>,
  //     position:'bottom'
  //   },
  //   {
  //     intro: <Typography>You can find more information about the proposal life cycle <a href=''>here</a></Typography>
  //   }
  // ]

  function handleStepsChange(index){
    if(index==1){
      handleTabChange(null, '2')
    }
    else if(index==2){
      handleTabChange(null, '3')
    }
    else if(index==3){ 
      handleTabChange(null, '4')
    }
    else if(index==4){
      handleTabChange(null, '5')
    }
  }

  return (
    <>
    {/* <Steps 
      enabled={stepsEnabled}
      steps={steps}
      options={options}
      initialStep={0}
      onComplete = {()=>onStepsComplete()}
      onExit = {()=>onStepsExit()}
      onChange = {(index)=>handleStepsChange(index)}  
    / > */}
    <Paper square className={classes.root}>
    {!matches && loaded ? (
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
            <StyledBadge badgeContent={memberCount} color="primary" max={9999999}>
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
      {matches && loaded ? (
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
            <StyledBadge badgeContent={memberCount} color="primary" max={9999999}>
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
                    remainingDelegates={remainingDelegates}
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
      <Grid container spacing={1} justifyContent="flex-start" alignItems="center">
      <FormControl component="fieldset" >
          <FormLabel component="legend">Filter Proposals</FormLabel>
          <FormGroup>
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
              label="Tribute"
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
          <FormHelperText>Choose the proposal types you want.</FormHelperText>
        </FormControl>
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
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter Proposals</FormLabel>
          <FormGroup>
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
              label="Tribute"
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
          <FormHelperText>Choose the proposal types you want.</FormHelperText>
        </FormControl>
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