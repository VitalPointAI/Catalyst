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
import Grid from '@material-ui/core/Grid'
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
            <Button onClick={handleCopy}>Copy</Button>
            <Grid style={{padding: 2}} container justify='center' spacing={4}>
            <Grid item xs={2}>
            <FacebookShareButton style={{width: 40}} url={link}><FacebookIcon style={{fontSize: "35px"}}></FacebookIcon></FacebookShareButton>
            </Grid>
            <Grid item xs={2}>
            <TwitterShareButton style={{width: 40}} url={link}><TwitterIcon style={{fontSize: "35px"}}></TwitterIcon></TwitterShareButton>
            </Grid>
            <Grid item xs={2}>
            <EmailShareButton style={{width: 40}} url={link}><EmailIcon style={{fontSize: "35px"}}></EmailIcon></EmailShareButton>
            </Grid>
            <Grid item xs={2}>
            <RedditShareButton style={{width: 40}} url={link}><RedditIcon style={{fontSize: "35px"}}></RedditIcon></RedditShareButton>
            </Grid>
            <Grid item xs={2}>
            <LinkedinShareButton style={{width: 40}} url={link}><LinkedInIcon style={{fontSize: "35px"}}></LinkedInIcon></LinkedinShareButton>
            </Grid>
            <Grid item xs={2}>
            <TelegramShareButton style={{width: 40}} url={link}><TelegramIcon style={{fontSize: "35px"}}></TelegramIcon></TelegramShareButton>
            </Grid>
            </Grid>
            <Button onClick={handleClose}>Close</Button>
        </Dialog>
        </div>
    ); 
}

export default Invite 