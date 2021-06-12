import React from 'react' 
import bannerImage from '../../img/bannerimage.png'
import { Link } from 'react-router-dom'

//material UI components
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'

const useStyles = makeStyles((theme) => ({
    root: {
      //  flexGrow: 1,
      //  maxWidth: 1000,
      padding: '10px'
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
    specialtextMobile: {
        fontSize: '60px',
        fontWeight: 800, 
        textAlign: 'center',
        background: '-webkit-linear-gradient(45deg, #ff9966, #ff5500)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    text: {
        fontSize: '70px',
        fontWeight: 800, 
        textAlign: 'left',
    },
    textMobile: {
        fontSize: '60px',
        fontWeight: 800, 
        textAlign: 'center',
    },
    image:{
        maxWidth: '95%',
        marginBottom: '10px',
        float: 'left'
    },
}));

const MainBanner = () => {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:420px)')

    return (
    !matches ?
        <>
      
            <Grid container justify="flex-start" alignItems="center" spacing={0}> 
                <Grid item xs={8} sm={8} md={7} lg={7} xl={7}>
                    <Typography variant="h1" style={{fontSize: 0}} gutterBottom>
                        <span className={classes.specialtext}>A New Era for</span><br></br>
                        <span className={classes.text}>Communities</span>
                    </Typography>
                    <Typography variant="h5" gutterBottom>Decentralized, autonomous communities (DACs).<br></br>Quite possibly the future of self-organization and coordination.</Typography>
                    <Link to='/learn'>
                        <Button className={classes.button} >Learn More</Button>
                    </Link>
                </Grid>
                <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                </Grid>
                <Grid item xs={5} sm={5} md={4} lg={4} xl={4}>
                    <img className={classes.image} src={bannerImage} />
                </Grid>
        </Grid>
        </>
    :
        <>
       
        <Grid container justify="center" alignItems="center" spacing={0}> 
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Typography variant="h1" style={{fontSize: 0}}>
                    <span className={classes.specialtextMobile}>A New Era for</span><br></br>
                    <span className={classes.textMobile}>Communities</span>
                </Typography>
            </Grid>
            <Grid item xs={8} sm={8} md={8} lg={8} xl={8} align="center">
                <img className={classes.image} src={bannerImage} />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '15px'}}>
                <Typography variant="h5" gutterBottom>Decentralized, autonomous communities (DACs).<br></br>
                Quite possibly the future of self-organization and coordination.</Typography>
            </Grid>
            <Grid item xs={8} sm={8} md={6} lg={6} xl={6} align="center">
                <Link to='/learn'>
                    <Button className={classes.button} >Learn More</Button>
                </Link>
            </Grid>
            
        </Grid>
        </>
   
    
    )
}

export default MainBanner 