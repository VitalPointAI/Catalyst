import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Big from 'big.js'
import { utils } from 'near-api-js'
import InfoPopup from '../../../common/InfoPopup'
import { Translate } from 'react-localize-redux'

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
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import WarningIcon from '@material-ui/icons/WarningTwoTone'
import Checkbox from '@material-ui/core/Checkbox'

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

export default function SponsorConfirmation(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [applicant, setApplicant] = useState(props.accountId)
  const [shares, setShares] = useState('')
  const [tribute, setTribute] = useState('')
  const [confirm, setConfirm] = useState(false)
  

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { handleSponsorConfirmationClickState, 
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    handleSponsorAction,
    getCurrentPeriod,
    sponsorFinish,
    tokenName, 
    minSharePrice, 
    depositToken,
    proposalDeposit,
    proposalIdentifier,
    contract } = props

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleSponsorConfirmationClickState(false)
    setOpen(false)
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked);
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)
    await handleSponsorAction(proposalIdentifier)
    
    // let finished = await contract.sponsorProposal({
    //        pI: proposalIdentifier,
    //        proposalDeposit: proposalDeposit,
    //        depositToken: depositToken
    //        }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount((parseInt(proposalDeposit)).toString()))
    //       await handleProposalEventChange()
    //       await handleEscrowBalanceChanges()
    //       await handleGuildBalanceChanges()
                  
    // let changed = await handleProposalEventChange()
    // await handleGuildBalanceChanges()
    // await handleEscrowBalanceChanges()
    
    if(sponsorFinish) {
      setFinished(true)
    //  await getCurrentPeriod()
      setOpen(false)
      handleSponsorConfirmationClickState(false)
    }
}

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Sponsorship Confirmation</DialogTitle>
        <DialogContent className={classes.rootForm}>
              <Card>
              <CardContent>
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body1">You are about to sponsor this proposal (#{proposalIdentifier}).  That means you believe there is enough detail, discussion, and justification to recommend it to the community for voting.</Typography>
                
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
                    <Typography variant="body2" gutterBottom>You understand this request requires you to transfer a deposit of <b>{parseInt(proposalDeposit)} Ⓝ</b>.  
                    It goes into escrow and will be returned when the proposal is processed.</Typography>
                    {errors.confirmCheck && <p style={{color: 'red', marginTop: '10px'}}>You must confirm your understanding.</p>}
                  </Grid>
                </Grid>
                </CardContent>
          </Card>
          </DialogContent>
        <DialogActions>
        {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Sponsor Proposal</Button></> : <LinearProgress className={classes.progress} />}
        {finished ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
        </DialogActions>
      </Dialog>
    </div>
  );
}
