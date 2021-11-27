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

// Material UI components
import Button from '@material-ui/core/Button'
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

export default function EditGuildKickProposalForm(props) {
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

    // Proposal Fields
    const [details, setDetails] = useState(EditorState.createEmpty())

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        handleUpdate,
        handleEditGuildKickProposalDetailsClickState,
        applicant,
        curDaoIdx,
        proposalId,
    } = props
    
    const classes = useStyles()
    const data = new Persona()

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)

            // Set Existing Persona Data
            let result = await data.getData('profile', applicant, curDaoIdx)     
           
              if(result) {
                result.date ? setDate(result.date) : setDate('')
                result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                result.name ? setName(result.name) : setName('')
              }
         //  }

           // Set Existing Proposal Data       
           if(curDaoIdx){
              let propResult = await curDaoIdx.get('proposalDetails', curDaoIdx.id)
            
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
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
           }
        }
       
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
    },[applicant])

    function handleFileHash(hash) {
      setAvatar(IPFS_PROVIDER + hash)
    }

    const handleClose = () => {
        handleEditGuildKickProposalDetailsClickState(false)
        setOpen(false)
    }

    const handleNameChange = (event) => {
        let value = event.target.value;
        setName(value)
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
      let detailRecords = await curDaoIdx.get('guildKickProposalDetails', curDaoIdx.id)
  
      if(!detailRecords){
        detailRecords = { proposals: [] }
      }

      let proposalRecord = {
          proposalId: proposalId.toString(),
          details: draftToHtml(convertToRaw(details.getCurrentContent())),
          memberToKick: applicant,
          updated: formattedDate,
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
          await curDaoIdx.set('guildKickProposalDetails', detailRecords)
          exists = true
          break
        }
        i++
      }

      // Add record if it doesn't exist
      if(!exists){
        detailRecords.proposals.push(proposalRecord)
      
        await curDaoIdx.set('guildKickProposalDetails', detailRecords)
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
              <DialogTitle id="form-dialog-title">Proposal Details</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Why should we kick this member out of the community?
                  
                  </DialogContentText>
                  <div><Avatar src={avatar} /></div>
                  <Typography variant="h6">{name ? name : applicant}</Typography>

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