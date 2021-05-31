import React from 'react' 
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core'
import { ArrowRightAltRounded } from '@material-ui/icons'
import bannerImage from './bannerimage.png'

const useStyles = makeStyles((theme) => ({

    root: {
        flexGrow: 1,
        margin: 'auto',
        maxWidth: 800, 
    },
    button: {
        backgroundColor: '#ffa366',
        boxShadow: '3px 5px',
        margin: 'auto',
        textAlign: 'center',
        color: "black",
        "&:hover": {
            backgroundColor: '#80d4ff',
            color: 'white',
        }
    },
    specialtext: {
        margin: 'center', 
        fontSize: '70px',
        fontWeight: 800, 
        textAlign: 'left',
        backgroundImage: '-webkit-linear-gradient(45deg, #ff9966, #ff5500)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        "&:hover": {
        backgroundImage: '-webkit-linear-gradient(45deg, #80d4ff, white)',
        }
    },
    text: {
        fontSize: '70px',
        fontWeight: 800, 
        textAlign: 'left',
    },
    image:{
        maxWidth: 500
    }
}));

const MainBanner = () => {
    const classes = useStyles(); 
    return (
    <Grid classNamw={classes.root} container justify="center">  
        <Grid  item xs={5}>  
            <Grid container spacing={3}>   
                <div>
                    <h1> <span className={classes.specialtext}> Kickstart</span><br />
                         <span className={classes.text}>Community</span></h1> 
                 </div> 
                <Grid item xs={12}>
                    <h5> Organize Differently</h5>
                </Grid>
             <Grid container justify="left" item xs={12}>
                <Grid item>
                     <Button variant="contained" className={classes.button} >Get Started</Button>
                </Grid>
        </Grid>
        </Grid>
        </Grid>
    <Grid item xs={6}>
    <img className={classes.image} src={bannerImage} />
    </Grid>
    </Grid>
    )
}

export default MainBanner 