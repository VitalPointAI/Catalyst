import React from 'react';
import clsx from 'clsx';
import EditInitSettings from '../EditDao/daoSettings'

// Material-UI Components
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings'

const useStyles = makeStyles({
  list: {
    width: 290,
  },
  fullList: {
    width: 'auto',
  },
});

export default function RightSideDrawer(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const {
    accountId,
    contract,
    currentPeriod,
    summoner,
    totalMembers,
    proposalDeposit,
    tokenName,
    depositToken
  } = props

  const handleEditSettingsClick = () => {
    toggleDrawer('right', false)
  };

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
     
    >
      <List>
        <EditInitSettings 
          contract={contract} 
          handleEditSettingsClick={handleEditSettingsClick}
          totalMembers={totalMembers}
           />
      </List>
    </div>
  );

  return (
    <div>
    

      {['right'].map((anchor) => (
        <React.Fragment key={anchor}>
        <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer(anchor, true)}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <SettingsIcon />
          </IconButton>
          
          <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}
