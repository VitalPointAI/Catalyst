import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useForm } from 'react-hook-form'

// Material UI components
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import LinearProgress from '@material-ui/core/LinearProgress'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import AccessTimeIcon from '@material-ui/icons/AccessTime'

import './daoSettings.css'

import { GAS, formatNearAmount } from '../../state/near'

const useStyles = makeStyles((theme) => ({
  root: {
      padding: '10px'
  },
  rootForm: {
      marginTop: '10px',
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


export default function EditInitSettings(props) {

    const[initSettings, setInitSettings] = useState([])
    const[loaded, setLoaded] = useState(false)
    const[periodDuration, setPeriodDuration] = useState('')
    const[votingPeriodLength, setVotingPeriodLength] = useState('')
    const[gracePeriodLength, setGracePeriodLength] = useState('')
    const[proposalDeposit, setProposalDeposit] = useState('')
    const[dilutionBound, setDilutionBound] = useState('')
    const [finished, setFinish] = useState(true)
    const[appDBList, setAppDBList] = useState([])

    const classes = useStyles()
    const { register, handleSubmit, watch, errors } = useForm()

    const { 
      contract,
      currentPeriod,
      handleEditSettingsClick,
      handleErrorMessage,
      handleSuccessMessage,
      handleSnackBarOpen,
      accountId,
      hasDao,
      handleHasDao } = props

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
                setInitSettings(result[0])
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

    const handleReset = () => {
        initSettings[1] ? setPeriodDuration(initSettings[1]) : setPeriodDuration('')
        initSettings[2] ? setVotingPeriodLength(initSettings[2]) : setVotingPeriodLength('')
        initSettings[3] ? setGracePeriodLength(initSettings[3]) : setGracePeriodLength('')
        initSettings[4] ? setProposalDeposit(initSettings[4]) : setProposalDeposit('')
        initSettings[5] ? setDilutionBound(initSettings[5]) : setDilutionBound('')
    }

    const handlePeriodDurationChange = (event) => {
        let value = event.target.value;
        setPeriodDuration(value)
    }

    const handleVotingPeriodLengthChange = (event) => {
        let value = event.target.value;
        setVotingPeriodLength(value)
    }

    const handleGracePeriodLengthChange = (event) => {
        let value = event.target.value;
        setGracePeriodLength(value)
    }

    const handleProposalDepositChange = (event) => {
        let value = event.target.value;
        setProposalDeposit(value)
    }

    const handleDilutionBoundChange = (event) => {
        let value = event.target.value;
        setDilutionBound(value)
    }
  
    const onSubmit = async (values) => {
        event.preventDefault()
        setFinish(false)
     
        let finished = await contract.setInit({
                            _periodDuration: parseInt(periodDuration),
                            _votingPeriodLength: parseInt(votingPeriodLength),
                            _gracePeriodLength: parseInt(gracePeriodLength),
                            _proposalDeposit: proposalDeposit,
                            _dilutionBound: parseInt(dilutionBound)                           
                        }, GAS)
        let currentId = await contract.getInitEventsLength()
        let id = currentId + 1
        let summonTime = await contract.getSummonTime()
    //    await summonEvent.recordSummonEvent(id.toString(), accountId, ['Ⓝ'], summonTime, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, finished)
        
        if(finished) {
          setFinish(true)
          handleEditSettingsClick()
        }
    }

    const onDeleteSubmit = async (values) => {
      setFinish(false)
      let finished

      try {
      let accountName = accountId.split('.')
      console.log('accountName', accountName[0])
      let name = accountName[0]
      if(hasDao){
          // create Fleet for account
         finished = await contract.deleteDAO({
              name: name,
              beneficiary: accountId
          }, GAS)
          console.log('finished', finished)
          if(finished) {
              await handleHasDao(false)
              handleSuccessMessage('Successfully deleted Fleet DAO.', 'success')
              handleSnackBarOpen(true)
          } else {
              console.log('error deleting Fleet Dao')
              handleErrorMessage('There was a problem deleting the Fleet DAO', 'error')
              handleSnackBarOpen(true)
              setFinished(true)
              handleEditSettingsClick()
          }
      }
      } catch (err) {
      console.log('error deleting fleet dao', err)
      handleErrorMessage('There was a problem deleting the Fleet DAO' + err.message, 'error')
      handleSnackBarOpen(true)
      setFinish(true)
      handleEditSettingsClick()
      }
      if(finished) {
          setFinish(true)
          handleEditSettingsClick()
      }
  }

      return (
       
        <Grid container spacing={3}>
         <Grid item xs={12}>
         
          
               <div className={classes.root}>
                  <Chip variant="outlined" icon={<AccessTimeIcon />} label={'Period: ' + currentPeriod} />
                  <Typography variant="h5" component="h2" >DAO Settings</Typography>
                  {!finished ? <LinearProgress className={classes.progress} /> : (
                  <form className={classes.rootForm} noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>

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

                  <Button variant="contained" color="primary" type="submit">
                        Submit
                  </Button>

                  <Button variant="contained" color="secondary" type="reset" onClick={handleReset}>
                        Reset
                  </Button>

                  <Button variant="contained" color="secondary" onClick={handleSubmit(onDeleteSubmit)}>
                     Delete DAO
                  </Button>

                  </form>
                  )}
                </div>
          
          </Grid>
        </Grid>
     
    )
  
}