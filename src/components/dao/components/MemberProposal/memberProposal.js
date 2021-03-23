import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Big from 'big.js'
import { utils } from 'near-api-js'
import InfoPopup from '../../../common/InfoPopup'
import { Translate } from 'react-localize-redux'
import { proposalEvent } from '../../../../utils/proposalEvents'
import { useParams } from 'react-router-dom'


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
  circleProgress: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    minWidth: '325px',
    minHeight: '200px',
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
  const [confirm, setConfirm] = useState(false)

  const {
    contractId
  } = useParams()
  

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { handleMemberProposalClickState, 
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    handleSnackBarOpen,
    handleErrorMessage,
    handleSuccessMessage,
    tokenName,
    daoContract,
    depositToken,
    proposalDeposit,
    contract,
    didsContract,
    contractIdx } = props

  const handleClose = () => {
    handleMemberProposalClickState(false)
  };

  const handleApplicantChange = (event) => {
    setApplicant(event.target.value.toString());
  };

  const handleSharesRequestedChange = (event) => {
    setShares(event.target.value.toString());
  };

  const handleTributeChange = (event) => {
    setTribute(event.target.value);
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked);
  };

  async function handleCancelAction(proposalIdentifier, tribute) {
    let finished = await daoContract.cancelProposal({
        pI: proposalIdentifier
        }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount((parseInt(proposalDeposit)+parseInt(tribute)).toString()))
    try{
      // let recorded = await proposalEvent.recordEvent(
      //   finished.pI, finished.a, finished.p, finished.s, finished.sR, finished.lR, finished.tO, finished.tT, finished.pR, finished.pT, 
      //   finished.sP, finished.yV, finished.nV, finished.f, finished.mT, finished.pS, finished.vP, finished.gP, finished.voteFinalized)

        let contractDid = await didsContract.getDID({accountId: contractId})
        let memberProposalRecords = await contractIdx.get('memberProposal', contractDid)
        let i = 0
        let recordToChange
        while (i < memberProposalRecords.events.length){
          if (memberProposalRecords.events[i].memberProposalId == proposalIdentifier.toString()){
            memberProposalRecords.events[i].flags = finished.f
            break
          }
          i++
        }

        let result = await contractIdx.set('memberProposal', memberProposalRecords)

        handleSuccessMessage('Successfully cancelled membership proposal.', 'success')
        handleSnackBarOpen(true)
      } catch (err) {
        handleErrorMessage('There was a problem cancelling the membership proposal.', 'error')
        handleSnackBarOpen(true)
      }
  }

  const onSubmit = async (values) => {
    setFinished(false)
    let finished
    try{
      finished = await contract.submitProposal({
                      a: applicant,
                      sR: tribute,
                      lR: '0',
                      tO: tribute,
                      tT: depositToken,
                      pR: '0',
                      pT: depositToken
                      }, BOATLOAD_OF_GAS, utils.format.parseNearAmount((parseInt(tribute) + parseInt(proposalDeposit)).toString()))

      console.log('finished', finished)
        let contractDid = await didsContract.getDID({accountId: contractId})
        let memberProposalRecords = await contractIdx.get('memberProposal', contractDid)
        if(!memberProposalRecords){
          memberProposalRecords = { events: [] }
        }

        try{
        let indivMemberProposalRecord = {
          memberProposalId: (finished.pI).toString(),
          applicant: finished.a,
          proposer: finished.p,
          sponsor: finished.s,
          sharesRequested: finished.sR,
          lootRequested: finished.lR,
          tributeOffered: finished.tO,
          tributeToken: finished.tT,
          paymentRequested: finished.pR,
          paymentToken: finished.pT,
          startingPeriod: finished.sP,
          yesVote: finished.yV,
          noVote: finished.nV,
          flags: finished.f,
          maxTotalSharesAndLootAtYesVote: finished.mT,
          proposalSubmission: parseInt(finished.pS),
          votingPeriod: finished.vP,
          gracePeriod: finished.gP,
          voteFinalized: parseInt(finished.voteFinalized)
        }

        memberProposalRecords.events.push(indivMemberProposalRecord)
        console.log('memberProposalRecords.events', memberProposalRecords.events)

        let result = await contractIdx.set('memberProposal', memberProposalRecords)
   

    // let totalMembers = await daoContract.getTotalMembers()
    // let memberId = parseInt(totalMembers)
      // try{
      //   let recorded = await proposalEvent.recordEvent(
      //     finished.pI, finished.a, finished.p, finished.s, finished.sR, finished.lR, finished.tO, finished.tT, finished.pR, finished.pT, 
      //     finished.sP, finished.yV, finished.nV, finished.f, finished.mT, finished.pS, finished.vP, finished.gP, finished.voteFinalized)
          if(result) {
            handleSuccessMessage('Successfully added member proposal.', 'success')
            handleSnackBarOpen(true)
          } else {
            console.log('error recording proposal - reverting')
            await handleCancelAction(finished.pI, finished.tO)
          }
        } catch (err) {
          console.log('error storing proposal log - reverting', err)
          await handleCancelAction(finished.pI, finished.tO)
        }
    } catch (err) {
      handleErrorMessage('There was a problem adding the member proposal' + err.message, 'error')
      handleSnackBarOpen(true)
      setFinished(true)
      setOpen(false)
      handleClose()
    }

    if(finished) {
      setFinished(true)
    //  await handleProposalEventChange()
      await handleGuildBalanceChanges()
      await handleEscrowBalanceChanges()
      setOpen(false)
      handleClose()
    }
}

  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Request Membership For</DialogTitle>
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
             
            <div>
              <TextField
                margin="dense"
                id="member-proposal-tribute"
                variant="outlined"
                name="memberTribute"
                label="Community Fund Contribution"
                placeholder="100"
                value={tribute}
                onChange={handleTributeChange}
                inputRef={register({
                    required: true,
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <InfoPopup content={<Translate id='democracyMemberProposalInfoContribution'/>}/>
                  </>,
                  }}
              />
              {errors.memberTribute && <p style={{color: 'red'}}>You must enter a contribution amount.</p>}
            </div>
              <Card>
              <CardContent>
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body1">You are requesting that <b>{applicant}</b> become a member of the community.  After submitting
                this proposal, you must provide enough supporting detail to help other members vote on and decide whether to approve your proposal or not.</Typography>
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
                    <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{(tribute ? parseInt(tribute) : 0) + parseInt(proposalDeposit)} Ⓝ</b>:</Typography>
                    <Grid container justify="center" spacing={0}>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Typography variant="body2"><u>Proposal passes:</u></Typography>
                          <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                            <li>
                              <Typography variant="body2">Applicant becomes a member and receives {shares ? parseInt(shares) : 0} shares.</Typography>
                            </li>
                            <li>
                              <Typography variant="body2">Contribution of {tribute ? parseInt(tribute) : 0} Ⓝ goes into the community guild fund.</Typography>
                            </li>
                            <li>
                              <Typography variant="body2">{parseInt(proposalDeposit)} Ⓝ proposal deposit is returned to you</Typography>
                            </li>
                          </ul>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Typography variant="body2"><u>Proposal fails or is cancelled:</u></Typography>
                          <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                            <li>
                              <Typography variant="body2">Applicant does not become a member.</Typography>
                            </li>
                             <li>
                              <Typography variant="body2">Contribution of {tribute ? parseInt(tribute) : 0} Ⓝ is returned to you.</Typography>
                            </li>
                            <li>
                              <Typography variant="body2">{parseInt(proposalDeposit)} Ⓝ proposal deposit is returned to you.</Typography>
                            </li>
                          </ul>
                      </Grid>
                    </Grid>
                  
                    <Typography variant="body2">The <b>{(tribute ? parseInt(tribute) : 0) + parseInt(proposalDeposit)} Ⓝ</b> you are about to transfer immediately goes into escrow and stays there until the proposal is sponsored or cancelled.</Typography>     
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
