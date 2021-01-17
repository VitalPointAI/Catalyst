import React, { useState, useEffect } from 'react'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      marginTop: '15px',
    },
    avatar: {
      backgroundColor: red[500],
    },
  }));

export default function MemberCard(props) {

    const classes = useStyles();

    const { name, shares, joined } = props

    useEffect(
        () => {

    }, []
    )


    return(
        <>
        <Card raised={true} className={classes.card}>
            <CardHeader
                avatar={<Avatar className={classes.avatar}>M</Avatar>}
                action={
                    <IconButton aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                }
                  title={name}
                  subheader={joined}
            />            
            <CardContent>
                <Typography className={classes.pos} color="textSecondary">
                    {shares} {shares > 1 ? 'shares' : 'share'}
                </Typography>
            </CardContent>
        </Card>
        </>
    )
}