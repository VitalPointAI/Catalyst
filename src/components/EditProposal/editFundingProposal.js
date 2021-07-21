import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { flexClass } from '../../App'
import { IPFS_PROVIDER } from '../../utils/ceramic'
import Persona from '@aluhning/get-personas-js'

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
    const [details, setDetails] = useState('')

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
                    propResult.proposals[i].details ? setDetails(propResult.proposals[i].details) : setDetails('')
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
    },[curDaoIdx])

    function handleFileHash(hash) {
      setAvatar(IPFS_PROVIDER + hash)
    }

    const handleClose = () => {
        handleEditFundingProposalDetailsClickState(false)
        setOpen(false)
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

    const handleDetailsChange = (content, delta, source, editor) => {
        setDetails(content)
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
          details: details,
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
              
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    name="details"
                    value={details}
                    onChange={handleDetailsChange}
                    style={{height:'200px', marginBottom:'100px'}}
                    inputRef={register({
                        required: false
                    })}
                  />
                   
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