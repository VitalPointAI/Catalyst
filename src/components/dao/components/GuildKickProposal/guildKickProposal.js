import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Chip from '@material-ui/core/Chip'
import Paper from '@material-ui/core/Paper'


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 'auto',
    maxWidth: 325,
    minWidth: 325,
  },
  card: {
    margin: 'auto',
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  }));


export default function GuildKickProposal(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()
  const { 
    handleGuildKickClickState, 
    handleProposalEventChange,
    accountId,
    contract } = props

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleGuildKickClickState(false)
    setOpen(false)
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    console.log(errors)
    setFinished(false)
    const { memberToKick } = values
    console.log('values', values)
 
    let finished = await contract.submitGuildKickProposal({
                    memberToKick: memberToKick,
                    }, process.env.DEFAULT_GAS_VALUE)

    let changed = await handleProposalEventChange()
    
    if(finished && changed) {
      setFinished(true)
      setOpen(false)
      handleGuildKickClickState(false)
    }
}

  return (
    <div>
     
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" className={classes.root}>
        <DialogTitle id="form-dialog-title">Propose Member to Kick</DialogTitle>
        <DialogContent>
        {!finished ? <LinearProgress className={classes.progress} /> : (
          <DialogContentText style={{marginBottom: 10}}>
          Enter the account name of the member you wish to kick out.
          </DialogContentText>)}
            <div>
          <TextField
            margin="dense"
            id="guildkick-proposal"
            variant="outlined"
            name="memberToKick"
            label="Member to Kick Out"
            placeholder="e.g. somemember.testnet"
            inputRef={register({
                required: true, 
            })}
            />
            {errors.memberToKick && <p style={{color: 'red'}}>You must enter a member account.</p>}
            </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
            Submit Guild Kick Proposal
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
