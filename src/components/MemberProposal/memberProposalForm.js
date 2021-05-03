import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'

import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'


// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider'

// // Textile ThreadsDB components
// import { initiateCollection, 
//     createRecord,
//     initiateAppCollection,
//     createAppRecord,
//     retrieveRecord,
//     retrieveAppRecord,
//     updateRecord,
//     isAppCollection,
//     isUserCollection,
//     deleteAppRecord,
//     updateAppRecord } from '../../../../utils/threadsDB';
import { memberProposalSchema } from '../../schemas/memberProposals';

// ReactQuill Component
import ReactQuill from 'react-quill';

// CSS Styles
import '../../../node_modules/react-quill/dist/quill.snow.css'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      margin: 'auto',
      maxWidth: 325,
      minWidth: 325,
    },
    card: {
      margin: 'auto',
    },
    progress: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
    large: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        textAlign: 'center'
    },
    heading: {
      fontSize: 24,
      marginLeft: '10px'
    },
    }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function MemberProposalForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [proposalId, setMemberProposalId] = useState(props.memberProposalId.toString())
    const [proposalProposer, setMemberProposalProposer] = useState(props.accountId)
    const [proposalApplicant, setMemberProposalApplicant] = useState('')
    const [proposalIntro, setMemberProposalIntro] = useState('')
    const [proposalAvatar, setMemberProposalAvatar] = useState(imageName)
    const [proposalPublished, setMemberProposalPublished] = useState(false)
    const [proposalComments, setProposalComments] = useState()
    const [proposalTitle, setMemberProposalTitle] = useState('')

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        memberProposalId,
        accountId,
        handleProposalDetailsEmptyClickState,
        memberProposalType,
        contract,
        status,
    } = props
    console.log('memberproposalid', memberProposalId)
    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
            console.log('proposalId ', proposalId)
            let result = await retrieveRecord(proposalId.toString(), 'MemberProposal')
            console.log('result ', result)
            if(result) {
                result.applicant ? setMemberProposalApplicant(result.applicant) : setMemberProposalApplicant('')
                result.avatar ? setMemberProposalAvatar(result.avatar) : setMemberProposalAvatar(imageName)
                result.intro ? setMemberProposalIntro(result.intro) : setMemberProposalIntro('')
                result.proposer ? setMemberProposalProposer(result.proposer) : setMemberProposalProposer(accountId)
                result.published ? setMemberProposalPublished(result.published) : setMemberProposalPublished(false)
                result.title ? setMemberProposalTitle(result.title) : setMemberProposalTitle('')
            }

            let comments = await contract.getProposalComments({proposalId: proposalId.toString()})
            setProposalComments(comments)
          console.log('proposalcomments ', proposalComments)
        }
       
        fetchData()
          .then((res) => {
            console.log('res', res)
          })
    },[])

    const onDropAvatar = async (pictureFiles, pictureDataURLs) => {
        if(pictureDataURLs[0]!==null){
       setMemberProposalAvatar(pictureDataURLs[0])
        } else {
           setMemberProposalAvatar(proposalAvatar)
        }
    }
    const handleClose = () => {
        handleProposalDetailsEmptyClickState(false)
        setOpen(false)
    }

    const handleApplicantChange = (event) => {
        let value = event.target.value;
        setMemberProposalApplicant(value)
    }

    const handlePublishToggle = () => {
        const published = !proposalPublished
        setMemberProposalPublished(published)
    }

    const handleTitleChange = (event) => {
      let value = event.target.value;
      setMemberProposalTitle(value)
    }

    const handleIntroChange = (content, delta, source, editor) => {
        console.log('content', content)
        console.log('delta', delta)
        console.log('source', source)
        console.log('editor', editor)
        setMemberProposalIntro(content)
    }

    const onSubmit = async (values) => {
        event.preventDefault();
        setFinished(false)
        console.log('values ', values)
        let record = {
            _id: proposalId.toString(),
            applicant: proposalApplicant,
            title: proposalTitle,
            intro: proposalIntro,
            proposer: proposalProposer,
            submitDate: new Date().getTime(),
            avatar: proposalAvatar,
            published: proposalPublished
        }

        let userCollectionExists = await isUserCollection('MemberProposal')
        !userCollectionExists ? await initiateCollection('MemberProposal', memberProposalSchema) : null

        let result = await retrieveRecord(proposalId.toString(), 'MemberProposal')
        console.log('present user ', result)
        console.log('user record ', result)
        if(!result) {
            await createRecord('MemberProposal', record) 
        } else {
            const updatedRecord = result
            updatedRecord.applicant = proposalApplicant,
            updatedRecord.title = proposalTitle,
            updatedRecord.intro = proposalIntro
            updatedRecord.proposer = proposalProposer
            updatedRecord.submitDate = new Date().getTime()
            updatedRecord.avatar = proposalAvatar
            updatedRecord.published = proposalPublished
            await updateRecord('MemberProposal', [updatedRecord])
        }

        if(proposalPublished) {
            let appCollectionExists = await isAppCollection('MemberProposal')
            !appCollectionExists ? await initiateAppCollection('MemberProposal', memberProposalSchema) : null

            let result = await retrieveAppRecord(proposalId.toString(), 'MemberProposal')
            console.log('present user ', result)
            console.log('user record ', result)
            if(!result) {
                await createAppRecord('MemberProposal', record) 
            } else {
                const updatedRecord = result
                updatedRecord.applicant = proposalApplicant
                updatedRecord.title = proposalTitle
                updatedRecord.intro = proposalIntro
                updatedRecord.proposer = proposalProposer
                updatedRecord.submitDate = new Date().getTime()
                updatedRecord.avatar = proposalAvatar
                updatedRecord.published = proposalPublished
                await updateAppRecord('MemberProposal', [updatedRecord])
            }
        }

        if(!proposalPublished) {
          let appCollectionExists = await isAppCollection('MemberProposal')
          !appCollectionExists ? await initiateAppCollection('MemberProposal', memberProposalSchema) : null

          let result = await retrieveAppRecord(proposalId.toString(), 'MemberProposal')
          console.log('present user ', result)
          console.log('user record ', result)

          if(result) {
            await deleteAppRecord(proposalId.toString(), 'MemberProposal') 
          }
        }
      setFinished(true)
      setOpen(false)
      handleProposalDetailsEmptyClickState(false)
    }

    let Comments;
    if(proposalPublished) {
    Comments = (<Typography component="h3">Ask a question or leave a comment</Typography>)
    
    if (proposalComments && proposalComments.length > 0) {
        Comments = proposalComments.map(comment => {
            console.log('comments map', comment)
            return (
                    <CommentDetails
                        key={comment.commentId}
                        commentId={comment.commentId}
                        comments={proposalComments}
                        commentAuthor={comment.commentAuthor}
                        commentParent={comment.commentParent}
                        commentPublished={comment.published}
                        accountId={accountId}
                    />
                  )
          })
    }
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

    const label = memberProposalType == 'Member' ? 'Applicant' : 'Member to Kick'
    
        return (
            <div>
            <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">{memberProposalType} Proposal Details</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Provide as much detail as possible to assist with voting decisions.
                  </DialogContentText>
                  
                  <FormControlLabel
                    control={<Switch checked={proposalPublished} onChange={handlePublishToggle} color="primary" />}
                    label="Published"
                  />
                
                  <Grid container alignItems="center" justify="space-evenly" spacing={1}>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <TextField
                        autoFocus
                        margin="dense"
                        id="membership-proposal-applicant"
                        variant="outlined"
                        name="memberProposalApplicant"
                        label={label}
                        placeholder="someApplicant.testnet"
                        value={proposalApplicant}
                        onChange={handleApplicantChange}
                        inputRef={register({
                            required: true                              
                        })}
                      />
                      {errors.proposalApplicant && <p style={{color: 'red'}}>You must identify the applicant.</p>}
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                      <ImageUploader
                          withIcon={false}
                          buttonText="Upload Avatar"
                          onChange={onDropAvatar}
                          imgExtension={[".jpg", ".gif", ".png"]}
                          maxFileSize={5242880}
                          withPreview={false}
                          singleImage={true}
                          inputRef={register()}
                      />
                    </Grid>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                        <Avatar src={proposalAvatar} className={classes.large} />
                    </Grid>
                  </Grid>
                  <div>
                  <TextField
                      autoFocus
                      margin="dense"
                      id="member-proposal-title"
                      variant="outlined"
                      name="memberProposalTitle"
                      label="Proposal Title"
                      placeholder="Enter a short title"
                      value={proposalTitle}
                      onChange={handleTitleChange}
                      inputRef={register({
                          required: true                              
                      })}
                  />
                {errors.memberProposalTitle && <p style={{color: 'red'}}>You must give your proposal a short title.</p>}
              </div>
                  <div>
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    name="proposalIntro"
                    value={proposalIntro}
                    onChange={handleIntroChange}
                    style={{height:'400px', marginBottom:'100px'}}
                    inputRef={register({
                        required: true
                    })}
                  />
                  </div>
                 
                </DialogContent>
              {!finished ? <LinearProgress className={classes.progress} style={{marginBottom: '25px' }}/> : (
              <DialogActions>
              { status != 'Not Passed' && status != 'Passed' ? (
              <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
                  Submit Details
                </Button>
              ) : <Typography variant="body1">You cannot change these details - proposal has been processed.</Typography>}
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
              </DialogActions>)}
              <Divider style={{marginBottom: 10}}/>
              
              <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
              <Typography className={classes.heading}>Comments and Questions</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Grid container spacing={1}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  {Comments}
              </Grid>
              { status != 'Not Passed' && status != 'Passed' ? (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Typography variant="h5" style={{marginLeft: '10px'}}>Leave a Comment/Ask a Question</Typography>
                  <CommentForm
                    proposalId = {proposalId}
                  />
              </Grid>
              ) : null }
              </Grid>
              </AccordionDetails>
            </Accordion>
            </Dialog>
          </div>
          </div>
        )
}