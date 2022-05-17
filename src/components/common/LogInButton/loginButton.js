import React from 'react'
import { login } from '../../../state/near'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import LockOpenTwoToneIcon from '@material-ui/icons/LockOpenTwoTone'

const useStyles = makeStyles((theme) => ({
  button: {
    margin: 0,
    float: 'right'
  }
  }));

export default function LoginButton(props) {

    const classes = useStyles()

    return (
        <Button
        variant="contained"
        color="primary"
        className={classes.button}
        startIcon={<LockOpenTwoToneIcon />}
        onClick={login}
        >Sign In</Button>
    )
}