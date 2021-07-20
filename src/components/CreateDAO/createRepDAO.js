import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { utils } from 'near-api-js'

import { GAS, FACTORY_DEPOSIT } from '../../utils/ceramic'
import { proposalEvent } from '../../utils/proposalEvents'
import * as nearAPI from 'near-api-js'

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


export default function CreateRepDAO(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [daoName, setDaoName] = useState('')
  const [funding, setFunding] = useState('')
  const [confirm, setConfirm] = useState(false)

  const classes = useStyles()

  const { register, handleSubmit, watch, errors } = useForm()

  const { handleProposalEventChange,
    handleEscrowBalanceChanges,
    handleGuildBalanceChanges,
    handleCreateDAOClickState,
    proposalDeposit,
   
    tokenName,
    depositToken,
    accountId,
    contract } = props

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleCreateDAOClickState(false)
  };
  
  const handleDaoNameChange = (event) => {
    setDaoName(event.target.value);
  };

  const handleFundingChange = (event) => {
    setFunding(event.target.value);
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked);
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)

      // create Fleet for account
      try{
        finished = await factoryContract.createDAO({
                name: name,
                publicKey: publicKey
            }, GAS, utils.format.parseNearAmount(FACTORY_DEPOSIT))
            console.log('finished', finished)
      
      
        setFinished(true)
    } catch (err) {
        console.log('error creating fleet dao', err)
       
        setFinished(true)
    }




    let proposal
    try{
      proposal = await contract.submitProposal({
        a: accountId,
        sR: '0',
        lR: '0',
        tO: '0',
        tT: depositToken,
        pR: funding,
        pT: depositToken,
        }, GAS, utils.format.parseNearAmount(parseInt(proposalDeposit).toString()))
          try{
          let updated = await proposalEvent.recordEvent(
            proposal.pI, proposal.a, proposal.p, proposal.s, proposal.sR, proposal.lR, proposal.tO, proposal.tT, proposal.pR, proposal.pT, 
            proposal.sP, proposal.yV, proposal.nV, proposal.f, proposal.mT, proposal.pS, proposal.vP, proposal.gP, proposal.voteFinalized)
           
          } catch (err) {
            console.log('problem recording the funding proposal event', err)
           
          }
      } catch (err) {
        console.log('problem submitting funding proposal', err)
       
      }
      if(finished) {
        setFinished(true)
        await handleProposalEventChange()
        await handleEscrowBalanceChanges()
        await handleGuildBalanceChanges()
        setOpen(false)
        handleClose()
      }
  } 

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create a DAO</DialogTitle>
        <DialogContent className={classes.rootForm}>  
          <div>
            <TextField
              autoFocus
              margin="dense"
              id="create-dao-name"
              variant="outlined"
              name="daoName"
              placeholder="MyProject"
              label="Name"
              value={daoName}
              onChange={handleDaoNameChange}
              inputRef={register({
                  required: true,
                  validate: value => value != '' || <p style={{color:'red'}}>You must specify a valid name (no spaces).</p>
              })}
            />
            {errors.daoName && <p style={{color: 'red'}}>You must provide a valid name (no spaces).</p>}
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
                <Tooltip TransitionComponent={Zoom} title="A short description of why the DAO exists - what purpose or mission is it bringing people together to achieve.">
                            <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                </Tooltip>
                </>,
                }}
            />
          </div>
        <Card>
        <CardContent>
          <WarningIcon fontSize='large' className={classes.warning} />
          <Typography variant="body1"></Typography>
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
              <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{parseInt(proposalDeposit)} Ⓝ</b>:</Typography>
              <Grid container justify="center" spacing={0}>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="body2"><u>Proposal passes:</u></Typography>
                    <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                      <li>
                        <Typography variant="body2">Applicant receives {funding} Ⓝ.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">Community fund will decrease by {funding} Ⓝ.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{proposalDeposit} Ⓝ proposal deposit is returned to you</Typography>
                      </li>
                    </ul>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="body2"><u>Proposal fails or is cancelled:</u></Typography>
                    <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                      <li>
                        <Typography variant="body2">Applicant receives no funding.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">Community fund does not change.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{proposalDeposit} Ⓝ proposal deposit is returned to you.</Typography>
                      </li>
                    </ul>
                </Grid>
              </Grid>
              <Typography variant="body2">The <b>{proposalDeposit} Ⓝ</b> you are about to transfer immediately goes into escrow and stays there until the proposal is sponsored or cancelled.</Typography>     
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
