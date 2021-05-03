import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import AddPersonaForm from '../AddPersona/addPersona'
import AddDaoForm from '../CreateDAO/addDao'

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import AddBoxIcon from '@material-ui/icons/AddBox'
import AccountBalanceIcon from '@material-ui/icons/AccountBalance'
import Avatar from '@material-ui/core/Avatar'

const useStyles = makeStyles((theme) => ({
    list: {
        width: 250,
        padding: '10px',
      },
    fullList: {
        width: 'auto',
    },
    menuButton: {
        marginTop: '5px'
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        float: 'right',
      },
  }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function LeftSideDrawer(props) {

const classes = useStyles();

const [anchorEl, setAnchorEl] = useState(null);
const [addPersonaClicked, setAddPersonaClicked] = useState(false)
const [addDaoClicked, setAddDaoClicked] = useState(false)

const [drawerState, setDrawerState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

const {
    state,
    handleSnackBarOpen, handleSuccessMessage, handleErrorMessage, snackBarOpen, severity, errorMessage, successMessage
} = props

const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
}

function handleAddPersonaClick(property){
    setAddPersonaClicked(property)
}

const addPersonaClick = (event) => {
    setAddPersonaClicked(true)
    handleClick(event)
}

function handleAddDaoClick(property){
    setAddDaoClicked(property)
}

const addDaoClick = (event) => {
    setAddDaoClicked(true)
    handleClick(event)
}

const toggleDrawer = (anchor, open) => (event) => {
if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
    return
}

setDrawerState({ ...drawerState, [anchor]: open });
}

const list = (anchor) => (
<div
    className={clsx(classes.list, {
    [classes.fullList]: anchor === 'top' || anchor === 'bottom',
    })}
    role="presentation"
    onClick={toggleDrawer(anchor, false)}
    onKeyDown={toggleDrawer(anchor, false)}
>
    <Typography variant='h6'>Personas</Typography>
    <List>
      <ListItem button key={1} onClick={(e) => addPersonaClick(e)}>
        <ListItemIcon><Avatar src={imageName} className={classes.small}/></ListItemIcon>
        <ListItemText primary='Create Persona'/>
      </ListItem>
    </List>
    <Divider />
    <Typography variant='h6'>DAOs</Typography>
    <List>
      <ListItem button key={4} onClick={(e) => addDaoClick(e)}>
        <ListItemIcon><AddBoxIcon /></ListItemIcon>
        <ListItemText primary='Create DAO'/>
      </ListItem>
    <Link to='/explore'>
      <ListItem button key={5}>
        <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
        <ListItemText primary='Explore DAOs'/>
      </ListItem>
    </Link>
    
    </List>
    
</div>
)

return (
    <React.Fragment key={'left'}>
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer('left', true)}>
        <MenuIcon />
        </IconButton>
        
        <Drawer anchor={'left'} open={drawerState['left']} onClose={toggleDrawer('left', false)}>
        {list('left')}
        </Drawer>

        {addPersonaClicked ? <AddPersonaForm
            state={state}
            handleAddPersonaClick={handleAddPersonaClick}
        /> : null }

        {addDaoClicked ? <AddDaoForm
            state={state}
            handleAddDaoClick={handleAddDaoClick}
            handleSnackBarOpen={handleSnackBarOpen}
            handleSuccessMessage={handleSuccessMessage}
            handleErrorMessage={handleErrorMessage}
            snackBarOpen={snackBarOpen}
            severity={severity}
            errorMessage={errorMessage}
            successMessage={successMessage}
            
        /> : null }

    </React.Fragment>   
)
}
