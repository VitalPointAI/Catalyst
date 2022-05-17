import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../../state/app'
import LeftSideDrawer from '../../LeftSideDrawer/leftSideDrawer'
import LoginButton from '../LogInButton/loginButton'
import LogoutButton from '../LogoutButton/logoutButton'
import ImageLoader from '../ImageLoad/imageLoad'
import NotificationCard from '../../Notifications/notifications'
import { ceramic } from '../../../utils/ceramic'

// Material UI
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import '../../../App.css'

const nearLogo = require('../../../img/catalyst-logo-dark.png')

const logoStyle = {
    maxWidth: '150px',
    marginTop: '5px'
}

export default function Header(props) {
    const [newNotifications, setNewNotifications] = useState(0)
    const [anchorEl, setAnchorEl] = useState(null)
    const { state, update } = useContext(appStore)

    const {
        wallet,
        appIdx,
        isUpdated,
        accountId
    } = state

    useEffect(
        () => {
        async function fetchData(){
            if(isUpdated){}
            if(accountId){
                //get the list of all notifications for all accounts
       
                let result = await ceramic.downloadKeysSecret(appIdx, 'notifications')
                if(result){

                    //convert the object from ceramic to map in order to more easily
                    //return notifications associated with current account
                    if(result[0]){
                        let notificationMap = new Map(Object.entries(result[0])) 

                        let notifications = 0;

                        //loop thorugh all notifications for user, if the read flag is false, increase the count
                        //for the notification badge
                        if(notificationMap.get(accountId)){
                            for(let i = 0; i < notificationMap.get(accountId).length; i++){
                                if(notificationMap.get(accountId)[i].read == false){
                                    notifications++;
                                }
                            }
                        }
                    

                    //set the counter for the badge to the amount of unread notifications
                    setNewNotifications(notifications)
                    }
                }
            }
        }
        fetchData()
        .then((res) => {
        
        })
    }, [accountId, isUpdated])

    const matches = useMediaQuery('(max-width:500px)')

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        update('', {isUpdated: !isUpdated})
        setPopoverOpen(true)

    }

    const handleClose = () => {
        setAnchorEl(null);
        update('', {isUpdated: !isUpdated})
        setPopoverOpen(false)
    }
    
    return (
        <div>
        <Grid container justifyContent="space-between" alignItems="center" spacing={1} style={{paddingRight: '10px', paddingLeft: '10px', paddingBottom: '5px', backgroundColor: 'black'}}>
            
            {wallet && wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item >
                        <LeftSideDrawer
                        state={state}                        
                        />
                        <Link to="/"> 
                            <ImageLoader image={nearLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}} >
                        {wallet && !wallet.signedIn ? <LoginButton /> :  
                            <>
                                <Typography variant="overline" style={{color:'#FFFFFF'}}>
                                    {accountId}
                                </Typography><br></br>
                                <LogoutButton /> 
                            </>
                        }
                    </Grid>
                    </>
                )
                : (
                    <>
                    <Grid item >
                        <LeftSideDrawer
                        state={state}                        
                        />
                        <Link to="/"> 
                            <ImageLoader image={nearLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}} >
                        {wallet && !wallet.signedIn ? <LoginButton /> :  
                            <>
                                <Typography variant="overline" style={{color:'#FFFFFF'}}>
                                    {accountId.length <= 17 ? accountId : accountId.substring(0,15) + "..."}
                                </Typography><br></br>
                                <LogoutButton /> 
                            </>
                        }
                    </Grid>
                    </>
                )
            :  
            wallet && !wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item>
                    <LeftSideDrawer
                        state={state}                        
                    />
                    <Link to="/"> 
                        <ImageLoader image={nearLogo} style={logoStyle}/>
                    </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ? <LoginButton /> :   
                            <>
                                <Typography variant="overline" style={{color:'#FFFFFF'}}>
                                    {accountId}
                                </Typography><br></br>
                                <LogoutButton /> 
                            </>
                        }
                    </Grid>
                    </>
                ) : (
                    <>
                    <Grid item>
                        <LeftSideDrawer
                            state={state}
                        />
                        <Link to="/"> 
                            <ImageLoader image={nearLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ? <LoginButton /> :  
                            <>
                                <Typography variant="overline" style={{color:'#FFFFFF'}}>
                                    {accountId.length <= 17 ? accountId : accountId.substring(0,15) + "..."}
                                </Typography><br></br>
                                <LogoutButton /> 
                            </>
                        }
                    </Grid>
                    </>
                ) 
            : null
        }
            
        </Grid>
        </div>
    )
}