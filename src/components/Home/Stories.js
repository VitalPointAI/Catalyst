import React from 'react'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import BrushIcon from '@material-ui/icons/Brush'
import AttachMoneyTwoToneIcon from '@material-ui/icons/AttachMoneyTwoTone';
import WorkTwoToneIcon from '@material-ui/icons/WorkTwoTone';
import nearlogo from './near_logo_only.png'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        margin: 'auto',
        padding: 0,
        width: '80%',
        height: '50%', 
    },
    text: {
        margin: 'auto',
        width: '70%',
        minHeight: '100%',
        fontSize: '16px',
        textAlign: 'center'
    },
    paper:{
        height: '120%', 
        boxShadow: "3px 5px",
        justifyContent: "center", 
    },
    grid: {
        width: '100%',
        height: '100%', 
        margin: 'auto'
    },
    button: {
        position: 'center',
        backgroundColor: '#ffa366',
        textAlign: 'center',
        justifyContent: "center", 
        color: "black",
    },
    image: {
        width: '20%',
        height: '33%',
    },
    icon:{
        fontSize: "48px", 
    }
}));
export const Stories = () => {
    const classes = useStyles(); 

    return(
        <Grid justify='center' container className={classes.root} spacing={5}>
            <Grid item xs={6}>
                <Paper className={classes.paper}>
                    <h3 className={classes.text}>
                    <img className={classes.image} src={nearlogo} /> 
                    <br />   <br/>   <br/>   
                    Read about how the Near Community Fund uses Catalyst 
                    to foster innovation, and fund new projects.
                    <br />   <br/>   <br/>
                    <Button className={classes.button}>Take Me There</Button>
                    </h3>
                </Paper>
            </Grid> 
            <Grid item xs={6}>
                <Paper justify="center" className={classes.paper}>
                        <h5 className={classes.text}>
                        <BrushIcon className={classes.icon}></BrushIcon>
                        <br />    <br/>  <br />
                        Read about how Karen has created a community 
                        centered around her watercolour art.
                        <br/>   <br/>   <br/>   <br/>
                        <Button className={classes.button}>Take Me There</Button>
                         </h5>
                </Paper>
            </Grid>
        </Grid>
    )
}

export default Stories 