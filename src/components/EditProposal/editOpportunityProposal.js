import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { flexClass } from '../../App'
import { IPFS_PROVIDER } from '../../utils/ceramic'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Switch from '@material-ui/core/Switch'
import InputAdornment from '@material-ui/core/InputAdornment'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Checkbox from '@material-ui/core/Checkbox'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Rating from '@material-ui/lab/Rating'
import Paper from '@material-ui/core/Paper'

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
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function EditOpportunityProposalForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)

    // Persona Fields
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [deadline, setDeadline] = useState('')
    // Opportunity Proposal Fields
    const [title, setTitle] = useState('')
    const [details, setDetails] = useState(EditorState.createEmpty())
    const [reward, setReward] = useState('')
    const [budget, setBudget] = useState()
    const [category, setCategory] = useState('')
    const [projectName, setProjectName] = useState('')
    const [status, setStatus] = useState(false)
    const [permission, setPermission] = useState('')
    const [familiarity, setFamiliarity] = useState('0')
    const [desiredSkillSet, setDesiredSkillSet] = useState({
      memeCreation: false,
      videoCreation: false,
      writing: false,
      design: false,
      eventOrganization: false,
      socialMedia: false,
      marketing: false,
      translation: false
    })
    const [desiredDeveloperSkillSet, setDesiredDeveloperSkillSet] = useState({
      rust: false,
      assemblyScript: false,
      javascript: false,
      typescript: false,
      solidity: false,
      webDevelopment: false
    })
    const { state, dispatch, update } = useContext(appStore)
    const { register, handleSubmit, watch, errors } = useForm()

    const {
        handleUpdate,
        handleEditOpportunityProposalDetailsClickState,
        applicant,
        proposer,
        curDaoIdx,
        curPersonaIdx,
        opportunityId,
        contractId,
    } = props
    
    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)
           
            // Set Existing Persona Data      
            if(curPersonaIdx){
              let result = await curPersonaIdx.get('profile', curPersonaIdx.id)
              console.log('result edit', result)
              if(result) {
                result.date ? setDate(result.date) : setDate('')
                result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                result.name ? setName(result.name) : setName('')
              }
           }

           // Set Existing Proposal Data       
           if(curDaoIdx){
              let propResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.opportunities.length){
                  if(propResult.opportunities[i].opportunityId == opportunityId){
                    propResult.opportunities[i].title ? setTitle(propResult.opportunities[i].title) : setTitle('')
                    if (propResult.opportunities[i].details){
                    let contentBlock = htmlToDraft(propResult.opportunities[i].details)
                    if (contentBlock){
                      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
                      const editorState = EditorState.createWithContent(contentState)
                      setDetails(editorState)
                    }
                    } else {
                      setDetails(EditorState.createEmpty())
                    }
                    propResult.opportunities[i].reward ? setReward(propResult.opportunities[i].reward) : setReward('')
                    propResult.opportunities[i].deadline ? setDeadline(propResult.opportunities[i].deadline) : setDeadline('')
                    propResult.opportunities[i].category ? setCategory(propResult.opportunities[i].category) : setCategory('')
                    propResult.opportunities[i].projectName ? setProjectName(propResult.opportunities[i].projectName) : setProjectName('')
                    propResult.opportunities[i].status ? setStatus(propResult.opportunities[i].status) : setStatus(false)
                    propResult.opportunities[i].permission ? setPermission(propResult.opportunities[i].permission) : setPermission('')
                    propResult.opportunities[i].deadline ? setDeadline(propResult.opportunities[i].deadline) : setDeadline('')
                    propResult.opportunities[i].familiarity ? setFamiliarity(propResult.opportunities[i].familiarity) : setFamiliarity('0')
                    propResult.opportunities[i].budget ? setBudget(propResult.opportunities[i].budget) : setBudget()
                    propResult.opportunities[i].desiredSkillSet ? setDesiredSkillSet(propResult.opportunities[i].desiredSkillSet): setDesiredSkillSet({})
                    propResult.opportunities[i].desiredDeveloperSkillSet ? setDesiredDeveloperSkillSet(propResult.opportunities[i].desiredDeveloperSkillSet): setDesiredDeveloperSkillSet({})
                    break
                  }
                  i++
                }
              }
           }
        }
        let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
        return () => mounted = false
        }
    },[curPersonaIdx])

    function handleFileHash(hash) {
      setAvatar(IPFS_PROVIDER + hash)
    }

    const handleClose = () => {
        handleEditOpportunityProposalDetailsClickState(false)
        setOpen(false)
    }

    const handleStatusChange = (event) => {
      setStatus(event.target.checked)
    }

    const handleTitleChange = (event) => {
        let value = event.target.value;
        setTitle(value)
    }
    const handleDeadlineChange = (event) => {
      let value = event.target.value.toString();
      setDeadline(value)
    }
    const handleRewardChange = (event) => {
      let value = event.target.value;
      setReward(value)
    }
    const handleBudgetChange = (event) => {
      let value = event.target.value;
      setBudget(value)
    }
    const handleCategoryChange = (event) => {
      let value = event.target.value;
      setCategory(value)
    }

    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }

    const handleDesiredSkillSetChange = (event) => {
      setDesiredSkillSet({ ...desiredSkillSet, [event.target.name]: event.target.checked })
    }

    const handleDesiredDeveloperSkillSetChange = (event) => {
      setDesiredDeveloperSkillSet({ ...desiredDeveloperSkillSet, [event.target.name]: event.target.checked })
    }

    const handleRatingChange = (event, newValue) => {
      if(newValue != null){
        setFamiliarity(newValue.toString())
      }
    }

    const handleDetailsChange = (editorState) => {
      setDetails(editorState)
    }

    const onSubmit = async (values) => {
      console.log('editor', draftToHtml(convertToRaw(details.getCurrentContent())))
      event.preventDefault()
      setFinished(false)

      let now = new Date().getTime()
      let formattedDate = formatDate(now)
  
      // Load existing array of details
      let detailRecords = await curDaoIdx.get('opportunities', curDaoIdx.id)
      console.log('opportunity detailRecords', detailRecords)
      if(!detailRecords){
        detailRecords = { opportunities: [] }
      }
      
      let proposalRecord = {
          opportunityId: opportunityId.toString(),
          title: title,
          contractId: contractId,
          details: draftToHtml(convertToRaw(details.getCurrentContent())),
          proposer: proposer,
          submitDate: now,
          reward: reward,
          category: category,
          projectName: projectName,
          deadline: deadline, 
          budget: parseFloat(budget),
          status: status,
          permission: permission,
          familiarity: familiarity,
          desiredSkillSet: desiredSkillSet,
          desiredDeveloperSkillSet: desiredDeveloperSkillSet
      }

      // Update existing records
      let exists
      let i = 0
      while (i < detailRecords.opportunities.length){
        if(detailRecords.opportunities[i].opportunityId == opportunityId){
          detailRecords.opportunities[i] = proposalRecord
          await curDaoIdx.set('opportunities', detailRecords)
          exists = true
          break
        }
        i++
      }

      // Add record if it doesn't exist
      if(!exists){
        detailRecords.opportunities.push(proposalRecord)
        console.log('detailrecords.opportunities', detailRecords.opportunities)
        await curDaoIdx.set('opportunities', detailRecords)
      }
     
      setFinished(true)
      update('', { isUpdated })
      handleUpdate(true)
      setOpen(false)
      handleClose()
    }

    
        return (
           
            <div>
       
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<>
              <DialogTitle id="form-dialog-title">Opportunity Proposal Details</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Please describe the opportunity requirements:
                  
                  </DialogContentText>
                  <Grid container justifyContent="center" alignItems="center" spacing={1}>
                  <Grid item xs={12} sm={12} md={7} lg={7} xl={7}>
                    <TextField
                        autoFocus
                        fullWidth
                        margin="dense"
                        id="opportunity-proposal-title"
                        variant="outlined"
                        name="opportunityProposalTitle"
                        label="Opportunity Title"
                        placeholder="My Awesome Opportunity"
                        value={title}
                        onChange={handleTitleChange}
                        inputRef={register({
                            required: true                              
                        })}
                    />
                    {errors.opportunityProposalTitle && <p style={{color: 'red'}}>You must give your proposal a title.</p>}
                  </Grid>
                  
                  <Grid item xs={12} sm={12} md={5} lg={5} xl={5}>
                    <FormControlLabel
                      control={<Switch checked={status} onChange={handleStatusChange} name="status" color="primary"/>}
                      label="Activate Opportunity"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{marginBottom: '10px'}}>
                    <TextField
                      margin="dense"
                      id="base-reward"
                      variant="outlined"
                      required={true}
                      name="baseReward"
                      label="Base Reward"
                      placeholder="10"
                      value={reward}
                      onChange={handleRewardChange}
                      inputRef={register({
                          required: true, 
                      })}
                      InputProps={{
                        endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                        <Tooltip TransitionComponent={Zoom} title="Minimum (base) reward amount in NEAR that will be paid out for completion of this opportunity">
                            <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                        </Tooltip>
                        </>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{marginBottom: '10px'}}>
                     <TextField
                                autoFocus
                                margin="dense"
                                id="opportunity-deadline"
                                type = "date"
                                name="deadline"
                                label="Deadline"
                                value={deadline}
                                onChange={handleDeadlineChange}
                                InputLabelProps={{shrink: true,}}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                    <TextField
                        autoFocus
                        fullWidth
                        margin="dense"
                        id="opportunity-proposal-budget"
                        variant="outlined"
                        name="opportunityProposalBudget"
                        label="Budget"
                        type="number"
                        value={budget}
                        onChange={handleBudgetChange}
                        inputRef={register({
                            required: true,
                            min: 0                      
                        })}
                        InputProps={{
                          endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                          <Tooltip TransitionComponent={Zoom} title="The budget that is available for the sum of all instances of this opportunity">
                          <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                          </Tooltip>
                          </>
                        }}
                    />
                    {errors.opportunityProposalBudget && <p style={{color: 'red'}}>You must provide an opportunity budget.</p>}
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="opportunity-category"
                      variant="outlined"
                      name="opportunityCategory"
                      label="Categories"
                      placeholder="Content,Data,NFT"
                      value={category}
                      onChange={handleCategoryChange}
                      inputRef={register({
                          required: true                              
                      })}
                      InputProps={{
                        endAdornment: <>
                        <Tooltip TransitionComponent={Zoom} title="Make it easier for people to find the opportunities by entering meaningful categories separated by commas">
                            <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                        </Tooltip>
                        </>
                      }}
                    />
                  {errors.opportunityCategory && <p style={{color: 'red'}}>You must categorize the opportunity.</p>}
                  </Grid>
                  </Grid>

                  <Accordion style={{marginBottom: '20px'}}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                  >
                  Required Skills and Competencies
                  </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">Skills Required</FormLabel>
                        <FormGroup>
                          <FormControlLabel
                            control={<Checkbox checked={desiredSkillSet.memeCreation} onChange={handleDesiredSkillSetChange} name="memeCreation" />}
                            label="Meme Creation"
                          />
                          <FormControlLabel
                            control={<Checkbox checked={desiredSkillSet.videoCreation} onChange={handleDesiredSkillSetChange} name="videoCreation" />}
                            label="Video Creation"
                          />
                          <FormControlLabel
                            control={<Checkbox checked={desiredSkillSet.writing} onChange={handleDesiredSkillSetChange} name="writing" />}
                            label="Writing"
                          />
                          <FormControlLabel
                            control={<Checkbox checked={desiredSkillSet.design} onChange={handleDesiredSkillSetChange} name="design" />}
                            label="Design"
                          />
                          <FormControlLabel
                            control={<Checkbox checked={desiredSkillSet.eventOrganization} onChange={handleDesiredSkillSetChange} name="eventOrganization" />}
                            label="Event Organization"
                          />
                          <FormControlLabel
                            control={<Checkbox checked={desiredSkillSet.socialMedia} onChange={handleDesiredSkillSetChange} name="socialMedia" />}
                            label="Social Media"
                          />
                          <FormControlLabel
                            control={<Checkbox checked={desiredSkillSet.marketing} onChange={handleDesiredSkillSetChange} name="marketing" />}
                            label="Marketing"
                          />
                          <FormControlLabel
                            control={<Checkbox checked={desiredSkillSet.translation} onChange={handleDesiredSkillSetChange} name="translation" />}
                            label="Translation"
                          />
                        </FormGroup>
                        
                        <FormHelperText>Check off the skills someone should have.</FormHelperText>
                      </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <FormControl component="fieldset" className={classes.formControl}>
                          <FormLabel component="legend">Required Developer Skills</FormLabel>
                          <FormGroup>
                          <FormControlLabel
                              control={<Checkbox checked={desiredDeveloperSkillSet.rust} onChange={handleDesiredDeveloperSkillSetChange} name="rust" />}
                              label="RUST"
                            />
                            <FormControlLabel
                              control={<Checkbox checked={desiredDeveloperSkillSet.assemblyScript} onChange={handleDesiredDeveloperSkillSetChange} name="assemblyScript" />}
                              label="AssemblyScript"
                            />
                            <FormControlLabel
                              control={<Checkbox checked={desiredDeveloperSkillSet.javascript} onChange={handleDesiredDeveloperSkillSetChange} name="javascript" />}
                              label="JavaScript"
                            />
                            <FormControlLabel
                              control={<Checkbox checked={desiredDeveloperSkillSet.typescript} onChange={handleDesiredDeveloperSkillSetChange} name="typescript" />}
                              label="TypeScript"
                            />
                            <FormControlLabel
                              control={<Checkbox checked={desiredDeveloperSkillSet.solidity} onChange={handleDesiredDeveloperSkillSetChange} name="solidity" />}
                              label="Solidity"
                            />
                            <FormControlLabel
                              control={<Checkbox checked={desiredDeveloperSkillSet.webDevelopment} onChange={handleDesiredDeveloperSkillSetChange} name="webDevelopment" />}
                              label="Web Development"
                            />
                          
                          </FormGroup>
                          <FormHelperText>Check off the developer skills someone should have.</FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                            <Typography>Desired Familiarity with Crypto/Blockchain</Typography>
                            <Rating name="Familiarity" onChange={handleRatingChange} value={parseInt(familiarity)} />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
              </Accordion>
                  <Typography variant="h6">Opportunity Details</Typography>
                  <Paper style={{padding: '5px'}}>
                  <Editor
                    editorState={details}
                    toolbarClassName="toolbarClassName"
                    wrapperClassName="wrapperClassName"
                    editorClassName="editorClassName"
                    onEditorStateChange={handleDetailsChange}
                    editorStyle={{minHeight:'200px'}}
                  />
                  </Paper>

              
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
                <Typography variant="h5" align="center">Loading Proposal Data</Typography>
              </Grid>
              </Grid></div></> }
            </Dialog>
           
          </div>
        
        )
}
