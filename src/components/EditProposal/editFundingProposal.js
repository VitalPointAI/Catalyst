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
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
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
    const [requested, setRequested] = useState(props.funding)
    
    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])
    const [left, setLeft] = useState(props.funding)
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
    console.log('milestonefields', milestoneFields)
    const classes = useStyles()
console.log('props funding', funding)
console.log('props requested', requested)
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
            console.log('edit propresult', propResult)
              
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
                  } else {
                    // set title to opportunity title if it exists
                    if(referenceIds){
                      for(const [key, value] of Object.entries(referenceIds)){
                        console.log('opp value', value)
                        if(value['valueSetting']!=''){
                          try{
                            let oppResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
                            console.log('oppresult', oppResult)
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

                // let j = 0
                // let totalProgrammed = 0
               
                // while(j < milestones.length){
                //   console.log('xy milestones', milestones)
                
                //     if(isNaN(milestones[j][`payout${j}`])){
                //       totalProgrammed = 0
                //     }
            
                //     if(!isNaN(milestones[j][`payout${j}`])){
                //       totalProgrammed = parseFloat(totalProgrammed.toString()) + parseFloat(milestones[i][`payout${i}`])
                //       console.log('xy totalprogrammed notnan', totalProgrammed)
                    
                //     }
            
                //     setPlanned(parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false}))))
                //     thisLeft = parseFloat(requested.toLocaleString('fullwide', {useGrouping: false})) - parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false})))
                //     console.log('xy this left not nan', thisLeft.toLocaleString('fullwide', {useGrouping: false}))
                //     setLeft(thisLeft.toLocaleString('fullwide', {useGrouping: false}))
                  
                //   j++
                // }
              }
           }
           updatePlanned()
            if(thisLeft == 0){
            setDisabled(false)
            } else {
              setDisabled(true)
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

    const updatePlanned = () => {
      let totalPlanned = 0
      let i = 0
      let whatsLeft
      setLeft(formatNearAmount(requested, 3))
      while(i < milestoneFields.length){
        console.log('payout', parseFloat(milestoneFields[i].payout))
        totalPlanned = totalPlanned + parseFloat(milestoneFields[i].payout)
        console.log('totalplanned', totalPlanned)
        console.log('requested h', parseFloat(formatNearAmount(requested).toLocaleString('fullwide', {useGrouping: false})) )
        whatsLeft = parseFloat(formatNearAmount(requested).toLocaleString('fullwide', {useGrouping: false})) - totalPlanned
        console.log('whatsleft', whatsLeft)
        i++
      }
      setPlanned(totalPlanned)
      setLeft(formatNearAmount(parseNearAmount(whatsLeft.toString())), 3)
      if(whatsLeft != 0) {
        setDisabled(false)
      }
    }

// console.log('current likes', currentLikes)
//     const handleMilestonesChange = (i, e) => {
//       console.log('zi', i)
//       console.log('ze', e)
//       let newMilestone = [...milestones]
//       console.log('zi new milestones', newMilestone)
//       newMilestone[i]['milestoneId'] = i
//       // if(e.target.name == [`payout${i}`]){
//       //   newMilestone[i][e.target.name] = parseFloat(e.target.value)
//       // } else {
//          newMilestone[i][e.target.name] = e.target.value
//       // }
//       console.log('newmilestonet', newMilestone[i])
//       setMilestones(newMilestone)
   
//       setAddDisabled(true)
//       setDisabled(true)
//       let thisLeft
//       if(milestones.length == 1)  {
//         thisLeft = parseFloat(requested)
//         setMax(thisLeft)
//       } else {
//         thisLeft = left
//         setMax(thisLeft)
//       }

//       if(newMilestone[i][`payout${i}`] && newMilestone[i][`milestone${i}`] && newMilestone[i][`deadline${i}`] && newMilestone[i][`briefDescription${i}`]){
//         if(
//           newMilestone[i][`payout${i}`] != 0 &&
//           newMilestone[i][`milestone${i}`]!='' &&
//           newMilestone[i][`deadline${i}`]!='' &&
//           newMilestone[i][`briefDescription${i}`]!='' &&
//           (parseFloat(parseNearAmount(newMilestone[i][`payout${i}`].toLocaleString('fullwide', {useGrouping: false}))) < requested ||
//           parseFloat(parseNearAmount(newMilestone[i][`payout${i}`].toLocaleString('fullwide', {useGrouping: false}))) < thisLeft ||
//           thisLeft != 0)
//         ) {
//           setAddDisabled(false)
//         }
//       }

//       if(!newMilestone[i]){
//         setAddDisabled(true)
//       }
       
//     }


    // const addMilestoneFields = () => {
     
    //   setAddDisabled(true)
    //   let i = 0
    //   let totalProgrammed = 0
    //   let thisLeft
    //   while(i < milestones.length){
    //     console.log('xy milestones', milestones)
       
    //       if(isNaN(milestones[i][`payout${i}`])){
    //         totalProgrammed = 0
    //       }

    //       if(!isNaN(milestones[i][`payout${i}`])){
    //         totalProgrammed = parseFloat(totalProgrammed.toString()) + parseFloat(milestones[i][`payout${i}`])
    //         console.log('xy totalprogrammed notnan', totalProgrammed)
          
    //       }

    //       setPlanned(parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false}))))
    //       thisLeft = parseFloat(requested.toLocaleString('fullwide', {useGrouping: false})) - parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false})))
    //       console.log('xy add this left not nan', thisLeft.toLocaleString('fullwide', {useGrouping: false}))
    //       setLeft(thisLeft.toLocaleString('fullwide', {useGrouping: false}))

    //       if(parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false}))) == parseFloat(requested)){
    //         setDisabled(false)
    //       }
        
    //     i++
    //   }
    //   if(thisLeft == 0){
    //     return (
    //       <Typography variant='body1'>You have planned all the funds you requested.</Typography>
    //     )
       
    //   }
     
    //   setMilestones([...milestones, {milestoneId: ''}])
    // }

    // const removeMilestoneFields = (j) => {
    //   console.log('xy subtract j', j)
    //   let thisLeft
    //   console.log('remove this left', thisLeft)
    //   let newMilestones = [...milestones]
    //   newMilestones.splice(j, 1)
      
      


    //   let i = 0
    //   let totalProgrammed = 0

    //   while(i < newMilestones.length){
    //     console.log('xy newMilestones', newMilestones)
      
    //       if(isNaN(newMilestones[i][`payout${i}`])){
    //         totalProgrammed = 0
    //       }

    //       if(!isNaN(newMilestones[i][`payout${i}`])){
    //         console.log('remove total programmed', parseFloat(totalProgrammed.toString()))
    //         totalProgrammed = parseFloat(totalProgrammed.toString()) + parseFloat(milestones[i][`payout${i}`])
    //         console.log('xy totalprogrammed notnan', totalProgrammed)
    //       }

    //       setPlanned(parseFloat(parseNearAmount(totalProgrammed.toString())).toLocaleString('fullwide', {useGrouping: false}))
    //       console.log('xy subtract requested', requested)
    //       console.log('xy subtract totalProgrmmed', parseFloat(parseNearAmount(totalProgrammed.toString())).toLocaleString('fullwide', {useGrouping: false}))
    //       thisLeft = requested - parseFloat(parseNearAmount(totalProgrammed.toString())).toLocaleString('fullwide', {useGrouping: false})
    //       console.log('xy subtract this left not nan', thisLeft.toLocaleString('fullwide', {useGrouping: false}))
    //       setLeft(thisLeft.toLocaleString('fullwide', {useGrouping: false}))
    
    //       if(parseFloat(parseNearAmount(totalProgrammed.toString())) == parseFloat(requested)){
    //         setDisabled(false)
    //       }
        
      
    //     i++
    //   }

     

    //   if(
    //       thisLeft != 0
    //     ) {
    //       setAddDisabled(false)
    //     }

    //   setMilestones(newMilestones)
      
    // }

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
                  <Typography variant="h6" align="center"> {left ? left : 0} Ⓝ left to plan.</Typography>
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
                                    required: true                              
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
                                  label="Estimated Completion:"
                                  defaultValue={formatDate(Date.now())}
                                  InputProps={{
                                    endAdornment: <div>
                                    <Tooltip TransitionComponent={Zoom} title="Proposed deadline for completion of this milestone.">
                                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                    </Tooltip>
                                    </div>
                                  }}
                                  inputRef={register({
                                    required: true                              
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
                                    required: true                              
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
                                  required: true                              
                                })}
                              />
                              
                              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <Button type="button" onClick={() => {
                                  milestoneRemove(index) 
                                  updatePlanned()
                                }}
                                style={{float: 'right', marginLeft:'10px'}}>
                                  <DeleteForeverIcon />
                                </Button>
                              </Grid>
                              </Grid>
                            </Grid>
                          )
                        }) 
                        }
                        {!milestoneFields || milestoneFields.length == 0 ?
                          <Typography variant="body1" style={{marginLeft: '5px'}}>No project milestones defined yet. Add them to better schedule payouts for your proposal.
                          You must define milestones that equal the amount of your funding request.
                          </Typography>
                        : null }
                        <Divider variant="middle" />
                          <Button
                            type="button"
                            onClick={() => {
                              milestoneAppend({title: '', deadline: '', payout: '0', briefDescription: ''})
                              updatePlanned()
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