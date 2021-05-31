import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { login } from '../../state/near'
import AddRootPersonaForm from '../AddRootPersona/addRootPersona'

// Material UI Components
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography';
import LockOpenTwoToneIcon from '@material-ui/icons/LockOpenTwoTone';
import FrontPage from '../LandingSite/Home'
const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
      //  maxWidth: '95%',
        margin: 'auto',
        marginTop: 50,
        minHeight: 500,
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
        <FrontPage></FrontPage>
    )
}