import React, { useState, useEffect, useContext}  from 'react'
import Persona from '@aluhning/get-personas-js'
import { appStore, onAppMount } from '../../state/app'
import { get, set, del } from '../../utils/storage'

//material ui imports
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import ReplyIcon from '@material-ui/icons/Reply';
import Button from '@material-ui/core/Button'
import {OPPORTUNITY_NOTIFICATION, PROPOSAL_NOTIFICATION, NEW_NOTIFICATIONS} from '../../state/near' 

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 800,
      minWidth: 700,
      minHeight: 325,
      maxHeight: 800,
      margin: 'auto'
    }
}));

export default function NotificationCard(props){
    const [open, setOpen] = useState(true)

    const [notifications, setNotifications] = useState([])
    const { state, dispatch, update } = useContext(appStore)
    const classes = useStyles()

    const {
      accountId
    } = state

    const{
        toolbar,
        header,
        handleNotificationClick
    }=props

    const thisPersona = new Persona()

    useEffect(() => {

        async function fetchData(){
            if(accountId){
                let result = await thisPersona.getPersona(accountId)
                console.log("PERSONA", result)
                    if(result){
                        setNotifications(result.notifications)
                        console.log("RESULT", result.notifications)
                    }
                }
        }
        del(NEW_NOTIFICATIONS)

        fetchData()
        .then((res) => {
      
        })
    },[state])

    const handleClose = () => {
        handleNotificationClick(false)
        setOpen(!open)
    }

    const handleClick = (notification) => {
        //add indicator to local storage
       if(notification.type == 'opportunities'){
            let notificationFlag = get(OPPORTUNITY_NOTIFICATION, [])
            if(!notificationFlag[0]){
                notificationFlag.push({proposalId: notification.proposalId})
                set(OPPORTUNITY_NOTIFICATION, notificationFlag)
            }
        }
        else if(notification.type == 'dao'){
            let notificationFlag = get(PROPOSAL_NOTIFICATION, [])
            if(!notificationFlag[0]){
                notificationFlag.push({proposalId: notification.proposalId})
                set(PROPOSAL_NOTIFICATION, notificationFlag)
            }
        }
        console.log("NOTIFICATION", notification)

    }

    let notifs 
    console.log('notifications', notifications)

    if (notifications && notifications.length > 0) {
        notifs = notifications.slice().reverse().map(notification => {
            return(
                <Button href={notification.link} onClick={()=>{handleClick(notification)}} style={{minWidth: '100%'}}>
                <Card style={{minWidth: '100%', marginTop: 10}}>
                    <Avatar src={notification.avatar} style={{float:'left', marginRight: '10px'}}/>
                    <ReplyIcon fontSize='large'/>
                    <Typography style={{display: 'inline-block', marginTop: 15}}>{notification.commentAuthor}: {notification.commentPreview}</Typography>
                </Card>
                </Button>
            )
        })
    }
    

    return (
            <div>
            {toolbar ? <>
            <Dialog className={classes.root} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Notifications</DialogTitle>
              <DialogContent>
              {notifs ? (<>{notifs}</>) : (<Typography>no notifications yet</Typography>)}
              </DialogContent>
            </Dialog>
            </>: <div style={{maxWidth: '100%'}}>{notifs ? (<>{notifs}</>) :
                (
                <Card>
                <Typography>no notifications yet</Typography>
                </Card>)}</div>} 
          </div>

        )
}