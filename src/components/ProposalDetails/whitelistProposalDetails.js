import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'
import Persona from '@aluhning/get-personas-js'
import FungibleTokens from '../../utils/fungibleTokens'
import { getStatus, formatDate } from '../../state/near'

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
    const defaultToken = require('../../img/default-coin.png') // default no-token image

export default function WhitelistProposalDetails(props) {
    const [open, setOpen] = useState(true)

    const [title, setTitle] = useState()
    const [details, setDetails] = useState()
    const [tokenName, setTokenName] = useState()
    const [applicantAvatar, setApplicantAvatar] = useState()
    const [applicantName, setApplicantName] = useState()
    const [created, setCreated] = useState()

    const [proposerAvatar, setProposerAvatar] = useState()
    const [proposerName, setProposerName] = useState()

    const [curUserAvatar, setCurUserAvatar] = useState()
    const [curUserName, setCurUserName] = useState()

    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)

    const [thisTokenName, setThisTokenName] = useState()
    const [tokenImage, setTokenImage] = useState(defaultToken)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserIdx, 
      isUpdated,
      appIdx
    } = state

    const {
        handleWhitelistProposalDetailsClickState,
        proposalId,
        status,
        curDaoIdx,
        applicant,
        proposer,
        contract,
        memberStatus
    } = props

    const { getMetadata } = FungibleTokens

    const thisPersona = new Persona()

    useEffect(
      () => {
        if(tokenName){
          getMetadata(tokenName).then((meta) => {
            console.log('meta', meta)
            if(meta && meta.symbol != '') {
              setThisTokenName(meta.symbol)
              setTokenImage(meta.icon)
            } else {
              sethisTokenName('')
              setTokenImage(defaultToken)
            }
          })
        }
      },[tokenName]
    )

    useEffect(
        () => {
         

          async function fetchData() {
            if(isUpdated){}
             // Get Applicant Persona Information
             if(proposer){                    
              
              let result = await thisPersona.getData('profile', proposer, appIdx)
                if(result){
                  result.avatar ? setProposerAvatar(result.avatar) : setProposerAvatar(imageName)
                  result.name ? setProposerName(result.name) : setProposerName(proposer)
                } else {
                  setProposerAvatar(imageName)
                  setProposerName(proposer)
                } 
            }

            // Get Current User Persona Information
            if(accountId){                    
              
              let result = await thisPersona.getData('profile', accountId, appIdx)
                  if(result){
                    result.avatar ? setCurUserAvatar(result.avatar) : setCurUserAvatar(imageName)
                    result.name ? setCurUserName(result.name) : setCurUserName(accountId)
                  } else {
                    setCurUserAvatar(imageName)
                    setCurUserName(accountId)
                  } 
            }
          
            if(applicant){                           
              
                  let result = await thisPersona.getData('profile', applicant, appIdx)
                      if(result){
                        result.avatar ? setApplicantAvatar(result.avatar) : setApplicantAvatar(imageName)
                        result.name ? setApplicantName(result.name) : setApplicantName(applicant)
                      } else {
                        setApplicantAvatar(imageName)
                        setApplicantName(applicant)
                      } 
            }
            

            // Set Existing Proposal Data       
            if(curDaoIdx){
              let propResult = await curDaoIdx.get('whitelistProposalDetails', curDaoIdx.id)
         
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
                    propResult.proposals[i].title ? setTitle(propResult.proposals[i].title) : setTitle('')
                    propResult.proposals[i].submitDate ? setCreated(propResult.proposals[i].submitDate) : setCreated('')
                    propResult.proposals[i].tokenName ? setTokenName(propResult.proposals[i].tokenName) : setTokenName('')
                    propResult.proposals[i].details ? setDetails(propResult.proposals[i].details) : setDetails('')
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
          
    }, [applicant, applicantAvatar, curUserAvatar, proposerAvatar, title, details, applicantName, isUpdated]
    )

    const handleClose = () => {
        handleWhitelistProposalDetailsClickState(false)
        setOpen(false)
    }

    function handleUpdate(property){
      setIsUpdated(property)
    }

    let Comments
    let author = ''
    let color = 'white'
    let preview =''
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
              <div >
              {author != '' ? 
                 <Typography>
                 In reply to {author}{preview}
                 </Typography>: null}
                    <CommentDetails
                        proposalId={proposalId}
                        proposalApplicant={applicant}
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
                        memberStatus={memberStatus}
                    />
                </div>
                  )
          })
    }
  

        return (
            <div>
     
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            {finished ? (<>
              <DialogTitle id="form-dialog-title">Token Whitelist Proposal Details</DialogTitle>
                <DialogContent>
                {details == '' ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>) : (<>
                    <Grid container alignItems="flex-start" justifyContent="space-between" style={{marginBottom: '30px'}}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                        <Typography variant="h4">Whitelist<br></br>{tokenName}</Typography><br></br>
                        <Avatar src={tokenImage} />
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
                        <div dangerouslySetInnerHTML={{ __html: details }} />
                        </Card>
                        
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
              {status != 'Passed' && status != 'Not Passed' && memberStatus? (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Typography variant="h5" style={{marginLeft: '10px'}}>Leave a Comment/Ask a Question</Typography>
                  <CommentForm
                    reply={false}
                    proposalApplicant={applicant}
                    avatar={curUserAvatar}
                    name={curUserName}
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