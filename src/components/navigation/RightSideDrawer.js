import React from 'react';
import clsx from 'clsx';
import { DISABLE_SEND_MONEY } from '../../utils/wallet';
import { ENABLE_FULL_ACCESS_KEYS } from '../../utils/wallet';
import { Link } from 'react-router-dom';
import { Translate } from 'react-localize-redux';
import styled from 'styled-components';
import stakingIcon from '../../images/icon-staking-1.svg'
import UserBalance from './UserBalance';
import UserName from './UserName';
import MenuButton from './MenuButton';
import NavLinks from './NavLinks';
import UserLinks from './UserLinks';
import UserAccounts from './UserAccounts';
import CreateAccountBtn from './CreateAccountBtn';
import LanguageToggle from '../common/LangSwitcher';
import languagesIcon from '../../images/icon-languages.svg';
import AccessAccountBtn from './AccessAccountBtn';

import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail'
import MenuIcon from '@material-ui/icons/Menu'
import IconButton from '@material-ui/core/IconButton'
import SendIcon from '@material-ui/icons/Send'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import HowToVoteIcon from '@material-ui/icons/HowToVote'
import ListIcon from '@material-ui/icons/List'
import Typography from '@material-ui/core/Typography'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import LockOpenIcon from '@material-ui/icons/LockOpen';

import summaryIcon from '../../images/icon-recent.svg';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});


const User = styled.div`
    margin-left: 10px;
`

const LowerSection = styled.div`
    background-color: black;
    margin: 10px -20px 0 -20px;
    padding: 20px 20px 20px 20px;
`

const Lang = styled.div`
    border-top: 1px solid #404040;
    margin-top: 15px;
    padding: 15px 0;
    position: relative;

    &:after {
        content: '';
        border-color: #f8f8f8a1;
        border-style: solid;
        border-width: 2px 2px 0 0;
        display: inline-block;
        position: absolute;
        right: 10px;
        top: calc(50% - 10px);
        transform: rotate(135deg) translateY(-50%);
        height: 9px;
        width: 9px;
    }

    &:last-child {
        border-top: 0;
        margin-top: 0;
        margin-left: auto;
        padding: 0;

        .lang-selector {
            color: #24272a;
            width: 54px;
        }
    }

    .lang-selector {
        appearance: none;
        background: transparent url(${languagesIcon}) no-repeat 2px center / 24px 24px;
        border: 0;
        color: #f8f8f8;
        cursor: pointer;
        font-size: 16px;
        height: 32px;
        outline: none;
        padding-right: 54px;
        position: relative;
        width: 100%;
        z-index: 1;
    }

    &.mobile-lang .lang-selector  {
        text-indent: 36px;

        &:active,
        &:focus,
        &:hover {
            option {
                background-color: #24272a;
                border: 0;
                color: #f8f8f8;
            }
        }
    }
`

export default function RightSideDrawer(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const {
    account,
    selectAccount,
    availableAccounts,
    menuOpen,
    toggleMenu,
    showNavLinks
  } = props

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}

      style={{padding: '15px'}}
    >
    
    <Typography variant='h5'>Wallet</Typography>
    <List>
    <Link to='/'>
      <ListItem button key={0}>
        <ListItemIcon><InboxIcon /></ListItemIcon>
        <ListItemText primary={<Translate id='link.summary' />}/>
      </ListItem>
    </Link>
    {!DISABLE_SEND_MONEY &&
    <Link to='/send-money'>
      <ListItem button key={1}>
        <ListItemIcon ><SendIcon /></ListItemIcon>
        <ListItemText primary={<Translate id='link.send' />} />
      </ListItem>
    </Link>
    }
    <Link to='/receive-money'>
      <ListItem button key={2}>
        <ListItemIcon><SendIcon style={{transform: 'rotate(180deg)'}}/></ListItemIcon>
        <ListItemText primary={<Translate id='link.receive' />} />
      </ListItem>
    </Link>
    <Link to='/staking'>
      <ListItem button key={3} to='/staking'>
        <ListItemIcon><img src={stakingIcon} alt="NEAR staking" style={{width: '21px', height:'21px'}}/></ListItemIcon>
        <ListItemText primary={<Translate id='link.staking' />} />
      </ListItem>
    </Link>      
    </List>
    <Divider />
    
    <Typography variant='h5'>Command</Typography>
    <List>
    <Link to='/proposals'>
      <ListItem button key={4}>
        <ListItemIcon><HowToVoteIcon /></ListItemIcon>
        <ListItemText primary={<Translate id='link.dao' />}/>
      </ListItem>
    </Link>
    
    </List>
    <Divider />
    <Typography variant='h5'>Persona</Typography>
    <List>
    <Link to='/profile'>
      <ListItem button key={5}>
        <ListItemIcon><AccountBoxIcon /></ListItemIcon>
        <ListItemText primary={<Translate id='link.profile' />}/>
      </ListItem>
    </Link>
    <Link to='/authorized-apps'>
      <ListItem button key={6}>
        <ListItemIcon><LockOpenIcon /></ListItemIcon>
        <ListItemText primary={<Translate id='link.authorizedApps' />}/>
      </ListItem>
    </Link>
    <Link to='/add-fields'>
      <ListItem button key={7}>
        <ListItemIcon><ListIcon /></ListItemIcon>
        <ListItemText primary={<Translate id='link.addFields' />}/>
      </ListItem>
    </Link>
    {ENABLE_FULL_ACCESS_KEYS && 
      <Link to='/full-access-keys'>
      <ListItem button key={8}>
        <ListItemIcon><VpnKeyIcon /></ListItemIcon>
        <ListItemText primary={<Translate id='link.fullAccessKeys' />}/>
      </ListItem>
    </Link>
    }
   <LowerSection>      
      <Typography variant="h6"><Translate id='link.personaSwitchAccount'/></Typography>
      <UserAccounts
          accounts={availableAccounts}
          accountId={account.accountId}
          selectAccount={selectAccount}
      />
      <AccessAccountBtn/>
      <CreateAccountBtn/>
    </LowerSection>
    </List>
   
                        
    </div>
  );

  return (
    <div style={{position:'absolute', top:'10px', right:'0px'}}>
    

      {['right'].map((anchor) => (
        <React.Fragment key={anchor} >
        <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer(anchor, true)}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon fontSize="large"/>
          </IconButton>
          
          <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}
