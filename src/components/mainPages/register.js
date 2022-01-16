import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import Footer from '../common/Footer/footer'
import { STORAGE, GAS, parseNearAmount } from '../../state/near'
import { Header } from '../Header/header'

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
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import Divider from '@material-ui/core/Divider'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import Skeleton from '@material-ui/lab/Skeleton';
import StarsIcon from '@material-ui/icons/Stars';

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
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    menuButton: {
      marginRight: theme.spacing(0),
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    drawer: {
        marginTop: '5px'
    }
  }));
  
export default function Register(props) {

    const classes = useStyles()
    const [registered, setRegistered] = useState(false)

    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      accountId,
      did
    } = state

    useEffect(
        () => {
          let urlVariables = window.location.search
          const urlParameters = new URLSearchParams(urlVariables)
          let transactionHash = urlParameters.get('transactionHashes')
          registered && transactionHash ? window.location.assign('/') : null
    }, [registered]
    )

   async function onSubmit(){
      if(did){
        setRegistered(true)
        try{
          await didRegistryContract.putDID({
            accountId: accountId,
            did: did
          }, GAS, parseNearAmount((parseFloat(STORAGE)).toString()))
        } catch (err) {
          console.log('error registering', err)
          setRegistered(false)
        }
      }
    }

    function handleNo(){
      window.location.assign('/')
    }
    
    return (
        <>
        <div className={classes.root}>
        <Header state={state}/>

        <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <Typography variant="h4" style={{marginTop:'40px', marginBottom: '40px'}}>To be found or not to be found?</Typography>
          <Typography variant="h6" style={{marginTop:'40px', marginBottom: '40px'}}>Decide if you want to register your profile.</Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} >
          <List>
              <ListItem className={classes.spacing}>
                <ListItemIcon>
                  <AccountBoxIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Showcases your profile, skills, and talents, and is the first step towards obtaining verified status."
                />
              </ListItem>
              <Divider variant="middle" />
              <ListItem className={classes.spacing}>
                <ListItemIcon>
                  <SupervisedUserCircleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Makes it easier for communities looking for talent to find you."
                />
              </ListItem>
              <Divider variant="middle" />
              <ListItem className={classes.spacing}>
              <ListItemIcon>
                <StarsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Allows you to show up on leaderboards based on reputation and community standing."
              />
            </ListItem>
            <Divider variant="middle" />
          </List>
       
        <Button className={classes.spacing} style={{float: 'left', marginTop: '20px', marginRight: '15px'}} variant="contained" color="primary" onClick={onSubmit}>
          Register
        </Button>
        <Typography variant="body2" style={{marginTop: '30px'}}>
          You can unregister at any time.
        </Typography>
        <div style={{clear:'both'}} />
        <Button
          color="secondary"
          style={{marginTop: '20px'}}
          onClick={handleNo}
        >
          No Thanks
        </Button>
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
        </>
        
    )
}