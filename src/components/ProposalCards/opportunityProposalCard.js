import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { get, set, del } from '../../utils/storage'
import { ceramic } from '../../utils/ceramic'
import FungibleTokens from '../../utils/fungibleTokens'
import { explorerUrl, signal } from '../../state/near'
import { PROPOSAL_NOTIFICATION, NEW_PROPOSAL_TRIGGER} from '../../state/near'
import { formatNearAmount } from 'near-api-js/lib/utils/format'

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
import Button from '@material-ui/core/Button'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import SendIcon from '@material-ui/icons/Send'
import Badge from '@material-ui/core/Badge'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import PanToolIcon from '@material-ui/icons/PanTool'
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'
import Tooltip from '@material-ui/core/Tooltip'
import ExploreIcon from '@material-ui/icons/Explore'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import EditIcon from '@material-ui/icons/Edit'
import { Paper } from '@material-ui/core'


const useStyles = makeStyles((theme) => ({
    divider: {
      marginTop: '-55px',
      marginBottom: '10px'
    },
    card: {
      marginTop: '10px',
      maxWidth: '250px',
      minWidth: '250px',
      height: '480px',
      position: 'relative',
      margin: 'auto'
    },
    cardAction: {
      display: 'block',
      margin: 0,
      padding: 0,
      
    },
    bottom: {
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
    btnTitle: {
        fontSize: '20px',
        padding: '0.5em 1em',
        textAlign: 'center',
        width: '100%',
        height: '80px'
    },
  }));

  const StyledBadge = withStyles((theme) => ({
    badge: {
      right: 13,
      top: 0,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }))(Badge)

  const imageName = require('../../img/default-profile.png') // default no-image avatar
  const logoName = require('../../img/default_logo.png') // default no-logo image
  const likeImage = require('../../img/happy.png')
  const dislikeImage = require('../../img/disgust.png') 
  const neutralImage = require('../../img/neutral.png') 
  const defaultToken = require('../../img/default-coin.png') // default no-token image

export default function OpportunityProposalCard(props) {

  const { state, dispatch, update } = useContext(appStore)

  const {
    didRegistryContract,
    daoFactory,
    appIdx,
    accountId,
    neededVotes,
    curDaoIdx,
    summoner,
    gracePeriodLength,
    periodDuration,
    contract,
    isUpdated,
    currentPeriod,
    memberStatus,
    guildBalance,
    escrowBalance,
    totalMembers
  } = state

  const {
    cancelFinish,
    voteFinish,
    processFinish,
    handleSponsorConfirmationClick,
    handleCancelAction,
    handleVotingAction,
    handleProcessAction,
    handleRageQuitClick,
    queueList,
  }= props

  const {
    blockTimeStamp,
    applicant, 
    date,
    noVotes, 
    yesVotes, 
    proposalType, 
    proposer, 
    requestId, 
    tribute,
    flags,
    receivedDelegations,
    delegatedShares,
    vote, 
    loot, 
    shares, 
    status, 
    funding,
    isVotingPeriod, 
    isGracePeriod, 
    gracePeriod, 
    votingPeriod,
    startingPeriod,
    sponsor,
    disabled,
    referenceIds,
    configuration,
    roleConfiguation,
    reputationConfiguration,
    roles,
    memberRoleConfiguration,
    cancelTransactionHash,
    submitTransactionHash,
    processTransactionHash,
    sponsorTransactionHash,
    changeTransactionHash,
    isFinalized,
    tributeToken,
    functionName,
    parameters
} = props.allProps

  const {
    contractId
  } = useParams()

    const [applicantName, setApplicantName] = useState('')
    const [applicantAvatar, setApplicantAvatar] = useState(imageName)
    const [pfpApplicantAvatar, setPfpApplicantAvatar] = useState('')
    const [pfpProposerAvatar, setPfpProposerAvatar] = useState('')
    const [applicantLogo, setApplicantLogo] = useState(logoName)

    const [proposerLogo, setProposerLogo] = useState(logoName)
    const [proposerName, setProposerName] = useState('')
    const [proposerAvatar, setProposerAvatar] = useState(imageName)
    const [pfpProposerLogo, setPfpProposerLogo] = useState('')
    const [pfpApplicantLogo, setPfpApplicantLogo] = useState('')
  
    const [applicantAccountType, setApplicantAccountType] = useState('')
    const [proposerAccountType, setProposerAccountType] = useState('')

    const [thisTokenName, setThisTokenName] = useState('')
    const [tokenImage, setTokenImage] = useState(defaultToken)

    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    const [title, setTitle] = useState('Details Required')
    const [opportunityTitle, setOpportunityTitle] = useState('Details Required')
    const [detailsExist, setDetailsExist] = useState(false)

    const [hasVoted, setHasVoted] = useState(false)
    const [memberVote, setMemberVote] = useState('')

    const [editOpportunityProposalDetailsClicked, setEditOpportunityProposalDetailsClicked] = useState(false)
    const [opportunityProposalDetailsClicked, setOpportunityProposalDetailsClicked] = useState(false)

    const [nextToFinalize, setNextToFinalize] = useState()
    const [voteEnding, setVoteEnding] = useState('calculating')
    const [rageQuitEnding, setRageQuitEnding] = useState('calculating')

    const [showSponsorButton, setShowSponsorButton] = useState(false)
    const [aNewProposal, setANewProposal] = useState(false)

    const [anchorEl, setAnchorEl] = useState(null)

    const { getMetadata } = FungibleTokens

    const classes = useStyles()
  
    useEffect(
      () => {
        if(tributeToken && tributeToken != 'Ⓝ'){
          getMetadata(tributeToken).then((meta) => {
            console.log('meta', meta)
            if(meta && meta.symbol != '') {
              setThisTokenName(meta.symbol)
            }
            if(meta && meta.icon != '') {
              setTokenImage(meta.icon)
            }
          })
        }
      },[tributeToken]
    )

    useEffect(
      () => {
        // check for successfully added new proposal to log it
        let newProposal = get(NEW_PROPOSAL_TRIGGER, [])
        let d = 0
        while(d < newProposal.length){
          if(newProposal[d].contractId==contractId && newProposal[d].new == true){
            setANewProposal(true)
            del(NEW_PROPOSAL_TRIGGER)
          }
        d++
        }
        
      }, []
    )

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
            
            try{
              let result = await contract.getMemberProposalVote({memberAddress: accountId, proposalId: requestId})
              if(result == 'yes'){
                setHasVoted(true)
              }
              setMemberVote(result)
            } catch (err) {
              console.log('problem retrieving member proposal vote', err)
            }
            
            if(queueList && queueList.length > 0){
              setNextToFinalize(queueList[0][0].requestId)
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

            async function getData(alias){
              // Set Existing Opportunity Proposal Data       
              if(curDaoIdx){
                let propResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
                console.log('curdaoIdx id', curDaoIdx.id)
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
            }

            getData()
            .then((res) => {

            })

            return true  
          }


          let mounted = true
          if(mounted){
            fetchData()
                .then((res) => {              
                checkSponsor()
                
                })
          return () => mounted = false
          }
          
    }, [isUpdated, appIdx, funding, queueList, guildBalance, escrowBalance, curDaoIdx, detailsExist]
    )

    useEffect(() => {
      let counter
      if(votingPeriod && status=='Voting'){
        let count = parseInt((gracePeriod - currentPeriod) * periodDuration * 0.7)
        counter=setInterval(timer, 1000); //1000 will  run it every 1 second  
        function timer()
        {
          count=count-1
          if (count <= 0)
          {
            clearInterval(counter)
            setVoteEnding(0)
            return;
          }
          setVoteEnding(count)
        }
      }
    }, [votingPeriod, status]
    )

    useEffect(() => {
      let rageCounter
      if(gracePeriod && status == 'Grace'){
        setVoteEnding(0)
        let rageCount = parseInt((gracePeriod + gracePeriodLength - currentPeriod) * periodDuration * 0.7)
        rageCounter=setInterval(rageTimer, 1000)
        function rageTimer()
        {
          rageCount=rageCount-1
          if (rageCount <= 0)
          {
            clearInterval(rageCounter)
            setRageQuitEnding(0)
            return;
          }
          setRageQuitEnding(rageCount)
        }
      }
    }, [gracePeriod, status]
    )

    // Determine whether to show Sponsor button
    const checkSponsor = () => {
      if(
        accountId == summoner
        && status=='Submitted' 
        && memberStatus == true 
        && detailsExist == true
        && parseFloat(funding) <= parseFloat(guildBalance[0].balance)
      ) {
        setShowSponsorButton(true)
      }
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
  
    function handleExpanded() {
      setAnchorEl(null)
    }

    async function handleSignal(sig){
      await signal(requestId, sig, curDaoIdx, accountId, proposalType)
      update('', {isUpdated: !isUpdated})
    }

    return(
        <>
        {aNewProposal ? (
          <EditOpportunityProposalForm
          handleEditOpportunityProposalDetailsClickState={handleEditOpportunityProposalDetailsClickState}
          proposer={proposer}
          opportunityId={requestId}
          />
        ) : null }
        <Card raised={true} className={classes.card}>          

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

          {status=='Voting' ? (<>
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
          <Typography variant="h6" align="right" style={{float: 'right', fontSize: '90%', marginRight: '10px', marginTop: '12px'}} color="textSecondary">#{requestId}</Typography>

          <CardHeader
            style={{display: 'block'}}
            align="center"
            title={
              <Button 
                color="primary"
                style={{fontWeight: '800', lineHeight: '1.1em'}}
                onClick={handleOpportunityProposalDetailsClick}
                className={classes.btnTitle}
              >
                {opportunityTitle ? opportunityTitle.replace(/(<([^>]+)>)/gi, ""): 'Details Required'}
              </Button>
            }
            subheader={
              <Grid container alignItems="center" justifyContent="space-evenly">
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                  <Typography variant="overline">Proposed: {date}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  by: 
                  {proposerAccountType != 'guild' ?
                    <Chip avatar={<Avatar src={pfpProposerAvatar != imageName && pfpProposerAvatar != '' ? pfpProposerAvatar : proposerAvatar} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                  :
                    <Chip avatar={<Avatar src={pfpProposerLogo != logoName && pfpProposerLogo != '' ? pfpProposerLogo : proposerLogo} className={classes.small}  />} label={proposerName != '' ? proposerName : proposer}/>
                  }
                </Grid>
                {status == 'Sponsored' ? (
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography>
                </Grid>
                ) : null }
              </Grid>
              }
          />

          <CardContent>
          <Divider variant="middle" style={{marginTop: '5px', marginBottom: '15px', border: '1px solid black'}}/>
          {status == 'Submitted' && detailsExist ?<>
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
          <Divider variant="middle" style={{marginTop: '5px', marginBottom: '15px', border: '1px solid black'}}/>
          </>
          : null }
          <div className={classes.infoBox}>
            {status == 'Submitted' && detailsExist == false ? 
                <Typography variant="subtitle2" align="center">Awaiting Details</Typography>
                : null
            } 
            {status == 'Submitted' && detailsExist == true ? 
                <Typography variant="subtitle2" align="center">Awaiting Sponsor</Typography> 
                : null
            }
          </div>
          </CardContent>

          <CardActions className={classes.cardAction}>
          
            {status == 'Voting' ? (
               
              <Grid container alignItems="center" justifyContent="space-between" spacing={0} style={{margin: '0px', position: 'absolute', bottom:'5px', right:'1px'}}>
                <Grid item xs={5} sm={5} md={5} lg={5} xl={5} align="center">
                  {voteFinish ? ( <StyledBadge badgeContent={yesVotes} color="primary" max={9999999}>
                    <IconButton onClick={(e) => handleVotingAction(requestId, 'yes')} disabled={hasVoted}>
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
                  {voteFinish ? ( 
                    <StyledBadge badgeContent={noVotes} color="secondary" max={9999999}>
                      <IconButton onClick={(e) => handleVotingAction(requestId, 'no')} disabled={hasVoted}>
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
                    {status == 'Voting' ?
                      voteEnding > 0 ? 'Time Remaining: ' + voteEnding + ' seconds' : 'vote closing soon...'
                      : null
                    }
                  </Typography>
                </Grid>
              </Grid>
              ) : null }

            {status == 'Grace' && (memberVote == 'no' || memberVote =='no vote yet') ? (
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
               
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '10px'}}>
                  <Typography variant="subtitle2">
                    {status == 'Grace' ?
                      rageQuitEnding > 0 ? 'Time Remaining: ' + rageQuitEnding + ' seconds' : 'Rage Quit closing soon...'
                    : null }
                  </Typography>
                </Grid>
              </Grid>
            ) : 
            status == 'Grace' && memberVote == 'yes' ?
            <>
            <Typography variant="h6">Rage Quit Period</Typography>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '10px'}}>
                  <Typography variant="subtitle2">
                  {status == 'Grace' ?
                    rageQuitEnding > 0 ? 'Time Remaining: ' + rageQuitEnding + ' seconds' : 'Rage Quit closing soon...'
                  : null }
                  </Typography>
            </Grid>
            </>
            : null}

              {status == 'Awaiting Finalization' ? (         
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
              
              {status == 'Submitted' || status == 'Awaiting Finalization' ? (
                <div className={classes.bottom} style={{margin: 0}}>
                <Divider className={classes.divider}/>
                <Paper elevation={5}>
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

                  <Grid item xs={8} sm={8} md={8} lg={8} xl={8} align="right">
                  
                  {nextToFinalize == requestId ?
                    processFinish ? 
                    <Button
                      variant="contained"
                      align="left"                    
                      startIcon={<SendIcon />}
                      onClick={(e) => handleProcessAction(requestId, proposalType, applicant)}
                    >
                    Finalize
                    </Button>
                    : <CircularProgress />
                    : null }

                  {accountId == proposer && status == 'Submitted' ? 
                    <>
                    {cancelFinish ?
                      <Button color="primary" onClick={() => handleCancelAction(requestId, loot, tribute)}>
                      <DeleteForeverIcon />
                      </Button>
                    : <CircularProgress />}

                    <Button 
                      color="primary" 
                      onClick={handleEditOpportunityProposalDetailsClick}>
                      <EditIcon />
                    </Button>
                    </>
                  : null }

                </Grid>
              </Grid>
              </Paper>
              </div>
              ): null }
              </CardActions>
        </Card>

        {editOpportunityProposalDetailsClicked ? <EditOpportunityProposalForm
          handleEditOpportunityProposalDetailsClickState={handleEditOpportunityProposalDetailsClickState}
          proposer={proposer}
          opportunityId={requestId}
          /> : null }

        {opportunityProposalDetailsClicked ? <OpportunityProposalDetails
          proposer={proposer}
          handleOpportunityProposalDetailsClickState={handleOpportunityProposalDetailsClickState}
          applicant={applicant}
          opportunityId={requestId}
          sponsor={sponsor}
          status={status}
          contractId={contractId}
          /> : null }

        </>
    )
}