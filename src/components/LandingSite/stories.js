import React from 'react'
import nearlogo from '../../img/near_logo_only.png'
import owsLogo from '../../img/ows.jpg'
import { Link } from 'react-router-dom'

//material ui components
import WorkTwoToneIcon from '@material-ui/icons/WorkTwoTone';
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import { Card, CardActions, CardContent, CardHeader, makeStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import BrushIcon from '@material-ui/icons/Brush'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Avatar from '@material-ui/core/Avatar'

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
        marginLeft: 'auto'
    },
    image: {
        width: '20%',
        height: '33%',
    },
    card: {
        minHeight: '250px'
    },
    icon:{
        fontSize: "48px", 
    }
}));

const Stories = () => {

    const classes = useStyles()
    const matches = useMediaQuery('(max-width:420px)')

    return(
        !matches ? 
        <Grid justify='center' container className={classes.root} spacing={5}>
            <Grid item xs={6}>
                <Card className={classes.card}>
                    <CardHeader
                        avatar={
                            <Avatar src={nearlogo} /> 
                        }
                        title={<Typography variant="h5">NEAR Community Fund</Typography>}
                    />
                    <CardContent>
                        <Typography variant="body1">
                        See how the Near Community Fund uses Catalyst 
                        to manage resources, foster innovation, and fund new projects.
                        </Typography>
                    </CardContent>
                    <CardActions style={{textAlign: 'right', display: 'block', marginRight: '30px'}}>
                        <Link to='nearStory'>
                            <Button variant="contained" className={classes.button}>Take Me There</Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid> 
            <Grid item xs={6}>
                <Card className={classes.card}>
                    <CardHeader
                        avatar={
                            <BrushIcon className={classes.icon}></BrushIcon>
                        }
                        title={<Typography variant="h5">Artist Community</Typography>}
                    />
                    <CardContent>
                        <Typography variant="body1">
                        See how Karen grows, nurtures, and interacts with a community 
                        centered around her love of watercolour art.
                        </Typography>
                    </CardContent>
                    <CardActions style={{textAlign: 'right', display: 'block', marginRight: '30px'}}>
                        <Link to='artistStory'>
                            <Button variant="contained" className={classes.button}>Take Me There</Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid>
            <Grid item xs={6}>
                <Card className={classes.card}>
                    <CardHeader
                        avatar={<Avatar src={owsLogo}/>}
                        title={<Typography variant="h5">Open Web Sandbox</Typography>}
                    />
                    <CardContent>
                        <Typography variant="body1">
                        See how the Sandbox uses Catalyst to encourage participation and collaboration on different activities in the NEAR Ecosystem.
                        </Typography>
                    </CardContent>
                    <CardActions style={{textAlign: 'right', display: 'block',  marginRight: '30px'}}>
                        <Link to='artistStory'>
                            <Button variant="contained" className={classes.button}>Take Me There</Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
        : 
        <Grid justify="center" container spacing={2}>
            <Grid item xs={11}>
                <Card>
                    <CardHeader
                        avatar={
                            <Avatar src={nearlogo} /> 
                        }
                        title={<Typography variant="h5">NEAR Community Fund</Typography>}
                    />
                    <CardContent>
                        <Typography variant="body1">
                        See how the Near Community Fund uses Catalyst 
                        to manage resources, foster innovation, and fund new projects.
                        </Typography>
                    </CardContent>
                    <CardActions style={{textAlign: 'right', display: 'block',  marginRight: '30px'}}>
                        <Link to='nearStory'>
                            <Button variant="contained" className={classes.button}>Take Me There</Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid> 
            <Grid item xs={11}>
                <Card>
                    <CardHeader
                        avatar={
                            <BrushIcon className={classes.icon}></BrushIcon>
                        }
                        title={<Typography variant="h5">An Artist's Community</Typography>}
                    />
                    <CardContent>
                        <Typography variant="body1">
                        See how Karen grows and nurtures a community 
                        centered around her watercolour art.
                        </Typography>
                    </CardContent>
                    <CardActions style={{textAlign: 'right', display: 'block', marginRight: '30px'}}>
                        <Link to='artistStory'>
                            <Button variant="contained" className={classes.button}>Take Me There</Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid>
            <Grid item xs={11}>
                <Card>
                    <CardHeader
                        avatar={<Avatar src={owsLogo}/>}
                        title={<Typography variant="h5">Open Web Sandbox</Typography>}
                    />
                    <CardContent>
                        <Typography variant="body1">
                        See how the Sandbox uses Catalyst to encourage participation and collaboration on different activities in the NEAR Ecosystem.
                        </Typography>
                    </CardContent>
                    <CardActions style={{textAlign: 'right', display: 'block',  marginRight: '30px'}}>
                        <Link to='artistStory'>
                            <Button variant="contained" className={classes.button}>Take Me There</Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>

    )
}

export default Stories 