import React, { useState, useEffect } from 'react'
import ProposalsTable from '../ProposalsTable/proposalsTable'
import VotingListTable from '../votingTable/votingTable'
import QueueTable from '../QueueTable/queueTable'
import ProcessedTable from '../ProcessedTable/processedTable'
import BalanceChart from '../BalanceGraphs/balanceGraph'
import DistributionGraph from '../DistributionGraph/distributionGraph'

// Material UI Components
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import TabContext from '@material-ui/lab/TabContext'
import Tab from '@material-ui/core/Tab'
import TabList from '@material-ui/lab/TabList'
import TabPanel from '@material-ui/lab/TabPanel'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  appBar: {
      font: '70%'
  }
});

export default function ProposalList(props) {
  const [loaded, setLoaded] = useState(false)
  const [proposalList, setProposalList] = useState([])
  const [votingList, setVotingList] = useState([])
  const [queueList, setQueueList] = useState([])
  const [processedList, setProcessedList] = useState([])
  const [userVote, setUserVote] = useState()

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
    handleUserBalanceChanges,
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
    daoContract
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
    }
    if(proposalEvents.length > 0){
    fetchData()
      .then((res) => {
      })
    }
},[proposalEvents, currentPeriod])

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
      // Hours part from the timestamp
      var hours = date.getHours();
      // Minutes part from the timestamp
      var minutes = "0" + date.getMinutes();
      // Seconds part from the timestamp
      var seconds = "0" + date.getSeconds();
      // Will display time in 10:30:23 format
      var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
      var formatDate = month + '-' + day + '-' + year
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
        requests.map(async(fr, i) => {
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
            queueProposals.push([{
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
      return propObject
    }

  const proposalTabLabel = 'Proposals ('+ proposalList.length + ')'
  const votingTabLabel = 'Voting (' + votingList.length + ')'
  const queueLabel = 'Queued (' + queueList.length + ')'
  const processedLabel = 'Processed (' + processedList.length +')'

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
  };

  const handleTabChange = (event, newValue) => {
      handleTabValueState(newValue);
  };

    
  return (
    <>
    <TabContext value={tabValue}>
        <AppBar position="static">
        {!matches 
          ? <TabList onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth">
              <Tab className="appBar" label={proposalTabLabel} value="1" align="left" />
              <Tab label={votingTabLabel} value="2"/>
              <Tab label={queueLabel} value="3" />
              <Tab label={processedLabel} value="4" />
            </TabList>
          : <TabList onChange={handleTabChange} aria-label="simple tabs example">
              <Tab className="appBar" label={proposalTabLabel} value="1" />
              <Tab label={votingTabLabel} value="2"/>
              <Tab label={queueLabel} value="3" />
              <Tab label={processedLabel} value="4" />
            </TabList>
        }
    </AppBar>
      <TabPanel value="1">{(proposalList.length > 0 ? <ProposalsTable 
        proposalList={proposalList} 
        loaded={loaded} 
        eventCount={proposalList.length} 
        matches={matches} 
        accountId={accountId} 
        memberStatus={memberStatus}
        depositToken={depositToken}
        tributeToken={tributeToken}
        tributeOffer={tributeOffer}
        processingReward={processingReward}
        proposalDeposit={proposalDeposit}
        currentPeriod={currentPeriod}
        proposalComments={proposalComments}
        handleTabValueState={handleTabValueState}
        handleProposalEventChange={handleProposalEventChange}
        handleGuildBalanceChanges={handleGuildBalanceChanges}
        handleEscrowBalanceChanges={handleEscrowBalanceChanges}
        handleUserBalanceChanges={handleUserBalanceChanges}
        contract={contract}
        daoContract={daoContract}
        /> : <div style={{marginTop: 10, marginBottom: 10}}>No Proposals Ready for Consideration</div>)}</TabPanel>

      <TabPanel value="2">{(votingList.length > 0 ? <VotingListTable 
        proposalList={votingList} 
        eventCount={votingList.length}  
        matches={matches} 
        accountId={accountId} 
        memberStatus={memberStatus}
        depositToken={depositToken}
        tributeToken={tributeToken}
        tributeOffer={tributeOffer}
        processingReward={processingReward}
        proposalDeposit={proposalDeposit}
        currentPeriod={currentPeriod}
        periodDuration={periodDuration}
        handleTabValueState={handleTabValueState}
        handleProposalEventChange={handleProposalEventChange}
        handleGuildBalanceChanges={handleGuildBalanceChanges}
        handleEscrowBalanceChanges={handleEscrowBalanceChanges}
        handleUserBalanceChanges={handleUserBalanceChanges}
        contract={contract}
        daoContract={daoContract}
        /> : <div style={{marginTop: 10, marginBottom: 10}}>No Proposals Ready for Voting</div>)}</TabPanel>

      <TabPanel value="3">{(queueList.length > 0 ? <QueueTable 
        proposalList={queueList} 
        eventCount={queueList.length} 
        matches={matches} 
        accountId={accountId}
        memberStatus={memberStatus}
        depositToken={depositToken}
        tributeToken={tributeToken}
        tributeOffer={tributeOffer}
        processingReward={processingReward}
        proposalDeposit={proposalDeposit}
        currentPeriod={currentPeriod}
        handleProposalEventChange={handleProposalEventChange}
        handleGuildBalanceChanges={handleGuildBalanceChanges}
        handleEscrowBalanceChanges={handleEscrowBalanceChanges}
        handleUserBalanceChanges={handleUserBalanceChanges}
        contract={contract}
        daoContract={daoContract}
        /> : <div style={{marginTop: 10, marginBottom: 10}}>No Guild Kick Proposals for Consideration</div>)}</TabPanel>

      <TabPanel value="4">{(processedList.length > 0 ? <ProcessedTable 
        proposalList={processedList} 
        eventCount={processedList.length} 
        matches={matches} 
        accountId={accountId}
        memberStatus={memberStatus}
        depositToken={depositToken}
        tributeToken={tributeToken}
        tributeOffer={tributeOffer}
        processingReward={processingReward}
        proposalDeposit={proposalDeposit}
        currentPeriod={currentPeriod}
        handleTabValueState={handleTabValueState}
        handleProposalEventChange={handleProposalEventChange}
        handleGuildBalanceChanges={handleGuildBalanceChanges}
        handleEscrowBalanceChanges={handleEscrowBalanceChanges}
        handleUserBalanceChanges={handleUserBalanceChanges}
        contract={contract}
        daoContract={daoContract}
        /> : <div style={{marginTop: 10, marginBottom: 10}}>No Proposals have been Processed</div>)}</TabPanel>
      </TabContext>
    </>
  )
}