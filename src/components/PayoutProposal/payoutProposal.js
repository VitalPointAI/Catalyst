import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { submitProposal, STORAGE } from '../../state/near'

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

const defaultImage = require('../../img/default_logo.png')

export default function PayoutProposal(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [applicant, setApplicant] = useState(props.accountId)
  const [payout, setPayout] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [logo, setLogo] = useState(defaultImage)
  const [usdConvert, setUsdConvert] = useState('0')

  const classes = useStyles()

  const { register, handleSubmit, watch, errors } = useForm()

  const { 
    state,
    handlePayoutProposalClickState,
    proposalDeposit,
    tokenName,
    depositToken,
    reference,
    contractId,
    milestonePayout,
    appIdx,
    did,
    passedContractId
     } = props


  useEffect(
    () => {
      async function fetchData() {
        // get community information
        
        if((contractId || passedContractId) && appIdx){
          let daoResult
          let thisContractId
          contractId ? thisContractId = contractId : thisContractId = passedContractId
          console.log('this contract id', thisContractId)
          if(!did){
            let did = await ceramic.getDid(thisContractId, state.daoFactory, state.didRegistryContract)
            daoResult = await appIdx.get('daoProfile', did)
            console.log('did1 dao result', daoResult)
          } else {
            daoResult = await appIdx.get('daoProfile', did)
            console.log('did2 dao result', daoResult)
          }
         
          if(daoResult){
            daoResult.name ? setCommunityName(daoResult.name) : setCommunityName('')
            daoResult.logo ? setLogo(daoResult.logo) : setLogo(defaultImage)
          }
        }
      }

      fetchData()
        .then((res) => {

        })

   }, [contractId, appIdx]
   )

  function handleConversion(amount){
    let us = (parseFloat(amount) * state.nearPrice).toFixed(2)
    setUsdConvert(us)
  }

  const handleClose = () => {
    handlePayoutProposalClickState(false)
  };
  
  const handleApplicantChange = (event) => {
    setApplicant(event.target.value);
  };

  const handlePayoutChange = (event) => {
    handleConversion(event.target.value)
    setPayout(event.target.value)
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked);
  }

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)

    let references = []

    if(reference){
      Object.entries(reference[0]).map(([key, value]) => {
        
        references.push({
          'keyName': key,
          'valueSetting': value.toString()
        })
      })
    }
   
    let actualPayout
    milestonePayout ? actualPayout = milestonePayout : actualPayout = payout

    try{
      await submitProposal(
        state.wallet,
        contractId,
        'Payout',
        applicant,
        '0',
        '0',
        '0',
        actualPayout.toString(),
        [''],
        references
        )
      } catch (err) {
        console.log('problem submitting payout proposal', err)
      }
  } 

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
      <Grid container alignItems="center" justifyContent="center" style={{padding: '5px'}}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <div style={{
            height: '100px',
            backgroundImage: `url(${logo})`, 
            backgroundSize: 'contain',
            backgroundPosition: 'center', 
            backgroundRepeat: 'no-repeat',
            backgroundOrigin: 'content-box'
          }}/>
          <br></br>
          {logo ? null : <Typography variant="h6">{communityName ? communityName : contractId ? contractId : passedContractId }</Typography>}
        </Grid>
      </Grid>
        <DialogTitle id="form-dialog-title">Request Payout</DialogTitle>
        <DialogContent className={classes.rootForm}>  
          <div>
            <TextField
              autoFocus
              margin="dense"
              id="payout-proposal-applicant-receiver"
              variant="outlined"
              name="payoutProposalApplicant"
              label="Applicant Account"
              value={applicant}
              onChange={handleApplicantChange}
              inputRef={register({
                  required: true,
                  validate: value => value != '' || <p style={{color:'red'}}>You must specify an account that will receive the payout.</p>
              })}
              placeholder={applicant}
            />
            {errors.payoutProposalApplicant && <p style={{color: 'red'}}>You must provide a valid NEAR account.</p>}
          </div>
          <div>
          {!milestonePayout ? (
            <TextField
              margin="dense"
              id="payout-proposal-funds-requested"
              variant="outlined"
              name="payout"
              label="Payout Requested"
              placeholder="e.g. 100000"
              value={milestonePayout ? milestonePayout : payout}
              onChange={handlePayoutChange}
              inputRef={register({
                  required: true,
                  validate: value => value != '' || <p style={{color:'red'}}>You must specify the amount of the payout.</p>
              })}
              InputProps={{
                endAdornment: <><InputAdornment position="end">{tokenName}</InputAdornment>
                <Tooltip TransitionComponent={Zoom} title="The amount of NEAR the applicant is requesting to receive. The payout must be an amount already committed for this project.">
                    <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                </Tooltip>
                </>
              }}
            />
          ) : (<>
            <Typography variant="h6">Payout Requested: {milestonePayout} {tokenName}</Typography>
            <Typography variant="body1">For proposal: {reference[0].proposal}, milestone: {reference[0].milestone}</Typography>
          </>)}

          <Typography variant="h6">{usdConvert ? `~$${usdConvert} USD`: null}</Typography>
          
          </div>
        <Card>
        <CardContent>
          <WarningIcon fontSize='large' className={classes.warning} />
          <Typography variant="body1">You are requesting that <b>{applicant}</b> receive {milestonePayout ? milestonePayout : payout} Ⓝ. After submitting
          this proposal, you must provide enough supporting detail and proof of work to help other members evaluate the work done and decide whether to approve your proposal or not.</Typography>
          <Grid container className={classes.confirmation} spacing={1}>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
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
                        <Typography variant="body2">Applicant receives {milestonePayout ? milestonePayout : payout} Ⓝ.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">Community escrow fund will decrease by {milestonePayout ? milestonePayout : payout} Ⓝ.</Typography>
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
                        <Typography variant="body2">Applicant receives no payout.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">Community escrow fund does not change.</Typography>
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
