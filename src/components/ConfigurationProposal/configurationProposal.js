import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { submitProposal, formatNearAmount, parseNearAmount } from '../../state/near'
import { appStore, onAppMount } from '../../state/app'

// ReactQuill Component
import ReactQuill from 'react-quill';

// CSS Styles
import '../../../node_modules/react-quill/dist/quill.snow.css'

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


export default function ConfigurationProposal(props) {

  const { state, dispatch, update } = useContext(appStore)

  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [funding, setFunding] = useState('')
  const [confirm, setConfirm] = useState(false)

  const [periodDuration, setPeriodDuration] = useState('')
  const [votingPeriodLength, setVotingPeriodLength] = useState('')
  const [gracePeriodLength, setGracePeriodLength] = useState('')
  const [proposalDeposit, setProposalDeposit] = useState('')
  const [dilutionBound, setDilutionBound] = useState('')
  const [voteThreshold, setVoteThreshold] = useState('')

  const [loaded, setLoaded] = useState()

  const classes = useStyles()

  const { register, handleSubmit, watch, errors } = useForm()

  const {
    contract,
    handleConfigureClickState,
    tokenName,
    depositToken,
    } = props

  const { 
    appIdx,
    didRegistryContract,
    near,
    accountId,
    wallet
  } = state

  const {
    contractId
  } = useParams()

    useEffect(
      () => {
          async function fetchSettings () {
           
            try {
              
                let result = await contract.getInitSettings({})
                result[0][1] ? setPeriodDuration(result[0][1]) : setPeriodDuration('')
                result[0][2] ? setVotingPeriodLength(result[0][2]) : setVotingPeriodLength('')
                result[0][3] ? setGracePeriodLength(result[0][3]) : setGracePeriodLength('')
                result[0][4] ? setProposalDeposit(formatNearAmount(result[0][4])) : setProposalDeposit('')
                result[0][5] ? setDilutionBound(result[0][5]) : setDilutionBound('')
                result[0][6] ? setVoteThreshold(result[0][6]) : setVoteThreshold('')
                return true
            } catch (err) {
                console.log('failure fetching init settings')
                return false
            }
          }

          fetchSettings().then((res) => {
              res ? setLoaded(true) : setLoaded(false)
          })
          
      }, [loaded]
    )

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

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked)
  }

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)

    let configuration = [periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, voteThreshold]
    
    try{
      await submitProposal(
        wallet,
        contractId,
        depositToken,
        parseNearAmount(proposalDeposit),
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
          value={periodDuration}
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
          value={votingPeriodLength}
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
        value={gracePeriodLength}
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
        value={proposalDeposit}
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
        value={dilutionBound}
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
        value={voteThreshold}
        onChange={handleVoteThresholdChange}  
        inputRef={register({
            required: true, 
        })}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
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
              <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{proposalDeposit} Ⓝ</b>:</Typography>
              <Grid container justify="center" spacing={0}>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="body2"><u>Proposal passes:</u></Typography>
                    <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                      <li>
                        <Typography variant="body2">Community configuration settings will change to the new values.</Typography>
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
                        <Typography variant="body2">Community configuration settings remain the same.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{proposalDeposit} Ⓝ proposal deposit is returned to you.</Typography>
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
