import React, { useState } from 'react' 

//material ui components
import Dialog from '@material-ui/core/Dialog'
import { DialogTitle } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import EmailIcon from '@material-ui/icons/Email';
//other libraries
import {ShareButton} from "react-custom-share"

const Invite = (props) => {
    const [open, setOpen] = useState(true)
    const { 
        handleInviteClickState,
       } = props
   
    const link = window.location.origin + "/invitation" + window.location.pathname 
    
    const FBButtonProps = {
        url: link, 
        network: "Facebook",  
    }
    const TwitterButtonProps = {
        url: link, 
        network: "Twitter",  
    }
    const EmailButtonProps = {
        url: link, 
        network: "Email",  
    }

    const handleClose = () => {
        handleInviteClickState(false)
    };

   function handleCopy(){
       //this will not work in older browsers
       //window.clipboardData.setData("Text", 'Copy this text to clipboard') would though 
        navigator.clipboard.writeText(`${link}`)
        alert("Copied!");
    };

    return(
        <div>
        <Dialog open={open}>
            <DialogTitle>Share Link</DialogTitle>
            <TextField style={{width: 400}} placeholder={`${link}`} id="linkField"/>
            <Button onClick={handleClose}>Close</Button> 
            <Button onClick={handleCopy}>Copy</Button>
            <ShareButton {...FBButtonProps}><FacebookIcon></FacebookIcon></ShareButton>
            <ShareButton {...TwitterButtonProps}><TwitterIcon></TwitterIcon></ShareButton>
            <ShareButton {...EmailButtonProps}><EmailIcon></EmailIcon></ShareButton>
        </Dialog>
        </div>
    ); 
}

export default Invite 