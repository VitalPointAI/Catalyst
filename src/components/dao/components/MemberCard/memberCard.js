import React, { useState, useEffect } from 'react'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      marginTop: '10px'
    },
    avatar: {
      backgroundColor: red[500],
    },
  }));

export default function MemberCard(props) {

    const classes = useStyles();

    const { name, shares, joined, memberCount } = props

    useEffect(
        () => {

    }, []
    )


    return(
        <>
        <Card raised={true} className={classes.card} >
          <CardHeader
            title={<Chip
              avatar={<Avatar alt="Member" src="../../../../images/default-profile.png" />}
              label={name}
              variant="outlined"
            />}
            subheader={<Typography variant="overline" align="center">Since: {joined}</Typography>}
          />
 
          <CardContent>
            <Grid container alignItems="center" style={{marginTop: '-20px', marginBottom:'20px'}}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Typography variant="overline" align="center">{shares > 1 ? shares + ' shares' : shares + ' share' }</Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Typography variant="overline">{`Voting Power: ${shares && memberCount ? (shares / memberCount)*100 : '100'}%`}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        </>
    )
}