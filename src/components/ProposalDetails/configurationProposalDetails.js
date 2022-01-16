import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'
import { formatNearAmount } from '../../state/near'
import { ceramic } from '../../utils/ceramic'

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
import Divider from '@material-ui/core/Divider'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
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

export default function ConfigurationProposalDetails(props) {

  const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserIdx,
      appIdx,
      daoFactory,
      didRegistryContract,
      periodDuration,
      votingPeriodLength,
      gracePeriodLength,
      proposalDeposit,
      dilutionBound,
      voteThreshold,
      platformPercent,
      platformAccount,
      curDaoIdx,
      memberStatus,
      contract
    } = state

    const {
      handleConfigurationProposalDetailsClickState,
      proposalId,
      applicant,
      proposer,
      configuration,
      status
  } = props

    const [open, setOpen] = useState(true)

    const [title, setTitle] = useState()
    const [details, setDetails] = useState()
    const [applicantAvatar, setApplicantAvatar] = useState()
    const [applicantName, setApplicantName] = useState()

    const [proposerAvatar, setProposerAvatar] = useState()
    const [proposerName, setProposerName] = useState()

    const [curUserAvatar, setCurUserAvatar] = useState()
    const [curUserName, setCurUserName] = useState()
  
    const [isUpdated, setIsUpdated] = useState(false)
    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)
   
    const classes = useStyles()

    useEffect(
        () => {
         

          async function fetchData() {
         
            // Get Applicant Persona Information
            if(proposer){                    
              let proposerDid = await ceramic.getDid(proposer, daoFactory, didRegistryContract)
              let result = await appIdx.get('profile', proposerDid)
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
              let accountDid = await ceramic.getDid(accountId, daoFactory, didRegistryContract)
              let result = await appIdx.get('profile', accountDid)
                  if(result){
                    result.avatar ? setCurUserAvatar(result.avatar) : setCurUserAvatar(imageName)
                    result.name ? setCurUserName(result.name) : setCurUserName(accountId)
                  } else {
                    setCurUserAvatar(imageName)
                    setCurUserName(accountId)
                  } 
            }
           
            if(applicant){                           
              let applicantDid = await ceramic.getDid(applicant, daoFactory, didRegistryContract)
              let result = await appIdx.get('profile', applicantDid)
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
              let propResult = await curDaoIdx.get('configurationProposalDetails', curDaoIdx.id)
           
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
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
          
    }, [applicant, applicantAvatar, curUserAvatar, proposerAvatar, title, details, contract, isUpdated]
    )

    const handleClose = () => {
        handleConfigurationProposalDetailsClickState(false)
        setOpen(false)
    }

    function handleUpdate(property){
      setIsUpdated(property)
    }

    let Comments
    let author = '';
    let color;
    let preview = '';
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
                   </Typography>
                 : null}
                 <CommentDetails
                    key={comment.commentId}
                    proposalId={proposalId}
                    proposalApplicant={applicant}
                    commentId={comment.commentId}
                    comments={proposalComments}
                    commentAuthor={comment.author}
                    commentParent={comment.parent}
                    commentPublished={comment.published}
                    commentBody={comment.body}
                    commentPostDate={comment.postDate}
                    commentSubject={comment.subject}
                />
                </div>
                  )
          })
    }
  

        return (
            <div>
     
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            {finished ? (<>
              <DialogTitle id="form-dialog-title">Configuration Proposal Details</DialogTitle>
                <DialogContent>
                {details == '' ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>) : (<>
                    <Grid container spacing={1}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left"> 
                    <Typography variant="overline">Proposed By:</Typography>                  
                      <Typography variant="h6"><Avatar src={proposerAvatar} style={{float:'left', marginRight: '10px'}}/>{proposerName ? proposerName : proposer}</Typography>
                    </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <TableContainer component={Paper} style={{marginBottom: '20px'}}>
                        <Table className={classes.table} size="small" aria-label="a dense table">
                          <TableHead>
                            <TableRow>
                              <TableCell>Setting</TableCell>
                              <TableCell>Current</TableCell>
                              <TableCell>Proposed</TableCell>
                            </TableRow>
                          </TableHead>
                         
                          <TableBody>
                        
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Period Duration
                              </TableCell>
                              <TableCell>
                                {periodDuration ? periodDuration : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: periodDuration.toString() != configuration[0] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[0] : <CircularProgress />} seconds
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Voting Period Length
                              </TableCell>
                              <TableCell>
                                {votingPeriodLength ? votingPeriodLength : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: votingPeriodLength.toString() != configuration[1] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[1] : <CircularProgress />} {configuration.length > 0 ? parseInt(configuration[1]) > 1 ? 'periods' : 'period' : null}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Grace Period Length
                              </TableCell>
                              <TableCell>
                                {gracePeriodLength ? gracePeriodLength : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: gracePeriodLength.toString() != configuration[2] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[2] : <CircularProgress />} {configuration.length > 0 ? parseInt(configuration[2]) > 1 ? 'periods' : 'period' : null}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Proposal Deposit
                              </TableCell>
                              <TableCell>
                                {proposalDeposit ? proposalDeposit : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: proposalDeposit != configuration[3] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[3] : <CircularProgress />} Ⓝ
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Dilution Bound
                              </TableCell>
                              <TableCell>
                                {dilutionBound ? dilutionBound : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: dilutionBound.toString() != configuration[4] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[4] : <CircularProgress />}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Vote Threshold
                              </TableCell>
                              <TableCell>
                                {voteThreshold ? voteThreshold : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: voteThreshold.toString() != configuration[5] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[5] : <CircularProgress />}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Platform Support
                              </TableCell>
                              <TableCell>
                                {platformPercent ? formatNearAmount(platformPercent, 5) : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: formatNearAmount(platformPercent, 5) != configuration[6] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[6] : <CircularProgress />}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell component="th" scope="row">
                              Platform Support Account
                            </TableCell>
                            <TableCell>
                              {platformAccount ? platformAccount : <CircularProgress />}
                            </TableCell>
                            <TableCell style={{ 
                              backgroundColor: platformAccount != configuration[7] ? 'yellow' : ''
                            }}>
                              {configuration.length > 0 ? configuration[7] : <CircularProgress />}
                            </TableCell>
                          </TableRow>
                                    
                          </TableBody>
                        </Table>
                      </TableContainer>
                        </Grid>
                       
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Typography variant="h6">Justification</Typography>
                           {details ? <div dangerouslySetInnerHTML={{ __html: details}}></div> : 'no justification provided yet'}
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
              {status != 'Passed' && status != 'Not Passed' && memberStatus ? (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Typography variant="h5" style={{marginLeft: '10px'}}>Leave a Comment/Ask a Question</Typography>
                <CommentForm
                  reply={false}
                  proposalApplicant={applicant}
                  avatar={curUserAvatar}
                  name={curUserName}
                  proposalId={proposalId}
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