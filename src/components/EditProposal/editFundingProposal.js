import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { flexClass } from '../../App'
import { IPFS_PROVIDER } from '../../utils/ceramic'
import Persona from '@aluhning/get-personas-js'
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
import { CircularProgress } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import InputAdornment from '@material-ui/core/InputAdornment'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
import Paper from '@material-ui/core/Paper'

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
    const [milestones, setMilestones] = useState([{milestone: '', deadline: '', payout: '', briefDescription:''}])

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        handleUpdate,
        handleEditFundingProposalDetailsClickState,
        applicant,
        proposer,
        curDaoIdx,
        proposalId,
    } = props
    
    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)
           
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
           if(curDaoIdx){
              let propResult = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
                    propResult.proposals[i].title ? setTitle(propResult.proposals[i].title) : setTitle('')
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
                    break
                  }
                  i++
                }
              }
           }
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

    const handleMilestonesChange = (i, e) => {
      let newMilestone = [...mileStones]
      newMilestone[i][e.target.milestone] = e.target.value
      setMilestones(newMilestone)
    }

    const addMilestoneFields = () => {
      setMilestones([...milestones, {milestoneId: '', milestone: '', deadline: '', payout: '', briefDescription:''}])
    }

    const removeMilestoneFields = (i) => {
      let newMilestones = [...milestones]
      newMilestones.splice(i, 1)
      setMilestones(newMilestones)
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
      console.log('funding detailRecords', detailRecords)
      if(!detailRecords){
        detailRecords = { proposals: [] }
      }

      let proposalRecord = {
          proposalId: proposalId.toString(),
          title: title,
          details: draftToHtml(convertToRaw(details.getCurrentContent())),
          proposer: proposer,
          submitDate: now,
          published: true
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
        console.log('detailrecords.proposals', detailRecords.proposals)
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
            { loaded ? (<>
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
                  {errors.fundingProposalTitle && <p style={{color: 'red'}}>You must give your proposal a title.</p>}
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
                  {milestones.map((element, index) => (
                      <>
                      <Grid key={index} container justifyContent="center" alignItems="center" spacing={1}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <TextField
                          margin="dense"
                          id="milestone-id"
                          variant="outlined"
                          name="milestoneId"
                          label="MilestoneId:"
                          placeholder={index}
                          value={index}
                          onChange={e => handleMilestonesChange(index, e)}
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
                          id="milestone-title"
                          variant="outlined"
                          name="milestone"
                          label="Milestone:"
                          placeholder="Milestone 1"
                          value={element.milestone || ""}
                          onChange={e => handleMilestonesChange(index, e)}
                          InputProps={{
                            endAdornment: <>
                            <Tooltip TransitionComponent={Zoom} title="Short title of this milestone.">
                                <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                            </Tooltip>
                            </>
                          }}
                          inputRef={register({
                              required: false                              
                          })}
                        />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <TextField
                          autoFocus
                          margin="dense"
                          id="milestone-deadline"
                          type = "date"
                          name="deadline"
                          label="Deadline:"
                          value={element.deadline || ""}
                          onChange={e => handleMilestonesChange(index, e)}
                          InputLabelProps={{shrink: true,}}
                          InputProps={{
                            endAdornment: <>
                            <Tooltip TransitionComponent={Zoom} title="Proposed deadline for completion of this milestone.">
                                <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                            </Tooltip>
                            </>
                          }}
                          inputRef={register({
                              required: false                              
                          })}
                        />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <TextField
                          margin="dense"
                          id="payout-requested"
                          variant="outlined"
                          name="payout"
                          label="Payout Requested"
                          placeholder="10"
                          value={element.payout || ""}
                          onChange={e => handleMilestonesChange(index, e)}
                          inputRef={register({
                              required: false, 
                          })}
                          InputProps={{
                            endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                            <Tooltip TransitionComponent={Zoom} title="Payout proposed in NEAR that will be paid out for completion of this milestone">
                                <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                            </Tooltip>
                            </>
                          }}
                        />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <TextField
                          autoFocus
                          fullWidth
                          margin="dense"
                          id="milestone-description"
                          variant="outlined"
                          name="briefDescription"
                          label="Brief Description:"
                          placeholder="Finish ...."
                          value={element.briefDescription || ""}
                          onChange={e => handleMilestonesChange(index, e)}
                          InputProps={{
                            endAdornment: <>
                            <Tooltip TransitionComponent={Zoom} title="Short description of what will be finished by completing this milestone.">
                                <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                            </Tooltip>
                            </>
                          }}
                          inputRef={register({
                              required: false                              
                          })}
                        />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        {
                        index ? 
                          <Button className="button remove" onClick={() => removeMilestoneFields(index)}>Remove Milestone</Button> 
                        : null
                        }
                        </Grid>
                      </Grid>
                        <hr></hr>
                        </>
                  ))}
                  <div>
                    <Button className="button add" type="button" onClick={() => addMilestoneFields()}>Add Milestone</Button>
                  </div>
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