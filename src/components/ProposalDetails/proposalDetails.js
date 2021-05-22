import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'
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

export default function proposalDetails(props) {
    const [open, setOpen] = useState(true)
    const [intro, setIntro] = useState()
    const [avatar, setAvatar] = useState()
    const [name, setName] = useState('')
  
   
    // const [proposalPublished, setMemberProposalPublished] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)
    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near,
      appIdx,
      accountId,
      curUserIdx
    } = state

    const {
        handleProposalDetailsClickState,
        proposalId,
        memberStatus,
        status,
        curDaoIdx,
        curPersonaIdx,
        applicant,
        proposer,
        contract
    } = props

    useEffect(
        () => {
         

          async function fetchData() {
         
            // Get Applicant Persona Information
           
            if(applicant){                           
                  let result = await curPersonaIdx.get('profile', curPersonaIdx.id)
                  console.log('result proposal details persona card', result)
                  
                  if(result){
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                    result.name ? setName(result.name) : setName('')
                  }
            }
            

            // Set Existing Proposal Data       
            if(curDaoIdx){
              let propResult = await curDaoIdx.get('proposalDetails', curDaoIdx.id)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
                    propResult.proposals[i].intro ? setIntro(propResult.proposals[i].intro) : setIntro('')
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
              console.log('commentResult', commentResult)
              if(commentResult) {
                let j = 0
                let comments = []
                while (j < commentResult.comments.length){
                  if(commentResult.comments[j].parent == proposalId){
                    comments.push(commentResult.comments[j])
                  }
                  j++
                }
                console.log('comments', comments)
                setProposalComments(comments)
              }
            }
            
            // // Load DAO Proposal information
            // let result = await curDaoIdx.get('proposals', curDaoIdx.id)
            // console.log('result here proposal card', result)
                    
            return true  
          }

          fetchData()
            .then((res) => {
              setFinished(true)
            })
          
    }, [applicant, avatar, intro, isUpdated]
    )

    const handleClose = () => {
        handleProposalDetailsClickState(false)
        setOpen(false)
    }

    function handleUpdate(property){
      setIsUpdated(property)
    }

    let Comments
    console.log('proposalComments', proposalComments)
    if (proposalComments && proposalComments.length > 0) {
        Comments = proposalComments.map(comment => {
            console.log('comments map', comment)
            return (
                    <CommentDetails
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
                  )
          })
    }
  

        return (
            <div>
     
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            {finished ? (<>
              <DialogTitle id="form-dialog-title">Proposal Details</DialogTitle>
                <DialogContent>
                {intro == '' ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>) : (<>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} className={classes.centered}>
                            <Typography variant="h6">Meet</Typography>
                            <Avatar src={avatar} className={classes.large} />
                            <Typography variant="h3">{applicant}</Typography>
                            <Typography variant="overline" display="block" gutterBottom>Proposed by: {proposer}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <div dangerouslySetInnerHTML={{ __html: intro}}></div>
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