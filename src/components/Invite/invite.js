import React, { useState } from 'react' 

//material ui components
import Dialog from '@material-ui/core/Dialog'
import { DialogTitle } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import EmailIcon from '@material-ui/icons/Email';
import RedditIcon from '@material-ui/icons/Reddit';
import TelegramIcon from '@material-ui/icons/Telegram';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
//other libraries

import {
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    TelegramShareButton,
    RedditShareButton,
    EmailShareButton,
  } from 'react-share'

const Invite = (props) => {
    const [open, setOpen] = useState(true)
    const { 
        handleInviteClickState,
       } = props
   
    const link = window.location.origin + "/invitation" + window.location.pathname 

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
            <FacebookShareButton url={link}><FacebookIcon></FacebookIcon></FacebookShareButton>
            <TwitterShareButton url={link}><TwitterIcon></TwitterIcon></TwitterShareButton>
            <EmailShareButton url={link}><EmailIcon></EmailIcon></EmailShareButton>
            <RedditShareButton url={link}><RedditIcon></RedditIcon></RedditShareButton>
            <TelegramShareButton url={link}><TelegramIcon></TelegramIcon></TelegramShareButton>
            <LinkedinShareButton url={link}><LinkedInIcon></LinkedInIcon></LinkedinShareButton>
        </Dialog>
        </div>
    ); 
}

export default Invite 