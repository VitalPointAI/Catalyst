import React from 'react' 
import bannerImage from '../../img/bannerimage.png'

//material UI components
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        maxWidth: 1000, 
    },
    button: {
        backgroundColor: '#ffa366',
        boxShadow: '3px 5px',
    },
    specialtext: {
        fontSize: '70px',
        fontWeight: 800, 
        textAlign: 'left',
        background: '-webkit-linear-gradient(45deg, #ff9966, #ff5500)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    text: {
        fontSize: '70px',
        fontWeight: 800, 
        textAlign: 'left',
    },
    image:{
        maxWidth: 500
    },
}));

const MainBanner = () => {
    const classes = useStyles(); 
    return (
    <Grid className={classes.root} container justify="center">  
        <Grid item xs={5}>  
            <Grid container className={classes.root}  spacing={2}> 
                <Grid item xs={12} spacing={3}>  
                        <h1> <span className={classes.specialtext}> Kickstart</span><br/>
                        <span className={classes.text}>Community</span></h1> 
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h5">Catalyzing Self Organization</Typography>
                </Grid>
                <Grid item xs={12}>
                     <Button className={classes.button} >Get Started</Button>
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