import React from 'react';
import LeftSideDrawer from '../LeftSideDrawer/leftSideDrawer'
import LogoutButton from '../LogoutButton/logoutButton'
import LoginButton from '../LogInButton/loginButton'
import Persona from '../Persona/persona'
import Logo from '../Logo/logo'

// Material UI
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import '../../App.css'
import { LinearProgress } from '@material-ui/core';

export const Header = ({ state, handleSnackBarOpen, handleSuccessMessage, handleErrorMessage, snackBarOpen, severity, errorMessage, successMessage }) => {
   
    const {
        wallet
    } = state

    return (
        <>
        <Grid container justify="space-between" alignItems="center">
            <Grid item xs={8} sm={8} md={3} lg={3} xl={3}>
                <LeftSideDrawer
                state={state}
                handleSnackBarOpen={handleSnackBarOpen}
                handleSuccessMessage={handleSuccessMessage}
                handleErrorMessage={handleErrorMessage}
                snackBarOpen={snackBarOpen}
                severity={severity}
                errorMessage={errorMessage}
                successMessage={successMessage}
                />
                <Logo />
            </Grid>
            
            {wallet && !wallet.signedIn ? (
                <>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                <Typography style={{textAlign: 'center', margin: 'auto'}}>About Catalyst</Typography>
            </Grid>
            <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                <Typography style={{textAlign: 'center', margin: 'auto'}}>Products</Typography>
            </Grid>
            <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                <Typography style={{textAlign: 'center', margin: 'auto'}}>Developers</Typography>
            </Grid>
            <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                <Typography style={{textAlign: 'center', margin: 'auto'}}>Learn</Typography>
            </Grid>
            <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                <LoginButton wallet={wallet} />
            </Grid>
                </>
            ) : (
                <>
                <Grid item xs={4} sm={4} md={7} lg={7} xl={7}>
                    {wallet && wallet.signedIn ? <Persona state={state} accountId={wallet.getAccountId()} balance={wallet.balance} /> : <LinearProgress /> }
                </Grid>
                <Grid item xs={4} sm={4} md={2} lg={2} xl={2} style={{textAlign: 'right'}}>
                    <LogoutButton wallet={wallet} /> 
                </Grid>
                </>
                )
            }
        </Grid>
    </>
    )
}