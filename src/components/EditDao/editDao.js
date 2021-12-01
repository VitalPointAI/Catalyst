import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import FileUpload from '../IPFSupload/ipfsUpload'
import { flexClass } from '../../App'
import { ceramic, IPFS_PROVIDER } from '../../utils/ceramic'
import * as nearAPI from 'near-api-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"

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
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Accordion from '@material-ui/core/Accordion'
import { AccordionDetails } from '@material-ui/core'
import { AccordionSummary } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import EmailIcon from '@material-ui/icons/Email'
import RedditIcon from '@material-ui/icons/Reddit'
import TwitterIcon from '@material-ui/icons/Twitter'
import TelegramIcon from '@material-ui/icons/Telegram'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Zoom from '@material-ui/core/Zoom'
import Tooltip from '@material-ui/core/Tooltip'
import { InputAdornment } from '@material-ui/core'
import InfoIcon from '@material-ui/icons/Info'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import AddBoxIcon from '@material-ui/icons/AddBox'

// CSS Styles
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
    id: {
      display: 'none'
    },
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const imageName = require('../../img/default_logo.png') // default no-image avatar
const discordIcon = require('../../img/discord-icon.png')

export default function EditDaoForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [logo, setLogo] = useState(imageName)
    const [purpose, setPurpose] = useState(EditorState.createEmpty())
    const [category, setCategory] = useState('')
    const [webhook, setWebhook] = useState('')
  

    const [discordActivated, setDiscordActivated] = useState(false)
    const [proposalsActivated, setProposalsActivated] = useState(false)
    const [passedProposalsActivated, setPassedProposalsActivated] = useState(false)
    const [votingActivated, setVotingActivated] = useState(false) 
    const [sponsorActivated, setSponsorActivated] = useState(false) 
    const [email, setEmail] = useState('')
    const [twitter,setTwitter] = useState('')
    const [discord, setDiscord] = useState('')
    const [website, setWebsite] = useState('')
    const [telegram, setTelegram] = useState('')
    const [reddit, setReddit] = useState('')
    const [addDisabled, setAddDisabled] = useState(true)
   
    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
   
    
    const {
       fields: skillsFields,
       append: skillsAppend,
       remove: skillsRemove} = useFieldArray({
      name: "skills",
      control
    })

    const { 
      fields: specificSkillsFields,
      append: specificSkillsAppend,
      remove: specificSkillsRemove } = useFieldArray({
      name: "specificSkills",
      control
    })

    const skills = watch('skills', skillsFields)
    const specificSkills = watch('specificSkills', specificSkillsFields)
    
  
    const { state, dispatch, update } = useContext(appStore)

    const {
        handleEditDaoClickState,
        contractId,
    } = props

    const {
      near,
      appIdx,
      isUpdated,
      didRegistryContract,
      daoFactory
    } = state
    
    const classes = useStyles()
   
    useEffect(() => {
        async function fetchData() {
          setLoaded(false)
         
           // Set Card Persona Idx       
           if(contractId && near){
             // Set Dao Idx
             let thisCurDaoIdx
             try{
              let daoAccount = new nearAPI.Account(near.connection, contractId)
              thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, near, didRegistryContract)
              setCurDaoIdx(thisCurDaoIdx)
            } catch (err) {
              console.log('problem getting curdaoidx', err)
              return false
            }
                               
              
              let did = await ceramic.getDid(contractId, daoFactory, didRegistryContract)
              let result = await appIdx.get('daoProfile', did)
            
              let webhook = await ceramic.downloadKeysSecret(thisCurDaoIdx, 'apiKeys')
      
              if(webhook && Object.keys(webhook).length > 0){
                 setWebhook(webhook[0].api) 
              }
              else{
                 setWebhook('')
              }
              if(result) {
                if(result.purpose){
                  let contentBlock = htmlToDraft(result.purpose)
                  if(contentBlock){
                    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
                    const editorState = EditorState.createWithContent(contentState)
                    setPurpose(editorState)
                  }
                 }
                  else{
                    setPurpose(EditorState.createEmpty())
                  }
                result.name ? setName(result.name) : setName('')
                result.date ? setDate(result.date) : setDate('')
                result.logo ? setLogo(result.logo) : setLogo(imageName)
                result.skills ? setValue('skills', result.skills) : setValue('skills', {'name': ''})
                result.specificSkills ? setValue('specificSkills', result.specificSkills) : setValue('specificSkills', {'name': ''})
                result.category ? setCategory(result.category) : setCategory('')
                result.discordActivation ? setDiscordActivated(true) : setDiscordActivated(false)
                result.proposalActivation ? setProposalsActivated(true) : setProposalsActivated(false)
                result.passedProposalActivation ? setPassedProposalsActivated(true) : setPassedProposalsActivated(false)
                result.sponsorActivation ? setSponsorActivated(true) : setSponsorActivated(false)
                result.reddit? setReddit(result.reddit) : setReddit('')
                result.discord? setDiscord(result.discord): setDiscord('')
                result.twitter? setTwitter(result.twitter): setTwitter('')
                result.email? setEmail(result.email): setEmail('')
                result.telegram? setTelegram(result.telegram): setTelegram('')
                result.website? setWebsite(result.website): setWebsite('')
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

    const handlePurposeChange = (editorState) => {
      setPurpose(editorState)
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
    const handleTwitterChange = (event) =>{
      let value = event.target.value;
      setTwitter(value); 
    }
    const handleEmailChange = (event) =>{
      let value = event.target.value;
      setEmail(value); 
    }
    const handleTelegramChange = (event) =>{
      let value = event.target.value;
      setTelegram(value); 
    }
    const handleWebsiteChange = (event) =>{
      let value = event.target.value;
      setWebsite(value); 
    }
    const handleDiscordChange = (event) =>{
      let value = event.target.value;
      setDiscord(value); 
    }
    const handleRedditChange = (event) =>{
      let value = event.target.value;
      setReddit(value); 
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
            purpose: draftToHtml(convertToRaw(purpose.getCurrentContent())),
            discordActivation: discordActivated,
            proposalActivation: proposalsActivated,
            passedProposalActivation: passedProposalsActivated,
            sponsorActivation: sponsorActivated,
            skills: skills,
            specificSkills: specificSkills,
            discord: discord,
            twitter: twitter,
            telegram: telegram, 
            email: email,
            website: website, 
            reddit: reddit
        }
     
        let result = await curDaoIdx.set('daoProfile', record)
    
        
        //ADD WEBHOOK HERE
        let hookArray = await ceramic.downloadKeysSecret(curDaoIdx, 'apiKeys')
   
     
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

        let result2 = await ceramic.storeKeysSecret(curDaoIdx, hookArray, 'apiKeys', curDaoIdx.id)
     
      //setIsUpdated(true)
      setFinished(true)
      update('', {isUpdated: !isUpdated})
      
      setOpen(false)
      handleClose()
    }


        return (
           
            <div>
       
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<>
              <DialogTitle id="form-dialog-title">Community Profile Details</DialogTitle>
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
                        label="Community Name"
                        placeholder="Super Dao"
                        value={name}
                        onChange={handleNameChange}
                        inputRef={register({
                            required: false                              
                        })}
                      />
                    {errors.name && <p style={{color: 'red'}}>You must provide a community name.</p>}

                    <TextField
                      
                      margin="dense"
                      id="profile-category"
                      variant="outlined"
                      name="category"
                      label="Category"
                      placeholder="Social Cause"
                      value={category}
                      onChange={handleCategoryChange}
                      style={{marginLeft: '5px'}}
                      inputRef={register({
                          required: false                              
                      })}
                    />
                    {errors.name && <p style={{color: 'red'}}>You must categorize your DAO so others can find it.</p>} 
               
                    <Typography variant="h6" style={{marginTop: '10px'}}>Community Purpose</Typography>
                    <Paper style={{padding: '5px'}}>
                    <Editor
                      editorState={purpose}
                      toolbarClassName="toolbarClassName"
                      wrapperClassName="wrapperClassName"
                      editorClassName="editorClassName"
                      onEditorStateChange={handlePurposeChange}
                      editorStyle={{minHeight:'200px'}}
                    />
                    </Paper>

                    <Paper style={{padding: '5px', marginTop: '20px'}}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Typography variant="h6">Add a Logo</Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                          <Avatar src={logo} variant="square" className={classes.square} />
                      </Grid>
                      <Grid item xs={8} sm={8} md={8} lg={8} xl={8}>
                        <FileUpload handleFileHash={handleFileHash} align="center"/>
                      </Grid>
                    </Grid>
                    </Paper>

                  <Card style={{marginTop: '20px', marginBottom: '20px', padding: '5px'}}>
                  <Typography variant="h6">Notifications</Typography>
                      <Grid container justifyContent="flex-start" alignItems="center" spacing={1}>
                        <Grid item xs={9} sm={9} md={9} lg={9} xl={9}>
                          <TextField
                            
                            fullWidth
                            margin="dense"
                            id="discord-webhook"
                            variant="outlined"
                            name="WebHook"
                            label="Discord Server Webhook"
                            placeholder="Discord Server Webhook"
                            value={webhook}
                            onChange={handleWebhookChange}
                            inputRef={register({
                                required: false                              
                            })}
                          />
                        </Grid>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                          <FormControlLabel control={<Switch checked={discordActivated} onChange={handleDiscordActivation} color="primary"/>} label="Enabled" />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <Typography variant="h6">Notify on:</Typography>
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={4} xl={4}>
                          <FormControlLabel control={<Switch checked={proposalsActivated} onChange={handleProposalActivation} color="primary"/>} label="New Proposal" />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={4} xl={4}>
                          <FormControlLabel control={<Switch checked={passedProposalsActivated} onChange={handlePassedProposalActivation} color="primary"/>} label="Processed Proposal" />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={4} xl={4}>
                          <FormControlLabel control={<Switch checked={sponsorActivated} onChange={handleSponsorActivation} color="primary"/>} label="Sponsored Proposal" />
                        </Grid>
                      </Grid>
                    
                  </Card>
                  <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                      >
                      <Typography variant="h6">Community Accounts</Typography>
                      <Tooltip TransitionComponent={Zoom} title="Here you can add communication channels for your community.">
                        <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                      </Tooltip>
                      </AccordionSummary>
                  <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <TextField
                        
                        margin="dense"
                        id="input-with-icon-grid"
                        id="profile-email"
                        variant="outlined"
                        name="email"
                        label="Email"
                        placeholder="someone@someplace"
                        value={email}
                        onChange={handleEmailChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                        inputRef={register({
                            required: false                              
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <TextField
                       
                        margin="dense"
                        id="daoprofile-website"
                        variant="outlined"
                        name="website"
                        label="Website"
                        placeholder="www.someplace.com"
                        value={website}
                        onChange={handleWebsiteChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              https://
                            </InputAdornment>
                          ),
                        }}
                        inputRef={register({
                            required: false                              
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <TextField
                       
                        margin="dense"
                        id="profile-discord"
                        variant="outlined"
                        name="discord"
                        label="Discord"
                        placeholder="someone#1234"
                        value={discord}
                        onChange={handleDiscordChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <img src={discordIcon} style={{width: '24px', height: 'auto'}}/>
                            </InputAdornment>
                          ),
                        }}
                        inputRef={register({
                            required: false                              
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <TextField
                      
                        margin="dense"
                        id="profile-telegram"
                        variant="outlined"
                        name="telegram"
                        label="Telegram"
                        placeholder="@someplace"
                        value={telegram}
                        onChange={handleTelegramChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                             <TelegramIcon />
                            </InputAdornment>
                          ),
                        }}
                        inputRef={register({
                            required: false                              
                        })}
                      />
                  </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <TextField
                        
                        margin="dense"
                        id="profile-twitter"
                        variant="outlined"
                        name="twitter"
                        label="Twitter"
                        placeholder="some user"
                        value={twitter}
                        onChange={handleTwitterChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TwitterIcon />
                            </InputAdornment>
                          ),
                        }}
                        inputRef={register({
                            required: false                              
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <TextField
                        
                        margin="dense"
                        id="profile-reddit"
                        variant="outlined"
                        name="reddit"
                        label="Reddit"
                        placeholder="some user"
                        value={reddit}
                        onChange={handleRedditChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <RedditIcon />
                            </InputAdornment>
                          ),
                        }}
                        inputRef={register({
                            required: false                              
                        })}
                      />
                    </Grid>
                  </Grid>

                </AccordionDetails>
              </Accordion>
              <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                      >
                      <Typography variant="h6">General Skills, Values and Competencies</Typography>
                      <Tooltip TransitionComponent={Zoom} title="Here you can add the general skills (leadership, management, teamwork, etc...) and values that are relevant to what your community does.">
                        <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                      </Tooltip>
                      </AccordionSummary>
                  <AccordionDetails>
                    <React.Fragment>
                      <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                      {
                        skillsFields.map((field, index) => {
                        return(
                          
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                          <TextField
                            
                            margin="dense"
                            id={`skills[${index}].name`}
                            variant="outlined"
                            name={`skills[${index}].name`}
                            defaultValue={field.name}
                            label="Skill Name:"
                            InputProps={{
                              endAdornment: <div>
                              <Tooltip TransitionComponent={Zoom} title="Short name of skill.">
                                  <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                              </Tooltip>
                              </div>
                            }}
                            inputRef={register({
                                required: true                              
                            })}
                          />
                          {errors[`skills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                          
                          <Button type="button" onClick={() => skillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                            <DeleteForeverIcon />
                          </Button>
                          </Grid>
                          
                        )
                      }) 
                      }
                      {!skillsFields || skillsFields.length == 0 ?
                        <Typography variant="body1" style={{marginLeft: '5px'}}>No general skills defined yet. Add general skills that are relevant to your community.</Typography>
                      : null }
                      <Button
                        type="button"
                        onClick={() => skillsAppend({name: ''})}
                        startIcon={<AddBoxIcon />}
                      >
                        Add Skill
                      </Button>
                    </Grid>
                    </React.Fragment>  
                </AccordionDetails>
              </Accordion>
              <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                      >
                      <Typography variant="h6">Specific Skills and Certifications</Typography>
                      <Tooltip TransitionComponent={Zoom} title="Here you can add specific skills such as programming languages, frameworks, certifications, etc... that are relevant to what your community does.">
                        <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                      </Tooltip>
                      </AccordionSummary>
                  <AccordionDetails>
                    <React.Fragment>
                      <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                      {
                        specificSkillsFields.map((field, index) => {
                        return(
                          
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                          <TextField
                            
                            margin="dense"
                            id={`specificSkills[${index}].name`}
                            variant="outlined"
                            name={`specificSkills[${index}].name`}
                            defaultValue={field.name}
                            label="Skill Name:"
                            InputProps={{
                              endAdornment: <div>
                              <Tooltip TransitionComponent={Zoom} title="Short name of skill.">
                                  <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                              </Tooltip>
                              </div>
                            }}
                            inputRef={register({
                                required: true                              
                            })}
                          />
                          {errors[`specificSkills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                          
                          <Button type="button" onClick={() => specificSkillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                            <DeleteForeverIcon />
                          </Button>
                          </Grid>
                          
                        )
                      }) 
                      }
                      {!specificSkillsFields || specificSkillsFields.length == 0 ?
                        <Typography variant="body1" style={{marginLeft: '5px'}}>No specific skills defined yet. Add specific skills that are relevant to your community.</Typography>
                      : null }
                      <Button
                        type="button"
                        onClick={() => specificSkillsAppend({name: ''})}
                        startIcon={<AddBoxIcon />}
                      >
                        Add Skill
                      </Button>
                    </Grid>
                    </React.Fragment>  
                </AccordionDetails>
              </Accordion>
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
              
              </>) : <><div className={classes.waiting}><div class={flexClass}><CircularProgress/></div><Grid container spacing={1} alignItems="center" justifyContent="center" >
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h5" align="center">Loading DAO Details</Typography>
              </Grid>
              </Grid></div></> }
            </Dialog>
           
          </div>
        
        )
}