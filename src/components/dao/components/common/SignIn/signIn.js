import React from 'react'
//import { login } from '../../../utils'
import { makeStyles } from '@material-ui/core/styles'
import Footer from '../Footer/footer'

// Material UI Components
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography';
import LockOpenTwoToneIcon from '@material-ui/icons/LockOpenTwoTone';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        maxWidth: 300,
        margin: 'auto',
        marginTop: 50,
        minHeight: 550,
    },
    root2: {
      flexGrow: 1,
      maxWidth: '95%',
      margin: 'auto',
      marginTop: 50,
      minHeight: 550,
  },
    paper: {
        padding: theme.spacing(4),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    customCard: {
        maxWidth: 600,
        minWidth: 275,
        margin: 'auto',
        padding: 20
    },
    customCard2: {
      maxWidth: '95%',
      minWidth: 275,
      margin: 'auto',
      padding: 20,
      marginLeft: 50
  },
    media: {
        height: 140,
      },
    button: {
        margin: theme.spacing(1),
      },
    }));

export default function SignIn() {
const login = null
const classes = useStyles()

    return (
      <>
        <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <Paper className={classes.paper}>
            
            <Grid container spacing={2}>
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
            <div className={classes.root}>
              <Card className={classes.customCard}>
                <CardMedia
                    component="img"
                    image={require("../../../../../images/near_logo.png")}
                    title="Near Logo"
                />
                <CardMedia
                    component="img"
                    image={require("../../../../../images/guild-logo-small.png")}
                    title="Near Logo"
                />
                <CardHeader title="Ready to Experience our Guild's DAO?"></CardHeader>
                <CardContent>
                <Typography variant="body2" color="textPrimary" component="p" style={{marginBottom: 20}}>
                To do so, you need to sign in. The button below will sign you in using NEAR Wallet.</Typography>
                <Typography variant="body2" color="textSecondary" component="p" style={{marginBottom: 20}}>
                Go ahead and click the button below to get started:</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  startIcon={<LockOpenTwoToneIcon />}
                  onClick={login}
                >Sign In</Button>
                </CardContent>
              </Card>
              </div>
            </Grid>
            <Grid item xs={8} sm={8} md={8} lg={8} xl={8}>
              <div className={classes.root2}>
                  <Card className={classes.customCard2}>
                   
                    <CardContent>
                    <Typography variant="h4" color="textPrimary" style={{textAlign: 'left', marginBottom: 20}}>What's a DAO?</Typography>
                    <Typography variant="body1" color="textPrimary" component="p" style={{textAlign: 'left', marginBottom: 20}}>
                    DAO = Decentralized Autonomous Organization.  It's an interesting way to manage resource allocation in a community.  People submit
                    proposals which members can vote on and if they pass, they are automatically funded.</Typography>
                    <Typography variant="h4" color="textPrimary" style={{textAlign: 'left', marginBottom: 20}}>What Does It Run On?</Typography>
                    <Typography variant="body1" color="textPrimary" component="p" style={{textAlign: 'left', marginBottom: 20}}>
                    The VP Guild DAO is currently running on NEAR Protocol's Testnet.  To participate and play around with it <b>you need Vital Point Coin (VPC)</b>.  You can get some
                    by asking me for it in our <a href="https://discord.gg/3AKNUdU3cz">Discord Server.</a>  Because it's running on Testnet, play with it, but it's still in development and anything in there can disappear or change at any time.</Typography>
                    <Typography variant="h4" color="textPrimary" style={{textAlign: 'left', marginBottom: 20}}>Take a Quick Video WalkThrough</Typography>
                    <div style={{float:'left', marginRight: '10px'}}><iframe width="200" height="115" src="https://www.youtube.com/embed/I-gDJAHtDm0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true" style={{float:'left'}}></iframe></div>
                    <Typography variant="body1" color="textPrimary" component="p" style={{textAlign: 'left', marginBottom: 20}}>
                    I didn't speed anything up in this video.  It's showing realtime interaction with the NEAR testnet.  The voting, grace periods are set to approx 1 min (so you may want to fast forward through those parts...)</Typography>
                   
                    </CardContent>
                  </Card>
                  </div>
                </Grid>
      
               </Grid>
            </Paper>
          </Grid>
         
        </Grid>
        <Footer />
        </>
    )
}