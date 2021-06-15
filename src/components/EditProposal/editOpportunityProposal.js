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
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import InputAdornment from '@material-ui/core/InputAdornment'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'


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

export default function EditOpportunityProposalForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)

    // Persona Fields
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')

    // Opportunity Proposal Fields
    const [title, setTitle] = useState('')
    const [details, setDetails] = useState('')
    const [reward, setReward] = useState('')
    const [category, setCategory] = useState('')
    const [projectName, setProjectName] = useState('')
    const [status, setStatus] = useState('')
    const [permission, setPermission] = useState('')

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        handleUpdate,
        handleEditOpportunityProposalDetailsClickState,
        applicant,
        proposer,
        curDaoIdx,
        curPersonaIdx,
        opportunityId,
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
                    propResult.opportunities[i].details ? setDetails(propResult.opportunities[i].details) : setDetails('')
                    propResult.opportunities[i].reward ? setReward(propResult.opportunities[i].reward) : setReward('')
                    propResult.opportunities[i].category ? setCategory(propResult.opportunities[i].category) : setCategory('')
                    propResult.opportunities[i].projectName ? setProjectName(propResult.opportunities[i].projectName) : setProjectName('')
                    propResult.opportunities[i].status ? setStatus(propResult.opportunities[i].status) : setStatus('')
                    propResult.opportunities[i].permission ? setPermission(propResult.opportunities[i].permission) : setPermission('')
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
   
    const handleRewardChange = (event) => {
      let value = event.target.value;
      setReward(value)
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

    const handleDetailsChange = (content, delta, source, editor) => {
        setDetails(content)
    }

    const onSubmit = async (values) => {
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
          details: details,
          proposer: proposer,
          submitDate: now,
          reward: reward,
          category: category,
          projectName: projectName,
          status: status,
          permission: permission
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
              <DialogTitle id="form-dialog-title">Opportunity Proposal Details</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Please describe the opportunity requirements:
                  
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

                  <Grid container justify="center" alignItems="center" spacing={1}>
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <TextField
                      fullWidth
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
                      style={{marginBottom: '10px'}}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="opportunity-category"
                      variant="outlined"
                      name="opportunityCategory"
                      label="Category"
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
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <FormControlLabel
                    control={<Switch checked={status} onChange={handleStatusChange} name="status" color="primary"/>}
                    label="Active"
                  />
                  </Grid>
                  </Grid>

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

                   {console.log('status', status)}
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