import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'
import Persona from '@aluhning/get-personas-js'
import { formatNearAmount } from '../../state/near'

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

export default function ConfigurationProposalDetails(props) {
    const [open, setOpen] = useState(true)

    const [title, setTitle] = useState()
    const [details, setDetails] = useState()
    const [avatar, setAvatar] = useState()
    const [name, setName] = useState()
  
    const [isUpdated, setIsUpdated] = useState(false)
    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)

    const [currentPeriodDuration, setCurrentPeriodDuration] = useState()
    const [currentVotingPeriodLength, setCurrentVotingPeriodLength] = useState()
    const [currentGracePeriodLength, setCurrentGracePeriodLength] = useState()
    const [currentProposalDeposit, setCurrentProposalDeposit] = useState()
    const [currentDilutionBound, setCurrentDilutionBound] = useState()
    const [currentVoteThreshold, setCurrentVoteThreshold] = useState()

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserIdx
    } = state

    const {
        handleConfigurationProposalDetailsClickState,
        proposalId,
        status,
        curDaoIdx,
        curPersonaIdx,
        applicant,
        proposer,
        configuration,
        contract
    } = props

    useEffect(
        () => {
         

          async function fetchData() {
         
            // Get Applicant Persona Information
           
            if(applicant){                           
                
                  const thisPersona = new Persona()
                  let result = await thisPersona.getPersona(applicant)
                      if(result){
                        result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                        result.name ? setName(result.name) : setName('')
                      }
            }

            if(contract){
              try {
                let result = await contract.getInitSettings({})
                result[0][1] ? setCurrentPeriodDuration(result[0][1]) : setCurrentPeriodDuration('')
                result[0][2] ? setCurrentVotingPeriodLength(result[0][2]) : setCurrentVotingPeriodLength('')
                result[0][3] ? setCurrentGracePeriodLength(result[0][3]) : setCurrentGracePeriodLength('')
                result[0][4] ? setCurrentProposalDeposit(formatNearAmount(result[0][4])) : setCurrentProposalDeposit('')
                result[0][5] ? setCurrentDilutionBound(result[0][5]) : setCurrentDilutionBound('')
                result[0][6] ? setCurrentVoteThreshold(result[0][6]) : setCurrentVoteThreshold('')
              } catch (err) {
                console.log('error retrieving current init settings', err)
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
          
    }, [applicant, avatar, title, details, name, contract, isUpdated]
    )

    const handleClose = () => {
        handleConfigurationProposalDetailsClickState(false)
        setOpen(false)
    }

    function handleUpdate(property){
      setIsUpdated(property)
    }

    let Comments
  
    if (proposalComments && proposalComments.length > 0) {
        Comments = proposalComments.map(comment => {
        
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
              <DialogTitle id="form-dialog-title">Configuration Proposal Details</DialogTitle>
                <DialogContent>
                {details == '' ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>) : (<>
                    <Grid container spacing={1}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left"> 
                    <Typography variant="overline">Proposed By:</Typography>                  
                      <Typography variant="h6"><Avatar src={avatar} style={{float:'left', marginRight: '10px'}}/>{name ? name : proposer}</Typography>
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
                                {currentPeriodDuration ? currentPeriodDuration : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: currentPeriodDuration != configuration[0] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[0] : <CircularProgress />} seconds
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Voting Period Length
                              </TableCell>
                              <TableCell>
                                {currentVotingPeriodLength ? currentVotingPeriodLength : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: currentVotingPeriodLength != configuration[1] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[1] : <CircularProgress />} {configuration.length > 0 ? parseInt(configuration[1]) > 1 ? 'periods' : 'period' : null}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Grace Period Length
                              </TableCell>
                              <TableCell>
                                {currentGracePeriodLength ? currentGracePeriodLength : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: currentGracePeriodLength != configuration[2] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[2] : <CircularProgress />} {configuration.length > 0 ? parseInt(configuration[2]) > 1 ? 'periods' : 'period' : null}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Proposal Deposit
                              </TableCell>
                              <TableCell>
                                {currentProposalDeposit ? currentProposalDeposit : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: currentProposalDeposit != configuration[3] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[3] : <CircularProgress />} Ⓝ
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Dilution Bound
                              </TableCell>
                              <TableCell>
                                {currentDilutionBound ? currentDilutionBound : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: currentDilutionBound != configuration[4] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[4] : <CircularProgress />}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Vote Threshold
                              </TableCell>
                              <TableCell>
                                {currentVoteThreshold ? currentVoteThreshold : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: currentVoteThreshold != configuration[5] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[5] : <CircularProgress />}
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