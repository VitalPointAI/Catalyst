import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { logout } from '../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import LockTwoToneIcon from '@material-ui/icons/LockTwoTone'

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

export default function LogoutButton(props) {

    const classes = useStyles()

    return (
        <> 
        <Button
        variant="contained"
        color="primary"
        className={classes.button}
        startIcon={<LockTwoToneIcon />}
        onClick={logout}
        >Sign Out</Button>
           
      </>
    )
}