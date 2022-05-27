import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'
import MilestoneCard from '../MilestoneCard/MilestoneCard'
import { getProposalStatus, formatDate } from '../../state/near'
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
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'
import Card from '@material-ui/core/Card'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import AttachFileIcon from '@material-ui/icons/AttachFile'

// CSS Styles

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 800,
      minWidth: 325,
      minHeight: 325,
      
    },
    card: {
      margin: 'auto',
      width: '100%',
      marginBottom: '10px'
    },
    paper: {
      width: '100%'
    },
    detailsCard: {
      margin: 'auto',
      width: '100%',
      minWidth: '100%',
      marginBottom: '10px',
      marginTop: '10px',
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
    const logoName = require('../../img/default_logo.png') // default no-logo image

export default function FundingProposalDetails(props) {
    const [open, setOpen] = useState(true)

    const [title, setTitle] = useState()
    const [details, setDetails] = useState()
    const [milestones, setMilestones] = useState([{}])
    const [created, setCreated] = useState()
    const [likes, setLikes] = useState([])
    const [dislikes, setDisLikes] = useState([])
    const [neutrals, setNeutrals] = useState([])

    const [applicantName, setApplicantName] = useState('')
    const [applicantAvatar, setApplicantAvatar] = useState(imageName)
    const [pfpApplicantAvatar, setPfpApplicantAvatar] = useState('')
    const [pfpApplicantLogo, setPfpApplicantLogo] = useState('')
    const [applicantLogo, setApplicantLogo] = useState(logoName)

    const [proposerName, setProposerName] = useState('')
    const [proposerAvatar, setProposerAvatar] = useState(imageName)
    const [pfpProposerLogo, setPfpProposerLogo] = useState('')
    const [pfpProposerAvatar, setPfpProposerAvatar] = useState('')
    const [proposerLogo, setProposerLogo] = useState(logoName)

    const [applicantAccountType, setApplicantAccountType] = useState('')
    const [proposerAccountType, setProposerAccountType] = useState('')

    const [attachedFiles, setAttachedFiles] = useState()

    const [milestonePayouts, setMilestonePayouts] = useState([])
    const [milestoneCancellations, setMilestoneCancellations] = useState([])

    // const [proposalStatus, setProposalStatus] = useState()
  
    const [proposalComments, setProposalComments] = useState([])
    const [finished, setFinished] = useState(false)
  
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserName,
      curUserAvatar,
      pfpCurUserLogo,
      pfpCurUserAvatar,
      curUserLogo,
      appIdx,
      daoFactory,
      didRegistryContract,
      curDaoIdx,
      contract,
      memberStatus,
      isUpdated
    } = state
    
    const {
        handleFundingProposalDetailsClickState,
        proposalId,
        status,
        applicant,
        proposer,
        sponsor,
        proposalStatus
    } = props

    useEffect(
      () => {
       
        async function fetchData() {
          if(isUpdated){}

          // Get Persona Information           
          if(applicant && proposer && appIdx){

            let applicantAccountType
            try{
                applicantAccountType = await didRegistryContract.getType({accountId: applicant})
                setApplicantAccountType(applicantAccountType)
              } catch (err) {
                applicantAccountType = 'none'
                console.log('account not registered, not type avail', err)
            }
            
            // Applicant
            let applicantDid = await ceramic.getDid(applicant, daoFactory, didRegistryContract)
            if(applicantAccountType != 'guild') {
              let result = await appIdx.get('profile', applicantDid)
              console.log('indiv result', result)
              if(result){
                  result.avatar ? setApplicantAvatar(result.avatar) : setApplicantAvatar(imageName)
                  result.name ? setApplicantName(result.name) : setApplicantName('')
                  result.profileNft ? setPfpApplicantAvatar(result.profileNft) : setPfpApplicantAvatar('')
              }
            } else {
                if(applicantAccountType == 'guild'){
                    let result = await appIdx.get('guildProfile', applicantDid)
                    console.log('guild result', result)
                    if(result){
                        result.logo ? setApplicantLogo(result.logo) : setApplicantLogo(logoName)
                        result.name ? setApplicantName(result.name) : setApplicantName('')
                        result.profileNft ? setPfpApplicantLogo(result.profileNft) : setPfpApplicantLogo('')
                    }
                }
            }
            
            let proposerAccountType
            try{
                proposerAccountType = await didRegistryContract.getType({accountId: proposer})
                setProposerAccountType(proposerAccountType)
              } catch (err) {
                proposerAccountType = 'none'
                console.log('account not registered, not type avail', err)
            }
            // Proposer
            let proposerDid = await ceramic.getDid(proposer, daoFactory, didRegistryContract)
            if(proposerAccountType != 'guild') {
              let result = await appIdx.get('profile', proposerDid)
              console.log('indiv result', result)
              if(result){
                  result.avatar ? setProposerAvatar(result.avatar) : setProposerAvatar(imageName)
                  result.name ? setProposerName(result.name) : setProposerName('')
                  result.profileNft ? setPfpProposerAvatar(result.profileNft) : setPfpProposerAvatar('')
              }
            } else {
                if(proposerAccountType == 'guild'){
                    let result = await appIdx.get('guildProfile', proposerDid)
                    console.log('guild result', result)
                    if(result){
                        result.logo ? setProposerLogo(result.logo) : setProposerLogo(logoName)
                        result.name ? setProposerName(result.name) : setProposerName('')
                        result.profileNft ? setPfpProposerLogo(result.profileNft) : setPfpProposerLogo('')
                    }
                }
            }
          }
        }

        let mounted = true
        if(mounted){
          fetchData()
              .then((res) => {
              
              })
        return () => mounted = false
        }
        
  }, [isUpdated, proposer, applicant, appIdx]
  )

    useEffect(
        () => {
  
          async function fetchData() {

            // Set Existing Proposal Data       
            if(curDaoIdx && contract){
              let propResult = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
                    propResult.proposals[i].title ? setTitle(propResult.proposals[i].title) : setTitle('')
                    propResult.proposals[i].details ? setDetails(propResult.proposals[i].details) : setDetails('')
                    propResult.proposals[i].attachedFiles ? setAttachedFiles(propResult.proposals[i].attachedFiles) : setAttachedFiles([{}])
                    propResult.proposals[i].milestones ? setMilestones(propResult.proposals[i].milestones) : setMilestones([{}])
                    propResult.proposals[i].submitDate ? setCreated(propResult.proposals[i].submitDate) : setCreated()
                    propResult.proposals[i].likes ? setLikes(propResult.proposals[i].likes.length) : setLikes(0)
                    propResult.proposals[i].dislikes ? setDisLikes(propResult.proposals[i].dislikes.length) : setDisLikes(0)
                    propResult.proposals[i].neutrals ? setNeutrals(propResult.proposals[i].neutrals.length) : setNeutrals(0)
            
                    break
                  }
                  i++
                }
              }
              
              try{
                let oppResult = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
                console.log('oppResult', oppResult)
                let confirmedMilestonePayouts = []
                let t = 0
              while (t < oppResult.proposals.length){
                    let z = 0
                    while(z < oppResult.proposals[t].referenceIds.length){                 
                      if(oppResult.proposals[t].referenceIds[0].keyName == 'proposal' && oppResult.proposals[t].referenceIds[0].valueSetting == proposalId ){
                        let payoutProposalId = oppResult.proposals[t].proposalId
                        let currentProposal = await contract.getProposal({proposalId: parseInt(payoutProposalId)})
                        console.log('proposalId', currentProposal)
                        let status = getStatus(currentProposal.flags)
                        console.log('status', status)             
                        if (status == 'Passed'){
                          confirmedMilestonePayouts.push(oppResult.proposals[t].referenceIds[1].valueSetting)
                          setMilestonePayouts(confirmedMilestonePayouts)                 
                        }
                      }
                    z++
                    }
                t++
                }
              } catch (err) {
                console.log('problem retrieving payout details', err)
              }
              try{
                let oppResult = await curDaoIdx.get('cancelCommitmentProposalDetails', curDaoIdx.id)
                console.log('cancel oppResult', oppResult)
                let confirmedMilestoneCancellations = []
                let t = 0
                while (t < oppResult.proposals.length){
                    let z = 0
                    while(z < oppResult.proposals[t].referenceIds.length-1){                 
                      if(oppResult.proposals[t].referenceIds[0].keyName == 'proposal' && oppResult.proposals[t].referenceIds[0].valueSetting == proposalId ){
                        let cancelledProposalId = oppResult.proposals[t].proposalId
                        let currentProposal = await contract.getProposal({proposalId: parseInt(cancelledProposalId)})
                        let status = getProposalStatus(currentProposal.flags)                    
                        if (status == 'Passed'){
                          confirmedMilestoneCancellations.push(oppResult.proposals[t].referenceIds[1].valueSetting)
                          setMilestoneCancellations(confirmedMilestoneCancellations)                     
                        }
                      }
                    z++
                    }
                t++
                }
              } catch (err) {
                console.log('problem retrieving cancel commitment details', err)
              }
            }
            console.log('milestone cancellations', milestoneCancellations)

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
          
    }, [curDaoIdx, contract, isUpdated]
    )

    const handleClose = () => {
        handleFundingProposalDetailsClickState(false)
        setOpen(false)
    }

    let Milestones
    if(milestones && milestones.length > 0){
      Milestones = milestones.map((element, index) => {
        console.log('element', element)
        console.log('milestone payouts', milestonePayouts)
        let i = 0
        let paid = false
        while (i < milestonePayouts.length){
          if (element.id == milestonePayouts[i]){
            paid = true
            break
          }
          i++
        }
        console.log('paid', paid)
        let j = 0
        let cancelled
        while (j < milestoneCancellations.length){
          if (element.id == parseInt(milestoneCancellations[j])){
            cancelled = true
            break
          }
          j++
        }

        if(element.title=='' && element.deadline =='' && element.payout == '0' && element.briefDescription==''){
          return null
        } else {
        return (
          <MilestoneCard 
            key={element.id}
            id={element.id}
            name={element.title}
            deadline={element.deadline}
            payout={element.payout}
            description={element.briefDescription}
            proposalId={proposalId}
            proposalStatus={proposalStatus}
            applicant={applicant}
            paid={paid}
            cancelled={cancelled}
            form={'details'}
          />
        )
        }
      })
    }

    let Files
    if(attachedFiles && attachedFiles.length > 0){
      Files = attachedFiles.map((element, index) => {
        console.log('attachedfiles', attachedFiles)
        console.log('element', element)
        if(element.hash==''){
          return null
        } else {
        return (
          <a href={element.hash} target="_blank">
            <ListItem button key={element.id}>
              <ListItemIcon><AttachFileIcon /></ListItemIcon>
              <ListItemText primary={element.name} />
            </ListItem>
          </a>
         
        )
        }
      })
    }
      

    let Comments;
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
              <DialogTitle id="form-dialog-title">Funding Commitment Details</DialogTitle>
                <DialogContent>
                {details == '' ? (
                  <DialogContentText style={{marginBottom: 10}}>
                  This proposal has no details yet.
                  </DialogContentText>
                ):(<>
                  <Grid container alignItems="flex-start" justifyContent="space-between" style={{marginBottom: '30px'}}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                       <Typography variant="h4" style={{marginBottom: '10px'}}>{title}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                      <Typography variant="overline">Proposed: {created ? formatDate(created) : null}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                      by: 
                      {proposerAccountType != 'guild' ?
                        <Chip avatar={<Avatar src={pfpProposerAvatar != imageName && pfpProposerAvatar != '' ? pfpProposerAvatar : proposerAvatar} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                      :
                        <Chip avatar={<Avatar src={pfpProposerLogo != logoName && pfpProposerLogo != '' ? pfpProposerLogo : proposerLogo} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                      }
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

                    <Grid container spacing={1} style={{width: '100%'}}>
                    <Typography variant="h6" style={{marginBottom: '10px'}}>Completion Plan</Typography>
                      <Paper className={classes.paper} >
                      <Grid container justifyContent="flex-start" alignItems="center" spacing={1}>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} align="left" >
                          <Typography variant="body2">Milestone</Typography>
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="left" >
                          <Typography variant="body2">Desc</Typography>
                        </Grid>
                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="left" >
                          <Typography variant="body2">Deadline</Typography>
                        </Grid>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} align="left">
                          <Typography variant="body2" align="center">Payout</Typography>
                        </Grid>
                      </Grid>
                    
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          {Milestones}
                      </Grid>
                      </Paper>
                    </Grid>
                  
                    {attachedFiles && attachedFiles.length > 0 ? (
                      <Grid container spacing={1} style={{width: '100%'}}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <Paper style={{marginTop:'20px', padding: '10px'}}>
                            <Typography variant="h6" style={{marginTop: '20px', marginBottom: '20px'}}>Attached Files</Typography>
                            <List>
                              {Files}
                            </List>
                          </Paper>
                        </Grid>
                      </Grid>
                    ): null }
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
              <Typography className={classes.heading}>Comments</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Grid container spacing={1}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  {Comments}
              </Grid>
              {status != 'Passed' && status != 'Not Passed' && memberStatus ? (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Typography variant="h5" style={{marginLeft: '10px'}}>New Comment</Typography>
                  <CommentForm
                    reply={false}
                    proposalApplicant={applicant}
                    avatar={pfpCurUserAvatar ? pfpCurUserAvatar : curUserAvatar}
                    logo={pfpCurUserLogo ? pfpCurUserLogo : curUserLogo}
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