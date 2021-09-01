import React, { useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { get, set, del } from '../../utils/storage'
import { Steps, Hints } from "intro.js-react";
import clsx from 'clsx'
import AddPersonaForm from '../AddPersona/addPersona'
import AddDaoForm from '../CreateDAO/addDao'
import { DASHBOARD_DEPARTURE } from '../../state/near'
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
const [options, setOptions] = useState({
  doneLabel: 'Continue!',
  showButtons: true,
  overlayOpacity: 0.5,
  scrollTo: 'element',
  skipLabel: "Skip",
  showProgress: true
})
const [anchorEl, setAnchorEl] = useState(null);
const [addPersonaClicked, setAddPersonaClicked] = useState(false)
const [addDaoClicked, setAddDaoClicked] = useState(false)
const [stepsEnabled, setStepsEnabled] = useState(false)
const [drawerState, setDrawerState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

const {
    state,
} = props
const steps = [
  {
    element: '.toolbar',
    intro: <Typography>This is the toolbar, and is where you can access all of the pages on Catalyst, along with some important actions.</Typography>
  },
  {
    element: '.managePersona',
    intro: <Typography>Here is the portal to the ‘My Personas’ page mentioned earlier, where you can edit your current Persona details, or any others created from this account.</Typography>,
    position: "right"
  },
  {
    element: '.createPersona',
    intro: <Typography>This function will bring you through the flow of creating a new Persona</Typography>,
    position: "right"
  },
  {
    element: '.myCommunities',
    intro: <Typography>Here you will find all of the communities that you have created for easy access.</Typography>,
    position: 'right'
  },
  {
    element: '.exploreCommunities',
    intro: <Typography>This page lets you explore, search, and visit all of the communities on Catalyst.</Typography>,
    position: 'right'
  },
  {
    element: '.createCommunity',
    intro:<> 
            <Typography>If you want to establish a new community on Catalyst, this is the button for you. </Typography>
            <br />
            <Typography> Here you can follow the instructions to create a community of your own.</Typography>,
          </>,
    position: 'right'
  },
  {
    intro: <Typography>That’s all for now. With that you’re ready to explore! </Typography>,
    position: "top"
  }
] 
useEffect(
  () => {


    let intervalController = setInterval(checkDash, 500)
    function checkDash(){
      let newVisit = get(DASHBOARD_DEPARTURE, [])
      if(newVisit[0]){
         
          if(newVisit[0].status=="true" && !newVisit[1]){
          setStepsEnabled(true)
          setDrawerState({ ...drawerState, ['left']: true})
          newVisit.push({arrived: 'true'})
          set(DASHBOARD_DEPARTURE, newVisit)
        }
        clearInterval(intervalController)
      }
    }
  }
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
function onStepsExit(){
  setStepsEnabled(false)
  setDrawerState({ ...drawerState, ['left']: false})
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
    <Steps 
      enabled= {stepsEnabled}
      steps={steps}
      initialStep={0}
      onExit={()=>{onStepsExit()}}
      options={options}
    />
    <div className='toolbar'>
    <List>
      <Link to='/'>
        <ListItem button key={1}>
          <ListItemIcon><PieChartIcon /></ListItemIcon>
          <ListItemText primary='Dashboard'/>
        </ListItem>
      </Link>
    </List>
    <Divider />
    <Typography variant='h6'>Personas</Typography>
    <List>
      <Link to='/personas'>
        <ListItem className='managePersona' button key={2}>
          <ListItemIcon><Avatar src={imageName} className={classes.small}/></ListItemIcon>
          <ListItemText primary='My Personas'/>
        </ListItem>
      </Link>
      <ListItem className='createPersona' button key={3} onClick={(e) => addPersonaClick(e)}>
        <ListItemIcon><AddBoxIcon /></ListItemIcon>
        <ListItemText primary='Create Persona'/>
      </ListItem>
    </List>
    <Divider />
    <Typography variant='h6'>Communities</Typography>
    <List>
      <Link to='/daos'>
        <ListItem className='myCommunities' button key={4}>
          <ListItemIcon><GroupIcon /></ListItemIcon>
          <ListItemText primary='My Communities'/>
        </ListItem>
      </Link>
      
    <Link to='/explore'>
      <ListItem className='exploreCommunities' button key={5}>
        <ListItemIcon><ExploreIcon /></ListItemIcon>
        <ListItemText primary='Explore Communities'/>
      </ListItem>
    </Link>
    <ListItem className='createCommunity' button key={6} onClick={(e) => addDaoClick(e)}>
        <ListItemIcon><AddBoxIcon /></ListItemIcon>
        <ListItemText primary='Create Community'/>
      </ListItem>
    </List>
    <Divider />
    </div>
  </>
  ) :
    state.wallet.signedIn ? (
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
    <Typography variant='h6'>Personas</Typography>
    <List>
      <Link to='/personas'>
        <ListItem button key={2}>
          <ListItemIcon><Avatar src={imageName} className={classes.small}/></ListItemIcon>
          <ListItemText primary='My Personas'/>
        </ListItem>
      </Link>
      <ListItem button key={3} onClick={(e) => addPersonaClick(e)}>
        <ListItemIcon><AddBoxIcon /></ListItemIcon>
        <ListItemText primary='Create Persona'/>
      </ListItem>
    </List>
    <Divider />
    <Typography variant='h6'>Communities</Typography>
    <List>
      <Link to='/daos'>
        <ListItem button key={4}>
          <ListItemIcon><GroupIcon /></ListItemIcon>
          <ListItemText primary='My Communities'/>
        </ListItem>
      </Link>
      
    <Link to='/explore'>
      <ListItem button key={5}>
        <ListItemIcon><ExploreIcon /></ListItemIcon>
        <ListItemText primary='Explore Communities'/>
      </ListItem>
    </Link>
    <ListItem button key={6} onClick={(e) => addDaoClick(e)}>
        <ListItemIcon><AddBoxIcon /></ListItemIcon>
        <ListItemText primary='Create Community'/>
      </ListItem>
    </List>
    <Divider />
    </>
    ) : null }
    <List>
    <Link to='/about'>
      <ListItem button key={7}>
        <ListItemIcon><InfoIcon /></ListItemIcon>
        <ListItemText primary='About Catalyst'/>
      </ListItem>
    </Link>
    <Link to='/developer'>
      <ListItem button key={8}>
        <ListItemIcon><CodeIcon /></ListItemIcon>
        <ListItemText primary='Developers'/>
      </ListItem>
    </Link>
    <Link to='/learn'>
      <ListItem button key={9}>
        <ListItemIcon><SchoolIcon /></ListItemIcon>
        <ListItemText primary='Learn'/>
      </ListItem>
    </Link>
    <Link to='/contact'>
      <ListItem button key={10}>
        <ListItemIcon><ContactSupportIcon /></ListItemIcon>
        <ListItemText primary='Contact'/>
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
           
            
        /> : null }

    </React.Fragment>   
)
}
