import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Big from 'big.js'
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
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'

const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed()


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
  rootForm: {
  '& > *': {
    margin: theme.spacing(1),
  },
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

export default function MemberProposal(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [applicant, setApplicant] = useState(props.accountId)
  const [shares, setShares] = useState('')
  const [tribute, setTribute] = useState('')
  

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()
  const { handleMemberProposalClickState, 
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    tokenName, 
    minSharePrice, 
    depositToken,
    contract } = props
console.log('depositToken ', depositToken)
  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleMemberProposalClickState(false)
    setOpen(false)
  };

  const handleSharesRequestedChange = (event) => {
    setShares(event.target.value.toString());
  };

  const handleTributeChange = (event) => {
    setTribute(event.target.value.toString());
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)
    
    let finished = await contract.submitProposal({
                    a: applicant,
                    sR: shares,
                    lR: '0',
                    tO: tribute,
                    tT: depositToken,
                    pR: '0',
                    pT: depositToken
                    }, BOATLOAD_OF_GAS, utils.format.parseNearAmount((parseInt(shares)+parseInt(tribute)).toString()))
    console.log('amount ', utils.format.parseNearAmount((parseInt(shares)+parseInt(tribute)).toString()))  
                  
    let changed = await handleProposalEventChange()
    await handleGuildBalanceChanges()
    await handleEscrowBalanceChanges()
    
    if(finished && changed) {
      setFinished(true)
      setOpen(false)
      handleMemberProposalClickState(false)
    }
}

  return (
    <div>
     
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Membership Proposal</DialogTitle>
        <DialogContent className={classes.rootForm}>
        {!finished ? <LinearProgress className={classes.progress} /> : (
            <DialogContentText style={{marginBottom: 10}}>
            Submit membership proposal for:
            </DialogContentText>)}
            <Typography component="h5" style={{marginBottom: 20}}>{applicant}</Typography>
              <div>
                <TextField
                    autoFocus
                    margin="dense"
                    id="membership-proposal-sharesRequested"
                    variant="outlined"
                    name="sharesRequested"
                    label="Shares Requested"
                    placeholder="10"
                    value={shares}
                    onChange={handleSharesRequestedChange}
                    inputRef={register({
                        required: true,
                        min: 1,
                        max: 10
                        
                    })}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">Shares</InputAdornment>,
                    }}
                />
              {errors.sharesRequested && <p style={{color: 'red'}}>You must provide a number between 1 and 10.</p>}
            </div><div>
            <TextField
              margin="dense"
              id="member-proposal-tribute"
              variant="outlined"
              name="memberTribute"
              label="Tribute"
              placeholder="1"
              value={tribute}
              onChange={handleTributeChange}
              inputRef={register({
                  required: true,
                  min: {minSharePrice}
              })}
              InputProps={{
                endAdornment: <InputAdornment position="end">{tokenName}</InputAdornment>,
                }}
              />
              {errors.memberTribute && <p style={{color: 'red'}}>You must enter a value greater than {minSharePrice}.</p>}
              </div>
          </DialogContent>
        <DialogActions>
        <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
            Submit Proposal
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
