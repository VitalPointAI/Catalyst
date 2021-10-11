import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { flexClass } from '../../App'
import { contractName, IPFS_PROVIDER } from '../../utils/ceramic'
import Persona from '@aluhning/get-personas-js'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { formatNearAmount, parseNearAmount } from 'near-api-js/lib/utils/format';

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
import { CircularProgress } from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
import Paper from '@material-ui/core/Paper'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import AddBoxIcon from '@material-ui/icons/AddBox'

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

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function EditFundingProposalForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)

    // Persona Fields
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')

    // Funding Proposal Fields
    const [title, setTitle] = useState('')
    const [details, setDetails] = useState(EditorState.createEmpty())
    const [milestones, setMilestones] = useState([{milestoneId: ''}])
    const [requested, setRequested] = useState()
    
    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])
    const [left, setLeft] = useState()
    const [planned, setPlanned] = useState(0)
    const [disabled, setDisabled] = useState(true)
    const [addDisabled, setAddDisabled] = useState(true)
    const [errorM, setErrorM] = useState(false)
    const [message, setMessage] = useState(false)
    const [max, setMax] = useState(props.funding)
    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
    const {
      fields: milestoneFields,
      append: milestoneAppend,
      remove: milestoneRemove} = useFieldArray({
     name: "projectMilestones",
     control
    })

    const projectMilestones = watch('projectMilestones', milestoneFields)
  
    const {
        handleUpdate,
        handleEditFundingProposalDetailsClickState,
        applicant,
        proposer,
        curDaoIdx,
        proposalId,
        contract,
        funding, 
        referenceIds
    } = props
    
    const classes = useStyles()

    useEffect(() => {
      updatePlanned()
    }, [milestoneFields]
    )

    useEffect(() => {
        async function fetchData() {
           
            // Set Existing Persona Data      
            if(applicant){
              const thisPersona = new Persona()
              let result = await thisPersona.getPersona(applicant)
                  if(result){
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                    result.name ? setName(result.name) : setName('')
                    result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                    result.date ? setDate(result.date) : setDate('')
                  }
           }

           // Set Existing Proposal Data
           let thisLeft      
           if(curDaoIdx && contract ){
            
              let propResult = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
           
              
              if(propResult) {
                let i = 0
               
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
                    propResult.proposals[i].title ? setTitle(propResult.proposals[i].title) : setTitle('')
                    propResult.proposals[i].milestones ? setValue('projectMilestones', propResult.proposals[i].milestones): setValue('projectMilestones', {title: '', deadline: '', payout: '0', briefDescription: ''})
                    if (propResult.proposals[i].details){
                      let contentBlock = htmlToDraft(propResult.proposals[i].details)
                      if (contentBlock){
                        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
                        const editorState = EditorState.createWithContent(contentState)
                        setDetails(editorState)
                      }
                      } else {
                        setDetails(EditorState.createEmpty())
                      }
                      propResult.proposals[i].likes ? setCurrentLikes(propResult.proposals[i].likes) : setCurrentLikes([])
                      propResult.proposals[i].dislikes ? setCurrentDisLikes(propResult.proposals[i].dislikes) : setCurrentDisLikes([])
                      propResult.proposals[i].neutrals ? setCurrentNeutrals(propResult.proposals[i].neutrals) : setCurrentNeutrals([])
                      
                    
                    break
                  } else {
                    // set title to opportunity title if it exists
                    if(referenceIds){
                      for(const [key, value] of Object.entries(referenceIds)){
                      
                        if(value['valueSetting']!=''){
                          try{
                            let oppResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
                         
                            let k = 0
                            while(k < oppResult.opportunities.length){
                              if(oppResult.opportunities[k].opportunityId == value['valueSetting']){
                                setTitle(oppResult.opportunities[k].title)
                                if (oppResult.opportunities[k].details){
                                  let contentBlock = htmlToDraft(oppResult.opportunities[k].details)
                                  if (contentBlock){
                                    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
                                    const editorState = EditorState.createWithContent(contentState)
                                    setDetails(editorState)
                                  }
                                  } else {
                                    setDetails(EditorState.createEmpty())
                                  }
                                break
                              }
                              k++
                            }
                          } catch (err) {
                            console.log('error retrieving opportunities', err)
                          }
                        }
                      }
                    }
                  }
                  i++
                }
              }
           } 
          
           
            setLeft(funding)
            setRequested(funding)
            
        }
       
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
    },[])

    function handleFileHash(hash) {
      setAvatar(IPFS_PROVIDER + hash)
    }

    const handleClose = () => {
        handleEditFundingProposalDetailsClickState(false)
        setOpen(false)
    }

    const updatePlanned = async () => {
      let totalPlanned = 0
      let i = 0
      let whatsLeft
      while(i < milestoneFields.length){
        totalPlanned = parseFloat(totalPlanned) + parseFloat(milestoneFields[i].payout)
        i++
      }

      setPlanned(totalPlanned)
      whatsLeft = parseFloat(funding) - parseFloat(parseNearAmount(totalPlanned.toString()))  
      setLeft(whatsLeft.toLocaleString('fullwide', {useGrouping: false}))
      if(whatsLeft != 0) {
        setAddDisabled(false)
        setDisabled(true)
      } else {
        if(whatsLeft == 0) {
          setAddDisabled(true)
          setDisabled(false)
        }
      }
    }


    const handleTitleChange = (event) => {
        let value = event.target.value;
        setTitle(value)
    }

    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
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
      let detailRecords = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
     
      if(!detailRecords){
        detailRecords = { proposals: [] }
      }

      let proposalRecord = {
          proposalId: proposalId.toString(),
          title: title,
          details: draftToHtml(convertToRaw(details.getCurrentContent())),
          proposer: proposer,
          submitDate: now,
          milestones: milestoneFields,
          published: true,
          likes: currentLikes,
          dislikes: currentDisLikes,
          neutrals: currentNeutrals
      }

      // Update existing records
      let exists
      let i = 0
      while (i < detailRecords.proposals.length){
        if(detailRecords.proposals[i].proposalId == proposalId){
          detailRecords.proposals[i] = proposalRecord
          await curDaoIdx.set('fundingProposalDetails', detailRecords)
          exists = true
          break
        }
        i++
      }

      // Add record if it doesn't exist
      if(!exists){
        detailRecords.proposals.push(proposalRecord)
      
        await curDaoIdx.set('fundingProposalDetails', detailRecords)
      }
     
      setFinished(true)
      handleUpdate(true)
      setOpen(false)
      handleClose()
    }

        return (
           
            <div>
       
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<div>
              <DialogTitle id="form-dialog-title">Funding Commitment Proposal Details</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Please describe the project:
                  
                  </DialogContentText>
                  
                  <TextField
                      autoFocus
                      margin="dense"
                      id="funding-proposal-title"
                      variant="outlined"
                      name="fundingProposalTitle"
                      label="Proposal Title"
                      placeholder="My Awesome Proposal"
                      value={title}
                      onChange={handleTitleChange}
                      inputRef={register({
                        required: true                             
                      })}
                  />
                  {errors.fundingProposalTitle && <p style={{color: 'red', fontSize:'80%'}}>You must give your proposal a title.</p>}
        
              
                      <Typography variant="h6" style={{marginTop: '30px'}}>Proposal Details</Typography>
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
                  <Typography variant="h6" style={{marginTop: '30px'}}>Milestones</Typography>
                  <Paper style={{padding: '5px'}}>
                  <Typography variant="body1">The total amount of all milestones must equal the amount requested ({formatNearAmount(requested, 3)} Ⓝ).</Typography>
                  <Typography variant="h6" align="center"> {planned ? parseFloat(formatNearAmount(requested, 3)) - planned : formatNearAmount(requested, 3)} Ⓝ left to plan.</Typography>
                  <Divider variant="middle" /> 
                    <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                        {
                          milestoneFields.map((field, index) => {
                           
                          return(
                            <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1} key={field.id}>
                              
                              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                  fullWidth
                                  margin="dense"
                                  id={`projectMilestones[${index}].title`}
                                  variant="outlined"
                                  name={`projectMilestones[${index}].title`}
                                  label="Milestone Name"
                                  placeholder="Milestone"
                                  defaultValue={field.title}
                                  InputProps={{
                                    endAdornment: <div>
                                    <Tooltip TransitionComponent={Zoom} title="Short title of this milestone.">
                                        <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                    </Tooltip>
                                    </div>
                                  }}
                                  inputRef={register({
                                    required: false                            
                                  })}
                                />
                            
                              </Grid>
                              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                  fullWidth
                                  margin="dense"
                                  type="date"
                                  id={`projectMilestones[${index}].deadline`}
                                  variant="outlined"
                                  name={`projectMilestones[${index}].deadline`}
                                  defaultValue={formatDate(Date.now())}
                                  InputProps={{
                                    endAdornment: <div>
                                    <Tooltip TransitionComponent={Zoom} title="Proposed deadline for completion of this milestone.">
                                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                    </Tooltip>
                                    </div>
                                  }}
                                  inputRef={register({
                                    required: false                             
                                  })}
                                />
                              
                              </Grid>
                              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                  fullWidth
                                  margin="dense"
                                  type="number"
                                  id={`projectMilestones[${index}].payout`}
                                  variant="outlined"
                                  name={`projectMilestones[${index}].payout`}
                                  label="Proposed Payout"
                                  defaultValue={field.payout}
                                  InputProps={{
                                    endAdornment: <div><InputAdornment position="end">Ⓝ</InputAdornment>
                                      <Tooltip TransitionComponent={Zoom} title="Payout proposed in NEAR that will be paid out for completion of this milestone">
                                          <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                      </Tooltip>
                                      </div>
                                  }}
                                  inputRef={register({
                                    required: false                             
                                  })}
                                />
                             
                              </Grid>
                              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                fullWidth
                                margin="dense"
                                id={`projectMilestones[${index}].briefDescription`}
                                variant="outlined"
                                name={`projectMilestones[${index}].briefDescription`}
                                label="Brief Description"
                                defaultValue={field.briefDescription}
                                InputProps={{
                                  endAdornment: <div>
                                    <Tooltip TransitionComponent={Zoom} title="Short description of what will be finished by completing this milestone.">
                                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                    </Tooltip>
                                    </div>
                                }}
                                inputRef={register({
                                  required: false                          
                                })}
                              />
                              </Grid>
                              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                              <Button type="button" onClick={() => {
                                milestoneRemove(index) 
                              }}
                              style={{float: 'right', marginLeft:'10px'}}>
                                <DeleteForeverIcon />
                              </Button>
                            </Grid>
                            </Grid>
                          )
                        }) 
                        }
                        {!milestoneFields || milestoneFields.length == 0 ?
                          <Typography variant="body1" style={{marginLeft: '5px'}}>No project milestones defined yet. Add them to help stay on track and schedule payouts for your proposal.
                          </Typography>
                        : null }
                        <Divider variant="middle" />
                          <Button
                            type="button"
                            onClick={() => {
                              milestoneAppend({title: '', deadline: '', payout: '0', briefDescription: ''})
                            
                              }
                           } startIcon={<AddBoxIcon />}
                          >
                            Add Milestone
                          </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </DialogContent>
               
              {!finished ? <LinearProgress className={classes.progress} style={{marginBottom: '25px' }}/> : (
              <DialogActions>
              <Button onClick={handleSubmit(onSubmit)} disabled={disabled} color="primary" type="submit" >
                Submit Details
              </Button>
              
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
              </DialogActions>)}
              
              
              </div>) : <div className={classes.waiting}><div class={flexClass}><CircularProgress/></div><Grid container spacing={1} alignItems="center" justifyContent="center" >
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h5" align="center">Loading Proposal Data</Typography>
              </Grid>
              </Grid></div> }
            </Dialog>
           
          </div>
        
        )
}