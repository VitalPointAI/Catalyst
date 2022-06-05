import React, { useState, useEffect, useContext} from 'react'
import { Link, useParams } from 'react-router-dom'
import { get, set, del } from '../../utils/storage'
import clsx from 'clsx'
import { appStore, onAppMount } from '../../state/app';
import AddPersonaForm from '../AddPersona/addPersona'
import AddDaoForm from '../CreateDAO/addDao'
import EditDaoForm from '../EditDao/editDao'
import AddFTForm from '../CreateFT/createFT'
import NotificationCard from '../Notifications/notifications'
import {ceramic} from '../../utils/ceramic'

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
import Avatar from '@material-ui/core/Avatar'
import GroupIcon from '@material-ui/icons/Group'
import ExploreIcon from '@material-ui/icons/Explore'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import InfoIcon from '@material-ui/icons/Info'
import CodeIcon from '@material-ui/icons/Code'
import SchoolIcon from '@material-ui/icons/School'
import ContactSupportIcon from '@material-ui/icons/ContactSupport'
import PieChartIcon from '@material-ui/icons/PieChart'
import NotificationsIcon from '@material-ui/icons/Notifications'
import Badge from '@material-ui/core/Badge'
import LocalHospitalIcon from '@material-ui/icons/LocalHospital'
import EditIcon from '@material-ui/icons/Edit'

const useStyles = makeStyles((theme) => ({
    list: {
        width: 250,
        padding: '10px',
      },
    fullList: {
        width: 'auto',
    },
    menuButton: {
        marginTop: '5px',
        float: 'left',
        
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        float: 'right',
      },
  }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function LeftSideDrawer(props) {

const classes = useStyles()
const matches = useMediaQuery('(max-width:500px)')
const [anchorEl, setAnchorEl] = useState(null);
const [addPersonaClicked, setAddPersonaClicked] = useState(false)
const [addDaoClicked, setAddDaoClicked] = useState(false)
const [editDaoClicked, setEditDaoClicked] = useState(false)
const [addFTClicked, setAddFTClicked] = useState(false)
const [notificationsClicked, setNotificationsClicked] = useState(false)
const [newNotifications, setNewNotifications] = useState(0)

const { state, update } = useContext(appStore);

const [drawerState, setDrawerState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

const {
  wallet,
  appIdx,
  accountId,
  isUpdated,
  accountType
} = state

const {
  contractId
} = useParams()

useEffect(
  () => {

    async function fetchData(){
      if(isUpdated){}
      if(accountId){
        //get the list of all notifications for all accounts
        let result = await ceramic.downloadKeysSecret(appIdx, 'notifications')
        if(result){

            //convert the object from ceramic to map in order to more easily
            //return notifications associated with current account
            if(result[0]){
              let notificationMap = new Map(Object.entries(result[0])) 

              let notifications = 0;

              //loop thorugh all notifications for user, if the read flag is false, increase the count
              //for the notification badge
              if(notificationMap.get(accountId)){
                for(let i = 0; i < notificationMap.get(accountId).length; i++){
                    if(notificationMap.get(accountId)[i].read == false){
                        notifications++;
                    }
                }
              }
            

            //set the counter for the badge to the amount of unread notifications
            setNewNotifications(notifications)
            }
        }
      }
    }

    fetchData()
    .then((res) => {
  
    })
  }, [isUpdated, accountId]
)

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

function handleEditDaoClick(property){
  setEditDaoClicked(property)
}

function handleAddFTClick(property){
    setAddFTClicked(property)
}

function handleNotificationClick(property){
  setNotificationsClicked(property)

}

const addDaoClick = (event) => {
    setAddDaoClicked(true)
    handleClick(event)
}

const editDaoClick = (event) => {
  setEditDaoClicked(true)
  handleClick(event)
}

const addFTClick = (event) => {
    setAddFTClicked(true)
    handleClick(event)
}

const notificationsClick = (event) => {
    setNotificationsClicked(true)
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
{!matches ? (
  <>
   
    <div className='toolbar'>
    <List>
      <Link to='/'>
        <ListItem button key={1}>
          <ListItemIcon><PieChartIcon /></ListItemIcon>
          <ListItemText primary='Dashboard'/>
        </ListItem>
      </Link>
      <ListItem button key={2}>
        <ListItemIcon>
          <Badge badgeContent={newNotifications} color='primary'>   
          <NotificationsIcon />
          </Badge>
        </ListItemIcon>
        
        <ListItemText onClick={(e) => notificationsClick(e)} primary='Notifications'/>
      </ListItem>
    </List>
    <Divider />
    <Typography variant='h6'>Account</Typography>
    <Typography variant='body1' style={{fontSize: '60%'}}>
      {accountId && accountId.length <= 30 ? accountId : accountId ? accountId.substring(0,28) + "..." : null}<br></br>
      {accountType}
    </Typography>
    <List>
      {accountType == 'guild' ? (
        <a href="https://nearguilds.live">
          <ListItem className='managePersona' button key={3}>
            <ListItemIcon><Avatar src={imageName} className={classes.small}/></ListItemIcon>
            <ListItemText primary='Manage Guild'/>
          </ListItem>
        </a>)
        :(
          <a href="https://nearpersonas.live">
            <ListItem className='managePersona' button key={3}>
              <ListItemIcon><Avatar src={imageName} className={classes.small}/></ListItemIcon>
              <ListItemText primary='Manage Persona'/>
            </ListItem>
          </a>
        )}
    </List>
    <Divider />
    <Typography variant='h6'>Project Communities</Typography>
    <List>
      <ListItem className='createCommunity' button key={8} onClick={(e) => addDaoClick(e)}>
      <ListItemIcon><AddBoxIcon /></ListItemIcon>
      <ListItemText primary='Create New'/>
    </ListItem>
    <Link to='/explore'>
      <ListItem className='exploreCommunities' button key={6}>
        <ListItemIcon><ExploreIcon /></ListItemIcon>
        <ListItemText primary='Explore'/>
      </ListItem>
    </Link>
    </List>
    <Divider />
    <Typography variant='h6'>Fungible Tokens</Typography>
    <List>
      <Link to='/fts'>
        <ListItem className='exploreTokens' button key={9}>
          <ListItemIcon><ExploreIcon /></ListItemIcon>
          <ListItemText primary='Explore Tokens'/>
        </ListItem>
      </Link>
      <ListItem className='createFT' button key={10} onClick={(e) => addFTClick(e)}>
        <ListItemIcon><AddBoxIcon /></ListItemIcon>
        <ListItemText primary='Create Token'/>
      </ListItem>
    </List>
    <Divider />
    </div>
  </>
  ) :
    wallet.signedIn ? (
      <>
      <List>
      <Link to='/'>
        <ListItem button key={1}>
          <ListItemIcon><PieChartIcon /></ListItemIcon>
          <ListItemText primary='Dashboard'/>
        </ListItem>
      </Link>
    </List>
    <Divider />
    <Typography variant='h6'>Account</Typography>
    <Typography variant='body1' style={{fontSize: '60%'}}>
      {accountId.length <= 30 ? accountId : accountId.substring(0,28) + "..."}<br></br>
      ({accountType})
    </Typography>
    <List>
      {accountType == 'guild' ? (
        <a href="https://nearguilds.live">
          <ListItem className='managePersona' button key={2}>
            <ListItemIcon><Avatar src={imageName} className={classes.small}/></ListItemIcon>
            <ListItemText primary='Manage'/>
          </ListItem>
        </a>)
        :(
          <a href="https://nearpersonas.live">
            <ListItem className='managePersona' button key={2}>
              <ListItemIcon><Avatar src={imageName} className={classes.small}/></ListItemIcon>
              <ListItemText primary='Manage'/>
            </ListItem>
          </a>
        )}
    </List>
    <Divider />
    <Typography variant='h6'>Project Communities</Typography>
    <List>
    <ListItem button key={7} onClick={(e) => addDaoClick(e)}>
      <ListItemIcon><AddBoxIcon /></ListItemIcon>
      <ListItemText primary='Create New'/>
    </ListItem>     
    <Link to='/explore'>
      <ListItem button key={5}>
        <ListItemIcon><ExploreIcon /></ListItemIcon>
        <ListItemText primary='Explore'/>
    </ListItem>
    </Link>
    </List>
    <Divider />
    <Typography variant='h6'>Fungible Tokens</Typography>
    <List>
      <Link to='/fts'>
        <ListItem className='exploreTokens' button key={8}>
          <ListItemIcon><ExploreIcon /></ListItemIcon>
          <ListItemText primary='Explore Tokens'/>
        </ListItem>
      </Link>
      <ListItem className='createFT' button key={9} onClick={(e) => addFTClick(e)}>
        <ListItemIcon><AddBoxIcon /></ListItemIcon>
        <ListItemText primary='Create Token'/>
      </ListItem>
    </List>
    <Divider />
    </>
    ) : null }
    
    <Typography variant='h6'>Catalyst Support</Typography>
    <List>
    <a href='https://vitalpoint.ai/catalyst'>
      <ListItem button key={7}>
        <ListItemIcon><InfoIcon /></ListItemIcon>
        <ListItemText primary='About Catalyst'/>
      </ListItem>
    </a>
    <a href='https://vitalpoint.ai/catalyst-for-developers'>
      <ListItem button key={8}>
        <ListItemIcon><CodeIcon /></ListItemIcon>
        <ListItemText primary='Developers'/>
      </ListItem>
    </a>
    <a href='https://vitalpoint.ai/docs-catalyst/'>
      <ListItem button key={9}>
        <ListItemIcon><SchoolIcon /></ListItemIcon>
        <ListItemText primary='Learn'/>
      </ListItem>
    </a>
    <a href='https://vitalpoint.ai/catalyst-contact/'>
      <ListItem button key={10}>
        <ListItemIcon><ContactSupportIcon /></ListItemIcon>
        <ListItemText primary='Contact'/>
      </ListItem>
    </a>
    </List>
</div>
)

return (
    <React.Fragment key={'left'}>
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer('left', true)}>
        <MenuIcon style={{color: 'white'}}/>
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
        /> : null }
        
        {editDaoClicked ? <EditDaoForm
          state={state}
          handleEditDaoClickState={handleEditDaoClick}
          contractId={contractId}
        /> : null }
        
        {addFTClicked ? <AddFTForm
          state={state}
          handleAddFTClick={handleAddFTClick}
        /> : null }

        {notificationsClicked ? 
        <NotificationCard
        toolbar={true}
        state={state}
        handleNotificationClick={handleNotificationClick}
        />: null
        }

    </React.Fragment>   
)
}
