import React, { useState, useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'

import FundingProposal from '../FundingProposal/fundingProposal'
import TributeProposal from '../TributeProposal/tributeProposal'
import WhiteListProposal from '../WhiteListProposal/whitelistProposal'
import GuildKickProposal from '../GuildKickProposal/guildKickProposal'
import MemberProposal from '../MemberProposal/memberProposal'
import PayoutProposal from '../PayoutProposal/payoutProposal'
import OpportunityProposal from '../OpportunityProposal/opportunityProposal'
import CommunityRoleProposal from '../CommunityRoleProposal/communityRoleProposal'
import Donation from '../Donation/donation'
import Invite from '../Invite/invite'
import Leave from '../Leave/leave'
import proposal from '../../img/proposal-icon.png'
import invite from '../../img/invite-icon.png'
import join from '../../img/join-icon.png'
import supporters from '../../img/give-icon.png'
import opportunities from '../../img/opportunity-icon.png'
import EditDaoForm from '../EditDao/editDao'

// Material UI Components
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle'
import HowToVoteIcon from '@material-ui/icons/HowToVote'
import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import AddAlertIcon from '@material-ui/icons/AddAlert'
import MoneyIcon from '@material-ui/icons/Money'
import EditIcon from '@material-ui/icons/Edit'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import { LinearProgress } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import Badge from '@material-ui/core/Badge'

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function ActionSelector(props) {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)
  const [editDaoClicked, setEditDaoClicked] = useState(false)
  const [memberProposalClicked, setMemberProposalClicked] = useState(false)
  const [inviteClicked, setInviteClicked] = useState(false);
  const [fundingProposalClicked, setFundingProposalClicked] = useState(false)
  const [tributeProposalClicked, setTributeProposalClicked] = useState(false)
  const [payoutProposalClicked, setPayoutProposalClicked] = useState(false)
  const [donationProposalClicked, setDonationProposalClicked] = useState(false)
  const [opportunityProposalClicked, setOpportunityProposalClicked] = useState(false)
  const [communityRoleProposalClicked, setCommunityRoleProposalClicked] = useState(false)
  const [leaveClicked, setLeaveClicked] = useState(false)
  const [whiteListClicked, setWhiteListClicked] = useState(false)
  const [guildKickClicked, setGuildKickClicked] = useState(false)
  const [active, setActive] = useState(false)
  const [supporterCount, setSupporterCount] = useState(0)
  const [opportunityCount, setOpportunityCount] = useState(0)
  
  const { state, dispatch, update } = useContext(appStore)

  const {
    proposalDeposit,
    depositToken,
    tokenName,
    contract,
    currentDaosList,
    accountId,
    memberStatus,
    daoFactory, 
    nearPrice,
    appIdx,
    curDaoIdx,
    isUpdated
  } = state

  const {
    handleTabValueState,
    fairShare,
    loaded } = props

  const {
    contractId
  } = useParams()

  useEffect(() => {
    async function checkStatus(){
      try{
        let community = await daoFactory.getDaoByAccount({accountId: contractId})
        community.status == 'active' ? setActive(true) : setActive(false)
      } catch (err) {
        console.log('error getting status', err)
      }
    }

    checkStatus()
  })

  useEffect(() => {
    if(isUpdated){}
    async function getStats() {
      if(appIdx && curDaoIdx){
        let thisSupporterCount = await appIdx.get('donations', curDaoIdx.id)
        console.log('supporterCount', thisSupporterCount)
        thisSupporterCount ? setSupporterCount(thisSupporterCount.donations.length) : setSupporterCount(0)
      
        let thisOpportunityCount = await appIdx.get('opportunities', curDaoIdx.id)
        console.log('opporuntiy count', thisOpportunityCount)
        let count = 0
        if(thisOpportunityCount && thisOpportunityCount.opportunities.length > 0){
          for(let x = 0; x < thisOpportunityCount.opportunities.length; x++){
            if(thisOpportunityCount.opportunities[x].status){
              count++
            }
          }
          setOpportunityCount(count)
        } else {
          setOpportunityCount(0)
        }
      }
    }

    getStats()
  }, [curDaoIdx, appIdx, isUpdated])

  const handleDonationProposalClick = () => {
    handleExpanded()
    handleTabValueState('5')
    setDonationProposalClicked(true)
  }

  const handleFundingProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    setFundingProposalClicked(true)
  }

  const handleTributeProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    setTributeProposalClicked(true)
  }

  const handleWhitelistProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    setWhiteListClicked(true)
  };

  const handleGuildKickClick = () => {
    handleExpanded()
    handleTabValueState('2')
    setGuildKickClicked(true)
  }

  const handleLeaveClick = () => {
    handleExpanded()
    handleTabValueState('2')
    setLeaveClicked(true)
  }

  const handleMemberProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    handleMemberProposalClickState(true)
  }

  const handlePayoutProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    handlePayoutProposalClickState(true)
  }

  const handleOpportunityProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    handleOpportunityProposalClickState(true)
  }

  const handleCommunityRoleProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    handleCommunityRoleProposalClickState(true)
  }

  const handleInvite = () => {
    handleInviteClickState(true);
  }

  function handleDonationProposalClickState(property) {
    setDonationProposalClicked(property)
  }

  function handleLeaveClickState(property) {
    setLeaveClicked(property)
  }

  function handleInviteClickState(property) {
    setInviteClicked(property)
  }

  function handleWhitelistClickState(property) {
    setWhiteListClicked(property)
  }

  function handleGuildKickClickState(property) {
    setGuildKickClicked(property)
  }

  function handleFundingProposalClickState(property) {
    setFundingProposalClicked(property)
  }

  function handleTributeProposalClickState(property) {
    setTributeProposalClicked(property)
  }

  function handlePayoutProposalClickState(property) {
    setPayoutProposalClicked(property)
  }

  function handleMemberProposalClickState(property) {
    setMemberProposalClicked(property)
  }

  function handleOpportunityProposalClickState(property) {
    setOpportunityProposalClicked(property)
  }

  function handleCommunityRoleProposalClickState(property) {
    setCommunityRoleProposalClicked(property)
  }

  function handleEditDaoClickState(property){
    setEditDaoClicked(property)
  }

  const handleEditDaoClick = () => {
    handleExpanded()
    handleEditDaoClickState(true)
  }

  function handleExpanded() {
    setAnchorEl(null)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  return (
    <>

      {loaded && !memberStatus && active ? (
        <IconButton
          style={{ marginRight: 5 }}
          aria-controls="fade-menu"
          aria-haspopup="true"
          onClick={handleMemberProposalClick}
        >
        <img src={join} style={{width: '25px'}}/>
        </IconButton>
      ) : null}

      {loaded && active ? (
      <>
      <IconButton
        className='proposalList'
        aria-controls="fade-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <img src={proposal} style={{width: '25px'}}/>
      </IconButton>

      <IconButton
        className='invite'
        style={{ marginLeft: 5 }}
        aria-controls="fade-menu"
        aria-haspopup="true"
        onClick={handleInvite}
      >
      <img src={invite} style={{width: '25px'}}/>
      </IconButton>

     
      <IconButton
        className='invite'
        style={{ marginLeft: 5 }}
        aria-controls="fade-menu"
        aria-haspopup="true"
      >
      <Badge badgeContent={opportunityCount} color="primary">
        <a href={`/opportunities/${contractId}`}>
          <img src={opportunities} style={{width: '25px'}}/>
        </a>
      </Badge>
      </IconButton>
      
      
      <IconButton
        className='invite'
        style={{ marginLeft: 5 }}
        aria-controls="fade-menu"
        aria-haspopup="true"
      >
      <Badge badgeContent={supporterCount} color="primary">
        <a href={`/supporters/${contractId}`}>
          <img src={supporters} style={{width: '25px'}}/>
        </a>
      </Badge>
      </IconButton>
     

      <IconButton
      className='edit'
      style={{ marginLeft: 5 }}
      aria-controls="fade-menu"
      aria-haspopup="true"
      onClick={handleEditDaoClick}
      >
      <EditIcon />
      </IconButton>
      </>
      ) : 
      loaded ?
        <Typography variant="body1">This community has been inactivated and exists here as an archive of its activity.</Typography>
      : <Typography variant="body1">Setting things up.  Please wait a moment.</Typography>
      }
      

      {loaded && memberStatus && active ? (
        <StyledMenu
          id="customized-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleExpanded}
        >
          <StyledMenuItem button onClick={handleMemberProposalClick}>
            <ListItemIcon>
              <EmojiPeopleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="New Member" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleDonationProposalClick}>
            <ListItemIcon>
              <MoneyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Donation (no Votes)" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleTributeProposalClick}>
            <ListItemIcon>
              <HowToVoteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Add Funds (get Voting Shares)" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleOpportunityProposalClick}>
            <ListItemIcon>
              <AddAlertIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Opportunity" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleFundingProposalClick}>
            <ListItemIcon>
              <EnhancedEncryptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Funding Commitment" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handlePayoutProposalClick}>
            <ListItemIcon>
              <MonetizationOnIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Payout" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleWhitelistProposalClick}>
          <ListItemIcon>
            <VerifiedUserIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Whitelist Token" />
        </StyledMenuItem>
          <StyledMenuItem button onClick={handleGuildKickClick}>
            <ListItemIcon>
              <RemoveCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Remove Voting Rights" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleLeaveClick}>
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Leave Community" />
          </StyledMenuItem>
        </StyledMenu>
      ) : 
      loaded && active ? (
        <StyledMenu
          id="customized-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleExpanded}
        >
          <StyledMenuItem button onClick={handleMemberProposalClick}>
            <ListItemIcon>
              <EmojiPeopleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="New Member" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleDonationProposalClick}>
            <ListItemIcon>
              <MoneyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Donate (no Voting Rights)" />
          </StyledMenuItem>
        </StyledMenu>
      ) :
      active ?
    <LinearProgress />
    : null
    }

      {editDaoClicked ? <EditDaoForm
        state={state}
        handleEditDaoClickState={handleEditDaoClickState}
        contractId={contractId}
        appIdx={appIdx}
        did={curDaoIdx.id}
        /> : null }

      {whiteListClicked ? <WhiteListProposal
        contract={contract}
        handleWhitelistClickState={handleWhitelistClickState}
        state={state}
        contractId={contractId}
        depositToken={depositToken}
        proposalDeposit={proposalDeposit}
        appIdx={appIdx}
        did={curDaoIdx.id}
        accountId={accountId} /> : null}

      {guildKickClicked ? <GuildKickProposal
        handleGuildKickClickState={handleGuildKickClickState}
        proposalDeposit={proposalDeposit}
        contractId={contractId}
        appIdx={appIdx}
        did={curDaoIdx.id}
        state={state} /> : null}

      {inviteClicked ? <Invite
        handleInviteClickState={handleInviteClickState}
      /> : null}

      {leaveClicked ? <Leave
        state={state}
        fairShare={fairShare}
        contractId={contractId}
        contract={contract}
        handleLeaveClickState={handleLeaveClickState}
        appIdx={appIdx}
        did={curDaoIdx.id}
      /> : null}

      {fundingProposalClicked ? <FundingProposal
        contractId={contractId}
        handleFundingProposalClickState={handleFundingProposalClickState}
        depositToken={depositToken}
        tokenName={tokenName}
        applicant={accountId}
        contract={contract}
        proposalDeposit={proposalDeposit}
        nearPrice={nearPrice}
        appIdx={appIdx}
        did={curDaoIdx.id}
        state={state}
      /> : null}

      {communityRoleProposalClicked ? <CommunityRoleProposal
        contractId={contractId}
        handleCommunityRoleProposalClickState={handleCommunityRoleProposalClickState}
        state={state}
        depositToken={depositToken}
        proposalDeposit={proposalDeposit}
        tokenName={tokenName}
        accountId={accountId}
        appIdx={appIdx}
        did={curDaoIdx.id}
      /> : null}

      {tributeProposalClicked ? <TributeProposal
        contractId={contractId}
        handleTributeProposalClickState={handleTributeProposalClickState}
        state={state}
        depositToken={depositToken}
        proposalDeposit={proposalDeposit}
        tokenName={tokenName}
        accountId={accountId}
        appIdx={appIdx}
        did={curDaoIdx.id}
      /> : null}


      {opportunityProposalClicked ? <OpportunityProposal
        contractId={contractId}
        handleOpportunityProposalClickState={handleOpportunityProposalClickState}
        state={state}
        depositToken={depositToken}
        proposalDeposit={proposalDeposit}
        tokenName={tokenName}
        accountId={accountId}
        appIdx={appIdx}
        did={curDaoIdx.id}
      /> : null}

      {memberProposalClicked ? <MemberProposal
        contractId={contractId}
        state={state}
        proposalDeposit={proposalDeposit}
        depositToken={depositToken}
        handleMemberProposalClickState={handleMemberProposalClickState}
        accountId={accountId}
        appIdx={appIdx}
        did={curDaoIdx.id}
      /> : null}

      {donationProposalClicked ? <Donation
        contractId={contractId}
        state={state}
        proposalDeposit={proposalDeposit}
        depositToken={depositToken}
        handleDonationProposalClickState={handleDonationProposalClickState}
        accountId={accountId}
        appIdx={appIdx}
        did={curDaoIdx.id}
      /> : null}

      {payoutProposalClicked ? <PayoutProposal
        contractId={contractId}
        state={state}
        proposalDeposit={proposalDeposit}
        depositToken={depositToken}
        tokenName={tokenName}
        handlePayoutProposalClickState={handlePayoutProposalClickState}
        accountId={accountId}
        appIdx={appIdx}
        did={curDaoIdx.id}
      /> : null}
    </>
  )
}