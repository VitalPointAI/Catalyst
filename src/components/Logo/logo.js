import React from 'react'
import { Link } from 'react-router-dom'
import CatalystLogo from '../../img/catalyst-logo-cropped.png'

// Material UI
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    logo: {
        maxWidth: 175,
        margin: 'auto',
        paddingLeft: '10px'
    },
  }));

export default function Logo(props) {
    const classes = useStyles()
    
    return (
        <Link to='/'>
            <img src={CatalystLogo} alt="Catalyst Logo" className={classes.logo}/>
        </Link>
    )
}
