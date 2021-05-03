import React, { useState, useEffect, useContext } from 'react'
import * as nearAPI from 'near-api-js'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { utils } from 'near-api-js'

import { ceramic } from '../../utils/ceramic'

import { daoProfileSchema } from '../../schemas/daoProfile-old'
import { summonSchema } from '../../schemas/summonEvent'
import { memberSchema } from '../../schemas/members'
import { memberProposalSchema } from '../../schemas/memberProposals'
import { IDX } from '@ceramicstudio/idx'
import { dao } from '../../utils/dao'
import FileUpload from '../IPFSupload/ipfsUpload'

const bip39 = require('bip39')

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
import Avatar from '@material-ui/core/Avatar'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
import Divider from '@material-ui/core/Divider'
import { factoryContractName, GAS, FACTORY_DEPOSIT, nameSuffix } from '../../state/near'


const useStyles = makeStyles((theme) => ({
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  confirmation: {
    textAlign: 'left',
    margin: 'auto',
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
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    margin: 'auto'
  },
  }));

const imageName = require('../../img/default-profile.png') // default no-image avatar


export default function CreateDemDAO(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [daoName, setDaoName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [periodDuration, setPeriodDuration] = useState('')
  const [votingPeriodLength, setVotingPeriodLength] = useState('')
  const [gracePeriodLength, setGracePeriodLength] = useState('')
  const [proposalDeposit, setProposalDeposit] = useState('')
  const [dilutionBound, setDilutionBound] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [logo, setLogo] = useState(imageName)
  const [fileHash, setFileHash] = useState('')
  const [daoType, setDaoType] = useState('Democracy')
  const [isTaken, setIsTaken] = useState(false)
  const [did, setDid] = useState()
  const [curDaoIdx, setCurDaoIdx] = useState()

  const classes = useStyles()

  const { register, handleSubmit, watch, errors, transform } = useForm()

  const {
    state,
    handleCreateDAOClickState,
    handleSnackBarOpen,
    handleErrorMessage,
    handleSuccessMessage,
    daoFactory,
    accountId } = props
 console.log('state', state)
    useEffect(
      () => {
       
      },[]
    )
  
    const handleClickOpen = () => {
        setOpen(true)
    };

    const handleClose = () => {
        handleCreateDAOClickState(false)
    };

    function handleFileHash(hash) {
      setLogo(process.env.IPFS_PROVIDER + hash)
    }
    
    const handleDaoNameChange = async (event) => {
      const v = event.target.value.toLowerCase()
      const taken = await state.wallet.isAccountTaken(v + '.' + factoryContractName)
      setIsTaken(taken)
      setDaoName(v)
    };

    const handlePeriodDurationChange = (event) => {
        setPeriodDuration(event.target.value);
    };

    const handleVotingPeriodLengthChange = (event) => {
        setVotingPeriodLength(event.target.value);
    };

    const handleGracePeriodLengthChange = (event) => {
        setGracePeriodLength(event.target.value);
    };

    const handleDilutionBoundChange = (event) => {
        setDilutionBound(event.target.value);
    };

    const handleProposalDepositChange = (event) => {
        setProposalDeposit(event.target.value);
    };

    const handlePurposeChange = (event) => {
        setPurpose(event.target.value);
    };

    const handleFundingChange = (event) => {
        setFunding(event.target.value);
    };

    const handleConfirmChange = (event) => {
        setConfirm(event.target.checked);
    };

    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }
  

  const onSubmit = async (values) => {
    event.preventDefault()
    
    setFinished(false)

      // create Democracy DAO
      let finish
      try{
        finish = await daoFactory.createDemDAO({
                name: daoName
            }, GAS, utils.format.parseNearAmount(FACTORY_DEPOSIT))
           
        let daoAccountName = daoName + '.' + factoryContractName
        let daoContract = await dao.loadDAO(daoAccountName)
        console.log('daoContract', daoContract)

        let summonTime = await daoContract.init({
            _periodDuration: parseInt(periodDuration),
            _votingPeriodLength: parseInt(votingPeriodLength),
            _gracePeriodLength: parseInt(gracePeriodLength),
            _proposalDeposit: proposalDeposit,
            _dilutionBound: parseInt(dilutionBound)
        }, GAS)

            
        let daoAccount = await state.wallet.loadAccount(daoName + '.' + factoryContractName)
        console.log('daoAccount', daoAccount)
        let thisDaoIdx = await ceramic.getDaoIdx(appIdx, didContract, daoAccount)
        setCurDaoIdx(thisDaoIdx)

        console.log('thisDaoIdx', thisDaoIdx)
        
      
        let daoRecords = await thisDaoIdx.get('daoProfile', thisDaoIdx.id)
        console.log('daoRecords', daoRecords)

        if(!daoRecords){
          daoRecords = { profiles: [] }
        }

        let now = new Date().getTime()
       
        let formattedDate = formatDate(now)
        console.log('formattedDate', formattedDate)

        let record = {
            contractId: daoName + '.' + factoryContractName,
            summoner: accountId,
            date: formattedDate,
            daoType: daoType,
            name: daoName,
            logo: logo,
            purpose: purpose
        }

        daoRecords.profiles.push(record)
        console.log('daoRecords.profiles', daoRecords.profiles)

        let result = await thisDaoIdx.set('daoProfile', daoRecords)
        console.log('result set', result)
       
        let totalMembers = await daoContract.getTotalMembers()
        let memberId = parseInt(totalMembers)
        
        let numberSummonTime = parseInt(summonTime)

        if(summonTime && memberId) {
           
          // Log Member Event
          //let memberEventRecord = await demDaoIdx.get('member', demDaoIdx._ceramic.did.id)
          let memberEventRecord = await thisDaoIdx.get('member', thisDaoIdx.id)
          if(!memberEventRecord){
            memberEventRecord = { events: [] }
          }

          let indivMemberEventRecord = {
            memberId: memberId.toString(),
            contractId: daoContract.contractId,
            delegateKey: accountId,
            shares: '1',
            loot: '0',
            existing: true,
            highestIndexYesVote: 0,
            jailed: 0,
            joined: numberSummonTime,
            updated: numberSummonTime
          }

          memberEventRecord.events.push(indivMemberEventRecord)
          console.log('memberEventRecord.events', memberEventRecord.events)
  
          await thisDaoIdx.set('member', memberEventRecord)
         
        }

         // Log Summon Event

       // let summonEventRecord = await demDaoIdx.get('summonEvent', demDaoIdx._ceramic.did.id)
       let summonEventRecord = await thisDaoIdx.get('summonEvent', thisDaoIdx.id)
        if(!summonEventRecord){
          summonEventRecord = { events: [] }
        }
       
        let indivSummonEventRecord = {
          eventId: '1',
          contractId: daoContract.contractId,
          summoner: accountId,
          tokens: ['Ⓝ'],
          summoningTime: numberSummonTime,
          periodDuration: parseInt(periodDuration),
          votingPeriodLength: parseInt(votingPeriodLength),
          gracePeriodLength: parseInt(gracePeriodLength),
          proposalDeposit: proposalDeposit,
          dilutionBound: parseInt(dilutionBound),
          updateTime: numberSummonTime
        }
  
        summonEventRecord.events.push(indivSummonEventRecord)

        await thisDaoIdx.set('summonEvent', summonEventRecord)
      
        handleSuccessMessage('Successfully created Democracy DAO.', 'success')
        handleSnackBarOpen(true)
        setFinished(true)
        setOpen(false)
        handleClose()
    } catch (err) {
        console.log('error creating dao', err)
        if(finish){
        let reset = await daoFactory.refund({
             accountId: accountId
         }, GAS, utils.format.parseNearAmount(FACTORY_DEPOSIT))
        }
        handleErrorMessage('There was a problem creating the Democracy DAO' + err.message, 'error')
        handleSnackBarOpen(true)
        setFinished(true)
        setOpen(false)
        handleClose()
    }
  }


  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create a Democracy DAO</DialogTitle>
        <DialogContent className={classes.rootForm}>
        <Grid container className={classes.confirmation} spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <TextField
                autoFocus
                fullWidth
                margin="dense"
                id="create-dao-name"
                required={true}
                variant="outlined"
                name="daoName"
                placeholder="AwesomeDao"
                helperText="2-48 characters, no spaces, no symbols (except -)"
                minLength={state.app.accountTaken ? 999999 : 2}
                maxLength={48}
                pattern="^(([a-z\d]+[\-_])*[a-z\d]+$"
                label="DAO Name"
                value={daoName}
                onChange={handleDaoNameChange}
                inputRef={register({
                  validate: {
                  notTaken: value => !state.app.accountTaken
                  }        
                })}
                InputProps={{
                  endAdornment: <>
                  <Tooltip TransitionComponent={Zoom} title="The name of your community - E.g. mygreatcause or my-great-cause.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
              }}
                />
                {errors.daoName && <p style={{color: 'red'}}>You must provide an account name.</p>}
                <div>
                    {state.app.accountTaken ? 'Account name is already taken' : null}
                </div>
                <Divider style={{marginBottom: 10}}/>
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Typography align="center" variant="h5">Upload a Logo</Typography>
              <Avatar variant="square" src={logo} className={classes.large}/>
              <FileUpload handleFileHash={handleFileHash}/>
              <Divider style={{marginTop: 10, marginBottom: 10}}/>
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <TextField
              margin="dense"
              fullWidth
              required={true}
              id="specify-dao-purpose"
              variant="outlined"
              name="purpose"
              label="DAO's Purpose"
              placeholder="e.g. stop climate change"
              value={purpose}
              onChange={handlePurposeChange}
              inputRef={register({
                  required: true,
                  validate: value => value != '' || <p style={{color:'red'}}>You must specify the purpose of the DAO.</p>
              })}
              InputProps={{
                  endAdornment: <>
                  <Tooltip TransitionComponent={Zoom} title="A short description of why the DAO exists - what purpose or mission is it bringing people together to achieve.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
              }}
              />
            </Grid>
        </Grid>

        <Grid container className={classes.confirmation} spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{textAlign: 'center'}}>
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
        </Grid>
        
        <Card>
        <CardContent>
         
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
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body2" gutterBottom>Creating a Democracy DAO requires you to deposit <b>{parseInt(process.env.FACTORY_DEPOSIT)} Ⓝ</b>.</Typography>
                <Typography variant="body2">The <b>{process.env.FACTORY_DEPOSIT} Ⓝ</b> you are about to transfer covers the cost of storage of the DAO contract.  As this is a democracy DAO, you will have to submit a proposal that receives 51% of the vote in order to delete the DAO and recover this deposit.</Typography>     
            </Grid>
            </Grid>
          </CardContent>
         </Card>
        </DialogContent>
      <DialogActions>
      {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit" disabled={isTaken}>Create DAO</Button></> : <LinearProgress className={classes.progress} />}
      {finished ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
      </DialogActions>
      </Dialog>
    </div>
  );
}
