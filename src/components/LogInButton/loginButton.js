import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { login } from '../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import LockOpenTwoToneIcon from '@material-ui/icons/LockOpenTwoTone';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(0),
    float: 'right'
  },
  accountButton: {
    margin: theme.spacing(0),
    float: 'right',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  }));

export default function LoginButton(props) {

    const classes = useStyles()

    return (
        <> 
        <Button
        variant="contained"
        color="primary"
        className={classes.button}
        startIcon={<LockOpenTwoToneIcon />}
        onClick={login}
        >Get Started</Button>
           
      </>
    )
}