import React from 'react'
import { logout } from '../../../state/near'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import LockTwoToneIcon from '@material-ui/icons/LockOpenTwoTone'

const useStyles = makeStyles((theme) => ({
  button: {
    margin: 0,
    float: 'right',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  },
  }));

export default function LogoutButton(props) {

    const classes = useStyles()

    return (
            <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<LockTwoToneIcon />}
            onClick={logout}
            >Sign Out</Button>
    )
}