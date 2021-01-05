import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { withStyles } from '@material-ui/core/styles';
import FundingProposal from '../FundingProposal/fundingProposal'
import WhiteListProposal from '../WhiteListProposal/whitelistProposal'
import GuildKickProposal from '../GuildKickProposal/guildKickProposal'
import MemberProposal from '../MemberProposal/memberProposal'

// Material UI Components
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';


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
  const [whiteListClicked, setWhiteListClicked] = useState(false)
  const [guildKickClicked, setGuildKickClicked] = useState(false)
  const [expanded, setExpanded] = useState(false)
  
  const { 
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    handleTabValueState,
    accountId,
    depositToken,
    tokenName,
    minSharePrice,
    contract } = props

  const handleFundingProposalClick = () => {
    handleExpanded()
    handleTabValueState('1')
    setFundingProposalClicked(true)
  };

  const handleWhiteListClick = () => {
    handleExpanded()
    handleTabValueState('1')
    setWhiteListClicked(true)
  };

  const handleGuildKickClick = () => {
    handleExpanded()
    handleTabValueState('1')
    setGuildKickClicked(true)
  };

  const handleMemberProposalClick = () => {
    handleExpanded()
    handleTabValueState('1')
    setMemberProposalClicked(true)
  };

  function handleWhiteListClickState(property) {
    setWhiteListClicked(property)
  }

  function handleGuildKickClickState(property) {
    setGuildKickClicked(property)
  }

  function handleFundingProposalClickState(property) {
    setFundingProposalClicked(property)
  }

  function handleMemberProposalClickState(property) {
    setMemberProposalClicked(property)
  }

  function handleExpanded() {
  //  setExpanded(!expanded)
    setAnchorEl(null)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

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
            <ListItemText primary="Member Proposal" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleFundingProposalClick}>
            <ListItemIcon>
              <MonetizationOnIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Request Funding" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleWhiteListClick}>
            <ListItemIcon>
              <ThumbUpAltIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Whitelist Token" />
          </StyledMenuItem>
          <StyledMenuItem button onClick={handleGuildKickClick}>
            <ListItemIcon>
              <RemoveCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Remove Member" />
          </StyledMenuItem>
      </StyledMenu>
       
    

      {whiteListClicked ? <WhiteListProposal
      contract={contract}
      handleProposalEventChange={handleProposalEventChange}
      handleWhiteListClickState={handleWhiteListClickState}  
      handleTabValueState={handleTabValueState}/> : null }

      {guildKickClicked ? <GuildKickProposal
      contract={contract}
      handleProposalEventChange={handleProposalEventChange}
      handleGuildKickClickState={handleGuildKickClickState} 
      handleTabValueState={handleTabValueState}/> : null }

      {fundingProposalClicked ? <FundingProposal
      contract={contract}
      handleProposalEventChange={handleProposalEventChange}
      handleGuildBalanceChanges={handleGuildBalanceChanges}
      handleEscrowBalanceChanges={handleEscrowBalanceChanges}
      handleFundingProposalClickState={handleFundingProposalClickState}
      handleTabValueState={handleTabValueState}
      depositToken={depositToken}
      accountId={accountId}/> : null }

      {memberProposalClicked ? <MemberProposal
      contract={contract} 
      handleProposalEventChange={handleProposalEventChange}
      handleGuildBalanceChanges={handleGuildBalanceChanges}
      handleEscrowBalanceChanges={handleEscrowBalanceChanges}
      handleMemberProposalClickState={handleMemberProposalClickState} 
      handleTabValueState={handleTabValueState} 
      accountId={accountId} 
      depositToken={depositToken}
      tokenName={tokenName}
      minSharePrice={minSharePrice}/> : null }
    </>
  );
}