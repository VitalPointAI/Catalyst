import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { makeDonation } from '../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import WarningIcon from '@material-ui/icons/WarningTwoTone'
import Checkbox from '@material-ui/core/Checkbox'

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
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  }));

export default function DonationConfirmation(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [confirm, setConfirm] = useState(false)
  
  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { handleDonationConfirmationClickState, 
    depositToken,
    proposalDeposit,
    proposalIdentifier,
    contract,
    contractId,
    donation,
    curDaoIdx } = props

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleDonationConfirmationClickState(false)
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked);
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)
    let finished
    try{
      await makeDonation(contract, contractId, depositToken, donation, curDaoIdx)
    } catch (err) {
        console.log('problem making donation', err)
        let split = err.message.split(': ')
        let split2 = split[1].split(",", 1)
        let message = split2[0]
        setFinished(true)
        setOpen(false)
        handleClose()
    }
}

  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Donation Confirmation</DialogTitle>
        <DialogContent className={classes.rootForm}>
              <Card>
              <CardContent>
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body1">You are about to donate {donation} N.  The community fund thanks you for your benevolence.</Typography>
                
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
                    <Typography variant="body2" gutterBottom>You understand that donations do not give you voting shares, and are instant (no voting/ragequitting). The entire donation of <b>{parseFloat(donation)} Ⓝ</b> goes directly into the community fund.  
                    </Typography>
                    {errors.confirmCheck && <p style={{color: 'red', marginTop: '10px'}}>You must confirm your understanding.</p>}
                  </Grid>
                </Grid>
                </CardContent>
          </Card>
          </DialogContent>
        <DialogActions>
        {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Make Donation</Button></> : <LinearProgress className={classes.progress} />}
        {finished ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
        </DialogActions>
      </Dialog>
    </div>
  );
}
