import React from 'react'
import ImageLoader from '../common/ImageLoad/imageLoad'
import guild from '../../img/guild.png'
import individual from '../../img/individual.png'
import { guildsRootName, personasRootName } from '../../state/near'

// Material UI Components
import { makeStyles } from '@material-ui/styles'
import { CardHeader, CardContent, Card } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      },
    center: {
        textAlign: 'center',
        fontWeight: 700,
        paddingTop: 30, 
        paddingBottom: 60, 
    },
    button: {
        width: '80%',
        fontSize: '40px'
    }
}));

const Choice = () => {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')

    return(
    <>
   {!matches ?
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '50px', marginBottom:'40px'}}>
                <Typography variant="h4" align="center">
                   You arrive at a<br></br>
                   fork in the road.
                </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom:'20px'}}>
                <Typography variant="h5" align="center">
                Which path will you take?<br></br>
                </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <a href={guildsRootName}>
                    <Typography variant="h6">Guild</Typography>
                    <ImageLoader image={guild} style={{width:'70%'}}/>
                </a>
            </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <a href={personasRootName}> 
                    <Typography variant="h6">Individual</Typography>
                    <ImageLoader image={individual} style={{width:'70%'}}/>
                </a>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{margin:'5px'}}>
                <Card>
                    <CardContent>
                        <Typography variant="body1">
                            A <b>Guild</b> is a group of people with a unique identity
                            based on purpose, vision, locale or other unifying characteristic who 
                            come together to collaborate and achieve common objectives.
                        </Typography><br></br>
                        <Typography variant="body1">
                            Choose the Guild path if you are a guild leader setting up a guild,
                            otherwise head down the individual path.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    :
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '100px', marginBottom:'40px'}}>
                <Typography variant="h4" align="center">
                You arrive at a<br></br>
                fork in the road.
                </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom:'20px'}}>
                <Typography variant="h5" align="center">
                Which path will you take?<br></br>
                </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <a href={guildsRootName}> 
                    <Typography variant="h6">Guild</Typography>
                    <ImageLoader image={guild} style={{width:'70%'}}/>
                </a>
            </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <a href={personasRootName}> 
                    <Typography variant="h6">Individual</Typography>
                    <ImageLoader image={individual} style={{width:'70%'}}/>
                </a>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{margin:'5px'}}>
                <Card>
                    <CardContent>
                        <Typography variant="body1">
                            A <b>Guild</b> is a group of people with a unique identity
                            based on purpose, vision, locale or other unifying characteristic who 
                            come together to collaborate and achieve common objectives.
                        </Typography><br></br>
                        <Typography variant="body1">
                            Choose the Guild path if you are a guild leader setting up a guild,
                            otherwise head down the individual path.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    }    
    </>
    )
}

export default Choice