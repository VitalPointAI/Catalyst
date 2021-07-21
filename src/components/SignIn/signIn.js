import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'


// Material UI Components
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    root: {
     //   flexGrow: 1,
      //  maxWidth: '95%',
     //   margin: 'auto',
     //   marginTop: 50,
     //   minHeight: 500,
    },
    customCard: {
        maxWidth: '95%',
        minWidth: 275,
        margin: 'auto',
        padding: 20
    },
    button: {
        margin: theme.spacing(1),
      },
    }));

export default function SignIn(props) {

  const {
    wallet,
    state
  } = props

const classes = useStyles()

    return (
      <Redirect to="https://vitalpoint.ai/catalyst" />
        
    )
}