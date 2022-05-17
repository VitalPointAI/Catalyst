import React, { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { appStore, onAppMount } from '../../state/app'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import { PLATFORM_PERCENT } from '../../state/near'
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
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'

import './daoSettings.css'

import { GAS, changeDao } from '../../state/near'
import { CircularProgress } from '@material-ui/core'
import { LocalConvenienceStoreOutlined } from '@material-ui/icons'

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

    const { state, dispatch, update } = useContext(appStore)

    const {
      periodDuration,
      votingPeriodLength,
      gracePeriodLength,
      proposalDeposit,
      dilutionBound,
      voteThreshold,
      platformPercent,
      summoningTime,
      platformAccount,
      contract,
      currentPeriod,
      summoner,
      tokenName,
      depositToken,
      accountId,
      wallet
    } = state

    const [initSettings, setInitSettings] = useState([])
    const [loaded, setLoaded] = useState(false)

    const [thisPeriodDuration, setPeriodDuration] = useState(periodDuration)
    const [thisVotingPeriodLength, setVotingPeriodLength] = useState(votingPeriodLength)
    const [thisGracePeriodLength, setGracePeriodLength] = useState(gracePeriodLength)
    const [thisProposalDeposit, setProposalDeposit] = useState(proposalDeposit)
    const [thisDilutionBound, setDilutionBound] = useState(dilutionBound)
    const [thisVoteThreshold, setVoteThreshold] = useState(voteThreshold)
    const [thisPlatformPercent, setPlatformPercent] = useState(formatNearAmount(platformPercent, 5))

    const [finished, setFinished] = useState(true)
    const [open, setOpen] = useState()
    
    const [configureClicked, setConfigureClicked] = useState()
   
    const [anchorEl, setAnchorEl] = useState(null)

    const classes = useStyles()
    const { register, handleSubmit, watch, errors } = useForm()

    const { 
      totalMembers,
      handleEditSettingsClick,
       } = props

    const {
      contractId
    } = useParams()
    
      let initArray = []

      console.log('state', state)
      console.log('periodduration', thisPeriodDuration)
      console.log('dilutionBound', thisDilutionBound)
     
    useEffect(
      () => {
          async function fetchSettings () {
            if(summoner && periodDuration && votingPeriodLength && gracePeriodLength
              && proposalDeposit && dilutionBound && voteThreshold && platformPercent
              && platformAccount){
            try {

                initArray.push({
                  summonName: summoner,
                  periodDuration: periodDuration,
                  votingPeriodLength: votingPeriodLength,
                  gracePeriodLength: gracePeriodLength,
                  proposalDeposit: proposalDeposit,
                  dilutionBound: dilutionBound,
                  voteThreshold: voteThreshold,
                  summonTime: summoningTime,
                  platformPercent: formatNearAmount(platformPercent, 5),
                  platformAccount: platformAccount
                })
              
                setInitSettings(initArray)
                return true
              

            } catch (err) {
                console.log('failure fetching init settings')
                return false
            }
          }
         
          }

          fetchSettings().then((res) => {
              res ? setLoaded(true) : setLoaded(false)
          })
          
      }, [summoner, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, voteThreshold, platformPercent, platformAccount]
    )

    const handleReset = () => {
        initSettings[1] ? setPeriodDuration(periodDuration) : setPeriodDuration('')
        initSettings[2] ? setVotingPeriodLength(votingPeriodLength) : setVotingPeriodLength('')
        initSettings[3] ? setGracePeriodLength(gracePeriodLength) : setGracePeriodLength('')
        initSettings[4] ? setProposalDeposit(proposalDeposit) : setProposalDeposit('')
        initSettings[5] ? setDilutionBound(dilutionBound) : setDilutionBound('')
        initSettings[6] ? setVoteThreshold(voteThreshold) : setVoteThreshold('')
        initSettings[8] ? setPlatformPercent(formatNearAmount(PLATFORM_PERCENT, 5)) : setPlatformPercent(formatNearAmount(PLATFORM_PERCENT, 5))
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

    const handlePlatformPercentChange = (event) => {
      setPlatformPercent(event.target.value)
    }

    const handleVoteThresholdChange = (event) => {
      let value = event.target.value;
      setVoteThreshold(value)
  }
  
    const onSubmit = async (values) => {
 
        setFinished(false)
        try{
          await changeDao(
            wallet,
            contractId,
            thisPeriodDuration,
            thisVotingPeriodLength,
            thisGracePeriodLength,
            thisProposalDeposit,
            thisDilutionBound,
            thisVoteThreshold,
            thisPlatformPercent,
            platformAccount
          )
        } catch (err) {
          console.log('error', err)
          setFinished(true)
          setOpen(false)
          handleClose()
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
                    label="Catalyst Support"
                    value={thisPlatformPercent}
                    onChange={handlePlatformPercentChange}
                    inputRef={register({
                        required: true,
                    })}
                    InputProps={{
                      endAdornment: <><InputAdornment position="end">%</InputAdornment>
                      <Tooltip TransitionComponent={Zoom} title="The percentage amount you are willing to send to the Catalyst development team that comes off each successful proposal payout. Minimum is 0.5%">
                          <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                      </Tooltip>
                      </>
                    }}
                    />

                   

                  <Button variant="contained" color="primary" type="submit" onClick={handleSubmit(onSubmit)}>
                        Submit
                  </Button>

                  <Button variant="contained" color="secondary" type="reset" onClick={handleReset}>
                        Reset
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
                            {initSettings.length > 0 ? initSettings[0].proposalDeposit : <CircularProgress />} Ⓝ
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
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Vote Threshold
                          </TableCell>
                          <TableCell>
                            {initSettings.length > 0 ? initSettings[0].voteThreshold : <CircularProgress />}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Platform Support
                          </TableCell>
                          <TableCell>
                            {initSettings.length > 0 ? initSettings[0].platformPercent : <CircularProgress />}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Platform Support Account
                          </TableCell>
                          <TableCell>
                            {initSettings.length > 0 ? initSettings[0].platformAccount : <CircularProgress />}
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
                  /> : null }

          </Grid>
        </Grid>
        
    )
}