import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useForm } from 'react-hook-form'

// Material UI components
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import LinearWithValueLabel from '../common/LinearProgressWithLabel/linearProgressWithLabel'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Card from '@material-ui/core/Card'


const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 50
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


export default function Initialize(props) {
    const[done, setDone] = useState(props.done)
    const classes = useStyles()
    const { register, handleSubmit, watch, errors } = useForm()

    const { handleInitChange, accountId, contract, initialized } = props
    
    const [finished, setFinish] = useState(false)
    const [loaded, setLoaded] = useState(false)

   
    useEffect(
      () => {
         
      }, [])
  
    const onSubmit = async (values) => {
        event.preventDefault()
        setFinish(false)
        const { periodDuration, votingPeriodLength, gracePeriodLength, dilutionBound, proposalDeposit, processingReward } = values
        console.log('values', values)
     
        let finisher = await contract.init({
                            _periodDuration: parseInt(periodDuration),
                            _votingPeriodLength: parseInt(votingPeriodLength),
                            _gracePeriodLength: parseInt(gracePeriodLength),
                            _proposalDeposit: proposalDeposit,
                            _dilutionBound: parseInt(dilutionBound)
                        }, process.env.DEFAULT_GAS_VALUE)
        if(finisher) {
          setFinish(finisher)
          handleInitChange(true)
        }
    }

    if(!done) {
      return(
        <Grid container alignItems="center" justify="center">
          <Grid item xs={6} sm={6} md={6} lg={6} xl={6} >
            <Typography component="h2">Just setting things up, please wait a moment.</Typography>
            <LinearWithValueLabel />
          </Grid>
        </Grid>
      )
    } else {
      return (       
        <Grid container spacing={3}>
         <Grid item xs={12}>
           <Paper className={classes.paper}>
          
               <div className={classes.root}>
                 <Card className={classes.customCard}>
                  <Typography variant="h5" component="h1" >DAO Setup</Typography>
                  <form className={classes.rootForm} noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>

                    <TextField
                      id="period-duration"
                      variant="outlined"
                      name="periodDuration"
                      label="Period Duration"
                      required={true}
                      inputRef={register({
                          required: true
                      })}
                      placeholder="14400"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">Seconds</InputAdornment>,
                    }}
                    />

                    <TextField
                      id="voting-period-length"
                      variant="outlined"
                      name="votingPeriodLength"
                      label="Voting Period Length"
                      placeholder="42"
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
                    placeholder="42"
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
                    placeholder="10"
                    inputRef={register({
                        required: true, 
                    })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Tokens</InputAdornment>,
                      }}
                    />

                    <TextField
                    id="dilution-bound"
                    variant="outlined"
                    name="dilutionBound"
                    label="Dilution Bound"
                    placeholder="3"
                    inputRef={register({
                        required: true, 
                    })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Tokens</InputAdornment>,
                      }}
                    />

                  <Button variant="contained" color="primary" type="submit">
                        Submit
                  </Button>

                  <Button variant="contained" color="secondary" type="reset">
                        Reset
                  </Button>

                  </form>
                  </Card>
                </div>
            </Paper>
          </Grid>
        </Grid> 
    )
  } 
}