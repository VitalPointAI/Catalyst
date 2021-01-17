import React, { useState, useEffect } from 'react'
import { utils } from 'near-api-js'
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
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';

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
  const [sponsorConfirmationClicked, setSponsorConfirmationClicked] = useState(false)
  const [proposalIdentifier, setProposalIdentifier] = useState()
  const [expanded, setExpanded] = useState(false)
  const [rageQuitClicked, setRageQuitClicked] = useState(false)
  const [cancelFinish, setCancelFinish] = useState(true)
  const [sponsorFinish, setSponsorFinish] = useState(true)

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
    processingReward,
    proposalDeposit,
    currentPeriod,
    periodDuration,
    proposalComments,
    contract,
    daoContract,
    allMemberInfo,
    getCurrentPeriod,
    refreshProposalEvents,
  } = props

  useEffect(() => {
    async function fetchData() {
      let i = 0
      while (i < proposalEvents.length) {
          let result = await getUserVote(proposalEvents[i].pI)
          proposalEvents[i].vote = result
          proposalEvents[i].voted = result == 'yes' || result == 'no'? true : false
          i++
      }
        let newLists = await resolveStatus(proposalEvents)
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
    
    if(proposalEvents.length > 0){
    fetchData()
      .then((res) => {
       
      })
    }

  },[proposalEvents, currentPeriod, allMemberInfo, sponsorFinish, cancelFinish])

  const handleTabChange = (event, newValue) => {
      handleTabValueState(newValue);
  }

  function handleExpanded() {
    setExpanded(!expanded)
  }

  const handleSponsorConfirmationClick = (requestId) => {
    handleExpanded()
    setProposalIdentifier(requestId)
    handleTabValueState('2')
    setSponsorConfirmationClicked(true)
  }

  const handleMemberProposalDetailsClick = async (id, applicant) => {
    if(accountId != applicant) {
        handleExpanded()
        handleTabValueState('2')
        setMemberProposalId(id)
        setMemberProposalDetailsClicked(true)
    } else {
        handleExpanded()
        handleTabValueState('2')
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

  const handleFundingProposalDetailsClick = async (id, applicant) => {
    if(accountId != applicant) {
        handleExpanded()
        handleTabValueState('2')
        setFundingProposalId(id)
        setFundingProposalDetailsClicked(true)
    } else {
        handleExpanded()
        handleTabValueState('2')
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

  async function handleSponsorAction(proposalIdentifier) {
    setSponsorFinish(false)
    let finished = await contract.sponsorProposal({
        pI: proposalIdentifier,
        proposalDeposit: proposalDeposit,
        depositToken: depositToken
        }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount((parseInt(proposalDeposit)).toString()))
    if(finished) {
      await handleProposalEventChange()
      await handleEscrowBalanceChanges()
      await handleGuildBalanceChanges()
      await refreshProposalEvents()
      setSponsorFinish(true)
    }
  }

  async function handleCancelAction(proposalIdentifier, tribute) {
    setCancelFinish(false)
    let finished = await daoContract.cancelProposal({
        pI: proposalIdentifier
        }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount((parseInt(proposalDeposit)+parseInt(tribute)).toString()))
    if(finished) {
      await handleProposalEventChange()
      await handleEscrowBalanceChanges()
      await handleGuildBalanceChanges()
      await refreshProposalEvents()
      setCancelFinish(true)
    }
  }

  async function handleProcessAction(proposalIdentifier) {
    await daoContract.processProposal({
         pI: proposalIdentifier
         }, process.env.DEFAULT_GAS_VALUE)
    await handleProposalEventChange()
    await handleGuildBalanceChanges()
    await handleEscrowBalanceChanges()
    await getCurrentPeriod()
  }

  async function handleYesVotingAction(proposalIdentifier) {
    await contract.submitVote({
        pI: proposalIdentifier,
        vote: 'yes'
        }, process.env.DEFAULT_GAS_VALUE)
    await handleProposalEventChange()
    await refreshProposalEvents()
  }

async function handleNoVotingAction(proposalIdentifier) {
    await contract.submitVote({
        pI: proposalIdentifier,
        vote: 'no'
        }, process.env.DEFAULT_GAS_VALUE)
        await handleProposalEventChange()
        await refreshProposalEvents()
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
    let result = await contract.getMemberProposalVote({memberAddress: accountId, pI: proposalIdentifier})
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
        console.log('requests', requests)
        status = getStatus(fr.f)
        proposalType = getProposalType(fr.f)
        let isVotingPeriod = getVotingPeriod(fr.sP, fr.vP)
        let isGracePeriod = getGracePeriod(fr.vP, fr.gP)
        let disabled
        let isDisabled = isVotingPeriod ? disabled = false : disabled = true       

        if(status != 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled'){
          allProposals.push([{
            blockTimeStamp: fr.pS,
            date: makeTime(fr.pS),
            applicant: fr.a, 
            proposer: fr.dK, 
            requestId: parseInt(fr.pI), 
            shares: fr.sR, 
            loot: fr.lR, 
            tribute: fr.tO, 
            flags: fr.f,
            yesVotes: fr.yV,
            noVotes: fr.nV,
            votingPeriod: parseInt(fr.vP),
            gracePeriod: parseInt(fr.gP),
            status: status,
            startingPeriod: parseInt(fr.sP),
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
            blockTimeStamp: fr.pS,
            date: makeTime(fr.pS), 
            applicant: fr.a, 
            proposer: fr.dK, 
            requestId: parseInt(fr.pI), 
            shares: fr.sR, 
            loot: fr.lR, 
            tribute: fr.tO, 
            flags: fr.f,
            yesVotes: fr.yV,
            noVotes: fr.nV,
            votingPeriod: parseInt(fr.vP),
            gracePeriod: parseInt(fr.gP),
            status: status,
            startingPeriod: parseInt(fr.sP),
            proposalType: proposalType,
            isGracePeriod: isGracePeriod,
            isVotingPeriod: isVotingPeriod,
            disabled: isDisabled,
            voted: fr.voted,
            vote: fr.vote
          }])
        }

        if(status == 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled' && currentPeriod > fr.sP && isVotingPeriod == false && isGracePeriod == false){
        
          queueProposals.push({
            blockTimeStamp: fr.pS,
            date: makeTime(fr.pS),
            applicant: fr.a, 
            proposer: fr.dK, 
            requestId: parseInt(fr.pI),
            shares: fr.sR, 
            loot: fr.lR, 
            tribute: fr.tO, 
            flags: fr.f,
            yesVotes: fr.yV,
            noVotes: fr.nV,
            votingPeriod: parseInt(fr.vP),
            gracePeriod: parseInt(fr.gP),
            status: status,
            startingPeriod: parseInt(fr.sP),
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
            blockTimeStamp: fr.pS,
            date: makeTime(fr.pS),
            applicant: fr.a, 
            proposer: fr.dK, 
            requestId: parseInt(fr.pI), 
            shares: fr.sR, 
            loot: fr.lR, 
            tribute: fr.tO, 
            flags: fr.f,
            yesVotes: fr.yV,
            noVotes: fr.nV,
            votingPeriod: parseInt(fr.vP),
            gracePeriod: parseInt(fr.gP),
            status: status,
            startingPeriod: parseInt(fr.sP),
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
      for(let i=0; i < propObject.queueProposals.length; i++) {
        try{
          console.log('queue length', propObject.queueProposals.length)
          console.log('queue', propObject.queueProposals)
          console.log('PI', propObject.queueProposals[i].requestId)
          await handleProcessAction(propObject.queueProposals[i].requestId)
        } catch (err) {
          console.log(err)
        }
     }
    }
    return propObject
  }

  let Members
  if (allMemberInfo && allMemberInfo.length > 0 && tabValue == '1') {
    allMemberInfo.map((fr) => {
      Members = (
        <MemberCard 
          name={fr.delegateKey}
          shares={fr.shares}
          joined={makeTime(parseInt(fr.joined))}
        />
      )
    })
  }

  let Proposals
  if (proposalList && proposalList.length > 0 && tabValue == '2') {
    Proposals = proposalList.map((fr) => {
      console.log('proposallist', proposalList)
      console.log('fr', fr)
      return (
        <ProposalCard
          key={fr[0].requestId} 
          applicant={fr[0].applicant}
          created={fr[0].date}
          noVotes={fr[0].noVotes}
          yesVotes={fr[0].yesVotes}
          proposalType={fr[0].proposalType}
          proposer={fr[0].proposer}
          requestId={fr[0].requestId}
          shares={fr[0].shares}
          tribute={fr[0].tribute}
          loot={fr[0].loot}
          status={fr[0].status}
          accountId={accountId}
          cancelFinish={cancelFinish}
          sponsorFinish={sponsorFinish}
          getCurrentPeriod={getCurrentPeriod}
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
          requestId={fr[0].requestId}
          shares={fr[0].shares}
          tribute={fr[0].tribute}
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
    console.log('processlist', processedList)
    Processed = processedList.map((fr) => {
      console.log('pl', fr)
      return (
        <ProposalCard 
          key={fr[0].requestId} 
          applicant={fr[0].applicant}
          created={fr[0].date}
          noVotes={fr[0].noVotes}
          yesVotes={fr[0].yesVotes}
          proposalType={fr[0].proposalType}
          proposer={fr[0].proposer}
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

    {memberProposalDetailsEmptyClicked ? <MemberProposalForm
      contract={contract}
      memberProposalId={memberProposalId}
      accountId={accountId}
      handleProposalDetailsEmptyClickState={handleMemberProposalDetailsEmptyClickState}  
      handleTabValueState={handleTabValueState}/> : null }
    
    {memberProposalDetailsClicked ? <MemberProposalDetails
      contract={contract}
      memberStatus={memberStatus}
      memberProposalId={memberProposalId}
      proposalComments={proposalComments}
      handleProposalDetailsClickState={handleMemberProposalDetailsClickState}  
      handleTabValueState={handleTabValueState}/> : null }
  
    {fundingProposalDetailsEmptyClicked ? <FundingProposalForm
      contract={contract}
      fundingProposalId={fundingProposalId}
      accountId={accountId}
      handleProposalDetailsEmptyClickState={handleFundingProposalDetailsEmptyClickState}  
      handleTabValueState={handleTabValueState}/> : null }
  
    {fundingProposalDetailsClicked ? <FundingProposalDetails
      contract={contract}
      memberStatus={memberStatus}
      fundingProposalId={fundingProposalId}
      proposalComments={proposalComments}
      handleProposalDetailsClickState={handleFundingProposalDetailsClickState}  
      handleTabValueState={handleTabValueState}/> : null }

    {sponsorConfirmationClicked ? <SponsorConfirmation
      contract={contract} 
      handleProposalEventChange={handleProposalEventChange}
      handleGuildBalanceChanges={handleGuildBalanceChanges}
      handleEscrowBalanceChanges={handleEscrowBalanceChanges}
      handleSponsorConfirmationClickState={handleSponsorConfirmationClickState} 
      handleSponsorAction={handleSponsorAction}
      sponsorFinish={sponsorFinish}
      handleTabValueState={handleTabValueState} 
      accountId={accountId} 
      depositToken={depositToken}
      getCurrentPeriod={getCurrentPeriod}
      proposalIdentifier={proposalIdentifier}
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