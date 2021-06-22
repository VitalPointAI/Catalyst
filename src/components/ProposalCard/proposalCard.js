import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { dao } from '../../utils/dao'
import { formatNearAmount, explorerUrl } from '../../state/near'
import Persona from '@aluhning/get-personas-js'

import EditMemberProposalForm from '../EditProposal/editMemberProposal'
import MemberProposalDetails from '../ProposalDetails/memberProposalDetails'

import EditFundingProposalForm from '../EditProposal/editFundingProposal'
import FundingProposalDetails from '../ProposalDetails/fundingProposalDetails'

import EditTributeProposalForm from '../EditProposal/editTributeProposal'
import TributeProposalDetails from '../ProposalDetails/tributeProposalDetails'

import EditPayoutProposalForm from '../EditProposal/editPayoutProposal'
import PayoutProposalDetails from '../ProposalDetails/payoutProposalDetails'

import EditOpportunityProposalForm from '../EditProposal/editOpportunityProposal'
import OpportunityProposalDetails from '../ProposalDetails/opportunityProposalDetails'

// Material UI Components
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red, green } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import SendIcon from '@material-ui/icons/Send'
import Badge from '@material-ui/core/Badge'
import Grid from '@material-ui/core/Grid'
import LinearProgress from '@material-ui/core/LinearProgress'
import CircularProgress from '@material-ui/core/CircularProgress'
import PanToolIcon from '@material-ui/icons/PanTool'
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'
import Tooltip from '@material-ui/core/Tooltip'
import ExploreIcon from '@material-ui/icons/Explore'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    divider: {
      marginTop: '5px',
      marginBottom: '10px'
    },
    card: {
      marginTop: '10px',
      maxWidth: '250px',
      minWidth: '250px'
    },
    votes: {
      paddingLeft: 0,
      paddingRight: '10px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      float: 'left'
    },
    large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
      float: 'left'
    },
    greenButton: {
      backgroundColor: '#43a047'
    }
  }));

  const StyledBadge = withStyles((theme) => ({
    badge: {
      right: 13,
      top: 0,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }))(Badge)
 
  const StyledBadgeProposer = withStyles((theme) => ({
    badge: {
      backgroundColor: '#f9f1f1',
   //   right: -30,
   //   top: 25,
      border: `1px solid #000000`,
      padding: '0 4px',
    },
  }))(Badge);

  const defaultProps = {
    color: 'primary',
    children: <Typography />,
  }

  const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function ProposalCard(props) {

    const [applicantName, setApplicantName] = useState('')
    const [applicantAvatar, setApplicantAvatar] = useState(imageName)
    const [intro, setIntro] = useState()

    const [proposerAvatar, setProposerAvatar] = useState(imageName)
    const [proposerName, setProposerName] = useState('')

    const[title, setTitle] = useState('Funding Proposal Details')
    const [tributeTitle, setTributeTitle] = useState('Tribute Proposal Details')

    const[payoutTitle, setPayoutTitle] = useState('Payout Details')

    const [proposals, setProposals] = useState()

    const [isUpdated, setIsUpdated] = useState(false)

    const[hasVoted, setHasVoted] = useState(props.voted)
    const[isDone, setIsDone] = useState(props.done)
    
    
    const[curPersonaIdx, setCurPersonaIdx] = useState()

    const [totalMembers, setTotalMembers] = useState()
   
    const [editMemberProposalDetailsClicked, setEditMemberProposalDetailsClicked] = useState(false)
    const [memberProposalDetailsClicked, setMemberProposalDetailsClicked] = useState(false)

    const [editFundingProposalDetailsClicked, setEditFundingProposalDetailsClicked] = useState(false)
    const [fundingProposalDetailsClicked, setFundingProposalDetailsClicked] = useState(false)

    const [editTributeProposalDetailsClicked, setEditTributeProposalDetailsClicked] = useState(false)
    const [tributeProposalDetailsClicked, setTributeProposalDetailsClicked] = useState(false)

    const [editPayoutProposalDetailsClicked, setEditPayoutProposalDetailsClicked] = useState(false)
    const [payoutProposalDetailsClicked, setPayoutProposalDetailsClicked] = useState(false)

    const [editOpportunityProposalDetailsClicked, setEditOpportunityProposalDetailsClicked] = useState(false)
    const [opportunityProposalDetailsClicked, setOpportunityProposalDetailsClicked] = useState(false)

    const [nextToFinalize, setNextToFinalize] = useState()

    const [anchorEl, setAnchorEl] = useState(null)
    
    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near,
      appIdx,
      accountId,
      wallet
    } = state

    const {
      contractId
    } = useParams()

    const classes = useStyles();

    const { applicant, created, noVotes, yesVotes, proposalType, proposer, requestId, tribute, vote, loot, shares, status, funding,
        isVotingPeriod, isGracePeriod, voted, gracePeriod, votingPeriod, currentPeriod, periodDuration, cancelFinish, sponsor, done,
        cancelTransactionHash,
        submitTransactionHash,
        processTransactionHash,
        sponsorTransactionHash,
        startingPeriod,
        handleSponsorConfirmationClick,
        handleCancelAction,
        handleVotingAction,
        handleProcessAction,
        handleRageQuitClick,
        curDaoIdx,
        daoDid,
        memberStatus,
        contract,
        proposalDeposit,
        summoner,
        queueList
    } = props

    useEffect(
        () => {
         

          async function fetchData() {
         
            // Get Applicant Persona Information
            let thisCurPersonaIdx
           
            if(applicant){
              const thisPersona = new Persona()
              let result = await thisPersona.getPersona(applicant)
                  if(result){
                    result.avatar ? setApplicantAvatar(result.avatar) : setApplicantAvatar(imageName)
                    result.name ? setApplicantName(result.name) : setApplicantName('')
                  }
              let resultb = await thisPersona.getPersona(proposer)
              if(resultb){
                resultb.avatar ? setProposerAvatar(resultb.avatar) : setProposerAvatar(imageName)
                resultb.name ? setProposerName(resultb.name) : setProposerName('')
              }
             }
            
            

            // Set Existing Member Proposal Data       
            if(curDaoIdx){
              let propResult = await curDaoIdx.get('memberProposalDetails', curDaoIdx.id)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == requestId){
                    propResult.proposals[i].intro ? setIntro(propResult.proposals[i].intro) : setIntro('')
                    break
                  }
                  i++
                }
              }
            }
            
            // Set Existing Funding Proposal Data       
            if(curDaoIdx){
              let propResult = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == requestId){
                    propResult.proposals[i].title ? setTitle(propResult.proposals[i].title) : setTitle('')
                    break
                  }
                  i++
                }
              }
            }

            // Set Existing Tribute Proposal Data       
            if(curDaoIdx){
              let propResult = await curDaoIdx.get('tributeProposalDetails', curDaoIdx.id)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == requestId){
                    propResult.proposals[i].title ? setTributeTitle(propResult.proposals[i].title) : setTributeTitle('')
                    break
                  }
                  i++
                }
              }
            }

            // Set Existing Opportunity Proposal Data       
            if(curDaoIdx){
              let propResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.opportunities.length){
                  if(propResult.opportunities[i].opportunityId == requestId){
                    propResult.opportunities[i].title ? setTitle(propResult.opportunities[i].title) : setTitle('')
                    break
                  }
                  i++
                }
              }
            }

            // Set Existing Payout Proposal Data       
             if(curDaoIdx){
              let propResult = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
              console.log('payout propresult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == requestId){
                    propResult.proposals[i].title ? setPayoutTitle(propResult.proposals[i].title) : setPayoutTitle('')
                    break
                  }
                  i++
                }
              }
            }

            if(wallet){
              let daoContract = await dao.initDaoContract(wallet.account(), contractId)
              let members = await daoContract.getTotalMembers()
              setTotalMembers(members)
            }

            setNextToFinalize(queueList[0].requestId)
                    
            return true  
          }

          fetchData()
            .then((res) => {

            })
          
    }, [isUpdated, queueList, curDaoIdx]
    )

    function handleUpdate(property){
      setIsUpdated(property)
    }
  
    // Member Proposal Functions

    const handleEditMemberProposalDetailsClick = () => {
      handleExpanded()
      handleEditMemberProposalDetailsClickState(true)
    }
  
    function handleEditMemberProposalDetailsClickState(property){
      setEditMemberProposalDetailsClicked(property)
    }

    const handleMemberProposalDetailsClick = () => {
      handleExpanded()
      handleMemberProposalDetailsClickState(true)
    }
  
    function handleMemberProposalDetailsClickState(property){
      setMemberProposalDetailsClicked(property)
    }

    // Funding Commitment Proposal Functions

    const handleEditFundingProposalDetailsClick = () => {
      handleExpanded()
      handleEditFundingProposalDetailsClickState(true)
    }
  
    function handleEditFundingProposalDetailsClickState(property){
      setEditFundingProposalDetailsClicked(property)
    }

    const handleFundingProposalDetailsClick = () => {
      handleExpanded()
      handleFundingProposalDetailsClickState(true)
    }
  
    function handleFundingProposalDetailsClickState(property){
      setFundingProposalDetailsClicked(property)
    }

    // Tribute Proposal Functions

    const handleEditTributeProposalDetailsClick = () => {
      handleExpanded()
      handleEditTributeProposalDetailsClickState(true)
    }
  
    function handleEditTributeProposalDetailsClickState(property){
      setEditTributeProposalDetailsClicked(property)
    }

    const handleTributeProposalDetailsClick = () => {
      handleExpanded()
      handleTributeProposalDetailsClickState(true)
    }
  
    function handleTributeProposalDetailsClickState(property){
      setTributeProposalDetailsClicked(property)
    }

     // Opportunity Proposal Functions

     const handleEditOpportunityProposalDetailsClick = () => {
      handleExpanded()
      handleEditOpportunityProposalDetailsClickState(true)
    }
  
    function handleEditOpportunityProposalDetailsClickState(property){
      setEditOpportunityProposalDetailsClicked(property)
    }

    const handleOpportunityProposalDetailsClick = () => {
      handleExpanded()
      handleOpportunityProposalDetailsClickState(true)
    }
  
    function handleOpportunityProposalDetailsClickState(property){
      setOpportunityProposalDetailsClicked(property)
    }

    // Payout Proposal Functions

    const handleEditPayoutProposalDetailsClick = () => {
      handleExpanded()
      handleEditPayoutProposalDetailsClickState(true)
    }
  
    function handleEditPayoutProposalDetailsClickState(property){
      setEditPayoutProposalDetailsClicked(property)
    }

    const handlePayoutProposalDetailsClick = () => {
      handleExpanded()
      handlePayoutProposalDetailsClickState(true)
    }
  
    function handlePayoutProposalDetailsClickState(property){
      setPayoutProposalDetailsClicked(property)
    }
  
    function handleExpanded() {
      setAnchorEl(null)
    }

    return(
        <>
        <Card raised={true} className={classes.card}>          

          {proposalType === 'Member' ? (
            <> 
          
            {status=='Submitted' ? (<>
            <Tooltip title="See transaction on explorer.">
              <a href={explorerUrl + '/transactions/' + submitTransactionHash}>
                <IconButton aria-label="delete" style={{float: 'left'}}>
                  <ExploreIcon />
                </IconButton>
              </a>
              </Tooltip>
              </>
            ) : null }
            {status=='Sponsored' ? (<>
              <Tooltip title="See transaction on explorer.">
                <a href={explorerUrl + '/transactions/' + sponsorTransactionHash}>
                  <IconButton aria-label="delete" style={{float: 'left'}}>
                    <ExploreIcon />
                  </IconButton>
                </a>
                </Tooltip>
                </>
              ) : null }
            {status=='Processed' ? (<>
              <Tooltip title="See transaction on explorer.">
                <a href={explorerUrl + '/transactions/' + processTransactionHash}>
                  <IconButton aria-label="delete" style={{float: 'left'}}>
                    <ExploreIcon />
                  </IconButton>
                </a>
                </Tooltip>
                </>
              ) : null }
            {status=='Cancelled' ? (<>
              <Tooltip title="See transaction on explorer.">
                <a href={explorerUrl + '/transactions/' + cancelTransactionHash}>
                  <IconButton aria-label="delete" style={{float: 'left'}}>
                    <ExploreIcon />
                  </IconButton>
                </a>
                </Tooltip>
                </>
              ) : null }
              <Typography variant="h6" align="left" style={{float: 'left', fontSize: '90%', marginLeft: '5px', marginTop: '12px'}} color="textSecondary">{proposalType}Proposal</Typography>
              <Typography variant="h6" align="right" style={{float: 'right', fontSize: '90%', marginRight: '5px'}} color="textSecondary">#{requestId}</Typography>
            <div style={{clear: 'both'}}></div>
            <Grid container justify="space-evenly" spacing={1} style={{marginTop:'20px'}}>
              <Button
              color="primary"
              onClick={handleMemberProposalDetailsClick}
              >
                <Avatar src={applicantAvatar} className={classes.large}  />
                <center><Chip label={applicantName != '' ? applicantName : applicant} style={{marginBottom: '3px'}}/><br></br>
                <Chip variant="outlined" label={applicant} style={{fontSize: '60%'}}/></center>
              </Button>
            </Grid>
            <CardHeader
               style={{display: 'block'}}
               align="center"
              
               subheader={
                 <Grid container alignItems="center" justify="space-evenly">
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                      <Typography variant="overline">Proposed: {created}</Typography>
                   </Grid>
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Typography variant="overline">By:</Typography>
                    <Chip avatar={<Avatar src={proposerAvatar} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                   </Grid>
                   {status == 'Sponsored' ? (
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                     <Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography>
                   </Grid>
                   ) : null }
                 </Grid>
                 }
             /></>
           ) : null }

          {proposalType === 'Commitment' ? (
            <> 
            
            {status=='Submitted' ? (<>
              <Tooltip title="See transaction on explorer.">
                <a href={explorerUrl + '/transactions/' + submitTransactionHash}>
                  <IconButton aria-label="delete" style={{float: 'left'}}>
                    <ExploreIcon />
                  </IconButton>
                </a>
                </Tooltip>
                </>
              ) : null }
              {status=='Sponsored' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + sponsorTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Processed' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + processTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Cancelled' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + cancelTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
            <Typography variant="h6" align="left" style={{float: 'left', fontSize: '90%', marginLeft: '5px', marginTop: '12px'}} color="textSecondary">Funding {proposalType}</Typography>
            <Typography variant="h6" align="right" style={{float: 'right', fontSize: '90%', marginRight: '5px'}} color="textSecondary">#{requestId}</Typography>
            <div style={{clear: 'both'}}></div>
            <CardHeader
               style={{display: 'block'}}
               align="center"
               title={
                 <>
                 <Button 
                  color="primary"
                  style={{fontWeight: '800', fontSize: '110%', lineHeight: '1.1em'}}
                  onClick={handleFundingProposalDetailsClick}
                 >
                  {title ? title.replace(/(<([^>]+)>)/gi, ""): 'No Details Yet.'}
                 </Button>
                 </>
                }
               subheader={
                 <Grid container alignItems="center" justify="space-evenly">
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                      <Typography variant="overline">Proposed: {created}</Typography>
                   </Grid>
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                   <Typography variant="overline">By:</Typography>
                   <Chip avatar={<Avatar src={proposerAvatar} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                   </Grid>
                   {status == 'Sponsored' ? (
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                     <Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography>
                   </Grid>
                   ) : null }
                 </Grid>
                 }
             /></>
           ) : null }

           {proposalType === 'Tribute' ? (
            <> 
            
            {status=='Submitted' ? (<>
              <Tooltip title="See transaction on explorer.">
                <a href={explorerUrl + '/transactions/' + submitTransactionHash}>
                  <IconButton aria-label="delete" style={{float: 'left'}}>
                    <ExploreIcon />
                  </IconButton>
                </a>
                </Tooltip>
                </>
              ) : null }
              {status=='Sponsored' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + sponsorTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Processed' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + processTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Cancelled' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + cancelTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
            <Typography variant="h6" align="left" style={{float: 'left', fontSize: '90%', marginLeft: '5px', marginTop: '12px'}} color="textSecondary">{proposalType} Proposal</Typography>
            <Typography variant="h6" align="right" style={{float: 'right', fontSize: '90%', marginRight: '5px'}} color="textSecondary">#{requestId}</Typography>
            <div style={{clear: 'both'}}></div>
            <CardHeader
               style={{display: 'block'}}
               align="center"
               title={
                 <>
                 <Button 
                  color="primary"
                  style={{fontWeight: '800', fontSize: '110%', lineHeight: '1.1em'}}
                  onClick={handleTributeProposalDetailsClick}
                 >
                  {tributeTitle ? tributeTitle.replace(/(<([^>]+)>)/gi, ""): 'No Details Yet.'}
                 </Button>
                 </>
                }
               subheader={
                 <Grid container alignItems="center" justify="space-evenly">
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                      <Typography variant="overline">Proposed: {created}</Typography>
                   </Grid>
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                   <Typography variant="overline">By:</Typography>
                   <Chip avatar={<Avatar src={proposerAvatar} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                   </Grid>
                   {status == 'Sponsored' ? (
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                     <Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography>
                   </Grid>
                   ) : null }
                 </Grid>
                 }
             /></>
           ) : null }

           {proposalType === 'Opportunity' ? (
            <> 
           
            {status=='Submitted' ? (<>
              <Tooltip title="See transaction on explorer.">
                <a href={explorerUrl + '/transactions/' + submitTransactionHash}>
                  <IconButton aria-label="delete" style={{float: 'left'}}>
                    <ExploreIcon />
                  </IconButton>
                </a>
                </Tooltip>
                </>
              ) : null }
              {status=='Sponsored' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + sponsorTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Processed' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + processTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Cancelled' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + cancelTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
                <Typography variant="h6" align="left" style={{float: 'left', fontSize: '90%', marginLeft: '5px', marginTop: '12px'}} color="textSecondary">{proposalType} Proposal</Typography>
                <Typography variant="h6" align="right" style={{float: 'right', fontSize: '90%', marginRight: '5px'}} color="textSecondary">#{requestId}</Typography>
            <div style={{clear: 'both'}}></div>
            <CardHeader
               style={{display: 'block'}}
               align="center"
               title={
                 <>
                 <Button 
                  color="primary"
                  style={{fontWeight: '800', fontSize: '110%', lineHeight: '1.1em'}}
                  onClick={handleOpportunityProposalDetailsClick}
                 >
                  {title ? title.replace(/(<([^>]+)>)/gi, ""): 'No Details Yet.'}
                 </Button>
                 </>
                }
               subheader={
                 <Grid container alignItems="center" justify="space-evenly">
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                      <Typography variant="overline">Proposed: {created}</Typography>
                   </Grid>
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                   <Typography variant="overline">By:</Typography>
                   <Chip avatar={<Avatar src={proposerAvatar} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                   </Grid>
                   {status == 'Sponsored' ? (
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                     <Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography>
                   </Grid>
                   ) : null }
                 </Grid>
                 }
             /></>
           ) : null }

           {proposalType === 'Payout' ? (
            <> 
            
            {status=='Submitted' ? (<>
              <Tooltip title="See transaction on explorer.">
                <a href={explorerUrl + '/transactions/' + submitTransactionHash}>
                  <IconButton aria-label="delete" style={{float: 'left'}}>
                    <ExploreIcon />
                  </IconButton>
                </a>
                </Tooltip>
                </>
              ) : null }
              {status=='Sponsored' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + sponsorTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Processed' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + processTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Cancelled' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + cancelTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              <Typography variant="h6" align="left" style={{float: 'left', fontSize: '90%', marginLeft: '5px', marginTop: '12px'}} color="textSecondary">{proposalType} Proposal</Typography>
            <Typography variant="h6" align="right" style={{float: 'right', fontSize: '90%', marginRight: '5px'}} color="textSecondary">#{requestId}</Typography>
            <div style={{clear: 'both'}}></div>
            <CardHeader
               style={{display: 'block'}}
               align="center"
               title={ <>
                <Button 
                 color="primary"
                 style={{fontWeight: '800', fontSize: '110%', lineHeight: '1.1em'}}
                 onClick={handleFundingProposalDetailsClick}
                >
                 {payoutTitle ? payoutTitle.replace(/(<([^>]+)>)/gi, ""): 'No Details Yet.'}
                </Button>
                </>}
               subheader={
                <><Typography variant="overline">Proposed: {created}</Typography>
                 <Grid container alignItems="center" justify="space-between">
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                    <Typography variant="overline">By:</Typography>
                    <Chip avatar={<Avatar src={proposerAvatar} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                   </Grid> 
                 
                  
                   {status == 'Sponsored' ? (
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                     <Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography>
                   </Grid>
                   ) : null }
                 </Grid></>
                 }
             /></>
           ) : null }


          {proposalType === 'GuildKick' ? (
            <>
            {status=='Submitted' ? (<>
              <Tooltip title="See transaction on explorer.">
                <a href={explorerUrl + '/transactions/' + submitTransactionHash}>
                  <IconButton aria-label="delete" style={{float: 'left'}}>
                    <ExploreIcon />
                  </IconButton>
                </a>
                </Tooltip>
                </>
              ) : null }
              {status=='Sponsored' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + sponsorTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Processed' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + processTransactionHash}>
                    <IconButton aria-label="delete" style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
              {status=='Cancelled' ? (<>
                <Tooltip title="See transaction on explorer.">
                  <a href={explorerUrl + '/transactions/' + cancelTransactionHash}>
                    <IconButton aria-label="delete"style={{float: 'left'}}>
                      <ExploreIcon />
                    </IconButton>
                  </a>
                  </Tooltip>
                  </>
                ) : null }
                <Typography variant="h6" align="center" color="textSecondary">{proposalType} Proposal</Typography>
             <CardHeader
               title={<Chip
                 avatar={<Avatar alt="Member" src="../../../images/default-profile.png" />}
                 label={applicant}
                 variant="outlined"
               />}
               subheader={
                 <Grid container alignItems="center" justify="space-evenly">
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                     <Typography variant="overline">Proposed: {created}</Typography>
                   </Grid>
                   {status == 'Sponsored' ? (
                   <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                     <Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography>
                   </Grid>
                   ) : null }
                 </Grid>
                 }
             /></>
           ) : null }

            <CardContent>
                {console.log('proposalType', proposalType)}
            {proposalType == 'Member' ? (
              <Grid container alignItems="center" justify="space-evenly" style={{marginBottom:'5px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '-20px'}}>
                  <Typography variant="overline">Shares: {shares}</Typography><br></br>
                  <Typography variant="overline">{`Tribute: ${formatNearAmount(tribute)} Ⓝ`}</Typography>
                </Grid>
              </Grid>
            ) : null }

            {proposalType == 'GuildKick' ? (
              <Grid container alignItems="center" justify="space-evenly" style={{marginTop: '-20px', marginBottom:'20px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Typography variant="h6" noWrap={true} style={{border: '1px solid', padding: '2px', textAlign: 'center', fontWeight: '800', color: 'black'}}
                  onClick={(e) => handleMemberProposalDetailsClick(requestId, applicant, status, proposer, proposalType, e)}
                  >{title}</Typography>
                </Grid>  
              </Grid>
            ) : null}

            {proposalType == 'Commitment' ? (
              <Grid container alignItems="center" justify="space-evenly" style={{marginTop: '-20px', marginBottom:'20px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                 
                </Grid>    
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <Typography variant="h6" align="center" style={{marginBottom: '10px'}}>Funding Requested</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Typography variant="h5" align="center">{`${formatNearAmount(funding)} Ⓝ`}</Typography>
                </Grid>
              </Grid>
            ) : null}

            {proposalType == 'Tribute' ? (
              <Grid container alignItems="center" justify="space-evenly" style={{marginBottom:'5px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '-20px'}}>
                  <Typography variant="overline">Shares: {shares}</Typography><br></br>
                  <Typography variant="overline">{`Tribute: ${formatNearAmount(tribute)} Ⓝ`}</Typography>
                </Grid>
              </Grid>
            ) : null }

            {proposalType == 'Payout' ? (
              <Grid container alignItems="center" justify="space-evenly" style={{marginTop: '-20px', marginBottom:'20px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                 
                </Grid>    
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <Typography variant="h6" align="center" style={{marginBottom: '10px'}}>Payout Requested</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Typography variant="h5" align="center">{`${formatNearAmount(funding)} Ⓝ`}</Typography>
                </Grid>
              </Grid>
            ) : null}

            

            <Divider className={classes.divider}/>
            {status == 'Submitted' ? <Typography variant="subtitle2" display="block" align="center">Awaiting Sponsor</Typography> : null}

            </CardContent>
           

              {status == 'Sponsored' && isVotingPeriod && !isGracePeriod ? (
                <Grid container alignItems="center" justify="space-between" spacing={1}>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5} align="left">
                     {done ? ( <StyledBadge badgeContent={yesVotes} color="primary">
                        <IconButton onClick={(e) => handleVotingAction(requestId, 'yes')} disabled={voted}>
                          <ThumbUpIcon fontSize='small' color="primary" />
                        </IconButton>
                      </StyledBadge>
                      ) : <CircularProgress /> }
                  </Grid>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="center">
                    <Typography variant="body2">
                      Current Vote
                    </Typography>
                  </Grid>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5} align="center" >
                  {done ? ( <StyledBadge badgeContent={noVotes} color="secondary">
                        <IconButton onClick={(e) => handleVotingAction(requestId, 'no')} disabled={voted}>
                          <ThumbDownIcon fontSize='small' color="secondary" />
                        </IconButton>
                      </StyledBadge>
                      ) : <CircularProgress /> }
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                    <Typography variant="caption" display="block">Voting Ends in {(((votingPeriod - currentPeriod)+1) * periodDuration / 60).toFixed(2)} minutes</Typography>
                  </Grid>
                </Grid>
              ) : null }

              {status == 'Sponsored' && isGracePeriod && !isVotingPeriod && vote != 'yes' ? (
                <Grid container alignItems="center" justify="space-evenly" spacing={1}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Button
                      variant="contained"
                      color="secondary"
                      align="center"
                      startIcon={<PanToolIcon />}
                      onClick={handleRageQuitClick}
                    >
                    Rage Quit
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                    <Typography variant="caption" display="block" align="center">RageQuit ends in {(((gracePeriod - currentPeriod)+1) * periodDuration / 60).toFixed(2)} {(((gracePeriod - currentPeriod)+1) * periodDuration / 60) > 1 ? 'minutes':'minute'}</Typography>
                  </Grid>
                </Grid>
              ) : null }
              
              {status == 'Sponsored' && status != 'Processed' && status !='Passed' && status != 'Not Passed' && status != 'Cancelled' && currentPeriod > gracePeriod && !isVotingPeriod && !isGracePeriod ? (
                <>
                <Grid container alignItems="center" justify="space-between" spacing={1}>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5} align="left" >
                    <StyledBadge badgeContent={yesVotes} color="primary">
                      <IconButton onClick={(e) => handleVotingAction(requestId, 'yes')} disabled={true}>
                        <ThumbUpIcon fontSize='small' color="primary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2} >
                    <Typography variant="body2">
                      Final Vote
                    </Typography>
                  </Grid>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5} align="center" >
                    <StyledBadge badgeContent={noVotes} color="secondary">
                      <IconButton onClick={(e) => handleVotingAction(requestId, 'no')} disabled={true}>
                        <ThumbDownIcon fontSize='small' color="secondary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                </Grid>
                
                <Grid container alignItems="center" justify="space-evenly" spacing={1}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                  {nextToFinalize == requestId ?
                    <Button
                      variant="contained"
                      className={classes.greenButton}
                      align="center"
                      startIcon={<SendIcon />}
                      onClick={(e) => handleProcessAction(requestId, proposalType)}
                    >
                    Finalize
                    </Button>
                    : null }
                  </Grid>
                </Grid>
                </>
              ) : null }

              {status == 'Passed' || status == 'Not Passed' ? (
                <Grid container alignItems="center" justify="space-between" spacing={0} >
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center" >
                    <StyledBadge badgeContent={yesVotes} color="primary">
                      <IconButton onClick={(e) => handleVotingAction(requestId, 'yes')} disabled={true}>
                        <ThumbUpIcon fontSize='small' color="primary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center" >
                    <Typography variant="body2">
                      {status}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center" >
                    <StyledBadge badgeContent={noVotes} color="secondary">
                      <IconButton onClick={(e) => handleVotingAction(requestId, 'no')} disabled={true}>
                        <ThumbDownIcon fontSize='small' color="secondary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                </Grid>
              ) : null }
               
              
              <Grid container alignItems="center" justify="space-evenly" spacing={1}>

                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  {(accountId != proposer && accountId != applicant && accountId != summoner) && status=='Submitted' && memberStatus == true ? 
                  <><Button 
                      color="primary" 
                      onClick={(e) => handleSponsorConfirmationClick(requestId, proposalType, funding)}
                    >
                    Sponsor
                    </Button>
                  </> : null }
               
                  {(accountId == summoner && totalMembers == 1) && status=='Submitted' && memberStatus == true ? 
                  <><Button 
                      color="primary" 
                      onClick={(e) => handleSponsorConfirmationClick(requestId, proposalType, funding)}
                    >
                    Sponsor
                    </Button>
                  </> : null }
                </Grid>

                <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                </Grid>

              <Grid item xs={8} sm={8} md={8} lg={8} xl={8} align="right">
                {accountId == proposer && status == 'Submitted' ? 
                cancelFinish ? 
                  <><Button color="primary" onClick={() => handleCancelAction(requestId, proposalDeposit, tribute)}>
                    Cancel
                  </Button>
                  {proposalType === 'Member' || proposalType === 'GuildKick' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditMemberProposalDetailsClick}>
                          Edit
                      </Button>
                    </>)
                  : null }
                  {proposalType === 'Commitment' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditFundingProposalDetailsClick}>
                          Edit
                      </Button>
                    </>) : null } 
                  {proposalType === 'Tribute' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditTributeProposalDetailsClick}>
                          Edit
                      </Button>
                    </>) : null } 
                  {proposalType === 'Payout' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditPayoutProposalDetailsClick}>
                          Edit
                      </Button>
                    </>) : null }
                  {proposalType === 'Opportunity' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditOpportunityProposalDetailsClick}>
                          Edit
                      </Button>
                    </>) : null }
                  </>: <LinearProgress /> : null }
              </Grid>
              </Grid>
        </Card>


        {editMemberProposalDetailsClicked ? <EditMemberProposalForm
          state={state}
          handleEditMemberProposalDetailsClickState={handleEditMemberProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          accountId={accountId}
          proposalId={requestId}
          /> : null }

        {editFundingProposalDetailsClicked ? <EditFundingProposalForm
          state={state}
          handleEditFundingProposalDetailsClickState={handleEditFundingProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          proposer={proposer}
          handleUpdate={handleUpdate}
          accountId={accountId}
          proposalId={requestId}
          /> : null }

        {editTributeProposalDetailsClicked ? <EditTributeProposalForm
          state={state}
          handleEditTributeProposalDetailsClickState={handleEditTributeProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          proposer={proposer}
          handleUpdate={handleUpdate}
          accountId={accountId}
          proposalId={requestId}
          /> : null }
        
        {editPayoutProposalDetailsClicked ? <EditPayoutProposalForm
          state={state}
          handleEditPayoutProposalDetailsClickState={handleEditPayoutProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          proposer={proposer}
          handleUpdate={handleUpdate}
          accountId={accountId}
          proposalId={requestId}
          /> : null }

        {editOpportunityProposalDetailsClicked ? <EditOpportunityProposalForm
          state={state}
          handleEditOpportunityProposalDetailsClickState={handleEditOpportunityProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          proposer={proposer}
          handleUpdate={handleUpdate}
          accountId={accountId}
          opportunityId={requestId}
          /> : null }


        {memberProposalDetailsClicked ? <MemberProposalDetails
          proposer={proposer}
          handleMemberProposalDetailsClickState={handleMemberProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          proposalId={requestId}
          /> : null }

        {fundingProposalDetailsClicked ? <FundingProposalDetails
          proposer={proposer}
          handleFundingProposalDetailsClickState={handleFundingProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          proposalId={requestId}
          /> : null }

        {tributeProposalDetailsClicked ? <TributeProposalDetails
          proposer={proposer}
          handleTributeProposalDetailsClickState={handleTributeProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          proposalId={requestId}
          /> : null }

        {payoutProposalDetailsClicked ? <PayoutProposalDetails
          proposer={proposer}
          handlePayoutProposalDetailsClickState={handlePayoutProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          proposalId={requestId}
          /> : null }

        {opportunityProposalDetailsClicked ? <OpportunityProposalDetails
          proposer={proposer}
          handleOpportunityProposalDetailsClickState={handleOpportunityProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          opportunityId={requestId}
          /> : null }

        </>
    )
}