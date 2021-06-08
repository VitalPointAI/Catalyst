import React, { useState } from 'react' 

//material ui components
import Dialog from '@material-ui/core/Dialog'
import { DialogTitle } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'


const Invite = (props) => {
    const [open, setOpen] = useState(true)
    const { 
        handleInviteClickState,
       } = props

    const link = window.location.hostname + ":1234/invitation" + window.location.pathname 

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
        </Dialog>
        </div>
    ); 
}

export default Invite 