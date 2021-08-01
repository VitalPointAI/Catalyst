import React from 'react'
import { useParams } from 'react-router-dom'
import LeftSideDrawer from '../LeftSideDrawer/leftSideDrawer'
import LogoutButton from '../LogoutButton/logoutButton'
import LoginButton from '../LogInButton/loginButton'
import PersonaInfo from '../Persona/persona'
import Logo from '../Logo/logo'

// Material UI
import Grid from '@material-ui/core/Grid'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'


import '../../App.css'
import { LinearProgress } from '@material-ui/core';

export const Header = ({ state, handleUpdate, isUpdated }) => {
   
    const {
        wallet
    } = state

    const {
        contractId
    } = useParams()

    const matches = useMediaQuery('(max-width:500px)')

    
    return (
        <><div>
        <Grid container justify="space-between" alignItems="center" spacing={0} style={{paddingRight: '5px', paddingLeft: '5px', paddingTop: '5px', backgroundColor: 'white'}}>
            
            {wallet && wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item xs={1} sm={1} md={2} lg={2} xl={2}>
                        <LeftSideDrawer
                        state={state}                        
                        /> 
                        <Logo />
                    </Grid>
                    <Grid item xs={1} sm={1} md={8} lg={8} xl={8}>
                        <PersonaInfo balance={wallet.balance} /> 
                    </Grid>
                    <Grid item xs={4} sm={4} md={2} lg={2} xl={2}>
                        {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton />}
                    </Grid>
                    </>
                ) : (
                    <>
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} style={{paddingLeft: '5px'}}>
                            <LeftSideDrawer
                            state={state}
                            style={{float: 'left'}}
                            /> 
                        </Grid>
                        <Grid item xs={7} sm={7} md={8} lg={8} xl={8}>
                            <Logo />
                        </Grid>
                        <Grid item xs={4} sm={4} md={3} lg={3} xl={3} style={{marginTop: '3px'}}>
                            {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton />}
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <PersonaInfo balance={wallet.balance} /> 
                        </Grid>
                    </>
                )
            :  
            wallet && !wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item xs={7} sm={7} md={3} lg={3} xl={3}>
                        <Logo />
                    </Grid>
                    <Grid item xs={2} sm={2} md={7} lg={7} xl={7} style={{display: 'inline-flex'}} align="center">
                        <Button style={{textAlign: 'center', marginRight: '30px'}}>About Catalyst</Button>
                        <Button style={{textAlign: 'center', marginRight: '30px'}}>Developers</Button>
                        <Button style={{textAlign: 'center', marginRight: '30px'}}>Learn</Button>
                        <Button style={{textAlign: 'center'}}>Contact</Button>
                    </Grid>
                    <Grid item xs={4} sm={4} md={2} lg={2} xl={2}>
                        {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton />}
                    </Grid>
                    </>
                ) : (
                    <>
                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                        <LeftSideDrawer
                            state={state}
                           
                        /> 
                    </Grid>
                    <Grid item xs={7} sm={7} md={7} lg={7} xl={7}>
                        <Logo />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4} style={{marginTop: '3px'}} align="right">
                        {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton />}
                    </Grid>
                    </>
                ) 
            : null
        }
            
        </Grid>
        </div>
    </>
    )
}