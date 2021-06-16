import React, { useEffect, useState } from 'react';
import Footer from '../common/Footer/footer'

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles((theme) => ({
    card: {
        minWidth: '350px',
        minHeight: '350px'
    },
  }));

export default function Dashboard(props) {

    const classes = useStyles()

    useEffect(
        () => {
 
      
    }, []
    )

    return (
        <>
        <div>
        <Grid container alignItems="center" justify="center" spacing={2} style={{padding: '20px'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'30px'}}>
                <Typography variant='h3'>Your Communities Dashboard</Typography>
                <Typography variant='body1'>Community and participation metrics.</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                <Card className={classes.card}>
                    KPI 1 (coming soon...)
                    <Skeleton />
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                <Card className={classes.card}>
                    KPI 2 (coming soon)
                    <Skeleton />
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Card className={classes.card}>
                    KPI 3 (coming soon)
                    <Skeleton />
                </Card>
            </Grid>
        </Grid>
        </div>
        </>
    )
}