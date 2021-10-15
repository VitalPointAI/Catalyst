import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import {get, set, del} from '../../utils/storage'
import { dao } from '../../utils/dao'
import { explorerUrl, signal } from '../../state/near'
import Persona from '@aluhning/get-personas-js'
import { PROPOSAL_NOTIFICATION} from '../../state/near'
import { formatNearAmount, parseNearAmount } from 'near-api-js/lib/utils/format'
import EditMemberProposalForm from '../EditProposal/editMemberProposal'
import MemberProposalDetails from '../ProposalDetails/memberProposalDetails'

import EditFundingProposalForm from '../EditProposal/editFundingProposal'
import FundingProposalDetails from '../ProposalDetails/fundingProposalDetails'

import EditTributeProposalForm from '../EditProposal/editTributeProposal'
import TributeProposalDetails from '../ProposalDetails/tributeProposalDetails'

import EditPayoutProposalForm from '../EditProposal/editPayoutProposal'
import PayoutProposalDetails from '../ProposalDetails/payoutProposalDetails'

import EditConfigurationProposalForm from '../EditProposal/editConfigurationProposal'
import ConfigurationProposalDetails from '../ProposalDetails/configurationProposalDetails'

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
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import EditIcon from '@material-ui/icons/Edit'


const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    divider: {
      marginTop: '-55px',
      marginBottom: '10px'
    },
    card: {
      marginTop: '10px',
      maxWidth: '250px',
      minWidth: '250px',
      height: '490px',
      position: 'relative',
      margin: 'auto'
    },
    cardAction: {
      display: 'block',
      margin: 0,
      padding: 0,
      
    },
    votes: {
      paddingLeft: 0,
      paddingRight: '10px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    bottom: {
      paddingTop: '20px',
      position: 'absolute',
      bottom: '60px',
     
    },
    bottom2: {
      position: 'absolute',
      bottom: '0px',
      left: '0px',
      width: '100%'
    },
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      float: 'left'
    },
    infoBox: {
      textAlign: 'center',
      width: '100%',
      marginTop: '-20px',
      padding: '5px'
    },
    memberInfoBox: {
      textAlign: 'center',
      width: '100%',
      marginTop: '-60px',
      padding: '5px'
    },
    signals: {
      width: theme.spacing(3),
    },
    large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
      float: 'left'
    },
    greenButton: {
      backgroundColor: '#43a047',
      marginLeft: '-20px'
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
  const likeImage = require('../../img/happy.png')
  const dislikeImage = require('../../img/disgust.png') 
  const neutralImage = require('../../img/neutral.png') 

export default function ProposalCard(props) {

    const [applicantName, setApplicantName] = useState('')
    const [applicantAvatar, setApplicantAvatar] = useState(imageName)
    const [intro, setIntro] = useState()

    const [proposerAvatar, setProposerAvatar] = useState(imageName)
    const [proposerName, setProposerName] = useState('')

    const[title, setTitle] = useState('Funding Proposal Details')
    const [tributeTitle, setTributeTitle] = useState('Tribute Proposal Details')
    const [opportunityTitle, setOpportunityTitle] = useState('Opportunity Proposal Details')

    const[payoutTitle, setPayoutTitle] = useState('Payout Details')

    const [proposals, setProposals] = useState()
    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    const [isUpdated, setIsUpdated] = useState(false)
    const [detailsExist, setDetailsExist] = useState(false)

    const[hasVoted, setHasVoted] = useState(props.voted)
    const[isDone, setIsDone] = useState(props.done)
    
    
    const[curPersonaIdx, setCurPersonaIdx] = useState()
   
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

    const [editConfigurationProposalDetailsClicked, setEditConfigurationProposalDetailsClicked] = useState(false)
    const [configurationProposalDetailsClicked, setConfigurationProposalDetailsClicked] = useState(false)

    const [nextToFinalize, setNextToFinalize] = useState()
    const [voteEnding, setVoteEnding] = useState('calculating')
    const [rageQuitEnding, setRageQuitEnding] = useState('calculating')

    const [daoContract, setDaoContract] = useState()

    const [showSponsorButton, setShowSponsorButton] = useState(false)

    const [anchorEl, setAnchorEl] = useState(null)
    
    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near,
      appIdx,
      accountId,
      wallet,
      proposalDeposit,
      nearPrice,
      neededVotes
    } = state

    const {
      contractId
    } = useParams()

    const classes = useStyles();

    const { applicant, created, noVotes, yesVotes, proposalType, proposer, requestId, tribute, vote, loot, shares, status, funding,
        isVotingPeriod, isGracePeriod, voted, gracePeriod, votingPeriod, currentPeriod, periodDuration, cancelFinish, sponsor, done, configuration,
        referenceIds,
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
        memberStatus,
        contract,
        summoner,
        queueList,
        guildBalance,
        escrowBalance,
        gracePeriodLength,
        votingPeriodLength,
        isFinalized,
        totalMembers
    } = props

    useEffect(
        () => {
         

          async function fetchData() {
            isUpdated
            // Get Persona Information           
            if(applicant){
              const thisPersona = new Persona()

              // Applicant
              let result = await thisPersona.getPersona(applicant)
                  if(result){
                    result.avatar ? setApplicantAvatar(result.avatar) : setApplicantAvatar(imageName)
                    result.name ? setApplicantName(result.name) : setApplicantName('')
                  }
              
              // Proposer
              let resultb = await thisPersona.getPersona(proposer)
              if(resultb){
                resultb.avatar ? setProposerAvatar(resultb.avatar) : setProposerAvatar(imageName)
                resultb.name ? setProposerName(resultb.name) : setProposerName('')
              }
             }

             // Check for reference titles first
              // set title to opportunity title if it exists
              if(referenceIds){
              for(const [key, value] of Object.entries(referenceIds)){
               
                if(value['valueSetting'] && value['valueSetting'] != ''){
                  try{
                    let oppResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
                    let k = 0
                    while(k < oppResult.opportunities.length){
                      if(oppResult.opportunities[k].opportunityId == value['valueSetting']){
                        setTitle(oppResult.opportunities[k].title)
                        break
                      }
                      k++
                    }
                  } catch (err) {
                    console.log('problem retrieving opportunities', err)
                  }
                }
              }
            }

            // Set Existing Member Proposal Data       
            if(curDaoIdx && proposalType=='Member'){
              let propResult = await curDaoIdx.get('memberProposalDetails', curDaoIdx.id)
              
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == requestId){
                    propResult.proposals[i].intro ? setIntro(propResult.proposals[i].intro) : setIntro('')
                    propResult.proposals[i].likes ? setCurrentLikes(propResult.proposals[i].likes) : setCurrentLikes([])
                    propResult.proposals[i].dislikes ? setCurrentDisLikes(propResult.proposals[i].dislikes) : setCurrentDisLikes([])
                    propResult.proposals[i].neutrals ? setCurrentNeutrals(propResult.proposals[i].neutrals) : setCurrentNeutrals([])
                    setDetailsExist(true)
                    break
                  }
                  i++
                }
              }
            }
            
            // Set Existing Funding Proposal Data       
            if(curDaoIdx && proposalType=='Commitment'){
             
              let propResult = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
        
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == requestId){
                    propResult.proposals[i].title ? setTitle(propResult.proposals[i].title) : setTitle('')
                    propResult.proposals[i].likes ? setCurrentLikes(propResult.proposals[i].likes) : setCurrentLikes([])
                    propResult.proposals[i].dislikes ? setCurrentDisLikes(propResult.proposals[i].dislikes) : setCurrentDisLikes([])
                    propResult.proposals[i].neutrals ? setCurrentNeutrals(propResult.proposals[i].neutrals) : setCurrentNeutrals([])
                    setDetailsExist(true)
                    break
                  }
                  i++
                }
              } 
            }

            // Set Existing Tribute Proposal Data       
            if(curDaoIdx && proposalType=='Tribute'){
              let propResult = await curDaoIdx.get('tributeProposalDetails', curDaoIdx.id)
          
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == requestId){
                    propResult.proposals[i].title ? setTributeTitle(propResult.proposals[i].title) : setTributeTitle('')
                    propResult.proposals[i].likes ? setCurrentLikes(propResult.proposals[i].likes) : setCurrentLikes([])
                    propResult.proposals[i].dislikes ? setCurrentDisLikes(propResult.proposals[i].dislikes) : setCurrentDisLikes([])
                    propResult.proposals[i].neutrals ? setCurrentNeutrals(propResult.proposals[i].neutrals) : setCurrentNeutrals([])
                    setDetailsExist(true)
                    break
                  }
                  i++
                }
              }
            }

             // Set Existing Payout Proposal Data       
             if(curDaoIdx && proposalType=='Payout'){
              let propResult = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  console.log('requestId', requestId)
                  if(parseInt(propResult.proposals[i].proposalId) == requestId){
                    propResult.proposals[i].title ? setPayoutTitle(propResult.proposals[i].title) : setPayoutTitle('')
                    propResult.proposals[i].likes ? setCurrentLikes(propResult.proposals[i].likes) : setCurrentLikes([])
                    propResult.proposals[i].dislikes ? setCurrentDisLikes(propResult.proposals[i].dislikes) : setCurrentDisLikes([])
                    propResult.proposals[i].neutrals ? setCurrentNeutrals(propResult.proposals[i].neutrals) : setCurrentNeutrals([])
                    setDetailsExist(true)
                    break
                  }
                  i++
                }
              }
            }

            // Set Existing Opportunity Proposal Data       
            if(curDaoIdx && proposalType=='Opportunity'){
              let propResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
          
              if(propResult) {
                let i = 0
                while (i < propResult.opportunities.length){
                  if(propResult.opportunities[i].opportunityId == requestId){
                    propResult.opportunities[i].title ? setOpportunityTitle(propResult.opportunities[i].title) : setOpportunityTitle('')
                    propResult.opportunities[i].likes ? setCurrentLikes(propResult.opportunities[i].likes) : setCurrentLikes([])
                    propResult.opportunities[i].dislikes ? setCurrentDisLikes(propResult.opportunities[i].dislikes) : setCurrentDisLikes([])
                    propResult.opportunities[i].neutrals ? setCurrentNeutrals(propResult.opportunities[i].neutrals) : setCurrentNeutrals([])
                    setDetailsExist(true)
                    break
                  }
                  i++
                }
              }
            }

            if(wallet){
              let daoContract = await dao.initDaoContract(wallet.account(), contractId)
              setDaoContract(daoContract)
            }

            if(queueList && queueList.length > 0){
              setNextToFinalize(queueList[0].requestId)
            }

            return true  
          }

       
            let notificationFlag = get(PROPOSAL_NOTIFICATION, [])
            if(notificationFlag[0]){
              del(PROPOSAL_NOTIFICATION)
              if(requestId == notificationFlag[0].proposalId)
                  switch(proposalType){
                    case 'Commitment':
                      handleFundingProposalDetailsClick()
                      break; 
                    case 'Tribute':
                      handleTributeProposalDetailsClick()
                      break;
                    case 'Payout':
                      handlePayoutProposalDetailsClick()
                      break;
                    case 'Configuration':
                      handleConfigurationProposalDetailsClick()
                      break;
               }
            }

          let mounted = true
          if(mounted){
            fetchData()
                .then((res) => {
                  if(votingPeriod){
                    let count = parseInt((gracePeriod - currentPeriod) * periodDuration * 0.7)
                    let counter=setInterval(timer, 1000); //1000 will  run it every 1 second  
                    function timer()
                    {
                      count=count-1;
                      if (count <= 0)
                      {
                        clearInterval(counter);
                        setVoteEnding('0')
                        return;
                      }
                      setVoteEnding(count)
                    }
                  }
                if(gracePeriod){
                  let rageCount = parseInt((gracePeriod + gracePeriodLength - currentPeriod) * periodDuration * 0.7)
                  let rageCounter=setInterval(rageTimer, 1000)
                  function rageTimer()
                  {
                    rageCount=rageCount-1;
                    if (rageCount <= 0)
                    {
                      clearInterval(rageCounter);
                      setRageQuitEnding('0')
                      return;
                    }
                    setRageQuitEnding(rageCount)
                  }
                }
                checkSponsor()
                })
          return () => mounted = false
          }
          
    }, [isUpdated, queueList, guildBalance, escrowBalance, curDaoIdx, detailsExist, wallet]
    )

    function handleUpdate(property){
      setIsUpdated(property)
    }

    const checkSponsor = () => {
      console.log('proposaltype', proposalType)
            console.log('totalmembers', totalMembers)
            console.log('proposer', proposer)
            console.log('summoner', summoner)
            console.log('applicant', applicant)
            console.log('memberStatus', memberStatus)
            console.log('detailsExist', detailsExist)
            console.log('funding', funding)
            console.log('guild balance', guildBalance[0].balance)
            console.log('escrow balance', escrowBalance[0].balance)
             // Determine whether to show Sponsor button
             switch(proposalType){
              case 'Commitment':
                if(
                    totalMembers != 1
                    && (accountId != proposer && accountId != applicant) 
                    && status=='Submitted'
                    && memberStatus == true 
                    && detailsExist == true
                    && parseFloat(funding) <= parseFloat(guildBalance[0].balance)
                  ) {
                    setShowSponsorButton(true)
                    break
                    }
                
                if(
                    (totalMembers == 1 || accountId == summoner)
                    && status=='Submitted' 
                    && memberStatus == true 
                    && detailsExist == true
                    && parseFloat(funding) <= parseFloat(guildBalance[0].balance)
                  ) {
                    setShowSponsorButton(true)
                    break
                  }
              case 'Payout':
                if(
                    totalMembers != 1
                    && (accountId != proposer && accountId != applicant) 
                    && status=='Submitted'
                    && referenceIds.length > 0
                    && memberStatus == true 
                    && detailsExist == true
                    && parseFloat(funding) <= parseFloat(escrowBalance[0].balance)
                  ) {
                    setShowSponsorButton(true)
                    break
                    }
                
                if(
                  totalMembers != 1
                  && (accountId != proposer && accountId != applicant) 
                  && status=='Submitted'
                  && referenceIds.length == 0
                  && memberStatus == true 
                  && detailsExist == true
                  && parseFloat(funding) <= parseFloat(guildBalance[0].balance)
                ) {
                  setShowSponsorButton(true)
                  break
                  }
              
                if(
                    (totalMembers == 1 || accountId == summoner)
                    && status=='Submitted' 
                    && memberStatus == true 
                    && detailsExist == true
                    && parseFloat(funding) <= parseFloat(escrowBalance[0].balance)
                  ) {
                    setShowSponsorButton(true)
                    break
                  }
              default:
                if(
                    accountId == summoner
                    && status=='Submitted' 
                    && memberStatus == true 
                    && detailsExist == true
                    && parseFloat(funding) <= parseFloat(guildBalance[0].balance)
                ) {
                  setShowSponsorButton(true)
                  break
                }
            }
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

    // Configuration Proposal Functions

    const handleEditConfigurationProposalDetailsClick = () => {
      handleExpanded()
      handleEditConfigurationProposalDetailsClickState(true)
    }

    function handleEditConfigurationProposalDetailsClickState(property){
      setEditConfigurationProposalDetailsClicked(property)
    }

    const handleConfigurationProposalDetailsClick = () => {
      handleExpanded()
      handleConfigurationProposalDetailsClickState(true)
    }

    function handleConfigurationProposalDetailsClickState(property){
      setConfigurationProposalDetailsClicked(property)
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

    async function handleSignal(sig){
      await signal(requestId, sig, curDaoIdx, accountId, proposalType)
      handleUpdate(!isUpdated)
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
            {status=='Passed' || status=='Not Passed' ? (<>
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
            <Grid container justifyContent="space-evenly" spacing={1} style={{marginTop:'20px'}}>
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
                 <Grid container alignItems="center" justifyContent="space-evenly">
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
              {status=='Passed' || status=='Not Passed' ? (<>
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
                 <Grid container alignItems="center" justifyContent="space-evenly">
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
              {status=='Passed' || status=='Not Passed' ? (<>
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
                 <Grid container alignItems="center" justifyContent="space-evenly">
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

           {proposalType === 'Configuration' ? (
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
              {status=='Passed' || status=='Not Passed' ? (<>
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
                  onClick={handleConfigurationProposalDetailsClick}
                 >
                  Configuration Changes Proposed
                 </Button>
                 </>
                }
               subheader={
                 <Grid container alignItems="center" justifyContent="space-evenly">
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
              {status=='Passed' || status=='Not Passed' ? (<>
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
                  {opportunityTitle ? opportunityTitle.replace(/(<([^>]+)>)/gi, ""): 'No Details Yet.'}
                 </Button>
                 </>
                }
               subheader={
                 <Grid container alignItems="center" justifyContent="space-evenly">
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
              {status=='Passed' || status=='Not Passed' ? (<>
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
                 onClick={handlePayoutProposalDetailsClick}
                >
                 {payoutTitle ? payoutTitle.replace(/(<([^>]+)>)/gi, ""): 'No Details Yet.'}
                </Button>
                </>}
               subheader={
                <><Typography variant="overline">Proposed: {created}</Typography>
                 <Grid container alignItems="center" justifyContent="space-between">
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
              {status=='Passed' || status=='Not Passed' ? (<>
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
                 <Grid container alignItems="center" justifyContent="space-evenly">
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
               
            {proposalType == 'Member' ? (
              <Grid container alignItems="center" justifyContent="space-evenly" style={{marginBottom:'5px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '-40px', marginBottom: '40px'}}>
                  <Typography variant="overline">Voting Shares: {shares}</Typography><br></br>
                  <Typography variant="overline">Non-Voting Shares: {loot ? loot : '0'}</Typography><br></br>
                  <Typography variant="overline" style={{fontSize:'100%'}}>{`Tribute: ${formatNearAmount(tribute, 3)} Ⓝ`}</Typography>
                </Grid>
              </Grid>
            ) : null }

            {proposalType == 'GuildKick' ? (
              <Grid container alignItems="center" justifyContent="space-evenly" style={{marginTop: '-20px', marginBottom:'20px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Typography variant="h6" noWrap={true} style={{border: '1px solid', padding: '2px', textAlign: 'center', fontWeight: '800', color: 'black'}}
                  onClick={(e) => handleMemberProposalDetailsClick(requestId, applicant, status, proposer, proposalType, e)}
                  >{title}</Typography>
                </Grid>  
              </Grid>
            ) : null}

            {proposalType == 'Commitment' ? (
              <Grid container alignItems="center" justifyContent="space-evenly" style={{marginTop: '-20px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                 
                </Grid>    
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                  <Typography variant="overline" align="center" style={{marginBottom: '10px'}}>Funding Requested</Typography><br></br>
                  <Typography variant="overline" align="center" style={{fontSize:'100%'}}>{`${formatNearAmount(funding, 3)} Ⓝ`}</Typography>
                </Grid>
              </Grid>
            ) : null}

            {proposalType == 'Tribute' ? (
              <Grid container alignItems="center" justifyContent="space-evenly" style={{marginBottom:'5px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '-20px'}}>
                  <Typography variant="overline">Shares: {shares}</Typography><br></br>
                  <Typography variant="overline">Non-Voting Shares: {loot ? loot : '0'}</Typography><br></br>
                  <Typography variant="overline" style={{fontSize:'100%'}}>{`Tribute: ${formatNearAmount(tribute, 3)} Ⓝ`}</Typography>
                </Grid>
              </Grid>
            ) : null }

            {proposalType == 'Payout' ? (
              <Grid container alignItems="center" justifyContent="space-evenly" style={{marginTop: '-20px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                 
                </Grid>    
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                  <Typography variant="overline" align="center" style={{marginBottom: '10px'}}>Payout Requested</Typography><br></br>
                  <Typography variant="overline" align="center" style={{fontSize:'100%'}}>{`${formatNearAmount(funding, 3)} Ⓝ`}</Typography>
                </Grid>
              </Grid>
            ) : null}

            
           
            </CardContent>
            <CardActions className={classes.cardAction}>
           
  
              <div className={`${proposalType != 'Member' ? classes.infoBox : classes.memberInfoBox}`}>
            
              {status == 'Submitted' && detailsExist ?
                <Grid container spacing={1} alignItems="center" justifyContent="space-between" style={{marginTop: '10px', marginBottom: '10px'}}>
                <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center">
                <Badge badgeContent={currentLikes.length} color="primary" max={9999999}>  
                  <img src={likeImage} className={classes.signals} onClick={(e) => handleSignal('like')}/>
                </Badge>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center">
                <Badge badgeContent={currentNeutrals.length} color="primary" max={9999999}>  
                  <img src={neutralImage} className={classes.signals} onClick={(e) => handleSignal('neutral')}/>
                </Badge>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center">
                <Badge badgeContent={currentDisLikes.length} color="primary" max={9999999}>  
                  <img src={dislikeImage} className={classes.signals} onClick={(e) => handleSignal('dislike')}/>
                </Badge>
                </Grid>
                </Grid>
                : null }
              {status != 'Passed' && status != 'Sponsored' && status != 'Not Passed' && proposalType=='Commitment' && parseFloat(funding) > parseFloat(guildBalance[0].balance) ? 
                <Typography variant="subtitle2" display="block" align="center" style={{backgroundColor: 'red', color: 'white', padding: '2px', marginTop:'3px'}}>Funds Required</Typography> 
              :status != 'Passed' && status != 'Sponsored' && status != 'Not Passed' && proposalType=='Payout' && referenceIds.length > 0 && parseFloat(funding) > parseFloat(escrowBalance[0].balance) ? 
              <Typography variant="subtitle2" display="block" align="center" style={{backgroundColor: 'red', color: 'white', padding: '2px', marginTop:'3px'}}>Funds Required</Typography>
              :status != 'Passed' && status != 'Sponsored' && status != 'Not Passed' && proposalType=='Payout' && referenceIds.length == 0 && parseFloat(funding) > parseFloat(guildBalance[0].balance) ? 
              <Typography variant="subtitle2" display="block" align="center" style={{backgroundColor: 'red', color: 'white', padding: '2px', marginTop:'3px'}}>Funds Required</Typography>
              : status == 'Submitted'  && detailsExist == false ? <Typography variant="subtitle2" display="block" align="center">Awaiting Details</Typography>
              : status == 'Submitted'  && detailsExist == true ? <Typography variant="subtitle2" display="block" align="center">Awaiting Sponsor</Typography> : null}
              {status != 'Passed' && status == 'Sponsored' && status != 'Not Passed' && currentPeriod < votingPeriod && !isVotingPeriod && !isGracePeriod ? 
                <Typography variant="subtitle2" display="block" align="center" style={{backgroundColor: 'red', color: 'white', padding: '2px', marginTop:'3px'}}>Prepare to Vote<br></br>{neededVotes} votes required to pass</Typography>
               : null}
              </div>

              {status == 'Sponsored' && isVotingPeriod && !isGracePeriod && !isFinalized ? (
               
                <Grid container alignItems="center" justifyContent="space-between" spacing={0} style={{margin: '0px', position: 'absolute', bottom:'5px', right:'1px'}}>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5} align="center">
                     {done ? ( <StyledBadge badgeContent={yesVotes} color="primary" max={9999999}>
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
                  {done ? ( <StyledBadge badgeContent={noVotes} color="secondary" max={9999999}>
                        <IconButton onClick={(e) => handleVotingAction(requestId, 'no')} disabled={voted}>
                          <ThumbDownIcon fontSize='small' color="secondary" />
                        </IconButton>
                      </StyledBadge>
                      ) : <CircularProgress /> }
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                    <Typography variant="overline">{neededVotes} votes required to pass</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '10px'}}>
                    <Typography variant="subtitle2">
                      Time Remaining: {voteEnding > 0 ? voteEnding + ' seconds' : 'closing vote'}
                    </Typography>
                  </Grid>
                </Grid>
                ) : null }

              {status == 'Sponsored' && isGracePeriod && (vote == 'no' || vote =='no vote yet') ? (
                <Grid container alignItems="center" justifyContent="space-evenly" spacing={1}>
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
                    <Typography variant="caption" display="block" align="center">Rage Quit Period</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '10px'}}>
                    <Typography variant="subtitle2">
                      Time Remaining: {rageQuitEnding > 0 ? rageQuitEnding + ' seconds' : 'closing rage quit'}
                    </Typography>
                  </Grid>
                </Grid>
              ) : 
              status == 'Sponsored' && isGracePeriod && vote == 'yes' ?
              <>
              <Typography variant="body1">Rage Quit period</Typography>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '10px'}}>
                    <Typography variant="subtitle2">
                      Time Remaining: {rageQuitEnding > 0 ? rageQuitEnding + ' seconds' : 'closing rage quit'} 
                    </Typography>
              </Grid>
              </>
              : null}
              {(status == 'Awaiting Finalization') ? (         
                <Grid container alignItems="center" justifyContent="space-between" spacing={0} style={{margin: '0px', position: 'absolute', bottom:'60px', right:'1px'}}>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5} align="center" >
                    <StyledBadge badgeContent={yesVotes} color="primary" max={9999999}>
                      <IconButton onClick={(e) => handleVotingAction(requestId, 'yes')} disabled={true}>
                        <ThumbUpIcon fontSize='small' color="primary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2} >
                    <Typography variant="body2">Final Vote</Typography>
                  </Grid>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5} align="center" >
                    <StyledBadge badgeContent={noVotes} color="secondary" max={9999999}>
                      <IconButton onClick={(e) => handleVotingAction(requestId, 'no')} disabled={true}>
                        <ThumbDownIcon fontSize='small' color="secondary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                </Grid>
              ) : null }

              {status == 'Passed' || status == 'Not Passed' ? (
                <Grid container alignItems="center" justifyContent="space-between" spacing={0} style={{position: 'absolute', bottom:'5px', right:'1px'}} >
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center" >
                    <StyledBadge badgeContent={yesVotes} color="primary" max={9999999}>
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
                    <StyledBadge badgeContent={noVotes} color="secondary" max={9999999}>
                      <IconButton onClick={(e) => handleVotingAction(requestId, 'no')} disabled={true}>
                        <ThumbDownIcon fontSize='small' color="secondary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                </Grid>
              ) : null }
               
              <div className={classes.bottom2}>
              <Divider className={classes.divider}/>
                <Grid container alignItems="center" justifyContent="space-evenly" spacing={1}>

                <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center">
            
                {showSponsorButton ?
                    (
                      <><Button 
                          color="primary" 
                          onClick={(e) => handleSponsorConfirmationClick(requestId, proposalType, funding)}
                        >
                        Sponsor
                        </Button>
                      </>
                    )
                  : null}
                </Grid>

                <Grid item xs={8} sm={8} md={8} lg={8} xl={8} align="center">
                {nextToFinalize == requestId ?
                  <Button
                    variant="contained"
                    align="left"                    
                    startIcon={<SendIcon />}
                    onClick={(e) => handleProcessAction(requestId, proposalType)}
                  >
                  Finalize
                  </Button>
                  : null }
                {accountId == proposer && status == 'Submitted' ? 
                cancelFinish ? 
                  <><Button color="primary" onClick={() => handleCancelAction(requestId, loot, tribute)}>
                    <DeleteForeverIcon />
                  </Button>
                 
                  {proposalType === 'Member' || proposalType === 'GuildKick' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditMemberProposalDetailsClick}>
                        <EditIcon />
                      </Button>
                    </>)
                  : null }
                  {proposalType === 'Commitment' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditFundingProposalDetailsClick}>
                        <EditIcon />
                      </Button>
                    </>) : null } 
                  {proposalType === 'Tribute' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditTributeProposalDetailsClick}>
                        <EditIcon />
                      </Button>
                    </>) : null } 
                  {proposalType === 'Payout' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditPayoutProposalDetailsClick}>
                        <EditIcon />
                      </Button>
                    </>) : null }
                  {proposalType === 'Configuration' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditConfigurationProposalDetailsClick}>
                        <EditIcon />
                      </Button>
                    </>) : null }
                  {proposalType === 'Opportunity' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditOpportunityProposalDetailsClick}>
                        <EditIcon />
                      </Button>
                    </>) : null }
                  </>: <LinearProgress /> : null }
              </Grid>
              </Grid>
              </div>
              </CardActions>
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
          contract={daoContract}
          funding={funding}
          referenceIds={referenceIds}
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

        {editConfigurationProposalDetailsClicked ? <EditConfigurationProposalForm
          state={state}
          handleEditConfigurationProposalDetailsClickState={handleEditConfigurationProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          proposer={proposer}
          handleUpdate={handleUpdate}
          accountId={accountId}
          proposalId={requestId}
          configuration={configuration}
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
          contract={daoContract}
          funding={funding}
          referenceIds={referenceIds}
          proposalStatus={status}
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
          contractId={contractId}
          /> : null }


        {memberProposalDetailsClicked ? <MemberProposalDetails
          proposer={proposer}
          handleMemberProposalDetailsClickState={handleMemberProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          proposalId={requestId}
          memberStatus={memberStatus}
          /> : null }

        {fundingProposalDetailsClicked ? <FundingProposalDetails
          proposer={proposer}
          handleFundingProposalDetailsClickState={handleFundingProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          proposalId={requestId}
          proposalStatus={status}
          sponsor={sponsor}
          contract={contract}
          memberStatus={memberStatus}
          /> : null }

        {tributeProposalDetailsClicked ? <TributeProposalDetails
          proposer={proposer}
          handleTributeProposalDetailsClickState={handleTributeProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          proposalId={requestId}
          memberStatus={memberStatus}
          /> : null }

        {configurationProposalDetailsClicked ? <ConfigurationProposalDetails
          proposer={proposer}
          handleConfigurationProposalDetailsClickState={handleConfigurationProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          proposalId={requestId}
          configuration={configuration}
          contract={contract}
          memberStatus={memberStatus}
          /> : null }

        {payoutProposalDetailsClicked ? <PayoutProposalDetails
          proposer={proposer}
          handlePayoutProposalDetailsClickState={handlePayoutProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          proposalId={requestId}
          proposalStatus={status}
          sponsor={sponsor}
          memberStatus={memberStatus}
          /> : null }

        {opportunityProposalDetailsClicked ? <OpportunityProposalDetails
          proposer={proposer}
          handleOpportunityProposalDetailsClickState={handleOpportunityProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          opportunityId={requestId}
          contractId={contractId}
          status={status}
          memberStatus={memberStatus}
          /> : null }

        </>
    )
}