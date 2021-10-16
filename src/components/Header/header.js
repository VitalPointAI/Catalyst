import React, {useState, useEffect} from 'react'
import { useParams} from 'react-router-dom'
import LeftSideDrawer from '../LeftSideDrawer/leftSideDrawer'
import LogoutButton from '../LogoutButton/logoutButton'
import LoginButton from '../LogInButton/loginButton'
import AccountInfo from '../AccountInfo/accountInfo'
import Logo from '../Logo/logo'
import {get, set, del} from '../../utils/storage'
import {NEW_NOTIFICATIONS} from '../../state/near'
import NotificationCard from '../Notifications/notifications'
import {ceramic} from '../../utils/ceramic'

// Material UI
import Grid from '@material-ui/core/Grid'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import Badge from '@material-ui/core/Badge'
import NotificationsIcon from '@material-ui/icons/Notifications';
import IconButton from '@material-ui/core/IconButton'
import Popover from '@material-ui/core/Popover'
import '../../App.css'

export const Header = ({ state, handleUpdate, isUpdated }) => {
    const [newNotifications, setNewNotifications] = useState(0)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);


    const {
        wallet,
        appIdx,
        accountId
    } = state

    const {
        contractId
    } = useParams()

 

    useEffect(
        () => {
        async function fetchData(){
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
    }, [state])

    const matches = useMediaQuery('(max-width:500px)')
    

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        setPopoverOpen(true)
    }

    const handleClose = () => {
        setAnchorEl(null);
        setPopoverOpen(false)
    }
    function handleNotificationClick(property){
     
        return; 
    }

    
    return (
        <><div>
        <Grid container justifyContent="space-between" alignItems="center" spacing={0} style={{paddingRight: '5px', paddingLeft: '5px', paddingTop: '5px', backgroundColor: 'white'}}>
            
            {wallet && wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                       
                        <LeftSideDrawer
                        state={state}                        
                        /> 
                     
                        <Logo />
                    </Grid>
                    <Grid item xs={8} sm={8} md={8} lg={8} xl={8}>
                        <AccountInfo balance={wallet.balance} /> 
                        
                    </Grid>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                        
                        <IconButton onClick={handleClick} color="primary" component="span">
                        <Badge  badgeContent={newNotifications} color='primary'>
                            <NotificationsIcon fontSize='large' /> 
                            </Badge>
                        </IconButton>
                   
                        {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton/>}
                    
                    <Popover
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    style={{maxWidth: '100%', maxHeight: '80%'}} 
                    open={popoverOpen}
                    >
                        <NotificationCard
                            handleNotificationClick={handleNotificationClick}
                            toolbar={false}
                            style={{minWidth: '100%'}}
                        />
                    </Popover>

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
                        <Grid item xs={8} sm={8} md={8} lg={8} xl={8}>
                            <Logo />
                        </Grid>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} style={{marginTop: '3px'}}>
                            {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton/>}
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                            <AccountInfo balance={wallet.balance} /> 
                            
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
                        {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton  />}
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