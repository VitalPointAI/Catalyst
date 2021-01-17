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
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid'
import WarningIcon from '@material-ui/icons/Warning';

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
  confirmation: {
    textAlign: 'left',
    margin: 'auto',
    paddingTop: '20px'
  },
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
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

export default function VotingRightsProposal(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [applicant, setApplicant] = useState(props.accountId)
  const [shares, setShares] = useState('1')
  const [tribute, setTribute] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [transfer, setTransfer] = useState(false)
  

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()
  const { handleVotingProposalClickState, 
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    depositToken,
    proposalDeposit,
    contract } = props

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleVotingProposalClickState(false)
    setOpen(false)
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked);
  };

  const handleTransferChange = (event) => {
    setTransfer(event.target.checked);
  };


  const handleApplicantChange = (event) => {
    setShares(event.target.value.toString());
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)
    
    let finished = await contract.submitProposal({
                    a: applicant,
                    sR: '1',
                    lR: '0',
                    tO: '0',
                    tT: depositToken,
                    pR: '0',
                    pT: depositToken
                    }, BOATLOAD_OF_GAS, utils.format.parseNearAmount((parseInt(shares)+parseInt(proposalDeposit)).toString()))
    console.log('amount ', utils.format.parseNearAmount((parseInt(shares)+parseInt(proposalDeposit)).toString()))  
                  
    let changed = await handleProposalEventChange()
    await handleGuildBalanceChanges()
    await handleEscrowBalanceChanges()
    
    if(finished && changed) {
      setFinished(true)
      setOpen(false)
      handleVotingProposalClickState(false)
    }
}

  return (
    <div>
     
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Propose Voting Rights For:</DialogTitle>
        <DialogContent className={classes.rootForm}>
              <div>
                <TextField
                    autoFocus
                    margin="dense"
                    id="votingrights-proposal"
                    variant="outlined"
                    name="applicant"
                    label="Applicant"
                    helperText="enter NEAR account name of applicant"
                    placeholder="someaccount.near"
                    value={applicant}
                    onChange={handleApplicantChange}
                    inputRef={register({
                        required: true,                        
                    })}
                />
              {errors.applicant && <p style={{color: 'red'}}>You must provide a valid NEAR account.</p>}
            </div>
                <Card>
                    <CardContent>
                      <WarningIcon fontSize='large' className={classes.warning} />
                      <Typography variant="body1">You are requesting that <b>{applicant}</b> be given voting rights.  After submitting
                      this request, you should provide enough supporting detail to help other voters decide whether to approval your proposal or not.</Typography>
                      <Grid container className={classes.confirmation} spacing={1}>
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                          <Checkbox
                            checked={transfer}
                            onChange={handleTransferChange}
                            name="transferCheck"
                            color="primary"
                            inputRef={register({
                              required: true
                            })}
                          />
                        </Grid>
                        <Grid item xs={10} sm={10} md={10} lg={10} xl={10} style={{margin:'auto'}}>
                          <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{parseInt(shares) + parseInt(proposalDeposit)} Ⓝ</b>:</Typography>
                          <Grid container justify="center" spacing={0}>
                            <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                              <Typography variant="body2"><u>Proposal passes:</u></Typography>
                                <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                                  <li>
                                    <Typography variant="body2">{parseInt(shares)} Ⓝ voting share goes to the applicant</Typography>
                                  </li>
                                  <li>
                                    <Typography variant="body2">{parseInt(proposalDeposit)} Ⓝ proposal deposit is returned to you</Typography>
                                  </li>
                                </ul>
                            </Grid>
                            <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                              <Typography variant="body2"><u>Proposal fails:</u></Typography>
                                <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                                  <li>
                                    <Typography variant="body2">{parseInt(shares)} Ⓝ goes to applicant </Typography>
                                  </li>
                                  <li>
                                    <Typography variant="body2">{parseInt(proposalDeposit)} Ⓝ proposal deposit is returned to you</Typography>
                                  </li>
                                </ul>
                            </Grid>
                            <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                              <Typography variant="body2"><u>Proposal Cancelled:</u></Typography>
                              <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                                <li>
                                  <Typography variant="body2">{parseInt(shares) + parseInt(proposalDeposit)} Ⓝ returned to you </Typography>
                                </li>
                              </ul>
                            </Grid>
                          </Grid>
                        
                          <Typography variant="body2">The Ⓝ is transferred immediately into escrow and stays there until the proposal is sponsored or cancelled.</Typography>     
                        </Grid>
                    </Grid>
                      </CardContent>
                </Card>

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
