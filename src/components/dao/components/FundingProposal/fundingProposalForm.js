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
import Grid from '@material-ui/core/Grid'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider'

// Textile ThreadsDB components
import { initiateCollection, 
    createRecord,
    initiateAppCollection,
    createAppRecord,
    retrieveRecord,
    retrieveAppRecord,
    updateRecord,
    isAppCollection,
    isUserCollection,
    updateAppRecord,
    deleteAppRecord
 } from '../../../../utils/threadsDB';
import { fundingProposalSchema } from '../../Schemas/FundingProposal';

// ReactQuill Component
import ReactQuill from 'react-quill';

// CSS Styles
import '../../../../../node_modules/react-quill/dist/quill.snow.css'

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

export default function FundingProposalForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [proposalId, setProposalId] = useState(props.fundingProposalId.toString())
    const [proposalProposer, setFundingProposalProposer] = useState(props.accountId)
    const [proposalDetails, setFundingProposalDetails] = useState('')
    const [proposalTitle, setFundingProposalTitle] = useState('')
    const [proposalPublished, setFundingProposalPublished] = useState(false)
    const [proposalComments, setProposalComments] = useState([])

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        fundingProposalId,
        accountId,
        handleProposalDetailsEmptyClickState,
        contract
    } = props
    console.log('Fundingproposalid', proposalId)
    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
            console.log('proposalId ', proposalId)
            let result = await retrieveRecord(proposalId.toString(), 'FundingProposal')
            console.log('result ', result)
            if(result) {
                result.title ? setFundingProposalTitle(result.title) : setFundingProposalTitle('')
                result.details ? setFundingProposalDetails(result.details) : setFundingProposalDetails('')
                result.proposer ? setFundingProposalProposer(result.proposer) : setFundingProposalProposer(accountId)
                result.published ? setFundingProposalPublished(result.published) : setFundingProposalPublished(false)
            }

            let comments = await contract.getProposalComments({proposalId: fundingProposalId.toString()})
            setProposalComments(comments)
          console.log('proposalcomments ', proposalComments)
        }
       
        fetchData()
          .then((res) => {
            console.log('res', res)
          })
    },[])

    const handleClose = () => {
        handleProposalDetailsEmptyClickState(false)
        setOpen(false)
    }

    const handleTitleChange = (event) => {
        let value = event.target.value;
        setFundingProposalTitle(value)
    }

    const handlePublishToggle = () => {
        const published = !proposalPublished
        setFundingProposalPublished(published)
    }

    const handleDetailsChange = (content, delta, source, editor) => {
        setFundingProposalDetails(content)
    }

    const onSubmit = async (values) => {
        event.preventDefault();
        setFinished(false)
        console.log('values ', values)
        let record = {
            _id: proposalId.toString(),
            title: proposalTitle,
            details: proposalDetails,
            proposer: proposalProposer,
            submitDate: new Date().getTime(),
            published: proposalPublished
        }

        let userCollectionExists = await isUserCollection('FundingProposal')
        !userCollectionExists ? await initiateCollection('FundingProposal', fundingProposalSchema) : null

        let result = await retrieveRecord(proposalId.toString(), 'FundingProposal')
        console.log('present user ', result)
        console.log('user record ', result)
        if(!result) {
            await createRecord('FundingProposal', record) 
        } else {
            const updatedRecord = result
            updatedRecord.title = proposalTitle
            updatedRecord.details = proposalDetails
            updatedRecord.proposer = proposalProposer
            updatedRecord.submitDate = new Date().getTime()
            updatedRecord.published = proposalPublished
            await updateRecord('FundingProposal', [updatedRecord])
        }

        if(proposalPublished) {
            let appCollectionExists = await isAppCollection('FundingProposal')
            !appCollectionExists ? await initiateAppCollection('FundingProposal', fundingProposalSchema) : null

            let result = await retrieveAppRecord(proposalId.toString(), 'FundingProposal')
            console.log('present user ', result)
            console.log('user record ', result)
            if(!result) {
                await createAppRecord('FundingProposal', record) 
            } else {
                const updatedRecord = result
                updatedRecord.title = proposalTitle
                updatedRecord.details = proposalDetails
                updatedRecord.proposer = proposalProposer
                updatedRecord.submitDate = new Date().getTime()
                updatedRecord.published = proposalPublished
                await updateAppRecord('FundingProposal', [updatedRecord])
            }
        }

        if(!proposalPublished) {
          let appCollectionExists = await isAppCollection('FundingProposal')
          !appCollectionExists ? await initiateAppCollection('FundingProposal', fundingProposalSchema) : null

          let result = await retrieveAppRecord(proposalId.toString(), 'FundingProposal')
          console.log('present user ', result)
          console.log('user record ', result)

          if(result) {
            await deleteAppRecord(proposalId.toString(), 'FundingProposal') 
          }
        }
      setFinished(true)
      setOpen(false)
      handleProposalDetailsEmptyClickState(false)
    }

    let Comments;
    if(proposalPublished) {
    
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
    
        return (
            <div>
            <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Funding Proposal Details</DialogTitle>
              <DialogContent>
              {!finished ? <LinearProgress className={classes.progress} /> : (
                  <DialogContentText style={{marginBottom: 10}}>
                  Provide as much detail as possible to assist with voting decisions.
                  </DialogContentText>)}
                    <div>
                      <TextField
                          autoFocus
                          margin="dense"
                          id="funding-proposal-title"
                          variant="outlined"
                          name="fundingProposalTitle"
                          label="Proposal Title"
                          placeholder="My Awesome Proposal"
                          value={proposalTitle}
                          onChange={handleTitleChange}
                          inputRef={register({
                              required: true                              
                          })}
                      />
                    {errors.proposalApplicant && <p style={{color: 'red'}}>You must identify the applicant.</p>}
                  </div>
                  <div>
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    name="proposalDetails"
                    value={proposalDetails}
                    onChange={handleDetailsChange}
                    style={{height:'400px', marginBottom:'100px'}}
                    inputRef={register({
                        required: true
                    })}
                  />
                  </div>
                 
                  <div>
                  <FormControlLabel
                    control={<Switch checked={proposalPublished} onChange={handlePublishToggle} color="primary" />}
                    label="Published"
                />
                  </div>
                </DialogContent>
              <DialogActions>
              <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
                  Submit Details
                </Button>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
              </DialogActions>
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
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Typography variant="h5" style={{marginLeft: '10px'}}>Leave a Comment/Ask a Question</Typography>
                  <CommentForm
                    proposalId = {proposalId}
                  />
              </Grid>
              </Grid>
              </AccordionDetails>
            </Accordion>
            </Dialog>
          </div>
          </div>
        )
}