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
import Card from '@material-ui/core/Card'
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
   
    const link = window.location.origin + "/inv" + "/" + ((window.location.pathname.split("/")).slice(2)[0].split("."))[0]

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
            <Card style={{marginLeft:15, marginRight: 15, marginBottom: 5}} >
            
            <Grid container justifyContent='center' spacing={5}>
                <Grid item>
                    <TextField style={{width: 300}} disable defaultValue={`${link}`} id="linkField"/>
                    <Button onClick={handleCopy}>Copy</Button>
                </Grid>
                <Grid direction = "row" container alingItems='center' justifyContent='center' spacing={3}>
                    <Grid item>
                        <FacebookShareButton style={{width: 40}} url={link}>
                            <FacebookIcon style={{fontSize: "35px"}}></FacebookIcon>
                        </FacebookShareButton>
                    </Grid>
                    <Grid item>
                        <TwitterShareButton style={{width: 40}} url={link}>
                            <TwitterIcon style={{fontSize: "35px"}}></TwitterIcon>
                        </TwitterShareButton>
                    </Grid>
                    <Grid item >
                        <EmailShareButton style={{width: 40}} url={link}>
                            <EmailIcon style={{fontSize: "35px"}}></EmailIcon>
                        </EmailShareButton>
                    </Grid>
                    <Grid item>
                    <RedditShareButton style={{width: 40}} url={link}>
                        <RedditIcon style={{fontSize: "35px"}}></RedditIcon>
                        </RedditShareButton>
                    </Grid>
                    <Grid item>
                        <LinkedinShareButton style={{width: 40}} url={link}>
                            <LinkedInIcon style={{fontSize: "35px"}}></LinkedInIcon>
                        </LinkedinShareButton>
                    </Grid>
                    <Grid item>
                        <TelegramShareButton style={{width: 40}} url={link}>
                            <TelegramIcon style={{fontSize: "35px"}}></TelegramIcon>
                        </TelegramShareButton>
                    </Grid>
                   
                </Grid>
                <Grid item>
                         <Button onClick={handleClose}>Close</Button>
                </Grid> 
            </Grid>
            </Card>
        </Dialog>
        </div>
    ); 
}

export default Invite 