import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { submitProposal, STORAGE } from '../../state/near'
import { appStore, onAppMount } from '../../state/app'
import { formatNearAmount } from 'near-api-js/lib/utils/format'

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


export default function ConfigurationProposal(props) {

  const { state, dispatch, update } = useContext(appStore)

  const { 
    appIdx,
    didRegistryContract,
    near,
    accountId,
    wallet,
    contract,
    proposalDeposit,
    periodDuration,
    votingPeriodLength,
    gracePeriodLength,
    dilutionBound,
    voteThreshold,
    platformPercent,
    platformAccount
  } = state


  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [funding, setFunding] = useState('')
  const [confirm, setConfirm] = useState(false)

  const [thisPeriodDuration, setPeriodDuration] = useState(periodDuration)
  const [thisVotingPeriodLength, setVotingPeriodLength] = useState(votingPeriodLength)
  const [thisGracePeriodLength, setGracePeriodLength] = useState(gracePeriodLength)
  const [thisProposalDeposit, setProposalDeposit] = useState(proposalDeposit)
  const [thisDilutionBound, setDilutionBound] = useState(dilutionBound)
  const [thisVoteThreshold, setVoteThreshold] = useState(voteThreshold)
  const [thisPlatformPercent, setPlatformPercent] = useState(formatNearAmount(platformPercent, 5))
  const [thisPlatformAccount, setPlatformAccount] = useState(platformAccount)

  const [loaded, setLoaded] = useState()

  const classes = useStyles()

  const { register, handleSubmit, watch, errors } = useForm()

  const {
    handleConfigureClickState
    } = props


  const {
    contractId
  } = useParams()

    // useEffect(
    //   () => {
    //       async function fetchSettings () {
           
    //         try {
              
    //             let result = await contract.getInitSettings({})
    //             result[0][1] ? setPeriodDuration(result[0][1]) : setPeriodDuration('')
    //             result[0][2] ? setVotingPeriodLength(result[0][2]) : setVotingPeriodLength('')
    //             result[0][3] ? setGracePeriodLength(result[0][3]) : setGracePeriodLength('')
    //             result[0][4] ? setProposalDeposit(formatNearAmount(result[0][4])) : setProposalDeposit('')
    //             result[0][5] ? setDilutionBound(result[0][5]) : setDilutionBound('')
    //             result[0][6] ? setVoteThreshold(result[0][6]) : setVoteThreshold('')
    //             result[0][7] ? setPlatformPercent(result[0][8]) : setPlatformPercent('')
    //             result[0][9] ? setPlatformAccount(result[0][9]) : setPlatformAccount('')
    //             if(!result[0][9]) {
    //               try {
    //                 let pfAccount = await contract.getPlatformAccount({})
    //                 setPlatformAccount(pfAccount)
    //                 console.log('platform account', pfAccount)
    //               } catch (err) {
    //                 console.log('problem getting platform account', err)
    //               }
    //             }
    //             return true
    //         } catch (err) {
    //             console.log('failure fetching init settings')
    //             return false
    //         }

            
    //       }

    //       fetchSettings().then((res) => {
    //           res ? setLoaded(true) : setLoaded(false)
    //       })
          
    //   }, [loaded]
    // )

  const handleClose = () => {
    handleConfigureClickState(false)
  }
  
  const handlePeriodDurationChange = (event) => {
    let value = event.target.value
    setPeriodDuration(value)
  }

  const handleVotingPeriodLengthChange = (event) => {
      let value = event.target.value
      setVotingPeriodLength(value)
  }

  const handleGracePeriodLengthChange = (event) => {
      let value = event.target.value
      setGracePeriodLength(value)
  }

  const handleProposalDepositChange = (event) => {
      let value = event.target.value
      setProposalDeposit(value)
  }

  const handleDilutionBoundChange = (event) => {
      let value = event.target.value
      setDilutionBound(value)
  }

  const handleVoteThresholdChange = (event) => {
    let value = event.target.value
    setVoteThreshold(value)
  }

  const handlePlatformPercentChange = (event) => {
    let value = event.target.value
    setPlatformPercent(value)
  }

  const handlePlatformAccountChange = (event) => {
    let value = event.target.value
    setPlatformAccount(value)
  }

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked)
  }

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)

    let configuration = [
      thisPeriodDuration.toString(), 
      thisVotingPeriodLength.toString(), 
      thisGracePeriodLength.toString(), 
      thisProposalDeposit, 
      thisDilutionBound.toString(), 
      thisVoteThreshold.toString(), 
      thisPlatformPercent,
      thisPlatformAccount]
    
    try{
      await submitProposal(
        wallet,
        contractId,
        'Configuration',
        accountId,
        '0',
        '0',
        '0',
        '0',
        configuration
        )
      } catch (err) {
        console.log('problem submitting funding proposal', err)
       
      }
  } 

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Propose Community Configuration Change</DialogTitle>
        <DialogContent className={classes.rootForm}>  

        <TextField
          id="period-duration"
          variant="outlined"
          name="periodDuration"
          label="Period Duration"
          value={thisPeriodDuration}
          onChange={handlePeriodDurationChange}
          inputRef={register({
              required: true
          })}
          InputProps={{
            endAdornment: <InputAdornment position="end">Seconds</InputAdornment>,
        }}
        />

        <TextField
          id="voting-period-length"
          variant="outlined"
          name="votingPeriodLength"
          label="Voting Period Length"
          value={thisVotingPeriodLength}
          onChange={handleVotingPeriodLengthChange}
          inputRef={register({
              required: true,
          })}
          InputProps={{
              endAdornment: <InputAdornment position="end">Periods</InputAdornment>,
          }}
        />

        <TextField
        id="grace-period-length"
        variant="outlined"
        name="gracePeriodLength"
        label="Grace Period Length"
        value={thisGracePeriodLength}
        onChange={handleGracePeriodLengthChange}
        inputRef={register({
            required: true, 
        })}
        InputProps={{
          endAdornment: <InputAdornment position="end">Periods</InputAdornment>,
          }}
        />

        <TextField
        id="proposal-deposit"
        variant="outlined"
        name="proposalDeposit"
        label="Proposal Deposit"
        value={thisProposalDeposit}
        onChange={handleProposalDepositChange}
        inputRef={register({
            required: true, 
        })}
        InputProps={{
          endAdornment: <InputAdornment position="end">Ⓝ</InputAdornment>,
          }}
        />

        <TextField
        id="dilution-bound"
        variant="outlined"
        name="dilutionBound"
        label="Dilution Bound"
        value={thisDilutionBound}
        onChange={handleDilutionBoundChange}  
        inputRef={register({
            required: true, 
        })}
        InputProps={{
          endAdornment: <InputAdornment position="end">Ⓝ</InputAdornment>,
          }}
        />

        <TextField
        id="vote-threshold"
        variant="outlined"
        name="voteThreshold"
        label="Vote Threshold"
        value={thisVoteThreshold}
        onChange={handleVoteThresholdChange}  
        inputRef={register({
            required: true, 
        })}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />

        <TextField
        id="platform-percent"
        variant="outlined"
        name="platformPercent"
        label="Platform Support Percentage"
        value={thisPlatformPercent}
        onChange={handlePlatformPercentChange}  
        inputRef={register({
            required: true, 
        })}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />

        <TextField
        id="platform-account"
        variant="outlined"
        name="platformAccount"
        label="Platform Support Account"
        value={thisPlatformAccount}
        onChange={handlePlatformAccountChange}  
        inputRef={register({
            required: true, 
        })}
        />
     
        <Card>
        <CardContent>
          <WarningIcon fontSize='large' className={classes.warning} />
          <Typography variant="body1" gutterBottom>You are proposing the community configuration settings get changed. After submitting
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
              <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{parseFloat(proposalDeposit) + parseFloat(STORAGE)} Ⓝ</b>:</Typography>
              <Grid container justifyContent="center" spacing={0}>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="body2"><u>Proposal passes:</u></Typography>
                    <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                      <li>
                        <Typography variant="body2">Community configuration settings will change to the new values.</Typography>
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
                        <Typography variant="body2">Community configuration settings remain the same.</Typography>
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
