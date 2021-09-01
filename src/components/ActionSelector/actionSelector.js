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
import Donation from '../Donation/donation'
import Invite from '../Invite/invite'
import Leave from '../Leave/leave'
import { Steps, Hints } from "intro.js-react";

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
import { EmailIcon } from 'react-share'
import { SportsTennisRounded } from '@material-ui/icons'



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
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [memberProposalClicked, setMemberProposalClicked] = useState(false)
  const [inviteClicked, setInviteClicked] = useState(false);
  const [fundingProposalClicked, setFundingProposalClicked] = useState(false)
  const [tributeProposalClicked, setTributeProposalClicked] = useState(false)
  const [payoutProposalClicked, setPayoutProposalClicked] = useState(false)
  const [donationProposalClicked, setDonationProposalClicked] = useState(false)
  const [opportunityProposalClicked, setOpportunityProposalClicked] = useState(false)
  const [leaveClicked, setLeaveClicked] = useState(false)
  const [whiteListClicked, setWhiteListClicked] = useState(false)
  const [guildKickClicked, setGuildKickClicked] = useState(false)
  const [stepsEnabled, setStepsEnabled] = useState(false)
  const [options, setOptions] = useState({
    doneLabel: 'Next',                                
    showButtons: true,
    overlayOpacity: 0.5,
    scrollTo: 'element',
    skipLabel: "Skip",
    showProgress: true
})

  const [loaded, setLoaded] = useState(false)
  
  const { state, dispatch, update } = useContext(appStore);
 
  let steps = [
    { 
      element: '.proposalList',
      intro: <>
             <Typography>Clicking this button will display a list of proposals that you can submit.</Typography>
             <br />
             <Typography>If you are not a member of this community, you can click the join button, and submit a member proposal to gain access to all proposals types.</Typography>
             <br />
             <Typography>For more information about the various proposal types, you can find them (here)</Typography>
            </>
    }, {
      element: '.invite',
      intro: <Typography>Here you can invite your friends to join a community on a variety of social media platforms.</Typography>
    }                       
]

  const {
    enable,
    returnFunction, 
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    handleTabValueState,
    accountId,
    depositToken,
    tokenName,
    proposalDeposit,
    daoContract,
    didsContract,
    contractIdx,
    idx,
    contract,
    fairShare,
    memberStatus } = props

  const {
    contractId
  } = useParams()

  useEffect(
    () => {
      if(memberStatus){
        setLoaded(true)
      }
    }, []
  )

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

  const handleWhiteListClick = () => {
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

  useEffect(
    () =>
      {
        setStepsEnabled(enable);
      }
      , [enable]
  )

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

  function handleWhiteListClickState(property) {
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

  function handleExpanded() {
    setAnchorEl(null)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }
  function onStepsExit() {
    setStepsEnabled(false)
    returnFunction('actionSelect') 
  }
  return (
    <>

      <Steps
        steps={steps}
        initialStep={0}
        onExit={() => onStepsExit()}
        enabled={stepsEnabled}
        options={options}/>

      {!memberStatus ? (
        <Button
     
          style={{ marginRight: 5 }}
          aria-controls="fade-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          onClick={handleMemberProposalClick}
        >
          Join
        </Button>
      ) : null}
      <Button
        className='proposalList'

    {loaded && !memberStatus ? (
    <Button
    style={{marginRight: 5}}
    aria-controls="fade-menu"
    aria-haspopup="true"
    variant="contained"
    color="primary"
    onClick={handleMemberProposalClick}
    >
      Join
    </Button>
    ) : null }
    <Button

        aria-controls="fade-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        Submit Proposals
      </Button>
      <Button
        className='invite'
        style={{ marginLeft: 5 }}
        aria-controls="fade-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleInvite}
      >
        Invite
      </Button>
      {memberStatus ? (
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
            <ListItemText primary="Tribute (add Voting Shares)" />
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
          <StyledMenuItem button onClick={handleGuildKickClick}>
            <ListItemIcon>
              <RemoveCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Remove Member" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleLeaveClick}>
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Leave Community" />
          </StyledMenuItem>
        </StyledMenu>
      ) : (
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
      )}




      {whiteListClicked ? <WhiteListProposal
        contract={contract}
        handleProposalEventChange={handleProposalEventChange}
        handleWhiteListClickState={handleWhiteListClickState}
        didsContract={didsContract}
        idx={idx}
        handleTabValueState={handleTabValueState} /> : null}

      {guildKickClicked ? <GuildKickProposal
        contract={contract}
        handleProposalEventChange={handleProposalEventChange}
        handleGuildKickClickState={handleGuildKickClickState}
        handleGuildBalanceChanges={handleGuildBalanceChanges}
        handleEscrowBalanceChanges={handleEscrowBalanceChanges}
        depositToken={depositToken}
        proposalDeposit={proposalDeposit}
        daoContract={daoContract}
        didsContract={didsContract}
        idx={idx}
        handleTabValueState={handleTabValueState} /> : null}

      {inviteClicked ? <Invite
        handleInviteClickState={handleInviteClickState}
      /> : null}

      {leaveClicked ? <Leave
        state={state}
        fairShare={fairShare}
        contractId={contractId}
        daoContract={daoContract}
        handleLeaveClickState={handleLeaveClickState}
      /> : null}

      {fundingProposalClicked ? <FundingProposal
        contractId={contractId}
        handleFundingProposalClickState={handleFundingProposalClickState}
        state={state}
        depositToken={depositToken}
        proposalDeposit={proposalDeposit}
        tokenName={tokenName}
        accountId={accountId}
      /> : null}

      {tributeProposalClicked ? <TributeProposal
        contractId={contractId}
        handleTributeProposalClickState={handleTributeProposalClickState}
        state={state}
        depositToken={depositToken}
        proposalDeposit={proposalDeposit}
        tokenName={tokenName}
        accountId={accountId}

      /> : null}


      {opportunityProposalClicked ? <OpportunityProposal
        contractId={contractId}
        handleOpportunityProposalClickState={handleOpportunityProposalClickState}
        state={state}
        depositToken={depositToken}
        proposalDeposit={proposalDeposit}
        tokenName={tokenName}
        accountId={accountId}

      /> : null}

      {memberProposalClicked ? <MemberProposal
        contractId={contractId}
        state={state}
        proposalDeposit={proposalDeposit}
        depositToken={depositToken}
        handleMemberProposalClickState={handleMemberProposalClickState}
        accountId={accountId}


      /> : null}

      {donationProposalClicked ? <Donation
        contractId={contractId}
        state={state}
        proposalDeposit={proposalDeposit}
        depositToken={depositToken}
        handleDonationProposalClickState={handleDonationProposalClickState}
        accountId={accountId}

      /> : null}

      {payoutProposalClicked ? <PayoutProposal
        contractId={contractId}
        state={state}
        proposalDeposit={proposalDeposit}
        depositToken={depositToken}
        tokenName={tokenName}
        handlePayoutProposalClickState={handlePayoutProposalClickState}
        accountId={accountId}

      /> : null}
    </>
  );
}