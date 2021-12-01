import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'
import FundingProposal from '../FundingProposal/fundingProposal'
import MemberProposal from '../MemberProposal/memberProposal'
import Persona from '@aluhning/get-personas-js'
import { dao } from '../../utils/dao'
import { getStatus, formatDate } from '../../state/near'
import { ceramic } from '../../utils/ceramic'
import * as nearAPI from 'near-api-js'
import { formatNearAmount } from 'near-api-js/lib/utils/format'

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
import Rating from '@material-ui/lab/Rating'
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

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function OpportunityProposalDetails(props) {
    const [open, setOpen] = useState(true)

    const [applicantAvatar, setApplicantAvatar] = useState()
    const [applicantName, setApplicantName] = useState()

    const [proposerAvatar, setProposerAvatar] = useState()
    const [proposerName, setProposerName] = useState()

    const [curUserAvatar, setCurUserAvatar] = useState()
    const [curUserName, setCurUserName] = useState()
   
    const [title, setTitle] = useState('')
    const [details, setDetails] = useState()
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
    const [opportunitySkillSet, setOpportunitySkillSet] = useState([])
    const [thisCurDaoIdx, setThisCurDaoIdx] = useState(props.curDaoIdx)
    const [memberStatus, setMemberStatus] = useState()
    const [active, setActive] = useState(false)
    
    const [memberProposalClicked, setMemberProposalClicked] = useState(false)
    const [fundingProposalClicked, setFundingProposalClicked] = useState(false)

    const [isUpdated, setIsUpdated] = useState(false)
    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)

    const [anchorEl, setAnchorEl] = useState(null)

    const [thisProposalDeposit, setThisProposalDeposit] = useState()

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserIdx,
      wallet,
      near,
      appIdx,
      didRegistryContract,
      currentDaosList
    } = state

    const {
        handleOpportunityProposalDetailsClickState,
        opportunityId,
        status,
        applicant,
        proposer,
        contract,
        sponsor,
        contractId,
        dateValid,
        budget
    } = props
  
    const thisPersona = new Persona()
  
    useEffect(
        () => {
          if(currentDaosList && currentDaosList.length > 0){
            let i = 0
            while (i < currentDaosList.length){
              if(currentDaosList[i].contractId == contractId){
                currentDaosList[i].status == 'active' ? setActive(true) : setActive(false)
                break
              }
              i++
            }
          }

          async function fetchData() {
           
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

            if(contract){
              let propDeposit = await contract.getProposalDeposit()
              setThisProposalDeposit(formatNearAmount(propDeposit))
            }
            
            if(wallet && contractId){
              
              const daoContract = await dao.initDaoContract(wallet.account(), contractId)
              let proposal = await daoContract.getProposal({proposalId: parseInt(opportunityId)})
              let thisStatus = getStatus(proposal.flags)
              setProposalStatus(thisStatus)

              try {
                let thisMemberInfo = await daoContract.getMemberInfo({member: accountId})
            
                let thisMemberStatus = await daoContract.getMemberStatus({member: accountId})
               
                if(thisMemberStatus && thisMemberInfo[0].active){
                  setMemberStatus(true)
                } else {
                  setMemberStatus(false)
                }
              } catch (err) {
                console.log('no member info yet')
              }
            }

            // Set Existing Proposal Data
            let loadCurDaoIdx
            if(!thisCurDaoIdx){
              if(contractId){
                let daoAccount = new nearAPI.Account(near.connection, contractId)
                 
                loadCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, near, didRegistryContract)
              
                setThisCurDaoIdx(loadCurDaoIdx)

              }
            }           

            
            if(thisCurDaoIdx){
              let propResult = await thisCurDaoIdx.get('opportunities', thisCurDaoIdx.id)
          
              console.log('opp details propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.opportunities.length){
                  if(propResult.opportunities[i].opportunityId == opportunityId.toString() && propResult.opportunities[i].contractId == contractId){
                    propResult.opportunities[i].title ? setTitle(propResult.opportunities[i].title) : setTitle('')
                    propResult.opportunities[i].details ? setDetails(propResult.opportunities[i].details) : setDetails()
                    propResult.opportunities[i].reward ? setReward(propResult.opportunities[i].reward) : setReward('')
                    propResult.opportunities[i].category ? setCategory(propResult.opportunities[i].category) : setCategory('')
                    propResult.opportunities[i].projectName ? setProjectName(propResult.opportunities[i].projectName) : setProjectName('')
                    propResult.opportunities[i].status ? setOpportunityStatus(propResult.opportunities[i].status) : setOpportunityStatus('')
                    propResult.opportunities[i].permission ? setPermission(propResult.opportunities[i].permission) : setPermission('')
                    propResult.opportunities[i].submitDate ? setCreated(propResult.opportunities[i].submitDate) : setCreated('')
                    propResult.opportunities[i].familiarity ? setFamiliarity(propResult.opportunities[i].familiarity) : setFamiliarity('0')
                    if(propResult.opportunities[i].desiredSkillSet ){
                      // let skillArray = []
                      // skillArray.push(propResult.opportunities[i].desiredSkillSet )
                   
                      setDesiredSkillSet(propResult.opportunities[i].desiredSkillSet)
                    }
                    if(propResult.opportunities[i].desiredDeveloperSkillSet){
                      // let developerSkillSetArray = []
                      // developerSkillSetArray.push(propResult.opportunities[i].desiredDeveloperSkillSet)
                       setDesiredDeveloperSkillSet(propResult.opportunities[i].desiredDeveloperSkillSet)
                    }
                    if(propResult.opportunities[i].opportunitySkills){
                      // let opportunitySkillSetArray = []
                      // opportunitySkillSetArray.push(propResult.opportunities[i].opportunitySkills)
                    
                      setOpportunitySkillSet(propResult.opportunities[i].opportunitySkills)
                    }
                    break
                  }
                  i++
                }
              }
             
            }

            // Set Existing Proposal Comments      
            if(thisCurDaoIdx){
              let commentResult = await thisCurDaoIdx.get('comments', thisCurDaoIdx.id)
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
          
    }, [applicant, applicantAvatar, curUserAvatar, proposerAvatar, proposer, title, details, proposerName, contractId, thisCurDaoIdx, isUpdated]
    )

    const handleClose = () => {
        handleOpportunityProposalDetailsClickState(false)
        setOpen(false)
    }

    function handleUpdate(property){
      setIsUpdated(property)
    }

    const handleMemberProposalClick = () => {
      handleExpanded()
      handleMemberProposalClickState(true)
    }

    function handleExpanded() {
      setAnchorEl(null)
    }

    function handleMemberProposalClickState(property) {
      setMemberProposalClicked(property)
    }

    const handleFundingProposalClick = () => {
      handleExpanded()
      setFundingProposalClicked(true)
    }

    function handleFundingProposalClickState(property) {
      setFundingProposalClicked(property)
    }

    let Comments
    let author = ''
    let preview = ''
    let color = 'white'
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
                      <Typography style={{marginTop: 10}}>
                      In reply to {author}{preview}
                      </Typography>: null}
                    <CommentDetails
                        proposalId={opportunityId}
                        proposalApplicant={applicant}
                        accountId={accountId}
                        handleUpdate={handleUpdate}
                        curDaoIdx={thisCurDaoIdx}
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
           
         
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            {finished ? (<>
              <DialogTitle id="form-dialog-title">Opportunity Proposal Details</DialogTitle>
              
                <DialogContent>
                {!details ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>) 
                  : (<>
                      <Grid container alignItems="flex-start" justifyContent="space-between" style={{marginBottom: '30px'}}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                           <Typography variant="h4">{title}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                           <Typography variant="h6">{projectName}</Typography>
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
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '20px'}}>
                          <Card className={classes.card}>
                          <div dangerouslySetInnerHTML={{ __html: details }} />
                          </Card>
                          
                        </Grid>
                      </Grid>
                      <Grid container justifyContent="space-evenly" spacing={1} style={{marginTop:'20px', marginBottom: '20px'}}>
                     
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className={classes.centered}>
                      <Typography variant="h6">General Skills Required</Typography>
                      <TableContainer component={Paper}>
                        <Table className={classes.table} size="small" aria-label="a dense table">
                          <TableHead>
                          
                          </TableHead>
                          <TableBody>
                          {desiredSkillSet ?
                            Object.entries(desiredSkillSet).map(([key, value]) => {
                                if(value){
                                  return(
                                    <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    </TableRow>
                                  )
                                }
                            })
                            : null
                          }
                          
                          </TableBody>
                        </Table>
                      </TableContainer>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className={classes.centered}>
                      <Typography variant="h6">Specific Skills</Typography>
                      <TableContainer component={Paper}>
                        <Table className={classes.table} size="small" aria-label="a dense table">
                          <TableHead>
                          
                          </TableHead>
                          <TableBody>
                          
                          {desiredDeveloperSkillSet ?
                            Object.entries(desiredDeveloperSkillSet).map(([key, value]) => {
                                if(value){
                                  return(
                                    
                                    <TableRow key={key}>
                                      <TableCell>{key}</TableCell>
                                    </TableRow>
                                    
                                  )
                                }
                            })
                            : null
                          }
                          {opportunitySkillSet && opportunitySkillSet.length > 0 ?
                          
                              opportunitySkillSet.map((values, index) => {
                                
                                  return (
                                    <TableRow key={values.name}>
                                      <TableCell>{values.name}</TableCell>
                                    </TableRow>
                                  )
                              
                            })
                            : null
                          }
                          
                          </TableBody>
                        </Table>
                      </TableContainer>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Typography variant="overline">Level of crypto/blockchain familiarity: <Rating readOnly value={parseInt(familiarity)} /> </Typography>
                      </Grid>
                      </Grid>
                  </>)}
                </DialogContent>
              <DialogActions>

              {status == 'Passed' ? (
                memberStatus ? (
                  dateValid ? (  
                    budget > 0 ? (
                      <>
                      <Button 
                        color="primary" 
                        onClick={handleFundingProposalClick}>
                          Accept
                      </Button>
                      </>
                    ) : 
                      <>
                      <Button 
                        color="primary" 
                        disabled>
                          Out of Budget
                      </Button>
                      </>            
                  ) :
                    <>
                    <Button 
                      color="primary" 
                      disabled>
                        Expired
                    </Button>
                    </>
                ) :
                  <>
                  <Button 
                    color="primary" 
                    onClick={handleMemberProposalClick}>
                      Join Community
                  </Button>
                  </>
              ) : null }

                  <Button onClick={handleClose} color="primary">
                    Close
                  </Button>
                  </DialogActions>
                  <Divider style={{marginBottom: 10}}/>
                 
              {memberStatus ? (
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
                    reply={false}
                    proposalApplicant={applicant}
                    avatar={curUserAvatar}
                    name={curUserName}
                    proposalId={opportunityId}
                    accountId={accountId}
                    contract={contract}
                    handleUpdate={handleUpdate}
                    curDaoIdx={thisCurDaoIdx}
                  />
              </Grid>
              </Grid>
              </AccordionDetails>
              </Accordion>
              ) : null }
              
            </>)
            : (
              <div style={{minWidth: '150px', minHeight: '150px', margin: 'auto'}}>
              <CircularProgress style={{position: 'fixed', top: '50%', left: '50%', marginLeft:'-20px', marginTop: '-20px'}}/>
              </div>
            )}
              
              {fundingProposalClicked ? <FundingProposal
                contractId={contractId}
                handleFundingProposalClickState={handleFundingProposalClickState}
                state={state}
                depositToken={'Ⓝ'}
                proposalDeposit={thisProposalDeposit}
                tokenName={'Ⓝ'}
                accountId={accountId} 
               
                /> : null }
      
              {memberProposalClicked ? <MemberProposal
                contractId={contractId}
                state={state}
                depositToken={'Ⓝ'}
                proposalDeposit={thisProposalDeposit}
                handleMemberProposalClickState={handleMemberProposalClickState} 
                accountId={accountId} 
          
                /> : null }
              
            </Dialog>
            
           
              
         
        )
}