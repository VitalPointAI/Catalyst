import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { submitProposal } from '../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'

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
  rootForm: {
    '& > *': {
      margin: theme.spacing(1),
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
  const[open, setOpen] = useState(true)
  const[finish, setFinish] = useState(true)
  const[memberKick, setMemberToKick] = useState('')

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const {
    state,
    handleGuildKickClickState,
    contractId
    } = props

  const handleClose = () => {
    handleGuildKickClickState(false)
  }

  const handleMemberToKickChange = (event) => {
    setMemberToKick(event.target.value)
  }

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinish(false)
    
    try{
      await submitProposal(
        state.wallet,
        contractId,
        'GuildKick',
        memberKick,
        '0',
        '0',
        '0',
        '0'
        )
      } catch (err) {
        console.log('problem submitting guildKick proposal', err)
      }
  }

  return (
    <div>
     
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Propose Member to Kick</DialogTitle>
        <DialogContent  className={classes.rootForm}>
          <div>
            <TextField
              autoFocus
              margin="dense"
              id="guildkick-proposal"
              variant="outlined"
              name="memberKick"
              label="Member to Kick"
              helperText="enter NEAR account name of member you propose to kick out"
              placeholder="someaccount.near"
              value={memberKick}
              onChange={handleMemberToKickChange}
              inputRef={register({
                  required: true,                        
              })}
            />
        {errors.memberKick && <p style={{color: 'red'}}>You must provide a valid NEAR account.</p>}
        </div>
        </DialogContent>
        <DialogActions>
        {finish ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Submit Proposal</Button></> : <LinearProgress className={classes.progress} />}
        {finish ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
        </DialogActions>
      </Dialog>
    </div>
  )
}
