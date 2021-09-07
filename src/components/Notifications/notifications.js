import React, { useState, useEffect, useContext}  from 'react'
import Persona from '@aluhning/get-personas-js'
import { appStore, onAppMount } from '../../state/app'

//material ui imports
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import ReplyIcon from '@material-ui/icons/Reply';

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
    const [persona, setPersona] = useState()
    const [notifications, setNotifications] = useState([])
    const { state, dispatch, update } = useContext(appStore)
    const classes = useStyles()

    const {
      accountId
    } = state

    const {
       handleNotificationClick,
    } = props

    useEffect(() => {
        async function fetchData(){
        let persona = new Persona()
        //need to get accountId somehow
        let result = await persona.getPersona(accountId)
        setPersona(result)
        setNotifications(result.notifications)
        }

        fetchData()
        .then((res) => {
      
        })
    },[])

    const handleClose = () => {
        handleNotificationClick(false)
        setOpen(!open)
    }

    let notifs 
    console.log('notificationsss', notifications)
    if (notifications && notifications.length > 0) {
        notifs = notifications.map(notification => {
            return(
                <Card style={{marginTop: 10}}>
                    <Avatar src={notification.avatar} style={{float:'left', marginRight: '10px'}}/>
                    <ReplyIcon fontSize='large'/>
                    <Typography style={{display: 'inline-block', marginTop: 15}}>{notification.commentAuthor}: {notification.commentPreview}</Typography>
                </Card>
            )
        })
    }
    
    return (
            <div>
            <Dialog className={classes.root} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Notifications</DialogTitle>
              <DialogContent>
                  {notifs}
              </DialogContent>
            </Dialog>
          </div>
        )
}