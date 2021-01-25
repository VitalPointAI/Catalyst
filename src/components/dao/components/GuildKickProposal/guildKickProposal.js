import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { proposalEvent } from '../../../../utils/proposalEvents'
import { utils } from 'near-api-js'

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
    handleGuildKickClickState, 
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    handleSnackBarOpen,
    handleErrorMessage,
    handleSuccessMessage,
    accountId,
    proposalDeposit,
    depositToken,
    daoContract,
    contract } = props

  const handleClose = () => {
    handleGuildKickClickState(false)
  }

  const handleMemberToKickChange = (event) => {
    setMemberToKick(event.target.value.toString())
  }

  async function handleCancelAction(proposalIdentifier) {
    let finished = await daoContract.cancelProposal({
        pI: proposalIdentifier
        }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount((parseInt(proposalDeposit)).toString()))
    try{
      let recorded = await proposalEvent.recordEvent(
        finished.pI, finished.a, finished.p, finished.s, finished.sR, finished.lR, finished.tO, finished.tT, finished.pR, finished.pT, 
        finished.sP, finished.yV, finished.nV, finished.f, finished.mT, finished.pS, finished.vP, finished.gP, finished.voteFinalized)
        handleSuccessMessage('Successfully cancelled guild kick proposal.', 'success')
        handleSnackBarOpen(true)
      } catch (err) {
        handleErrorMessage('There was a problem cancelling the guild kick proposal.', 'error')
        handleSnackBarOpen(true)
      }
  }


  const onSubmit = async (values) => {
    setFinish(false)
    console.log('proposaldeposit', proposalDeposit)
    let finished
    try {
     
      finished = await contract.submitGuildKickProposal({
                    memberToKick: memberKick, 
                    proposalDeposit: proposalDeposit,
                    depositToken: depositToken
                    }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount((parseInt(proposalDeposit)).toString()))
      try {
        let recorded = await proposalEvent.recordEvent(
          finished.pI, finished.a, finished.p, finished.s, finished.sR, finished.lR, finished.tO, finished.tT, finished.pR, finished.pT, 
          finished.sP, finished.yV, finished.nV, finished.f, finished.mT, finished.pS, finished.vP, finished.gP, finished.voteFinalized)
          console.log('recorded', recorded)
          if(recorded) {
            handleSuccessMessage('Successfully submitted guild kick proposal.', 'success')
            handleSnackBarOpen(true)
          } else {
            console.log('error recording guild kick')
            await handleCancelAction(finished.pI)
          }
        } catch (err) {
          console.log('error storing guild kick log', err)
          await handleCancelAction(finished.pI)
        }
    } catch (err) {
      handleErrorMessage('There was a problem adding the guild kick proposal.', 'error')
      handleSnackBarOpen(true)
    }

    if(finished) {
      setFinish(true)
      await handleProposalEventChange()
      await handleGuildBalanceChanges()
      await handleEscrowBalanceChanges()
      setOpen(false)
      handleClose()
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
        {errors.memberToKick && <p style={{color: 'red'}}>You must provide a valid NEAR account.</p>}
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
