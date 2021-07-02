import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { delegate } from '../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import WarningIcon from '@material-ui/icons/WarningTwoTone'
import Checkbox from '@material-ui/core/Checkbox'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'

const useStyles = makeStyles((theme) => ({
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  confirmation: {
    textAlign: 'left',
    margin: 'auto',
    paddingTop: '20px'
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
  }));

export default function Delegation(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [receiver, setReceiver] = useState('')
  
  const [quantity, setQuantity] = useState('')
  const [confirm, setConfirm] = useState(false)
  
  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { 
    contractId,
    state,
    maxDelegation,
    delegateTo,
    depositToken,
    proposalDeposit,
    handleDelegationClickState,
    handleSnackBarOpen,
    handleErrorMessage,
    handleSuccessMessage,
   } = props

   useEffect(
    () => {
      if(delegateTo){
        setReceiver(delegateTo)
      }
   }, [delegateTo]
   )

  const handleClose = () => {
    handleDelegationClickState(false)
  }

  const handleReceiverChange = (event) => {
    setReceiver(event.target.value.toString())
  }

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value)
  }

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked)
  }

  const onSubmit = async (values) => {
    setFinished(false)
    try{
      delegate(
        state.wallet,
        contractId,
        receiver,
        quantity
        )
            
    } catch (err) {
      handleErrorMessage('There was a problem making the delegation' + err.message, 'error')
      handleSnackBarOpen(true)
      setFinished(true)
      setOpen(false)
      handleClose()
    }
}

  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Delegate Votes</DialogTitle>
        <DialogContent className={classes.rootForm}>
        <Typography variant="body1">You can delegate up to {maxDelegation} votes.</Typography>
          <div>
            <TextField
                autoFocus
                margin="dense"
                id="delegation-receiver"
                variant="outlined"
                name="receiver"
                label="Delegate to:"
                helperText="NEAR account name of receiver"
                placeholder="someaccount.near"
                value={receiver}
                onChange={handleReceiverChange}
                inputRef={register({
                    required: true,                        
                })}
            />
            {errors.receiver && <p style={{color: 'red'}}>You must provide a valid NEAR account.</p>}
          </div>
             
            <div>
              <TextField
                margin="dense"
                id="quantity"
                variant="outlined"
                name="quantity"
                label="Quantity of Votes"
                placeholder="100"
                value={quantity}
                onChange={handleQuantityChange}
                inputRef={register({
                    required: true,
                    maximum: maxDelegation
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Votes</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="The number of votes you are giving to this account to use on your behalf.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
              {errors.quantity && <p style={{color: 'red'}}>You must enter a contribution amount.</p>}
            </div>
            <Card>
              <CardContent>
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body1">You are about to delegate {quantity ? quantity : '0'} votes to {receiver}.</Typography>
                
                <Grid container className={classes.confirmation} spacing={1}>
                  <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                    <Checkbox
                      checked={confirm}
                      onChange={handleConfirmChange}
                      name="confirmCheck"
                      color="primary"
                      inputRef={register({
                        required: true
                      })}
                    />
                  
                  </Grid>
                  <Grid item xs={10} sm={10} md={10} lg={10} xl={10} style={{margin:'auto'}}>
                    <Typography variant="body2" gutterBottom>You understand that once you delegate these votes, your voting power will decrease.  You are free to take them back at any time.  
                    </Typography>
                    {errors.confirmCheck && <p style={{color: 'red', marginTop: '10px'}}>You must confirm your understanding.</p>}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </DialogContent>
        <DialogActions>
        {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Delegate Votes</Button></> : <LinearProgress className={classes.progress} />}
        {finished ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
        </DialogActions>
      </Dialog>
      
    </div>
  )
}
