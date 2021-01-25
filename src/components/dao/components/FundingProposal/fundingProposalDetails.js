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
import CircularProgress from '@material-ui/core/CircularProgress';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'

// Textile ThreadsDB components
import { retrieveRecord, retrieveAppRecord } from '../../../../utils/threadsDB';

// CSS Styles

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 1000,
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

export default function FundingProposalDetails(props) {
    const [open, setOpen] = useState(true)
    const [proposalId, setProposalId] = useState(props.fundingProposalId.toString())
    const [proposalTitle, setFundingProposalTitle] = useState('')
    const [proposalProposer, setFundingProposalProposer] = useState()
    const [proposalDetails, setFundingProposalDetails] = useState()
    const [proposalPublished, setFundingProposalPublished] = useState(false)
    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)
    const classes = useStyles()

    const {
        handleProposalDetailsClickState,
        fundingProposalId,
        memberStatus,
        status,
        contract
    } = props
console.log('status', status)
    useEffect(() => {
        async function fetchData() {
            setFinished(false)
            let result = await retrieveAppRecord(fundingProposalId.toString(), 'FundingProposal')
            if(!result){
              let result = await retrieveRecord(fundingProposalId.toString(), 'FundingProposal')
            }
            if(result){
            setProposalId(fundingProposalId.toString())
            result.title ? setFundingProposalTitle(result.title) : setFundingProposalTitle('')
            result.details ? setFundingProposalDetails(result.details) : setFundingProposalDetails('')
            result.proposer ? setFundingProposalProposer(result.proposer) : setFundingProposalProposer(accountId)
            result.published ? setFundingProposalPublished(result.published) : setFundingProposalPublished(false)
            }

            let comments = await contract.getProposalComments({proposalId: fundingProposalId.toString()})
            setProposalComments(comments)
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

  const memberIcon = memberStatus ? <CheckCircleIcon /> : <NotInterestedIcon />

        return (
            <div>
     
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" >
            {finished ? (<>
              <DialogTitle id="form-dialog-title">Funding Proposal Details</DialogTitle>
                <DialogContent>
                {!proposalPublished ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>) : (<>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} className={classes.centered}>
                            <Typography variant="h3">{proposalTitle}</Typography>
                            <Typography variant="overline" display="block" gutterBottom>Proposed by: {proposalProposer}</Typography>
                            <Chip variant="outlined" label="Member" icon={memberIcon} style={{marginTop: '5px', marginRight: '2px'}}/>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <div dangerouslySetInnerHTML={{ __html: proposalDetails}}></div>
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