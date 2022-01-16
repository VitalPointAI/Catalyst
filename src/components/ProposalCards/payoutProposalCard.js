import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { ceramic } from '../../utils/ceramic'
import FungibleTokens from '../../utils/fungibleTokens'
import { explorerUrl, signal } from '../../state/near'
import { PROPOSAL_NOTIFICATION} from '../../state/near'
import { formatNearAmount } from 'near-api-js/lib/utils/format'

import EditPayoutProposalForm from '../EditProposal/editPayoutProposal'
import PayoutProposalDetails from '../ProposalDetails/payoutProposalDetails'

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



const useStyles = makeStyles((theme) => ({
    divider: {
      marginTop: '-55px',
      marginBottom: '10px'
    },
    card: {
      marginTop: '10px',
      maxWidth: '250px',
      minWidth: '250px',
      height: '550px',
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
  const likeImage = require('../../img/happy.png')
  const dislikeImage = require('../../img/disgust.png') 
  const neutralImage = require('../../img/neutral.png') 
  const defaultToken = require('../../img/default-coin.png') // default no-token image

export default function PayoutProposalCard(props) {

  const { state, dispatch, update } = useContext(appStore)

  const {
    didRegistryContract,
    daoFactory,
    appIdx,
    accountId,
    wallet,
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

    const [proposerAvatar, setProposerAvatar] = useState(imageName)
    const [proposerName, setProposerName] = useState('')

    const [thisTokenName, setThisTokenName] = useState('')
    const [tokenImage, setTokenImage] = useState(defaultToken)

    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    const [title, setTitle] = useState('Details Required')
    const [detailsExist, setDetailsExist] = useState(false)

    const [hasVoted, setHasVoted] = useState(false)

    const [editPayoutProposalDetailsClicked, setEditPayoutProposalDetailsClicked] = useState(false)
    const [payoutProposalDetailsClicked, setPayoutProposalDetailsClicked] = useState(false)

    const [nextToFinalize, setNextToFinalize] = useState()
    const [voteEnding, setVoteEnding] = useState('calculating')
    const [rageQuitEnding, setRageQuitEnding] = useState('calculating')

    const [showSponsorButton, setShowSponsorButton] = useState(false)

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
         
          async function fetchData() {
            if(isUpdated){}

            // Get Persona Information           
            if(applicant && proposer){
              
              // Applicant
              let applicantDid = await ceramic.getDid(applicant, daoFactory, didRegistryContract)
              let result = await appIdx.get('profile', applicantDid)
                  if(result){
                    result.avatar ? setApplicantAvatar(result.avatar) : setApplicantAvatar(imageName)
                    result.name ? setApplicantName(result.name) : setApplicantName('')
                  }
              
              // Proposer
              let proposerDid = await ceramic.getDid(proposer, daoFactory, didRegistryContract)
              let resultb = await appIdx.get('profile', proposerDid)
                if(resultb){
                  resultb.avatar ? setProposerAvatar(resultb.avatar) : setProposerAvatar(imageName)
                  resultb.name ? setProposerName(resultb.name) : setProposerName('')
                }
            }
            
            try{
              let result = await contract.getMemberProposalVote({memberAddress: accountId, proposalId: requestId})
              if(result == 'yes'){
                setHasVoted(true)
              }
            } catch (err) {
              console.log('problem retrieving member proposal vote', err)
            }
            
            if(queueList && queueList.length > 0){
              setNextToFinalize(queueList[0].requestId)
            }
            

            async function getData(alias){
              if(curDaoIdx){
                let propResult = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
                if(propResult) {
                  let i = 0
                  while (i < propResult.proposals.length){
                    if(parseInt(propResult.proposals[i].proposalId) == requestId){
                      propResult.proposals[i].title ? setTitle(propResult.proposals[i].title) : setTitle('Details Required')
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
                
                // Timers (need to be more accurate)
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
          
    }, [isUpdated, funding, queueList, guildBalance, escrowBalance, curDaoIdx, detailsExist, wallet]
    )

    // Determine whether to show Sponsor button
    const checkSponsor = () => {
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
        }
    
      if(
          (totalMembers == 1 || accountId == summoner)
          && status=='Submitted' 
          && memberStatus == true 
          && detailsExist == true
          && parseFloat(funding) <= parseFloat(escrowBalance[0].balance)
      ) {
        setShowSponsorButton(true)
      }
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
      update('', {isUpdated: !isUpdated})
    }

    return(
        <>
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
              style={{fontWeight: '800', lineHeight: '1.1em'}}
              onClick={handlePayoutProposalDetailsClick}
              className={classes.btnTitle}
            >
              {title ? title.replace(/(<([^>]+)>)/gi, ""): 'Details Required'}
            </Button>
            </>}

            subheader={
              <>
              <Typography variant="overline">Proposed: {date}</Typography>
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

              </Grid>
              </>
            }
          />

          <CardContent>
            <Grid container alignItems="center" justifyContent="space-evenly" style={{marginTop: '-20px'}}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
              
              </Grid>    
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                <Typography variant="overline" align="center" style={{marginBottom: '10px'}}>
                  Payout Requested
                </Typography><br></br>
                <Typography variant="overline" align="center" style={{fontSize:'100%'}}>
                  {formatNearAmount(funding, 3)} Ⓝ
                </Typography>
              </Grid>
            </Grid>
          </CardContent>

          <CardActions className={classes.cardAction}>
            <div className={classes.infoBox}>

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

              {status != 'Passed' && status != 'Sponsored' && status != 'Not Passed' && proposalType=='Payout' && referenceIds.length > 0 && parseFloat(funding) > parseFloat(escrowBalance[0].balance) ? 
                  <Typography variant="subtitle2" display="block" align="center" style={{backgroundColor: 'red', color: 'white', padding: '2px', marginTop:'3px'}}>Funds Required</Typography>
                : status != 'Passed' && status != 'Sponsored' && status != 'Not Passed' && proposalType=='Payout' && referenceIds.length == 0 && parseFloat(funding) > parseFloat(guildBalance[0].balance) ? 
                  <Typography variant="subtitle2" display="block" align="center" style={{backgroundColor: 'red', color: 'white', padding: '2px', marginTop:'3px'}}>Funds Required</Typography>
                : status == 'Submitted'  && detailsExist == false ? <Typography variant="subtitle2" display="block" align="center">Awaiting Details</Typography>
                : status == 'Submitted'  && detailsExist == true ? <Typography variant="subtitle2" display="block" align="center">Awaiting Sponsor</Typography> 
                : null
              }
              
            </div>

              {status == 'Sponsored' && isVotingPeriod && !isGracePeriod && !isFinalized ? (
               
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
               
              <div className={classes.bottom}>
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
                      onClick={handleEditPayoutProposalDetailsClick}>
                      <EditIcon />
                    </Button>
                    </>
                  : null }

                </Grid>
              </Grid>
              </div>
              </CardActions>
        </Card>

        {editPayoutProposalDetailsClicked ? <EditPayoutProposalForm
          handleEditPayoutProposalDetailsClickState={handleEditPayoutProposalDetailsClickState}
          applicant={applicant}
          proposer={proposer}
          proposalId={requestId}
          referenceIds={referenceIds}
          proposalStatus={status}
          /> : null }
        
        {payoutProposalDetailsClicked ? <PayoutProposalDetails
          proposer={proposer}
          handlePayoutProposalDetailsClickState={handlePayoutProposalDetailsClickState}
          applicant={applicant}
          proposalId={requestId}
          proposalStatus={status}
          sponsor={sponsor}
          /> : null }

        </>
    )
}