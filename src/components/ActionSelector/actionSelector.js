import React, { useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'

import FundingProposal from '../FundingProposal/fundingProposal'
import WhiteListProposal from '../WhiteListProposal/whitelistProposal'
import GuildKickProposal from '../GuildKickProposal/guildKickProposal'
import MemberProposal from '../MemberProposal/memberProposal'
import VotingProposal from '../VotingRights/votingRightsProposal'
import PayoutProposal from '../PayoutProposal/payoutProposal'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt'
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle'
import HowToVoteIcon from '@material-ui/icons/HowToVote'
import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'


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
  const [fundingProposalClicked, setFundingProposalClicked] = useState(false)
  const [payoutProposalClicked, setPayoutProposalClicked] = useState(false)
  const [whiteListClicked, setWhiteListClicked] = useState(false)
  const [guildKickClicked, setGuildKickClicked] = useState(false)
  const [votingProposalClicked, setVotingProposalClicked] = useState(false)
  const [snackBarOpen, setSnackBarOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState()
  const [severity, setSeverity] = useState()
  const [successMessage, setSuccessMessage] = useState()

  const { state, dispatch, update } = useContext(appStore);
  
  const { 
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
    memberStatus } = props

  const {
    contractId
  } = useParams()

  const handleFundingProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    setFundingProposalClicked(true)
  };

  const handleVotingProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    setVotingProposalClicked(true)
  };

  const handleWhiteListClick = () => {
    handleExpanded()
    handleTabValueState('2')
    setWhiteListClicked(true)
  };

  const handleGuildKickClick = () => {
    handleExpanded()
    handleTabValueState('2')
    setGuildKickClicked(true)
  };

  const handleMemberProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    handleMemberProposalClickState(true)
  };

  const handlePayoutProposalClick = () => {
    handleExpanded()
    handleTabValueState('2')
    handlePayoutProposalClickState(true)
  };

  function handleWhiteListClickState(property) {
    setWhiteListClicked(property)
  }

  function handleVotingProposalClickState(property) {
    setVotingProposalClicked(property)
  }

  function handleGuildKickClickState(property) {
    setGuildKickClicked(property)
  }

  function handleFundingProposalClickState(property) {
    setFundingProposalClicked(property)
  }

  function handlePayoutProposalClickState(property) {
    setPayoutProposalClicked(property)
  }

  function handleMemberProposalClickState(property) {
    setMemberProposalClicked(property)
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

  function handleExpanded() {
    setAnchorEl(null)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const snackBarHandleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarOpen(false);
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />
  }

  return (
    <>
    <Button
        aria-controls="fade-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        Submit Proposals
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
            <ListItemText primary="New Member Proposal" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleFundingProposalClick}>
            <ListItemIcon>
              <EnhancedEncryptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Request Funding Commitment" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handlePayoutProposalClick}>
          <ListItemIcon>
            <MonetizationOnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Request Payout" />
        </StyledMenuItem>
          <StyledMenuItem button onClick={handleGuildKickClick}>
            <ListItemIcon>
              <RemoveCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Remove Member" />
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
            <ListItemText primary="New Member Proposal" />
          </StyledMenuItem>
        </StyledMenu>
      )}
    
      <Snackbar open={snackBarOpen} autoHideDuration={4000} onClose={snackBarHandleClose}>
      <Alert onClose={snackBarHandleClose} severity={severity}>
        {severity=='success' ? successMessage : errorMessage}
      </Alert>
      </Snackbar>
  

      {whiteListClicked ? <WhiteListProposal
      contract={contract}
      handleProposalEventChange={handleProposalEventChange}
      handleWhiteListClickState={handleWhiteListClickState}
      didsContract={didsContract}
      idx={idx}
      handleTabValueState={handleTabValueState}/> : null }

      {votingProposalClicked ? <VotingProposal
      contract={contract} 
      handleProposalEventChange={handleProposalEventChange}
      handleGuildBalanceChanges={handleGuildBalanceChanges}
      handleEscrowBalanceChanges={handleEscrowBalanceChanges}
      handleVotingProposalClickState={handleVotingProposalClickState} 
      handleTabValueState={handleTabValueState} 
      accountId={accountId} 
      depositToken={depositToken}
      tokenName={tokenName}
      didsContract={didsContract}
      idx={idx}
      proposalDeposit={proposalDeposit}/> : null  }

      {guildKickClicked ? <GuildKickProposal
      contract={contract}
      handleProposalEventChange={handleProposalEventChange}
      handleGuildKickClickState={handleGuildKickClickState}
      handleGuildBalanceChanges={handleGuildBalanceChanges}
      handleEscrowBalanceChanges={handleEscrowBalanceChanges}
      depositToken={depositToken}
      proposalDeposit={proposalDeposit}
      daoContract={daoContract}
      handleSnackBarOpen={handleSnackBarOpen}
      handleErrorMessage={handleErrorMessage}
      handleSuccessMessage={handleSuccessMessage}
      didsContract={didsContract}
      idx={idx}
      handleTabValueState={handleTabValueState}/> : null }

      {fundingProposalClicked ? <FundingProposal
      contractId={contractId}
      handleFundingProposalClickState={handleFundingProposalClickState}
      state={state}
      depositToken={depositToken}
      proposalDeposit={proposalDeposit}
      tokenName={tokenName}
      accountId={accountId} 
     
      handleSnackBarOpen={handleSnackBarOpen}
      handleErrorMessage={handleErrorMessage}
      handleSuccessMessage={handleSuccessMessage}
      /> : null }

      {memberProposalClicked ? <MemberProposal
      contractId={contractId}
      state={state}
      proposalDeposit={proposalDeposit}
      depositToken={depositToken}
      handleMemberProposalClickState={handleMemberProposalClickState} 
      accountId={accountId} 
      handleSnackBarOpen={handleSnackBarOpen}
      handleErrorMessage={handleErrorMessage}
      handleSuccessMessage={handleSuccessMessage}

      /> : null }

      {payoutProposalClicked ? <PayoutProposal
        contractId={contractId}
        state={state}
        proposalDeposit={proposalDeposit}
        depositToken={depositToken}
        tokenName={tokenName}
        handlePayoutProposalClickState={handlePayoutProposalClickState} 
        accountId={accountId} 
        handleSnackBarOpen={handleSnackBarOpen}
        handleErrorMessage={handleErrorMessage}
        handleSuccessMessage={handleSuccessMessage}
  
        /> : null }
    </>
  );
}