import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useParams } from 'react-router-dom'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { flexClass } from '../../App'
import { IPFS_PROVIDER } from '../../utils/ceramic'
import { parseNearAmount, formatNearAmount } from 'near-api-js/lib/utils/format'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { ceramic } from '../../utils/ceramic'

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
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function EditOpportunityProposalForm(props) {

  const { state, dispatch, update } = useContext(appStore)
  
  const {
    isUpdated,
    daoFactory,
    didRegistryContract,
    appIdx,
    nearPrice,
    curDaoIdx
  } = state


  const {
      handleEditOpportunityProposalDetailsClickState,
      proposer,
      opportunityId,
      contractId
  } = props

    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)
    //const [isUpdated, setIsUpdated] = useState(false)

    // Persona Fields
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [deadline, setDeadline] = useState('')

    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    // Opportunity Proposal Fields
    const [title, setTitle] = useState('')
    const [details, setDetails] = useState(EditorState.createEmpty())
    const [reward, setReward] = useState('')
    const [budget, setBudget] = useState(0)
    const [category, setCategory] = useState('')
    const [projectName, setProjectName] = useState('')
    const [usd, setUsd] = useState()
    const [status, setStatus] = useState(false)
    const [permission, setPermission] = useState('')
    const [familiarity, setFamiliarity] = useState('0')
    const [submitDate, setSubmitDate] = useState(0)
    const [communitySkills, setCommunitySkills] = useState({})
    const [desiredSkillSet, setDesiredSkillSet] = useState({})
    const [desiredDeveloperSkillSet, setDesiredDeveloperSkillSet] = useState({})
    
    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()

    const {
      fields: opportunitySkillsFields,
      append: opportunitySkillsAppend,
      remove: opportunitySkillsRemove} = useFieldArray({
     name: "opportunitySkills",
     control
    })

    const opportunitySkills = watch('opportunitySkills', opportunitySkillsFields)
    
    const classes = useStyles()

    useEffect(() => {
      if(nearPrice){
        if(usd > 0 && nearPrice > 0){
          let near = (usd / nearPrice).toFixed(3)
          let parse = parseNearAmount(near)
          let formatNear = formatNearAmount(parse, 3)
          setReward(formatNear)
        }
      }
    }, [usd, nearPrice]
    )
    
    useEffect(() => {
        async function fetchData() {
          if(isUpdated){}
          
          setLoaded(false)
           
            // Get Existing Community Skills
            if(curDaoIdx){
              let daoProfileResult = await curDaoIdx.get('daoProfile', curDaoIdx.id)
              console.log('daoProfileresult', daoProfileResult)
              let currentSkills = {...desiredSkillSet}
              let currentSpecificSkills = {...desiredDeveloperSkillSet}
              if(daoProfileResult){
                const skillsResult = daoProfileResult.skills.map((name, value) => {
                  currentSkills = ({...currentSkills, [name.name]: false})
                })
                const specificSkillsResult = daoProfileResult.specificSkills.map((name, value) => {
                  currentSpecificSkills = ({...currentSpecificSkills, [name.name]: false})
                })
                console.log('currentSkills', currentSkills)
                console.log('currentspecificskills', currentSpecificSkills)
              setDesiredSkillSet(currentSkills)
              setDesiredDeveloperSkillSet(currentSpecificSkills)
              }
            }

           // Set Existing Proposal Data       
           if(appIdx){
              let daoDid = await ceramic.getDid(contractId, daoFactory, didRegistryContract)
              console.log('opp daoDid', daoDid)
              let propResult = await appIdx.get('opportunities', daoDid)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.opportunities.length){
                  if(propResult.opportunities[i].opportunityId == opportunityId.toString()){
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
                    propResult.opportunities[i].submitDate ? setSubmitDate(propResult.opportunities[i].submitDate) : setSubmitDate(0)
                    propResult.opportunities[i].familiarity ? setFamiliarity(propResult.opportunities[i].familiarity) : setFamiliarity('0')
                    propResult.opportunities[i].opportunitySkills ? setValue('opportunitySkills', propResult.opportunities[i].opportunitySkills) : setValue('opportunitySkills', {'name': ''})
                    propResult.opportunities[i].budget ? setBudget(propResult.opportunities[i].budget) : setBudget(0)
                    propResult.opportunities[i].usd ? setUsd(propResult.opportunities[i].usd) : setUsd(0)
                    Object.keys(propResult.opportunities[i].desiredSkillSet).length > 0 ? setDesiredSkillSet(propResult.opportunities[i].desiredSkillSet): null
                    Object.keys(propResult.opportunities[i].desiredDeveloperSkillSet).length > 0 ? setDesiredDeveloperSkillSet(propResult.opportunities[i].desiredDeveloperSkillSet): null
                    propResult.opportunities[i].likes ? setCurrentLikes(propResult.opportunities[i].likes) : setCurrentLikes([])
                    propResult.opportunities[i].dislikes ? setCurrentDisLikes(propResult.opportunities[i].dislikes) : setCurrentDisLikes([])
                    propResult.opportunities[i].neutrals ? setCurrentNeutrals(propResult.opportunities[i].neutrals) : setCurrentNeutrals([])
                    
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
    },[appIdx, isUpdated])

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

    const handleProjectNameChange = (event) => {
      let value = event.target.value
      setProjectName(value)
    }

    const handleDeadlineChange = (event) => {
      let value = event.target.value.toString();
      setDeadline(value)
    }

    const handleBudgetChange = (event) => {
      let value = event.target.value;
      setBudget(value)
    }

    const handleUsdChange = (event) => {
      let value = event.target.value;
      setUsd(value)
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
   
      event.preventDefault()
      setFinished(false)

      let now = new Date().getTime()
      let formattedDate = formatDate(now)
  
      // Load existing array of details
      let detailRecords = await curDaoIdx.get('opportunities', curDaoIdx.id)
      console.log('detailRecords', detailRecords)
      
      if(!detailRecords){
        detailRecords = { opportunities: [] }
      }
      
      let proposalRecord = {
          opportunityId: opportunityId.toString(),
          title: title,
          contractId: contractId,
          details: draftToHtml(convertToRaw(details.getCurrentContent())),
          proposer: proposer,
          submitDate: submitDate,
          updatedDate: now,
          reward: reward,
          category: category,
          projectName: projectName,
          deadline: deadline, 
          budget: parseFloat(budget),
          usd: parseFloat(usd),
          status: status,
          permission: permission,
          familiarity: familiarity,
          desiredSkillSet: desiredSkillSet,
          desiredDeveloperSkillSet: desiredDeveloperSkillSet,
          opportunitySkills: opportunitySkills,
          likes: currentLikes,
          dislikes: currentDisLikes,
          neutrals: currentNeutrals
      }

      console.log('proposalrecord', proposalRecord)

      // Update existing records
      let exists
      let i = 0
      while (i < detailRecords.opportunities.length){
        if(detailRecords.opportunities[i].opportunityId == opportunityId.toString()){
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
        await curDaoIdx.set('opportunities', detailRecords)
      }

      setFinished(true)
      update('', { isUpdated: !isUpdated })
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
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{marginBottom: '10px'}}>
                    <TextField
                      autoFocus
                      fullWidth
                      margin="dense"
                      id="opportunity-projectName"
                      variant="outlined"
                      name="projectName"
                      label="Project Name"
                      placeholder="Project X"
                      value={projectName}
                      onChange={handleProjectNameChange}
                      inputRef={register({
                          required: false                              
                      })}
                    />
                  </Grid>
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
                        helperText={`${title.length}/40`}
                        value={title}
                        onChange={handleTitleChange}
                        inputRef={register({
                            required: true,
                            maxLength: 40                             
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
                        id="usd"
                        variant="outlined"
                        required={true}
                        name="USD"
                        label="Opportunity Valuation"
                        placeholder="10"
                        value={usd}
                        onChange={handleUsdChange}
                        inputRef={register({
                            required: true, 
                        })}
                        InputProps={{
                          endAdornment: <><InputAdornment position="end">USD</InputAdornment>
                          <Tooltip TransitionComponent={Zoom} title="What you will pay for the opportunity to be completed in USD.">
                              <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                          </Tooltip>
                          </>
                        }}
                      />
                      <Typography variant="overline">{reward} Ⓝ</Typography>
                    
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
                          endAdornment: <><InputAdornment position="end">USD</InputAdornment>
                          <Tooltip TransitionComponent={Zoom} title="The budget that is available for the sum of all instances of this opportunity.">
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
                  <Typography variant="h6" style={{marginBottom:'10px', marginTop:'10px'}}>Desired Skills and Competencies</Typography>
                  </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">General Skills Required</FormLabel>
                        <FormGroup>
                        {loaded && desiredSkillSet && Object.keys(desiredSkillSet).length > 0 ?
                            Object.keys(desiredSkillSet).map((key) => {
                             
                              return (
                                <FormControlLabel
                                  control={<Checkbox checked={desiredSkillSet[key]} onChange={handleDesiredSkillSetChange} name={key} />}
                                  label={key}
                                />
                              )
                            })
                        : null }
                        </FormGroup>
                        
                        <FormHelperText>Check off the general skills someone should have.</FormHelperText>
                      </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <FormControl component="fieldset" className={classes.formControl}>
                          <FormLabel component="legend">Specific Skills Required</FormLabel>
                          <FormGroup>
                          {loaded && desiredDeveloperSkillSet && Object.keys(desiredDeveloperSkillSet).length > 0 ?
                            Object.keys(desiredDeveloperSkillSet).map((key) => {
                             
                              return (
                                <FormControlLabel
                                  control={<Checkbox checked={desiredDeveloperSkillSet[key]} onChange={handleDesiredDeveloperSkillSetChange} name={key} />}
                                  label={key}
                                />
                              )
                            })
                        : null }
                         
                          
                          </FormGroup>
                          <FormHelperText>Check off the specific skills someone should have.</FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                        <Typography variant="body1" style={{marginTop: '10px', marginBottom:'10px'}}>Additional Skills</Typography>
                        {
                          opportunitySkillsFields.map((field, index) => {
                          return(
                            
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                            <TextField
                              
                              margin="dense"
                              id={`opportunitySkills[${index}].name`}
                              variant="outlined"
                              name={`opportunitySkills[${index}].name`}
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
                            {errors[`opportunitySkills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                            
                            <Button type="button" onClick={() => opportunitySkillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                              <DeleteForeverIcon />
                            </Button>
                            </Grid>
                            
                          )
                        }) 
                        }
                        {!opportunitySkillsFields || opportunitySkillsFields.length == 0 ?
                          <Typography variant="body1" style={{marginLeft: '5px'}}>No opportunity specific skills defined yet. Add them if there are skills specific to this opportunity needed to complete it.</Typography>
                        : null }
                          <Button
                            type="button"
                            onClick={() => opportunitySkillsAppend({name: ''})}
                            startIcon={<AddBoxIcon />}
                          >
                            Add Skill
                          </Button>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
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
