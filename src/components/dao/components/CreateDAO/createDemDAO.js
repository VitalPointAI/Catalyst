import React, { useState, useEffect, useContext } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { utils } from 'near-api-js'
import InfoPopup from '../../../common/InfoPopup'
import { Translate } from 'react-localize-redux'
import { ceramic } from '../../../../utils/ceramic'
import { wallet } from '../../../../utils/wallet'
import { daoProfileSchema } from '../../../../schemas/daoProfile'
import { summonSchema } from '../../../../schemas/summonEvent'
import { memberSchema } from '../../../../schemas/members'
import { memberProposalSchema } from '../../../../schemas/memberProposals'
import { IDX } from '@ceramicstudio/idx'
import { dao } from '../../../../utils/dao'
import FileUpload from '../../../common/IPFSupload/ipfsUpload'
import { DaoCeramicAppContext } from '../../../../contexts/daoCeramicAppContext'
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
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    textAlign: 'center'
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  }));

const imageName = require('../../../../images/default-profile.png') // default no-image avatar


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

  const classes = useStyles()

  const { register, handleSubmit, watch, errors } = useForm()

  const {
    handleCreateDAOClickState,
    handleSnackBarOpen,
    handleErrorMessage,
    handleSuccessMessage, 
    accountId } = props

  const { 
    appIdx,
    handleAliases,
    didsContract,
    factoryContract,
    aliases
  } = useContext(DaoCeramicAppContext)
  
    useEffect(
      () => {
        async function test() {
        
        }
        test()
          .then((res) => {

          })
      },[appIdx]
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
    
    const handleDaoNameChange = (event) => {
        setDaoName(event.target.value);
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

    const onDropLogo = async (pictureFiles, pictureDataURLs) => {
        if(pictureDataURLs[0]!==null){
            setLogo(pictureDataURLs[0])
        } else {
            setLogo(logo)
        }
    }

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
        finish = await factoryContract.createDemDAO({
                name: daoName
            }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount(process.env.FACTORY_DEPOSIT))
           
        let daoAccountName = daoName + '.' + process.env.FACTORY_CONTRACT
        let daoContract = await dao.loadDAO(daoAccountName)
       

        let summonTime = await daoContract.init({
            _periodDuration: parseInt(periodDuration),
            _votingPeriodLength: parseInt(votingPeriodLength),
            _gracePeriodLength: parseInt(gracePeriodLength),
            _proposalDeposit: proposalDeposit,
            _dilutionBound: parseInt(dilutionBound)
        }, process.env.DEFAULT_GAS_VALUE)

        let did
        let demSeed
        let demAccount
        let demClient
        let demDaoIdx
        try {
          did = await didsContract.getDID({
            accountId: daoAccountName
          })
          demSeed = await ceramic.downloadSecret(appIdx, 'SeedsJWE', did)
          demAccount = await wallet.getAccount(daoName + '.' + process.env.FACTORY_CONTRACT)
          demClient = await ceramic.getCeramic(demAccount, demSeed)
        } catch (err) {
          console.log('no did here', err)
        }       

        if(!demSeed) {
            // create new Dem DAO identity seed
            let mnemonic = bip39.generateMnemonic()
            let secretKey = bip39.mnemonicToSeed(mnemonic)
            demSeed = Buffer.from(secretKey.slice(0, 32))
           
            // encrypt and store seed in app's vault for later retrieval
            demAccount = await wallet.getAccount(daoName + '.' + process.env.FACTORY_CONTRACT)
            demClient = await ceramic.getCeramic(demAccount, demSeed)
            let demDAODID = await ceramic.associateDAODID(demAccount, didsContract, demClient)
     
            try {
              did = await didsContract.getDID({
                accountId: daoAccountName
              })
              let upload = await ceramic.storeSeedSecret(appIdx, demSeed, 'SeedsJWE', did)
            } catch (err) {
              console.log('no did here either', err)
            }
        }

        // setup DemDAO definitions and aliases
        await ceramic.schemaSetup(demAccount, 'summonEvent', 'dao summon event', didsContract, demClient, summonSchema)
        await ceramic.schemaSetup(demAccount, 'daoProfile', 'dao profile data', didsContract, demClient, daoProfileSchema)
        await ceramic.schemaSetup(demAccount, 'member', 'dao member event', didsContract, demClient, memberSchema)
        await ceramic.schemaSetup(demAccount, 'memberProposal', 'member proposals', didsContract, demClient, memberProposalSchema)
       
        demAccount = await wallet.getAccount(daoName + '.' + process.env.FACTORY_CONTRACT)
        demClient = await ceramic.getCeramic(demAccount, demSeed)
        
        // authorize dem identity
        let currentAliases = {}
        try {
            let allAliases = await didsContract.getAliases()
       
            //reconstruct aliases
            let i = 0
            
            while (i < allAliases.length) {
                let key = allAliases[i].split(':')
                let alias = {[key[0]]: key[1]}
                currentAliases = {...currentAliases, ...alias}
                i++
            }
            if(allAliases) {
                demDaoIdx = new IDX({ ceramic: demClient, aliases: currentAliases})
            }
        } catch (err) {
            console.log('error retrieving aliases and setting app Idx', err)
        }
       
        //let daoRecords = await demDaoIdx.get('daoProfile', demDaoIdx._ceramic.did.id)
        let daoRecords = await demDaoIdx.get('daoProfile')
        console.log('daoRecords', daoRecords)
        if(!daoRecords){
          daoRecords = { profiles: [] }
         
        }

        let now = new Date().getTime()
       
        let formattedDate = formatDate(now)
        console.log('formattedDate', formattedDate)

        let record = {
            contractId: daoName + '.' + process.env.FACTORY_CONTRACT,
            date: formattedDate,
            daoType: daoType,
            name: daoName,
            logo: logo,
            purpose: purpose
        }

        daoRecords.profiles.push(record)
        console.log('daoRecords.profiles', daoRecords.profiles)

        let result = await demDaoIdx.set('daoProfile', daoRecords)
        console.log('result set', result)
       
        let totalMembers = await daoContract.getTotalMembers()
        let memberId = parseInt(totalMembers)
        
        let numberSummonTime = parseInt(summonTime)

        if(summonTime && memberId) {
           
          // Log Member Event
          //let memberEventRecord = await demDaoIdx.get('member', demDaoIdx._ceramic.did.id)
          let memberEventRecord = await demDaoIdx.get('member')
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
  
          await demDaoIdx.set('member', memberEventRecord)
         
        }

         // Log Summon Event

       // let summonEventRecord = await demDaoIdx.get('summonEvent', demDaoIdx._ceramic.did.id)
       let summonEventRecord = await demDaoIdx.get('summonEvent')
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

        await demDaoIdx.set('summonEvent', summonEventRecord)
      
        handleSuccessMessage('Successfully created Democracy DAO.', 'success')
        handleSnackBarOpen(true)
        setFinished(true)
        setOpen(false)
        handleClose()
    } catch (err) {
        console.log('error creating dao', err)
        if(finish){
        let reset = await factoryContract.refund({
             accountId: accountId
         }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount(process.env.FACTORY_DEPOSIT))
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
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                <div>
                    <TextField
                    autoFocus
                    fullWidth
                    margin="dense"
                    id="create-dao-name"
                    required={true}
                    variant="outlined"
                    name="daoName"
                    placeholder="AwesomeDao"
                    label="DAO Name"
                    value={daoName}
                    onChange={handleDaoNameChange}
                    inputRef={register({
                        required: true,
                        validate: value => value != '' || <p style={{color:'red'}}>You must specify a valid name.</p>
                    })}
                    />
                    {errors.daoName && <p style={{color: 'red'}}>You must provide a valid name (no spaces).</p>}
                </div>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                    <Typography align="center" variant="h5">Upload a Logo</Typography>
                    <Avatar variant="square" src={logo} className={classes.large}/>
                    <FileUpload handleFileHash={handleFileHash}/>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <div>
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
                        <InfoPopup content={<Translate id='daoPurposeInfo'/>}/>
                        </>
                        }}
                    />
                </div>
            </Grid>
        </Grid>
        <Grid container className={classes.confirmation} spacing={1}>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" style={{marginBottom: '5px'}}>Period Duration = decide how long you want each period to be. 
                            E.g. 60=1 min, 3,600=1 hr, 86,400=1 day, 604,800=1 week.
                            </Typography>
                            <Typography variant="body2" style={{marginBottom: '5px'}}>Voting Period Duration = how long voting will last.  
                            E.g. if each period is 1 min, entering 5 here will set voting period to 5 min (1 x 5).
                            </Typography>
                            <Typography variant="body2" style={{marginBottom: '5px'}}>Grace Period Duration = how long the grace period will last.  
                            E.g. if each period is 1 min, entering 5 here will set grace period to 5 min (1 x 5).
                            </Typography>
                            <Typography variant="body2" style={{marginBottom: '5px'}}>Proposal Deposit = amount of NEAR that needs to be deposited to submit a proposal.  
                            Recommend a large enough number to help prevent spam submissions. E.g. 10 NEAR.
                            </Typography>
                            <Typography variant="body2">Dilution Bound = protects members from excessive dilution in case where a large 
                            number of people ragequit.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                 
                </Grid>
                
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Initialization Settings</Typography>
                        <TextField
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
                          endAdornment: <InputAdornment position="end">Seconds</InputAdornment>,
                      }}
                      />
  
                      <TextField
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
                            endAdornment: <InputAdornment position="end">Periods</InputAdornment>,
                        }}
                      />
  
                      <TextField
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
                        endAdornment: <InputAdornment position="end">Periods</InputAdornment>,
                        }}
                      />
  
                      <TextField
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
                        endAdornment: <InputAdornment position="end">Ⓝ</InputAdornment>,
                        }}
                      />
  
                      <TextField
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
                        endAdornment: <InputAdornment position="end">Ⓝ</InputAdornment>,
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
      {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Create DAO</Button></> : <LinearProgress className={classes.progress} />}
      {finished ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
      </DialogActions>
      </Dialog>
    </div>
  );
}
