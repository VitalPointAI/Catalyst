import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'
import Persona from '@aluhning/get-personas-js'

// Material UI components
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'
import Card from '@material-ui/core/Card'
import Paper from '@material-ui/core/Paper'

// CSS Styles

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 800,
      minWidth: 325,
      minHeight: 325,
      
    },
    card: {
      margin: 'auto',
    },
    progress: {
        display: 'flex',
        justifyContent: 'center',
        height: '200px',
        width: '200px',
        alignItems: 'center',
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
        textAlign: 'center',
        margin: 'auto'
    },
    centered: {
        textAlign: 'center'
    },
    heading: {
      fontSize: 24,
      marginLeft: '10px'
    },
    }));

    const imageName = require('../../img/default-profile.png') // default no-image avatar
    
export default function PayoutProposalDetails(props) {
    const [open, setOpen] = useState(true)

    const [applicantAvatar, setApplicantAvatar] = useState()
    const [applicantName, setApplicantName] = useState()

    const [proposerAvatar, setProposerAvatar] = useState()
    const [proposerName, setProposerName] = useState()

    const [payoutTitle, setPayoutTitle] = useState()
    const [detailsOfCompletion, setDetailsOfCompletion] = useState()
    const [milestones, setMilestones] = useState()
    const [created, setCreated] = useState()
  
    const [isUpdated, setIsUpdated] = useState(false)
    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserIdx
    } = state

    const {
        handlePayoutProposalDetailsClickState,
        proposalId,
        proposalStatus,
        applicant,
        curDaoIdx,
        sponsor,
        proposer,
        contract
    } = props

    const thisPersona = new Persona()

    useEffect(
        () => {
          async function fetchData() {
         
            // Get Applicant Persona Information
            if(proposer){                    
              
              let result = await thisPersona.getPersona(proposer)
                  if(result){
                    result.avatar ? setProposerAvatar(result.avatar) : setProposerAvatar(imageName)
                    result.name ? setProposerName(result.name) : setProposerName(proposer)
                  } else {
                    setProposerAvatar(imageName)
                    setProposerName(proposer)
                  } 
            }
           
            if(applicant){                           
               
                  let result = await thisPersona.getPersona(applicant)
                      if(result){
                        result.avatar ? setApplicantAvatar(result.avatar) : setApplicantAvatar(imageName)
                        result.name ? setApplicantName(result.name) : setApplicantName('')
                      }
            }

            // Set Existing Proposal Data       
            if(curDaoIdx){
              let propResult = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
              console.log('propresult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
                    propResult.proposals[i].title ? setPayoutTitle(propResult.proposals[i].title) : setPayoutTitle('')
                    propResult.proposals[i].detailsOfCompletion ? setDetailsOfCompletion(propResult.proposals[i].detailsOfCompletion) : setDetailsOfCompletion('')
                    propResult.proposals[i].milestones ? setMilestones(propResult.proposals[i].milestones) : setMilestones([{}])
                    propResult.proposals[i].submitDate ? setCreated(propResult.proposals[i].submitDate) : setCreated()
                    break
                  }
                  i++
                }
              }
            }

            // Set Existing Proposal Comments      
            if(curDaoIdx){
              let commentResult = await curDaoIdx.get('comments', curDaoIdx.id)
              if(!commentResult){
                commentResult = { comments: [] }
              }
          
              if(commentResult && Object.keys(commentResult).length != 0) {
                let j = 0
                let comments = []
                while (j < commentResult.comments.length){
                  if(commentResult.comments[j].parent == proposalId){
                    comments.push(commentResult.comments[j])
                  }
                  j++
                }
             
                setProposalComments(comments)
              }
            }
                    
            return true  
          }

          fetchData()
            .then((res) => {
              setFinished(true)
            })
          
    }, [applicant, applicantAvatar, proposerAvatar, payoutTitle, created, detailsOfCompletion, applicantName, proposerName, isUpdated]
    )
         
    let Milestones
    if(milestones && milestones.length > 0){
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

    const handleClose = () => {
        handlePayoutProposalDetailsClickState(false)
        setOpen(false)
    }

    function handleUpdate(property){
      setIsUpdated(property)
    }

    let Comments
    let author = ''
    let color = 'white'
    let preview
    if (proposalComments && proposalComments.length > 0) {
        Comments = proposalComments.map(comment => {
            if(comment.originalAuthor && comment.originalContent){
              author = comment.originalAuthor
              let previewLength
              if(comment.originalContent.length > 43){
                previewLength = 40;
              }
              else{
                previewLength = comment.originalContent.length - 5; 
              }
              preview = ': ' + comment.originalContent.substring(3, previewLength) + '...'
              if(author == accountId){
                color = '#ffecc7'
              }
              else{
                color = '#dedad3'
              }
            }
            return (
              <div style={{backgroundColor: color}}>
                  {author != '' ? 
                    <Typography>
                    In reply to {author} 
                    </Typography>: null}
                    <CommentDetails
                        proposalId={proposalId}
                        accountId={accountId}
                        handleUpdate={handleUpdate}
                        curDaoIdx={curDaoIdx}
                        key={comment.commentId}
                        commentId={comment.commentId}
                        comments={proposalComments}
                        commentAuthor={comment.author}
                        commentParent={comment.parent}
                        commentPublished={comment.published}
                        commentBody={comment.body}
                        commentPostDate={comment.postDate}
                        commentSubject={comment.subject}
                        accountId={accountId}
                        curUserIdx={curUserIdx}
                    />
                </div>
                  )
          })
    }
  

        return (
            <div>
     
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            {finished ? (<>
              <DialogTitle id="form-dialog-title">Payout Proposal Details</DialogTitle>
                <DialogContent>
                {!detailsOfCompletion ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>) : (<>
                  <Grid container alignItems="flex-start" justifyContent="space-between" style={{marginBottom: '30px'}}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                       <Typography variant="h4">{payoutTitle}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                      <Typography variant="overline">Proposer:</Typography>
                      <Chip avatar={<Avatar src={proposerAvatar} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                      <Typography variant="overline" style={{marginLeft:'10px'}}>Proposed: {created ? formatDate(created) : null}</Typography>
                    </Grid>
                   
                    {status == 'Sponsored' ? (
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom: '30px'}}>
                      <Typography variant="overline" color="textSecondary">{sponsor ? 'Sponsor:' + sponsor : null}</Typography>
                    </Grid>
                    ) : null }
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Card className={classes.detailsCard}>
                      <div dangerouslySetInnerHTML={{ __html: detailsOfCompletion }} />
                      </Card>
                      
                    </Grid>
                  </Grid>
                    <Grid container spacing={1} style={{width: '100%'}}>
                    <Typography variant="h6" style={{marginBottom: '10px'}}>Completion Plan</Typography>
                      <Paper >
                      <Grid container justifyContent="flex-start" alignItems="center" spacing={1}>
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} align="center">
                          <Typography variant="body2">Id</Typography>
                        </Grid>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} align="left" >
                          <Typography variant="body2">Milestone</Typography>
                        </Grid>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} align="left" >
                          <Typography variant="body2">Description</Typography>
                        </Grid>
                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="left" >
                          <Typography variant="body2">Est Completion</Typography>
                        </Grid>
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} align="left">
                          <Typography variant="body2" align="center">Payout</Typography>
                        </Grid>
                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="left">
                         
                        </Grid>
                      </Grid>
                    

                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            {Milestones}
                        </Grid>
                        </Paper>
                    </Grid>
                  
                    </>)}
                </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Close
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
              {status != 'Passed' && status != 'Not Passed' ? (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Typography variant="h5" style={{marginLeft: '10px'}}>Leave a Comment/Ask a Question</Typography>
                  <CommentForm
                    reply={false}
                    avatar={avatar}
                    proposalId={proposalId}
                    accountId={accountId}
                    contract={contract}
                    handleUpdate={handleUpdate}
                    curDaoIdx={curDaoIdx}
                  />
              </Grid>
              ) : null }
              </Grid>
              </AccordionDetails>
            </Accordion>
              </>)
              : (
                    <div className={classes.progress}>
                        <CircularProgress size={100} color="primary"  />
                   </div>
              )}
            </Dialog>
          </div>
        )
}