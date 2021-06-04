import React from 'react' 
import MainBanner from './mainBanner'
import Stories from './stories'

// Material UI Components
import { makeStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        minHeight: '100%',
        margin: 'auto',
        width: 1000,
        paddingTop: 20, 
    },
    top: {
        background: 'linear-gradient(180deg, #80d4ff, white)',
        height: '45px',
        margin: 0,
        minWidth: '100%',
        padding: 0,
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
    const classes = useStyles(); 
    return(
    <>
    <div className = {classes.top}></div>
    <Grid container justify="center" className={classes.root} spacing={2}>
        <Grid item xs={12}>
                <MainBanner></MainBanner>
        </Grid> 
        <Grid item xs={12}>
              <h2 className={classes.center}>Discover some ways <span className={classes.specialtext}>Catalyst</span> is being used...</h2>
              <Stories></Stories>
        </Grid>
        <Grid item xs={12}>
             <h2 className={classes.bottomtext}>...or learn about how it works</h2>
        </Grid>
        <Button href='/FAQ' className={classes.button2}>Visit the FAQ</Button>
    </Grid>
    <br />
    <br />
    <div className = {classes.bottom}></div>
    </>
    )
}

export default FrontPage