import React from 'react'
import { Redirect, Link } from 'react-router-dom'
import MainBanner from './mainBanner'
import Stories from './stories'
import Footer from '../../components/common/Footer/footer'

// Material UI Components
import { makeStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Divider from '@material-ui/core/Divider'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      },
    top: {
        backgroundImage: 'linear-gradient(180deg, #80d4ff, white)',
       // height: '45px',
      //  margin: 'auto',
        backgroundSize: '100%',
    //    margin: 0,
    //    minWidth: '100%',
    //    padding: 0,
  
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
    },
    bottom: {
        background: 'linear-gradient(360deg, #80d4ff, white)',
        height: '45px',
        margin: 0,
        minWidth: '100%',
        padding: 0,
        bottom: 0, 
    },
    center: {
        textAlign: 'center',
        fontWeight: 700,
        paddingTop: 30, 
        paddingBottom: 60, 
    },
    bottomtext:{
        textAlign: 'center',
        fontWeight: 700,
        paddingTop: 30, 
    },
    button: {
        marginTop: 50, 
        backgroundColor: '#ffa366',
        boxShadow: '3px 5px',
        margin: 'auto',
    },
    button2:
    {
        marginTop: 20, 
        backgroundColor: '#ffa366',
        boxShadow: '3px 5px',
        margin: 'auto',
        textAlign: 'center',
        color: "black",
        width: 300, 
        height: 40,
    },
      specialtext: { 
        textAlign: 'center',
        fontWeight: 700,
        paddingBottom: 60, 
        backgroundImage: '-webkit-linear-gradient(45deg, #ff9966, #ff5500)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
}));

const FrontPage = () => {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')

    return(
    <>
    
   <div className={classes.top}>
   {!matches ?
        <Grid container justify="center" alignItems="center" spacing={3} >
            <Grid item xs={12} sm={12} md={10} lg={8} xl={8} style={{marginTop: '50px', marginBottom: '50px'}}>
                <MainBanner />
            </Grid> 
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h3" align="center" style={{marginBottom: '20px'}}>
                    Discover the communities growing with <span className={classes.specialtext}>Catalyst</span>...
                </Typography>
                <Stories/>
            </Grid>
            <Grid item xs={12}>
                <h2 className={classes.bottomtext}>...or learn how Catalyst works</h2>
            </Grid>
            <Button href='/FAQ' className={classes.button2}>Visit the FAQ</Button>
        </Grid>
    :
        <Grid container justify="center" alignItems="center" spacing={0} >
            <Grid item xs={12} sm={12} md={10} lg={8} xl={8} style={{marginTop: '20px', marginBottom: '50px'}}>
                <MainBanner />
            </Grid>
          
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h4" align="center" style={{marginBottom: '20px'}}>
                    Discover the communities growing with <span className={classes.specialtext}>Catalyst</span>...
                </Typography>
                <Stories/>
            </Grid>
            <Grid item xs={12}>
                <h2 className={classes.bottomtext}>...or learn how Catalyst works</h2>
            </Grid>
            <Button href='/FAQ' className={classes.button2}>Visit the FAQ</Button>
        </Grid>

    }
    </div>
    
    </>
    )
}

export default FrontPage