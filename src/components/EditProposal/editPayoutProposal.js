import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { flexClass } from '../../App'
import { IPFS_PROVIDER } from '../../utils/ceramic'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import Persona from '@aluhning/get-personas-js'
import MilestoneCard from '../MilestoneCard/MilestoneCard'

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

export default function EditPayoutProposalForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)

     // Persona Fields
     const [date, setDate] = useState('')
     const [name, setName] = useState('')
     const [avatar, setAvatar] = useState(imageName)
     const [shortBio, setShortBio] = useState('') 

   
    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    // Payout Proposal Fields
    const [title, setTitle] = useState('')
    const [refFundingId, setRefFundingId] = useState('')
    const [milestones, setMilestones] = useState([{}])
    const [details, setDetails] = useState(EditorState.createEmpty())

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        handleUpdate,
        handleEditPayoutProposalDetailsClickState,
        applicant,
        proposer,
        curDaoIdx,
        proposalId,
        contract,
        funding, 
        referenceIds,
        proposalStatus,
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

            // Set Existing Payout Proposal Data  
           if(curDaoIdx && contract && proposalId){
            console.log('here pp')
            let propResult = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
            console.log('pp here propResult', propResult)
            
            if(propResult) {
             
              let i = 0
              console.log('propresult', propResult)
              while (i < propResult.proposals.length){
                if(propResult.proposals[i].proposalId == proposalId){
                  propResult.proposals[i].title ? setTitle(propResult.proposals[i].title) : setTitle('')
                  propResult.proposals[i].milestones ? setMilestones(propResult.proposals[i].milestones) : setMilestones([{milestoneId: ''}])
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
                }
              i++
              }
            }
            
            // set title to funding commitment title if it exists
            if(referenceIds){
              let oppResult = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
              console.log('oppresult', oppResult)
              let proposal
              let interimMilestones = []
              let milestone
              let thisMilestoneId
              let t = 0
              while (t < referenceIds.length){
                  if(referenceIds[t].keyName == 'proposal'){
                    let k = 0
                    while(k < oppResult.proposals.length){
                      if(oppResult.proposals[k].proposalId == referenceIds[t].valueSetting){
                        interimMilestones = oppResult.proposals[k].milestones        
                        proposal = true                          
                        break
                      }
                    k++
                    }
                  
                  if(proposal){
                    let newT = 0
                    while(newT < referenceIds.length){
                      if(referenceIds[newT].keyName =='milestone'){                      
                        let m = 0
                        while(m < interimMilestones.length){
                            if(interimMilestones[m].milestoneId == referenceIds[newT].valueSetting){
                            setTitle(interimMilestones[m]['milestone'+m])
                            let newMilestone = []
                            newMilestone.push(interimMilestones[m])
                            console.log('newmilestone', newMilestone)
                            setMilestones(newMilestone)
                            milestone = true                      
                            break
                          }
                        }
                        m++
                      }
                      newT++
                    }
                  }
                }

                if(proposal && milestone){
                  break
                }
              t++
              }
            }
          }
        }
       
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
    },[])


    const handleClose = () => {
        handleEditPayoutProposalDetailsClickState(false)
        setOpen(false)
    }

    const handleTitleChange = (event) => {
        setTitle(event.target.value)
    }

    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }

    const handleDetailsChange = (editorState) => {
      setDetails(editorState)
    }

    let Milestones
    if(milestones && milestones.length > 0){
      console.log('milestones', milestones)
      Milestones = milestones.map((element, index) => {
        console.log('element', element)
        return (
          <MilestoneCard 
            key={element.milestoneId}
            id={element.milestoneId}
            name={element[`milestone${element.milestoneId}`]}
            deadline={element[`deadline${element.milestoneId}`]}
            payout={element[`payout${element.milestoneId}`]}
            description={element[`briefDescription${element.milestoneId}`]}
            proposalId={proposalId}
            proposalStatus={proposalStatus}
            applicant={applicant}
          />
        )
      })
    }

    const onSubmit = async (values) => {
      event.preventDefault()
      setFinished(false)

      let now = new Date().getTime()
      let formattedDate = formatDate(now)
  
      // Load existing array of details
      let detailRecords = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
      console.log('funding detailRecords', detailRecords)
      if(!detailRecords){
        detailRecords = { proposals: [] }
      }
      let references = []
      if(referenceIds){
        references = referenceIds
      }
     
      let proposalRecord = {
          proposalId: proposalId.toString(),
          milestone: milestones,
          title: title,
          details: draftToHtml(convertToRaw(details.getCurrentContent())),
          proposer: proposer,
          submitDate: now,
          published: true,
          referenceIds: references,
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
          await curDaoIdx.set('payoutProposalDetails', detailRecords)
          exists = true
          break
        }
        i++
      }

      // Add record if it doesn't exist
      if(!exists){
        detailRecords.proposals.push(proposalRecord)
        console.log('detailrecords.proposals', detailRecords.proposals)
        await curDaoIdx.set('payoutProposalDetails', detailRecords)
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
              <DialogTitle id="form-dialog-title">Payout Proposal Details</DialogTitle>
              <DialogContent>
                 
                  {milestones && milestones.length > 0 ? Milestones : null}
                  
                  {title == '' ? (
                  <TextField
                      autoFocus
                      margin="dense"
                      id="payout-proposal-title"
                      variant="outlined"
                      name="payoutProposalTitle"
                      label="Payout Proposal Title"
                      placeholder="Payout Request for Milestone # of Commitment #"
                      value={title}
                      onChange={handleTitleChange}
                      inputRef={register({
                          required: true                              
                      })}
                  />
                  ) : null }
                  {errors.payoutProposalTitle && <p style={{color: 'red'}}>You must provide a payout proposal title.</p>}
                 
                  <Typography variant="h6">Please provide proof of work completion:</Typography>
                  <Paper style={{padding: '5px'}}>
                  <Editor
                    name="details"
                    editorState={details}
                    toolbarClassName="toolbarClassName"
                    wrapperClassName="wrapperClassName"
                    editorClassName="editorClassName"
                    onEditorStateChange={handleDetailsChange}
                    editorStyle={{minHeight:'200px'}}
                  />
                  </Paper>
                  {errors.details && <p style={{color: 'red'}}>You must provide the details showing proof of project completion.</p>}
                   
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