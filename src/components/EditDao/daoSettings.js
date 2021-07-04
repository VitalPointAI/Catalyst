import React, { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { appStore, onAppMount } from '../../state/app'
import ConfigurationProposal from '../ConfigurationProposal/configurationProposal'

// Material UI components
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import LinearProgress from '@material-ui/core/LinearProgress'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import './daoSettings.css'

import { GAS, formatNearAmount, changeDao } from '../../state/near'
import { CircularProgress } from '@material-ui/core'

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

    const [initSettings, setInitSettings] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [periodDuration, setPeriodDuration] = useState('')
    const [votingPeriodLength, setVotingPeriodLength] = useState('')
    const [gracePeriodLength, setGracePeriodLength] = useState('')
    const [proposalDeposit, setProposalDeposit] = useState('')
    const [dilutionBound, setDilutionBound] = useState('')
    const [finished, setFinished] = useState(true)
    const [open, setOpen] = useState()
    const [appDBList, setAppDBList] = useState([])
    const [configureClicked, setConfigureClicked] = useState()
    const [anchorEl, setAnchorEl] = useState(null)

    const classes = useStyles()
    const { register, handleSubmit, watch, errors } = useForm()

    const { state, dispatch, update } = useContext(appStore)

    const { 
      contract,
      currentPeriod,
      summoner,
      totalMembers,
      handleEditSettingsClick,
      tokenName,
      depositToken,
      handleErrorMessage,
      handleSuccessMessage,
      handleSnackBarOpen,
      accountId,
      hasDao,
      handleHasDao } = props

    const {
      contractId
    } = useParams()
    
      let initArray = []
     
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
    

                initArray.push({
                  summonName: result[0][0],
                  periodDuration: result[0][1],
                  votingPeriodLength: result[0][2],
                  gracePeriodLength: result[0][3],
                  proposalDeposit: result[0][4],
                  dilutionBound: result[0][5],
                  summonTime: result[0][6]
                })
              
                setInitSettings(initArray)
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
       console.log('enter submit')
        setFinished(false)
        try{
          await changeDao(
            state.wallet,
            contractId,
            periodDuration,
            votingPeriodLength,
            gracePeriodLength,
            proposalDeposit,
            dilutionBound
          )
        } catch (err) {
          console.log('error', err)
          handleErrorMessage('There was a problem changing the community settings' + err.message, 'error')
          handleSnackBarOpen(true)
          setFinished(true)
          setOpen(false)
          handleClose()
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

  const handleConfigureClick = () => {
    handleExpanded()
    handleConfigureClickState(true)
  }

  function handleConfigureClickState(property){
    setConfigureClicked(property)
  }

  function handleExpanded() {
    setAnchorEl(null)
  }

  const handleClose = () => {
    handleEditSettingsClick(false)
    setOpen(false)
  }

      return (
       
        <Grid container spacing={3}>
         <Grid item xs={12}>
               <div className={classes.root}>
                  <center><Chip variant="outlined" icon={<AccessTimeIcon />} label={'Current Period: ' + currentPeriod} style={{marginBottom: '20px'}}/>
                  <Typography variant="h6">Community Configuration</Typography></center>
                  {!finished ? <LinearProgress className={classes.progress} /> : 
                  accountId == summoner && totalMembers == 1 ? (
                    <div className={classes.rootForm}>
                

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

                  <Button variant="contained" color="primary" type="submit" onClick={handleSubmit(onSubmit)}>
                        Submit
                  </Button>

                  <Button variant="contained" color="secondary" type="reset" onClick={handleReset}>
                        Reset
                  </Button>

                  <Button variant="contained" color="secondary" onClick={handleSubmit(onDeleteSubmit)}>
                     Delete DAO
                  </Button>

                  </div>
                  ) : (
                    <>
                    <TableContainer component={Paper} style={{marginBottom: '20px'}}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Setting</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                     
                      <TableBody>
                    
                        <TableRow key={initSettings.length > 0 ? initSettings.summonName : '1'}>
                          <TableCell component="th" scope="row">
                            Summoner
                          </TableCell>
                          <TableCell>
                            {initSettings.length > 0 ? initSettings[0].summonName : <CircularProgress />}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Period Duration
                          </TableCell>
                          <TableCell>
                            {initSettings.length > 0 ? initSettings[0].periodDuration : <CircularProgress />} seconds
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Voting Period Length
                          </TableCell>
                          <TableCell>
                            {initSettings.length > 0 ? initSettings[0].votingPeriodLength : <CircularProgress />} {initSettings.length > 0 ? parseInt(initSettings[0].votingPeriodLength) > 1 ? 'periods' : 'period' : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Grace Period Length
                          </TableCell>
                          <TableCell>
                            {initSettings.length > 0 ? initSettings[0].gracePeriodLength : <CircularProgress />} {initSettings.length > 0 ? parseInt(initSettings[0].gracePeriodLength) > 1 ? 'periods' : 'period' : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Proposal Deposit
                          </TableCell>
                          <TableCell>
                            {initSettings.length > 0 ? formatNearAmount(initSettings[0].proposalDeposit) : <CircularProgress />} Ⓝ
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Dilution Bound
                          </TableCell>
                          <TableCell>
                            {initSettings.length > 0 ? initSettings[0].dilutionBound : <CircularProgress />}
                          </TableCell>
                        </TableRow>
                                
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button variant="contained" color="primary" type="reset" onClick={handleConfigureClick}>
                    Submit Configuration Proposal
                  </Button>
                  </>
                  )}
                </div>
                {configureClicked ? <ConfigurationProposal
                  handleConfigureClickState={handleConfigureClickState}
                  contract={contract}
                  proposalDeposit={proposalDeposit}
                  tokenName={tokenName}
                  depositToken={depositToken}
                  
                  /> : null }
          </Grid>
        </Grid>
        
    )
}