import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import FileUpload from '../IPFSupload/ipfsUpload'
import { flexClass } from '../../App'
import { ceramic, IPFS_PROVIDER } from '../../utils/ceramic'
import * as nearAPI from 'near-api-js'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Switch from '@material-ui/core/Switch'
import Card from '@material-ui/core/Card'

// ReactQuill Component
import ReactQuill from 'react-quill';

// CSS Styles
import '../../../node_modules/react-quill/dist/quill.snow.css'
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    progress: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
    large: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        textAlign: 'center'
    },
    square: {
      //color: theme.palette.getContrastText(deepOrange[500]),
      //backgroundColor: deepOrange[500],
      width: '175px',
      height: 'auto'
    },
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const imageName = require('../../img/default_logo.png') // default no-image avatar

export default function EditDaoForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [isUpdated, setIsUpdated] = useState(false)
    const [logo, setLogo] = useState(imageName)
    const [purpose, setPurpose] = useState('')
    const [category, setCategory] = useState('')
    const [webhook, setWebhook] = useState('')
    const [curDaoIdx, setCurDaoIdx] = useState()

    const [discordActivated, setDiscordActivated] = useState(false)
    const [proposalsActivated, setProposalsActivated] = useState(false)
    const [passedProposalsActivated, setPassedProposalsActivated] = useState(false)
    const [votingActivated, setVotingActivated] = useState(false) 
    const [sponsorActivated, setSponsorActivated] = useState(false) 

    const { register, handleSubmit, watch, errors } = useForm()

    const { state, dispatch, update } = useContext(appStore)

    const {
        handleUpdate,
        handleEditDaoClickState,
        contractId
    } = props

    const {
      near,
      appIdx,
      didRegistryContract
    } = state
    
    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)
         
           // Set Card Persona Idx       
           if(contractId && near){
             // Set Dao Idx
                               
              let daoAccount = new nearAPI.Account(near.connection, contractId)
            
              let thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
              setCurDaoIdx(thisCurDaoIdx)

              let result = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)

              let webhook = await ceramic.downloadKeysSecret(thisCurDaoIdx, 'apiKeys')
              console.log("webhook", webhook)
              if(webhook && Object.keys(webhook).length > 0){
                 setWebhook(webhook[0].api) 
              }
              else{
                 setWebhook('')
              }
              if(result) {
                result.name ? setName(result.name) : setName('')
                result.date ? setDate(result.date) : setDate('')
                result.logo ? setLogo(result.logo) : setLogo(imageName)
                result.purpose ? setPurpose(result.purpose) : setPurpose('')
                result.category ? setCategory(result.category) : setCategory('')
                result.discordActivation ? setDiscordActivated(true) : setDiscordActivated(false)
                result.proposalActivation ? setProposalsActivated(true) : setProposalsActivated(false)
                result.passedProposalActivation ? setPassedProposalsActivated(true) : setPassedProposalsActivated(false)
                result.sponsorActivation ? setSponsorActivated(true) : setSponsorActivated(false)
              }
           }
        }
       
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
    },[near])

    function handleFileHash(hash) {
      setLogo(IPFS_PROVIDER + hash)
    }

    const handleClose = () => {
        handleEditDaoClickState(false)
        setOpen(false)
    }

    const handleNameChange = (event) => {
        let value = event.target.value;
        setName(value)
    }

    const handleCategoryChange = (event) => {
      let value = event.target.value;
      setCategory(value)
    }
    const handleWebhookChange = (event) => {
      let value = event.target.value;
      setWebhook(value)
    }
    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }

    const handlePurposeChange = (content, delta, source, editor) => {
      setPurpose(content)
    }
    const handleDiscordActivation = () => {
      setDiscordActivated(!discordActivated) 
    }
    const handleProposalActivation = () => {
      setProposalsActivated(!proposalsActivated)
    }
    const handlePassedProposalActivation = () => {
      setPassedProposalsActivated(!passedProposalsActivated)
    }
    const handleSponsorActivation = () => {
      setSponsorActivated(!sponsorActivated)
    }

    const onSubmit = async (values) => {
        event.preventDefault();
        setFinished(false)
        let now = new Date().getTime()
       
        let formattedDate = formatDate(now)
    
        let record = {
            contractId: contractId,
            summoner: state.accountId,
            date: formattedDate,
            category: category,
            name: name,
            logo: logo,
            purpose: purpose,
            discordActivation: discordActivated,
            proposalActivation: proposalsActivated,
            passedProposalActivation: passedProposalsActivated,
            sponsorActivation: sponsorActivated
        }
     
        let result = await curDaoIdx.set('daoProfile', record)
    
        
        //ADD WEBHOOK HERE
        let hookArray = await ceramic.downloadKeysSecret(curDaoIdx, 'apiKeys')
   
        console.log('hookArray', hookArray)
        // let hookArray = []
        hookArray = [
          {
          api: webhook, 
          discordActivation: discordActivated,
          proposalActivation: proposalsActivated,
          passedProposalActivation: passedProposalsActivated, 
          sponsorActivation: sponsorActivated
          }
        ]

         console.log("hook array", hookArray)
         let result2 = await ceramic.storeKeysSecret(curDaoIdx, hookArray, 'apiKeys', curDaoIdx.id)
         console.log("hook result", result2)

        // let m = 0
        // let updateDaoList = state.currentDaosList
        // while (m < updateDaoList.length){
        //   if(updateDaoList[m].contractId == contractId){
        //     let newRecord = {
        //       contractId: contractId,
        //       summoner: state.accountId,
        //       date: now,
        //       category: category,
        //       name: name,
        //       logo: logo,
        //       purpose: purpose
        //     }
        //     updateDaoList[m] = newRecord
        //   }
        //   m++
        // }

        // let daoResult = await state.appIdx.set('daoList', updateDaoList)
     
      setIsUpdated(true)
      setFinished(true)
      handleUpdate(true)
      setOpen(false)
      handleClose()
    }

    const modules = {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline','strike', 'blockquote', 'code', 'code-block'],
          [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}, {'align': []}],
          ['link', 'image', 'video'],
          ['clean']
        ],
    };
    
    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code', 'code-block',
        'list', 'bullet', 'indent','align',
        'link', 'image', 'video'
    ];
    
        return (
           
            <div>
       
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<>
              <DialogTitle id="form-dialog-title">DAO Profile Details</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Provide as much detail as you'd like.
                  </DialogContentText>
                    
                      <TextField
                        autoFocus
                        margin="dense"
                        id="profile-name"
                        variant="outlined"
                        name="name"
                        label="DAO Name"
                        placeholder="Super Dao"
                        value={name}
                        onChange={handleNameChange}
                        inputRef={register({
                            required: false                              
                        })}
                      />
                    {errors.name && <p style={{color: 'red'}}>You must provide a DAO name.</p>}

                    <TextField
                      autoFocus
                      margin="dense"
                      id="profile-category"
                      variant="outlined"
                      name="category"
                      label="Category"
                      placeholder="Social Cause"
                      value={category}
                      onChange={handleCategoryChange}
                      inputRef={register({
                          required: false                              
                      })}
                    />
                    {errors.name && <p style={{color: 'red'}}>You must categorize your DAO so others can find it.</p>} 
               
               
                    <TextField
                      autoFocus
                      margin="dense"
                      id="discord-webhook"
                      variant="outlined"
                      name="WebHook"
                      label="WebHook"
                      placeholder="Web Hook"
                      value={webhook}
                      onChange={handleWebhookChange}
                      inputRef={register({
                          required: false                              
                      })}
                    />
                  <Card>
                      <Grid container>
                      <Grid item xs={6}>     
                      <Typography>Discord Notifications</Typography>
                       <Switch checked={discordActivated} onChange={handleDiscordActivation}>Discord</Switch>
                      </Grid>
                      <Grid item xs={6}>
                      <Typography>Proposal Notifications</Typography>
                        <Switch checked={proposalsActivated} onChange={handleProposalActivation}>New Proposals</Switch>
                      </Grid>
                      <Grid item xs={6}>
                      <Typography>Processing Notifications</Typography>
                       <Switch checked={passedProposalsActivated} onChange={handlePassedProposalActivation}>Passed Proposals</Switch>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>Sponsor Notifications</Typography>
                        <Switch checked={sponsorActivated} onChange={handleSponsorActivation}>Sponsorships</Switch>
                      </Grid>
                    </Grid>
                  </Card>

                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    name="purpose"
                    label="DAO Purpose"
                    value={purpose}
                    onChange={handlePurposeChange}
                    style={{height:'200px', marginBottom:'100px'}}
                    inputRef={register({
                        required: false
                    })}
                  />
             
                  <Grid container spacing={1}>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                        <Avatar src={logo} variant="square" className={classes.square} />
                    </Grid>
                    <Grid item xs={8} sm={8} md={8} lg={8} xl={8}>
                      <Typography align="center" variant="h5">Upload a Logo</Typography>
                      <FileUpload handleFileHash={handleFileHash} align="center"/>
                    </Grid>
                  </Grid>
                 
                </DialogContent>
               
              {!finished ? <LinearProgress className={classes.progress} style={{marginBottom: '25px' }}/> : (
              <DialogActions>
              <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
                  Submit Details
                </Button>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
              </DialogActions>)}
              <Divider style={{marginBottom: 10}}/>
              
              </>) : <><div className={classes.waiting}><div class={flexClass}><CircularProgress/></div><Grid container spacing={1} alignItems="center" justify="center" >
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h5" align="center">Loading DAO Details</Typography>
              </Grid>
              </Grid></div></> }
            </Dialog>
           
          </div>
        
        )
}