import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import FileUpload from '../IPFSupload/ipfsUpload'
import { flexClass } from '../../App'
import { IPFS_PROVIDER } from '../../utils/ceramic'

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



// ReactQuill Component
import ReactQuill from 'react-quill';

// CSS Styles
import '../../../node_modules/react-quill/dist/quill.snow.css'
import { CircularProgress, setRef } from '@material-ui/core';

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
 
     // Funding Proposal Fields
     const [title, setTitle] = useState('')
     const [details, setDetails] = useState('')
 

    // Payout Proposal Fields
    const [payoutTitle, setPayoutTitle] = useState('')
    const [refFundingId, setRefFundingId] = useState('')
    const [milestoneId, setMilestoneId] = useState('')
    const [detailsOfCompletion, setDetailsOfCompletion] = useState('')


    const { register, handleSubmit, watch, errors } = useForm()

    const {
        handleUpdate,
        handleEditPayoutProposalDetailsClickState,
        applicant,
        proposer,
        curDaoIdx,
        curPersonaIdx,
        fundingProposalId,
        proposalId,
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

           // Set Existing Payout Proposal Data       
           if(curDaoIdx){
              let propResult = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
                    propResult.proposals[i].title ? setPayoutTitle(propResult.proposals[i].title) : setPayoutTitle('')
                    propResult.proposals[i].milestoneId ? setMilestoneId(propResult.proposals[i].milestoneId) : setMilestoneId('')
                    propResult.proposals[i].referencedFundingProposalId ? setRefFundingId(propResult.proposals[i].referencedFundingProposalId) : setRefFundingId('')
                    propResult.proposals[i].detailsOfCompletion ? setDetailsOfCompletion(propResult.proposals[i].detailsOfCompletion) : setDetailsOfCompletion('')
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

    const handleClose = () => {
        handleEditPayoutProposalDetailsClickState(false)
        setOpen(false)
    }

    const handlePayoutTitleChange = (event) => {
        setPayoutTitle(event.target.value)
    }

    const handleMilestoneIdChange = (event) => {
      setMilestoneId(event.target.value)
    }

    const handleReferencedFundingProposalIdChange = (event) => {
      setRefFundingId(event.target.value)
    }

    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }

    const handleDetailsOfCompletionChange = (content, delta, source, editor) => {
        setDetailsOfCompletion(content)
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
     
      let proposalRecord = {
          proposalId: proposalId.toString(),
          referencedFundingProposalId: refFundingId,
          milestoneId: milestoneId,
          title: payoutTitle,
          detailsOfCompletion: detailsOfCompletion,
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
              <DialogTitle id="form-dialog-title">Payout Proposal Details</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Please provide details of completion of milestone for referenced funded project id:
                  
                  </DialogContentText>
                  
                  <TextField
                      autoFocus
                      margin="dense"
                      id="payout-proposal-title"
                      variant="outlined"
                      name="payoutProposalTitle"
                      label="Payout Proposal Title"
                      placeholder="Payout Request for Milestone # of Commitment #"
                      value={payoutTitle}
                      onChange={handlePayoutTitleChange}
                      inputRef={register({
                          required: true                              
                      })}
                  />
                  {errors.payoutProposalTitle && <p style={{color: 'red'}}>You must provide a payout proposal title.</p>}

                  <TextField
                    autoFocus
                    margin="dense"
                    id="payout-proposal-fundingId"
                    variant="outlined"
                    name="referencedFundingId"
                    label="Referenced Funding Commitment ID"
                    placeholder="enter funding commitment id"
                    value={refFundingId}
                    onChange={handleReferencedFundingProposalIdChange}
                    inputRef={register({
                        required: true                              
                    })}
                  />
                  {errors.referencedFundingId && <p style={{color: 'red'}}>You must provide the funding commitment id.</p>}

                  <TextField
                    autoFocus
                    margin="dense"
                    id="payout-proposal-milestoneId"
                    variant="outlined"
                    name="milestoneId"
                    label="Milestone ID"
                    placeholder="enter milestone Id of funding commitment"
                    value={milestoneId}
                    onChange={handleMilestoneIdChange}
                    inputRef={register({
                        required: true                              
                    })}
                  />
                  {errors.milestoneId && <p style={{color: 'red'}}>You must provide the corresponding milestone Id.</p>}
              
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    name="detailsOfCompletion"
                    value={detailsOfCompletion}
                    onChange={handleDetailsOfCompletionChange}
                    style={{height:'200px', marginBottom:'100px'}}
                    inputRef={register({
                        required: true
                    })}
                  />
                  {errors.detailsOfCompletion && <p style={{color: 'red'}}>You must provide the details showing proof of project completion.</p>}
                   
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
                <Typography variant="h5" align="center">Loading Proposal Data</Typography>
              </Grid>
              </Grid></div></> }
            </Dialog>
           
          </div>
        
        )
}