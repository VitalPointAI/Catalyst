import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { submitProposal, STORAGE } from '../../state/near'
import Persona from '@aluhning/get-personas-js'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import InputAdornment from '@material-ui/core/InputAdornment'
import WarningIcon from '@material-ui/icons/WarningTwoTone'
import Grid from '@material-ui/core/Grid'
import Checkbox from '@material-ui/core/Checkbox'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'

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


export default function FundingProposal(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [applicant, setApplicant] = useState(props.accountId)
  const [funding, setFunding] = useState('')
  const [confirm, setConfirm] = useState(false)

  const classes = useStyles()

  const { register, handleSubmit, watch, errors } = useForm()

  const { 
    state,
    handleFundingProposalClickState,
    proposalDeposit,
    tokenName,
    depositToken,
    contractId,
    reference,
    budget
  } = props

  const handleClose = () => {
    handleFundingProposalClickState(false)
  };
  
  const handleApplicantChange = (event) => {
    setApplicant(event.target.value);
  };

  const handleFundingChange = (event) => {
    setFunding(event.target.value);
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked);
  }

  const onSubmit = async (values) => {

    if(parseFloat(funding) > budget){
      alert("Not enough funds in opportunity budget")
      handleClose()
      return
    }
      
    event.preventDefault()
    setFinished(false)
    let value = 0 
   
    let references = []
    references.push({'keyName': 'reference', 'valueSetting': reference})
  
    try{
      await submitProposal(
        state.wallet,
        contractId,
        'Commitment',
        applicant,
        '0',
        '0',
        '0',
        funding,
        [''],
        references
        )
      } catch (err) {
        console.log('problem submitting funding proposal', err)
       
      }
  } 

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Request Funding</DialogTitle>
        <DialogContent className={classes.rootForm}>  
          <div>
            <TextField
              autoFocus
              margin="dense"
              id="funding-proposal-applicant-receiver"
              variant="outlined"
              name="fundingProposalApplicant"
              label="Applicant Account"
              value={applicant}
              onChange={handleApplicantChange}
              inputRef={register({
                  required: true,
                  validate: value => value != '' || <p style={{color:'red'}}>You must specify an account that will receive the funding.</p>
              })}
              placeholder={applicant}
            />
            {errors.fundingProposalApplicant && <p style={{color: 'red'}}>You must provide a valid NEAR account.</p>}
          </div>
          <div>
            <TextField
              margin="dense"
              id="funding-proposal-funds-requested"
              variant="outlined"
              name="funding"
              label="Funding Requested"
              placeholder="e.g. 100000"
              value={funding}
              onChange={handleFundingChange}
              inputRef={register({
                  required: true,
                  validate: value => value != '' || <p style={{color:'red'}}>You must specify the amount of funding your proposal needs.</p>
              })}
              InputProps={{
                endAdornment: <><InputAdornment position="end">{tokenName}</InputAdornment>
                <Tooltip TransitionComponent={Zoom} title="The amount of NEAR the applicant is requesting to fund their proposal.  The proposal should be benefitting the community in some way.">
                    <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                </Tooltip>
                </>
              }}
            />
          </div>
        <Card>
        <CardContent>
          <WarningIcon fontSize='large' className={classes.warning} />
          <Typography variant="body1" gutterBottom>You are requesting that {funding} Ⓝ be reserved for use by <b>{applicant}</b>. After submitting
          this proposal, you must provide enough supporting detail to help other members vote on and decide whether to approve your proposal or not.</Typography> 
          <Typography variant="body1">Note: while you can submit a request for any funding amount, you should consider whether your request really warrants 
          using as much of the community fund as it proposes.</Typography>
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
              <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{parseFloat(proposalDeposit) + parseFloat(STORAGE)} Ⓝ</b>:</Typography>
              <Grid container justifyContent="center" spacing={0}>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="body2"><u>Proposal passes:</u></Typography>
                    <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                      <li>
                        <Typography variant="body2">{funding} Ⓝ will be put in escrow and designated for this project.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">Community fund will decrease by {funding} Ⓝ.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{proposalDeposit} Ⓝ proposal deposit is returned to you</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{STORAGE} Ⓝ goes to the contract to cover storage cost for this proposal.</Typography>
                      </li>
                    </ul>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="body2"><u>Proposal fails or is cancelled:</u></Typography>
                    <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                      <li>
                        <Typography variant="body2">No funding will be designated for this proposal.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">Community fund does not change.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{proposalDeposit} Ⓝ proposal deposit is returned to you.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{STORAGE} Ⓝ stays in the contract to cover storage cost for this proposal.</Typography>
                      </li>
                    </ul>
                </Grid>
              </Grid>
             </Grid>
            </Grid>
          </CardContent>
         </Card>
        </DialogContent>
      <DialogActions>
      {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Submit Proposal</Button></> : <LinearProgress className={classes.progress} />}
      {finished ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
      </DialogActions>
      </Dialog>
    </div>
  );
}
