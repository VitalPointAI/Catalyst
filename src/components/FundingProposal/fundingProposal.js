import React, { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ceramic } from '../../utils/ceramic'
import { makeStyles } from '@material-ui/core/styles'
import { appStore, onAppMount } from '../../state/app'
import { submitProposal, STORAGE } from '../../state/near'
import { parseNearAmount, formatNearAmount } from 'near-api-js/lib/utils/format'

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

export default function FundingProposal(props) {

  const { state, dispatch, update, getState } = useContext(appStore)

  const {
    passedContractId,
    appIdx,
    did,
    didRegistryContract,
    daoFactory,
    handleFundingProposalClickState,
    tokenName,
    reference,
    budget,
    applicant,
    passedProposalDeposit,
    usd
  } = props

  const {
    proposalDeposit
  } = state

  const {
    contractId
  } = useParams()

  const [open, setOpen] = useState(true)
  const [thisApplicant, setThisApplicant] = useState(props.applicant)
  const [finished, setFinished] = useState(true)
  const [funding, setFunding] = useState('0')
  const [usdConvert, setUsdConvert] = useState('0')
  const [confirm, setConfirm] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [logo, setLogo] = useState(defaultImage)
  const [propDeposit, setPropDeposit] = useState(props.passedProposalDeposit ? props.passedProposalDeposit : proposalDeposit)

  const classes = useStyles()

  const { register, handleSubmit, watch, errors } = useForm()

  useEffect(() => {
    async function fetchPrice() {
        if(usd > 0 && state.nearPrice > 0){
          let near = (usd / state.nearPrice).toFixed(3)
          let parse = parseNearAmount(near)
          let formatNear = formatNearAmount(parse, 3)
          setFunding(formatNear)
        } 
        if(!state.nearPrice){
          setFunding('Calculating ')
        }
        if((!usd || usd == 0) && state.nearPrice) {
          setFunding('0')
        }
    }

    fetchPrice()
    
  }, [usd, state.nearPrice]
  )

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

  const handleClose = () => {
    handleFundingProposalClickState(false)
  };
  
  const handleApplicantChange = (event) => {
    setThisApplicant(event.target.value);
  };

  const handleFundingChange = (event) => {
    handleConversion(event.target.value)
    setFunding(event.target.value);
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked);
  }

  function handleConversion(amount){
      let us = (parseFloat(amount) * state.nearPrice).toFixed(2)
      setUsdConvert(us)
  }

  const onSubmit = async (values) => {

    if(state.nearPrice){
      if(budget > 0 && state.nearPrice > 0){
        if(parseFloat(funding) * state.nearPrice > parseFloat(budget)){
          alert("Not enough funds in opportunity budget")
          handleClose()
        return
        }
      }
    }
      
    event.preventDefault()
    setFinished(false)
    let value = 0 
   
    let references = []
    references.push({'keyName': 'reference', 'valueSetting': reference})
    try{
      await submitProposal(
        state.wallet,
        contractId ? contractId : passedContractId,
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
        <DialogTitle id="form-dialog-title">Funding Request</DialogTitle>
        <DialogContent className={classes.rootForm}>  
        <Grid container alignItems="center" justifyContent="center" style={{padding: '5px'}}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              id="funding-proposal-applicant-receiver"
              variant="outlined"
              name="fundingProposalApplicant"
              label="Applicant Account"
              value={thisApplicant}
              onChange={handleApplicantChange}
              inputRef={register({
                  required: true,
                  validate: value => value != '' || <p style={{color:'red'}}>You must specify an account that will receive the funding.</p>
              })}
              placeholder={applicant}
            />
            {errors.fundingProposalApplicant && <p style={{color: 'red'}}>You must provide a valid NEAR account.</p>}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          {!reference ? (<>
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
                <Tooltip TransitionComponent={Zoom} title="The amount in NEAR the applicant is requesting to fund their proposal.  The proposal should be benefitting the community in some way.">
                    <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                </Tooltip>
                </>
              }}
            />
            <Typography variant="h6">{usdConvert ? `~$${usdConvert} USD`: null}</Typography>
            </>) : <>
              <Typography variant="h6" align="center">{funding} {tokenName}</Typography>
              <Typography variant="body1" color="textSecondary" align="center">(~ ${usd} USD)</Typography>
            </> }
         
          </Grid>
        </Grid>
        <Card>
        <CardContent>
          <WarningIcon fontSize='large' className={classes.warning} />
          <Typography variant="body1" gutterBottom>You are requesting that {!reference ? usdConvert ? `$${usdConvert} USD (~${funding} Ⓝ)` : `$${usd} USD (~${funding} Ⓝ)` : `$${usd} USD (~${funding} Ⓝ)`} be reserved for <b>{applicant}</b> for this opportunity or proposal.
          <br></br><br></br>After submitting this proposal, you must provide enough detail to help other members vote on and decide whether to approve your proposal or not.</Typography> 
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
              <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{parseFloat(propDeposit, 3) + parseFloat(STORAGE)} Ⓝ</b>:</Typography>
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
                        <Typography variant="body2">{propDeposit} Ⓝ proposal deposit is returned to you</Typography>
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
                        <Typography variant="body2">{propDeposit} Ⓝ proposal deposit is returned to you.</Typography>
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
