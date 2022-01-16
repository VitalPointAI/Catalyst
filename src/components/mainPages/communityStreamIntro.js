import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import Footer from '../common/Footer/footer'
import { Header } from '../Header/header'
import AddDaoForm from '../CreateDAO/addDao'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import Divider from '@material-ui/core/Divider'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import PostAddIcon from '@material-ui/icons/PostAdd';
import Skeleton from '@material-ui/lab/Skeleton';
import { LinearProgress } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    featureDAO: {
        minHeight: '200px',
        backgroundColor:'#eff3fb',
        padding: '20px',
    },
    spacing: {
      marginTop: '15px',
      marginBottom: '15px'
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    menuButton: {
      marginRight: theme.spacing(0),
    },
    card: {
      maxWidth: 345,
    },
    media: {
      height: 140,
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    drawer: {
        marginTop: '5px'
    }
  }));
  
export default function CommunityStreamIntro(props) {

    const classes = useStyles()
    const [editPersonaClicked, setEditPersonaClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [profileEdit, setProfileEdit] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [addDaoClicked, setAddDaoClicked] = useState(false)

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserIdx,
      did
    } = state

     useEffect(
        () => {
          if(state){
            setLoaded(true)
          }
    }, [state]
    )

    useEffect(
        () => {
    
    }, []
    )

  
    function handleAddDaoClick(property){
        setAddDaoClicked(property)
    }
    
    const addDaoClick = (event) => {
        handleExpanded()
        setAddDaoClicked(true)
    }

    function handleExpanded() {
      setAnchorEl(null)
    }
    
    return (
        <>
        <div className={classes.root}>
        {loaded ? <Header state={state}/> : <LinearProgress />}
        
        <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <Typography variant="h4" style={{marginTop:'40px', marginBottom: '40px'}}>Talent is waiting.</Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} >
          <List>
              <ListItem className={classes.spacing}>
                <ListItemIcon>
                  <AccountBalanceIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Easily establish a community and its governance processes for your project."
                />
              </ListItem>
              <Divider variant="middle" />
              <ListItem className={classes.spacing}>
                <ListItemIcon>
                  <PostAddIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Post opportunities for people to get involved and contribute."
                />
              </ListItem>
              <Divider variant="middle" />
              <ListItem className={classes.spacing}>
                <ListItemIcon>
                  <MonetizationOnIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Mint a community token to enable community voting, increase loyalty, and distribute ownership."
                />
              </ListItem>
              <Divider variant="middle" />
              <ListItem className={classes.spacing}>
              <ListItemIcon>
                <VerifiedUserIcon />
              </ListItemIcon>
              <ListItemText
                primary="Verify work progress and only pay when it's completed to your satisfaction, knowing that payment and work are governed by the underlying smart contracts."
              />
            </ListItem>
            <Divider variant="middle" />
          </List>
        <Typography variant="body1" style={{marginBottom: '15px'}}><a href="/profile">Want to join as an individual contributor?  Follow the conbributor stream.</a></Typography>
        <Button className={classes.spacing} style={{float: 'left', marginRight: '15px'}} variant="contained" color="primary" onClick={(e) => addDaoClick(e)}>
          Get Started
        </Button> <Typography variant="body2" style={{marginTop: '30px'}}>It only takes a few minutes and you can edit it later.</Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={2} lg={2} xl={2} >
        <Card className={classes.card}>
          <Skeleton variant="rect" width={210} height={435} />
        </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
      </Grid>
        
        </div>
        <Footer />

        {addDaoClicked ? <AddDaoForm
          state={state}
          handleAddDaoClick={handleAddDaoClick}
        /> : null }
        </>
        
    )
}