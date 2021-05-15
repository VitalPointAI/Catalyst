import React, { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { appStore, onAppMount } from '../../state/app';
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { initDao } from '../../state/near'
import { get, set, del } from '../../utils/storage'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import LinearProgress from '@material-ui/core/LinearProgress'
import Divider from '@material-ui/core/Divider'
import WarningIcon from '@material-ui/icons/WarningTwoTone'
import InputAdornment from '@material-ui/core/InputAdornment'
import Grid from '@material-ui/core/Grid'
import Checkbox from '@material-ui/core/Checkbox'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
import { CardActions } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 50
  },
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  customCard: {
    maxWidth: 300,
    minWidth: 275,
    margin: 'auto',
    padding: 20
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
  }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function Initialize(props) {
    const[done, setDone] = useState(props.done)
    const [periodDuration, setPeriodDuration] = useState('')
    const [votingPeriodLength, setVotingPeriodLength] = useState('')
    const [gracePeriodLength, setGracePeriodLength] = useState('')
    const [proposalDeposit, setProposalDeposit] = useState('')
    const [dilutionBound, setDilutionBound] = useState('')
    const [confirm, setConfirm] = useState(false)
    const [clicked, setClicked] = useState(false)

    const [logo, setLogo] = useState(imageName)
    const [finished, setFinished] = useState(false)

    const classes = useStyles()

    const { register, handleSubmit, watch, errors } = useForm()

    const { state, dispatch, update } = useContext(appStore);

    const {
      contractId
    } = useParams()

    const {
      handleSnackBarOpen,
      handleSuccessMessage,
      handleErrorMessage
    } = props
    
    useEffect(
      () => {
         
      }, [])

      const handlePeriodDurationChange = (event) => {
        setPeriodDuration(event.target.value);
      }
  
      const handleVotingPeriodLengthChange = (event) => {
          setVotingPeriodLength(event.target.value);
      }
  
      const handleGracePeriodLengthChange = (event) => {
          setGracePeriodLength(event.target.value);
      }
  
      const handleDilutionBoundChange = (event) => {
          setDilutionBound(event.target.value);
      }
  
      const handleProposalDepositChange = (event) => {
          setProposalDeposit(event.target.value);
      }
  
      const handleConfirmChange = (event) => {
        setConfirm(event.target.checked);
      }

      const onSubmit = async (values) => {
        try{
        
          await initDao(
            state.wallet, 
            contractId,
            periodDuration, 
            votingPeriodLength, 
            gracePeriodLength, 
            proposalDeposit, 
            dilutionBound, 
            'Democracy', 
            state.appIdx, 
            state.didRegistryContract)
          
          handleSuccessMessage('Successfully created Democracy DAO.', 'success')
          handleSnackBarOpen(true)
          setFinished(true)
        } catch (err) {
          console.log('error initializing dao', err)
          handleErrorMessage('There was a problem creating the Democracy DAO' + err.message, 'error')
          handleSnackBarOpen(true)
          setFinished(true)
        }
        setFinished(false)
      }

      return (
        <>
        <Grid container className={classes.confirmation} spacing={1}>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{textAlign: 'center'}}>
        <Card>
            <CardContent>
                <Typography variant="h6">Initialization Settings</Typography>
                <TextField
                fullWidth
                id="period-duration"
                variant="outlined"
                name="periodDuration"
                label="Period Duration"
                required={true}
                value={periodDuration}
                onChange={handlePeriodDurationChange}
                inputRef={register({
                    required: true
                })}
                placeholder="14400"
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Seconds</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="Decide how long you want each period to be. 
                  E.g. 60=1 min, 3,600=1 hr, 86,400=1 day, 604,800=1 week.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />

              <TextField
                fullWidth
                id="voting-period-length"
                variant="outlined"
                required={true}
                name="votingPeriodLength"
                label="Voting Period Length"
                placeholder="42"
                value={votingPeriodLength}
                onChange={handleVotingPeriodLengthChange}
                inputRef={register({
                    required: true,
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Periods</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="How long voting will last.
                  E.g. if each period is 1 min, entering 5 here will set voting period to 5 min (1 x 5).">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />

              <TextField
                fullWidth
                id="grace-period-length"
                variant="outlined"
                required={true}
                name="gracePeriodLength"
                label="Grace Period Length"
                placeholder="42"
                value={gracePeriodLength}
                onChange={handleGracePeriodLengthChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Periods</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="How long the grace period will last.  
                  E.g. if each period is 1 min, entering 5 here will set grace period to 5 min (1 x 5).">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />

              <TextField
                fullWidth
                id="proposal-deposit"
                variant="outlined"
                required={true}
                name="proposalDeposit"
                label="Proposal Deposit"
                placeholder="10"
                value={proposalDeposit}
                onChange={handleProposalDepositChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="Amount of NEAR that needs to be deposited to submit a proposal.  
                  Recommend a large enough number to help prevent spam submissions. E.g. 10 NEAR.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />

              <TextField
                fullWidth
                id="dilution-bound"
                variant="outlined"
                required={true}
                name="dilutionBound"
                label="Dilution Bound"
                placeholder="3"
                value={dilutionBound}
                onChange={handleDilutionBoundChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="protects members from excessive dilution in case where a large 
                  number of people ragequit.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
              </CardContent>
              </Card>
        </Grid>
       
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <CardContent>
              <Grid container className={classes.confirmation} spacing={1}>
         
              Placeholder for video

               
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{textAlign: 'center', marginTop: '50px'}}>
                  <Button
                  disabled={state.app.accountTaken || clicked}
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit(onSubmit)}>
                    INITIALIZE DAO
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        </>
    )
  
}