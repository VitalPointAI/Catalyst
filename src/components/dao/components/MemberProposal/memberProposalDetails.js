import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'

// Material UI components
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import CircularProgress from '@material-ui/core/CircularProgress';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'

// Textile ThreadsDB components
import { retrieveRecord, retrieveAppRecord } from '../../../../utils/threadsDB';

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

export default function MemberProposalDetails(props) {
    const [open, setOpen] = useState(true)
    const [proposalId, setMemberProposalId] = useState(props.memberProposalId.toString())
    const [proposalProposer, setMemberProposalProposer] = useState()
    const [proposalApplicant, setMemberProposalApplicant] = useState('')
    const [proposalIntro, setMemberProposalIntro] = useState()
    const [proposalAvatar, setMemberProposalAvatar] = useState()
    const [proposalPublished, setMemberProposalPublished] = useState(false)
    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)
    const classes = useStyles()

    const {
        handleProposalDetailsClickState,
        memberProposalId,
        memberStatus,
        status,
        contract
    } = props

    useEffect(() => {
        async function fetchData() {
            setFinished(false)
            let result = await retrieveAppRecord(memberProposalId.toString(), 'MemberProposal')
            if(!result){
              let result = await retrieveRecord(memberProposalId.toString(), 'MemberProposal')
            }
            if(result){
            setMemberProposalId(memberProposalId.toString())
            result.applicant ? setMemberProposalApplicant(result.applicant) : setMemberProposalApplicant('')
            result.avatar ? setMemberProposalAvatar(result.avatar) : setMemberProposalAvatar(imageName)
            result.intro ? setMemberProposalIntro(result.intro) : setMemberProposalIntro('')
            result.proposer ? setMemberProposalProposer(result.proposer) : setMemberProposalProposer(accountId)
            result.published ? setMemberProposalPublished(result.published) : setMemberProposalPublished(false)
            }

            let comments = await contract.getProposalComments({proposalId: memberProposalId.toString()})
            setProposalComments(comments)
          console.log('proposalcomments ', proposalComments)
        }
       
        fetchData()
          .then((res) => {
            console.log('res', res)
            setFinished(true)
          })
        
    },[])

    const handleClose = () => {
        handleProposalDetailsClickState(false)
        setOpen(false)
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

        return (
            <div>
     
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            {finished ? (<>
              <DialogTitle id="form-dialog-title">Membership Proposal Details</DialogTitle>
                <DialogContent>
                {!proposalPublished ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>) : (<>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} className={classes.centered}>
                            <Typography variant="h6">Meet</Typography>
                            <Avatar src={proposalAvatar} className={classes.large} />
                            <Typography variant="h3">{proposalApplicant}</Typography>
                            <Typography variant="overline" display="block" gutterBottom>Proposed by: {proposalProposer}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <div dangerouslySetInnerHTML={{ __html: proposalIntro}}></div>
                        </Grid>
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
                    proposalId = {proposalId}
                    contract = {contract}
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