import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'
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
    const { register, handleSubmit, watch, errors } = useForm()
  
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

                let j = 0
                let totalProgrammed = 0
               
                while(j < milestones.length){
                  console.log('xy milestones', milestones)
              
                  if(isNaN(milestones[j][`payout${j}`])){
                    totalProgrammed = 0
                  }
          
                  if(!isNaN(milestones[j][`payout${j}`])){
                    totalProgrammed = parseFloat(totalProgrammed.toString()) + parseFloat(milestones[i][`payout${i}`])
                    console.log('xy totalprogrammed notnan', totalProgrammed)
                   
                  }
          
                  setPlanned(parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false}))))
                  thisLeft = parseFloat(requested) - parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false})))
                  console.log('xy this left not nan', thisLeft.toLocaleString('fullwide', {useGrouping: false}))
                  setLeft(thisLeft.toLocaleString('fullwide', {useGrouping: false}))
                 
                  j++
                }
              }
           }
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
console.log('current likes', currentLikes)
    const handleMilestonesChange = (i, e) => {
      console.log('zi', i)
      console.log('ze', e)
      let newMilestone = [...milestones]
      console.log('zi new milestones', newMilestone)
      newMilestone[i]['milestoneId'] = i
      // if(e.target.name == [`payout${i}`]){
      //   newMilestone[i][e.target.name] = parseFloat(e.target.value)
      // } else {
         newMilestone[i][e.target.name] = e.target.value
      // }
      console.log('newmilestonet', newMilestone[i])
      setMilestones(newMilestone)
   
      setAddDisabled(true)
      setDisabled(true)
      let thisLeft
      if(milestones.length == 1)  {
        thisLeft = parseFloat(requested)
        setMax(thisLeft)
      } else {
        thisLeft = left
        setMax(thisLeft)
      }

      if(newMilestone[i][`payout${i}`] && newMilestone[i][`milestone${i}`] && newMilestone[i][`deadline${i}`] && newMilestone[i][`briefDescription${i}`]){
        if(
          newMilestone[i][`payout${i}`] != 0 &&
          newMilestone[i][`milestone${i}`]!='' &&
          newMilestone[i][`deadline${i}`]!='' &&
          newMilestone[i][`briefDescription${i}`]!='' &&
          (parseFloat(parseNearAmount(newMilestone[i][`payout${i}`].toLocaleString('fullwide', {useGrouping: false}))) < requested ||
          parseFloat(parseNearAmount(newMilestone[i][`payout${i}`].toLocaleString('fullwide', {useGrouping: false}))) < thisLeft ||
          thisLeft != 0)
        ) {
          setAddDisabled(false)
        }
      }

      if(!newMilestone[i]){
        setAddDisabled(true)
      }
       
    }


    const addMilestoneFields = () => {
     
      setAddDisabled(true)
      let i = 0
      let totalProgrammed = 0
      let thisLeft
      while(i < milestones.length){
        console.log('xy milestones', milestones)
    
        if(isNaN(milestones[i][`payout${i}`])){
          totalProgrammed = 0
        }

        if(!isNaN(milestones[i][`payout${i}`])){
          totalProgrammed = parseFloat(totalProgrammed.toString()) + parseFloat(milestones[i][`payout${i}`])
          console.log('xy totalprogrammed notnan', totalProgrammed)
         
        }

        setPlanned(parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false}))))
        thisLeft = parseFloat(requested) - parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false})))
        console.log('xy this left not nan', thisLeft.toLocaleString('fullwide', {useGrouping: false}))
        setLeft(thisLeft.toLocaleString('fullwide', {useGrouping: false}))

        if(parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false}))) == parseFloat(requested)){
          setDisabled(false)
        }
        i++
      }
      if(thisLeft == 0){
        return (
          <Typography variant='body1'>You have planned all the funds you requested.</Typography>
        )
       
      }
     
      setMilestones([...milestones, {milestoneId: ''}])
    }

    const removeMilestoneFields = (j) => {
      let thisLeft
      let newMilestones = [...milestones]
      newMilestones.splice(j, 1)
      setMilestones(newMilestones)

      let i = 0
      let totalProgrammed = 0

      while(i < newMilestones.length){
        console.log('xy newMilestones', newMilestones)
    
        if(isNaN(newMilestones[i][`payout${i}`])){
          totalProgrammed = 0
        }

        if(!isNaN(newMilestones[i][`payout${i}`])){
          console.log('remove total programmed', parseFloat(totalProgrammed.toString()))
          totalProgrammed = parseFloat(totalProgrammed.toString()) + parseFloat(milestones[i][`payout${i}`])
          console.log('xy totalprogrammed notnan', totalProgrammed)
         
        }

        setPlanned(parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false}))))
        thisLeft = parseFloat(requested) - parseFloat(parseNearAmount(totalProgrammed.toLocaleString('fullwide', {useGrouping: false})))
        console.log('xy this left not nan', thisLeft.toLocaleString('fullwide', {useGrouping: false}))
        setLeft(thisLeft.toLocaleString('fullwide', {useGrouping: false}))

        if(parseFloat(parseNearAmount(totalProgrammed.toString())) == parseFloat(requested)){
          setDisabled(false)
        }
        i++
      }

      if(
          thisLeft != 0
        ) {
          setAddDisabled(false)
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
          milestones: milestones,
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

   console.log('left', left)
   console.log('requested', requested)
    
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
                  <Typography variant="body1">You've requested {formatNearAmount(requested, 3)} Ⓝ.  The total amount of all milestones must equal the amount requested.</Typography>
                  {milestones && milestones.map((element, index) => (
                  
                      <React.Fragment key={index}>
                      <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      
                        <TextField
                          margin="dense"
                          className={classes.id}
                          id="milestone-id"
                          variant="outlined"
                          name="milestoneId"
                          label="MilestoneId:"
                          value={index}
                          onChange={e => handleMilestonesChange(index, e)}
                          inputRef={register({
                              required: true                              
                          })}
                        />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <TextField
                          fullWidth
                          required
                          margin="dense"
                          id="milestone-title"
                          variant="outlined"
                          name={`milestone${index}`}
                          label="Milestone Name"
                          placeholder="Milestone"
                          value={element[`milestone${index}`] || ""}
                          onChange={e => handleMilestonesChange(index, e)}
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
                          {errors[`milestone${index}`] && <p style={{color: 'red', fontSize:'80%'}}>You must name your milestone.</p>}
            
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                        <TextField
                          
                          margin="dense"
                          id="milestone-deadline"
                          type = "date"
                          name={`deadline${index}`}
                          required
                          label="Estimated Completion:"
                          value={element[`deadline${index}`] || ""}
                          onChange={e => handleMilestonesChange(index, e)}
                          InputLabelProps={{shrink: true,}}
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
                          {errors[`deadline${index}`] && <p style={{color: 'red', fontSize:'80%'}}>Provide est completion date.</p>}
            
                       
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Typography variant="overline">{left ? formatNearAmount(left, 3) : 0} Ⓝ left to plan work for.</Typography>
                        <TextField
                          margin="dense"
                          fullWidth
                          id="payout-requested"
                          variant="outlined"
                          type="number"
                          name={`payout${index}`}
                          label="Planned Payout"
                         
                          value={element[`payout${index}`] || ''}
                          onChange={e => handleMilestonesChange(index, e)}
                          
                          InputProps={{ 
                            inputProps: {
                              required: true, 
                              min: 0,
                              max: max
                            },
                            endAdornment: <div><InputAdornment position="end">Ⓝ</InputAdornment>
                            <Tooltip TransitionComponent={Zoom} title="Payout proposed in NEAR that will be paid out for completion of this milestone">
                                <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                            </Tooltip>
                            </div>
                          }}
                         
                          />
                          {errors[`payout${index}`] && <p style={{color: 'red', fontSize:'80%'}}>Provide planned payout amount.</p>}
            
                   
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <TextField
                          
                          fullWidth
                          margin="dense"
                          id="milestone-description"
                          variant="outlined"
                          name={`briefDescription${index}`}
                          label="Brief Description:"
                          required
                          placeholder="Finish ...."
                          value={element[`briefDescription${index}`] || ""}
                          onChange={e => handleMilestonesChange(index, e)}
                          InputProps={{
                            endAdornment: <div>
                            <Tooltip TransitionComponent={Zoom} title="Short description of what will be finished by completing this milestone.">
                                <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                            </Tooltip>
                            </div>
                          }}
                          />
                          {errors[`briefDescription${index}`] && <p style={{color: 'red', fontSize:'80%'}}>Provide milestone description.</p>}
            
                        
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        {
                        index ? 
                          <Button key={element.name} className="button remove" onClick={() => removeMilestoneFields(index)}>Remove Milestone</Button> 
                        : null
                        }
                        </Grid>
                      </Grid>
                        <hr></hr>
                        </React.Fragment>
                  ))}
                  <div>
                    <Button className="button add" type="button" disabled={addDisabled} onClick={() => addMilestoneFields()}>Add Milestone</Button>
                  </div>
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