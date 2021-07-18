import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'
import Persona from '@aluhning/get-personas-js'
import { dao } from '../../utils/dao'
import { getStatus } from '../../state/near'
import DOMPurify from "dompurify"

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
import Card from '@material-ui/core/Card'
import Rating from '@material-ui/lab/Rating'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

// CSS Styles

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 800,
      minWidth: 325,
      minHeight: 325,      
    },
    card: {
      margin: 'auto',
      padding: '5px'
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

export default function OpportunityProposalDetails(props) {
    const [open, setOpen] = useState(true)

    const [proposerAvatar, setProposerAvatar] = useState()
    const [proposerName, setProposerName] = useState()

    const [title, setTitle] = useState('')
    const [details, setDetails] = useState('')
    const [reward, setReward] = useState('')
    const [category, setCategory] = useState('')
    const [projectName, setProjectName] = useState('')
    const [opportunityStatus, setOpportunityStatus] = useState('')
    const [permission, setPermission] = useState('')
    const [created, setCreated] = useState('')
    const [familiarity, setFamiliarity] = useState('0')
    const [proposalStatus, setProposalStatus] = useState()
    const [desiredSkillSet, setDesiredSkillSet] = useState([])
    const [desiredDeveloperSkillSet, setDesiredDeveloperSkillSet] = useState([])


    const [isUpdated, setIsUpdated] = useState(false)
    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserIdx,
      wallet
    } = state

    const {
        handleOpportunityProposalDetailsClickState,
        opportunityId,
        status,
        curDaoIdx,
        applicant,
        proposer,
        contract
    } = props

    const {
      contractId
    } = useParams()

   
  

    useEffect(
        () => {
         

          async function fetchData() {
         
            // Get Applicant Persona Information
           
            if(proposer){                           
                  const thisPersona = new Persona()
                  let result = await thisPersona.getPersona(proposer)
                      if(result){
                        result.avatar ? setProposerAvatar(result.avatar) : setProposerAvatar(imageName)
                        result.name ? setProposerName(result.name) : setProposerName('')
                      }
            }
            
            if(wallet){
              const daoContract = await dao.initDaoContract(wallet.account(), contractId)
              let proposal = await daoContract.getProposal({proposalId: parseInt(opportunityId)})
              let thisStatus = getStatus(proposal.f)
              setProposalStatus(thisStatus)
            }
            // Set Existing Proposal Data       
            if(curDaoIdx){
              let propResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
          
              if(propResult) {
                let i = 0
                while (i < propResult.opportunities.length){
                  if(propResult.opportunities[i].opportunityId == opportunityId){
                    propResult.opportunities[i].title ? setTitle(propResult.opportunities[i].title) : setTitle('')
                    propResult.opportunities[i].details ? setDetails(DOMPurify.sanitize(propResult.opportunities[i].details)) : setDetails('')
                    propResult.opportunities[i].reward ? setReward(propResult.opportunities[i].reward) : setReward('')
                    propResult.opportunities[i].category ? setCategory(propResult.opportunities[i].category) : setCategory('')
                    propResult.opportunities[i].projectName ? setProjectName(propResult.opportunities[i].projectName) : setProjectName('')
                    propResult.opportunities[i].status ? setOpportunityStatus(propResult.opportunities[i].status) : setOpportunityStatus('')
                    propResult.opportunities[i].permission ? setPermission(propResult.opportunities[i].permission) : setPermission('')
                    propResult.opportunities[i].submitDate ? setCreated(propResult.opportunities[i].submitDate) : setCreated('')
                    propResult.opportunities[i].familiarity ? setFamiliarity(propResult.opportunities[i].familiarity) : setFamiliarity('0')
                    if(propResult.opportunities[i].desiredSkillSet ){
                      let skillArray = []
                      skillArray.push(propResult.opportunities[i].desiredSkillSet )
                      console.log('skillarray', skillArray)
                      setDesiredSkillSet(skillArray)
                    }
                    if(propResult.opportunities[i].desiredDeveloperSkillS){
                      let developerSkillSetArray = []
                      developerSkillSetArray.push(propResult.opportunities[i].desiredDeveloperSkillS)
                      setDesiredDeveloperSkillSet(developerSkillSetArray)
                    }
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
                  if(commentResult.comments[j].parent == opportunityId){
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
          
    }, [applicant, proposerAvatar, title, details, proposerName, isUpdated]
    )

    const handleClose = () => {
        handleOpportunityProposalDetailsClickState(false)
        setOpen(false)
    }

    function handleUpdate(property){
      setIsUpdated(property)
    }

    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
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
              <DialogTitle id="form-dialog-title">Opportunity Proposal Details</DialogTitle>
                <DialogContent>
                {details == '' ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>) 
                  : (<>
                   
                      <Grid container alignItems="flex-start" justify="space-between" style={{marginBottom: '30px'}}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                           <Typography variant="h4">{title}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                           <Typography variant="overline">Proposed: {formatDate(created)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                        <Typography variant="overline">Proposer:</Typography>
                          <Chip avatar={<Avatar src={proposerAvatar} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} align="center">
                          <Chip label={proposalStatus == 'Passed' && opportunityStatus ? 'Active' : 'Inactive'} style={{marginRight: '10px'}}/>
                          <Chip color="primary" label={category}/>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{marginBottom: '30px'}}>
                        <Typography variant="overline">Base Reward:</Typography>
                          <Chip label={reward + ' Ⓝ'}/>
                        </Grid>
                        {status == 'Sponsored' ? (
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom: '30px'}}>
                          <Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography>
                        </Grid>
                        ) : null }
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <Card className={classes.card}>
                          <div dangerouslySetInnerHTML={{ __html: details }} />
                          </Card>
                          
                        </Grid>
                      </Grid>
                      <Grid container justify="space-evenly" spacing={1} style={{marginTop:'20px', marginBottom: '20px'}}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Typography variant="h6">Crypto/Blockchain Familiarity: <Rating readOnly value={parseInt(familiarity)} /> </Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className={classes.centered}>
                      <Typography variant="h6">Skills Required</Typography>
                      <TableContainer component={Paper}>
                        <Table className={classes.table} size="small" aria-label="a dense table">
                          <TableHead>
                          
                          </TableHead>
                          <TableBody>
                          {desiredSkillSet && desiredSkillSet.length > 0 ? (
                              
                                  <>
                                  {desiredSkillSet[0].memeCreation ? <TableRow key={1}><TableCell>Meme Creation</TableCell></TableRow>: null}
                                  {desiredSkillSet[0].videoCreation ? <TableRow key={2}><TableCell>Video Creation</TableCell></TableRow>: null}
                                  {desiredSkillSet[0].writing ? <TableRow key={3}><TableCell>Writing</TableCell></TableRow>: null}
                                  {desiredSkillSet[0].design ? <TableRow key={4}><TableCell>Design</TableCell></TableRow>: null}
                                  {desiredSkillSet[0].eventOrganization ? <TableRow key={5}><TableCell>Event Organization</TableCell></TableRow>: null} 
                                  {desiredSkillSet[0].socialMedia ? <TableRow key={6}><TableCell>Social Media</TableCell></TableRow>: null}
                                  {desiredSkillSet[0].marketing ? <TableRow key={7}><TableCell>Marketing</TableCell></TableRow>: null}
                                  {desiredSkillSet[0].translation ? <TableRow key={8}><TableCell>Translation</TableCell></TableRow>: null}
    
                                  </>
                            )
                            : <TableRow key={0}><TableCell>None</TableCell></TableRow>
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className={classes.centered}>
                      <Typography variant="h6">Developer Skills Required</Typography>
                      <TableContainer component={Paper}>
                        <Table className={classes.table} size="small" aria-label="a dense table">
                          <TableHead>
                          
                          </TableHead>
                          <TableBody>
                          {desiredDeveloperSkillSet && desiredDeveloperSkillSet.length > 0 ? (
                             
                                  <>
                                  {desiredDeveloperSkillSet[0].rust ? <TableRow key={1}><TableCell>RUST</TableCell></TableRow>: null}
                                  {desiredDeveloperSkillSet[0].assemblyScript ? <TableRow key={2}><TableCell>AssemblyScript</TableCell></TableRow>: null}
                                  {desiredDeveloperSkillSet[0].javascript ? <TableRow key={3}><TableCell>JavaScript</TableCell></TableRow>: null}
                                  {desiredDeveloperSkillSet[0].typescript ? <TableRow key={4}><TableCell>TypeScript</TableCell></TableRow>: null}
                                  {desiredDeveloperSkillSet[0].solidity ? <TableRow key={5}><TableCell>Solidity</TableCell></TableRow>: null}
                                  {desiredDeveloperSkillSet[0].webDevelopment ? <TableRow key={6}><TableCell>Web Development</TableCell></TableRow>: null}
                                  </>
                                )
                              
                            : <TableRow key={0}><TableCell>None</TableCell></TableRow>
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
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
                    proposalId={opportunityId}
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