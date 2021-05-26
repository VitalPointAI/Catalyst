import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'
import EditProposalForm from '../EditProposal/editProposal'
import ProposalDetails from '../ProposalDetails/proposalDetails'

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
      maxWidth: '250px'
    },
    votes: {
      paddingLeft: 0,
      paddingRight: '10px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
    greenButton: {
      backgroundColor: '#43a047'
    }
  }));

  const StyledBadge = withStyles((theme) => ({
    badge: {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }))(Badge);

  const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function ProposalCard(props) {

    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [intro, setIntro] = useState()
    const [proposals, setProposals] = useState()

    const [isUpdated, setIsUpdated] = useState(false)

    const[hasVoted, setHasVoted] = useState(props.voted)
    const[isDone, setIsDone] = useState(props.done)
    const[title, setTitle] = useState('Enter Short Title')
    const[did, setDid] = useState()
    const[curPersonaIdx, setCurPersonaIdx] = useState()
   
    const [editProposalClicked, setEditProposalClicked] = useState(false)
    const [proposalDetailsClicked, setProposalDetailsClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    
    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near,
      appIdx,
      accountId
    } = state

    const {
      contractId
    } = useParams()

    const classes = useStyles();

    const { applicant, created, noVotes, yesVotes, proposalType, proposer, requestId, tribute, vote, loot, shares, status, funding,
        isVotingPeriod, isGracePeriod, voted, gracePeriod, votingPeriod, currentPeriod, periodDuration, cancelFinish, sponsor, done,
        startingPeriod,
        handleFundingProposalDetailsClick,
        handleSponsorConfirmationClick,
        handleCancelAction,
        handleVotingAction,
        handleProcessAction,
        handleRageQuitClick,
        curDaoIdx,
        daoDid,
        memberStatus,
        contract,
        proposalDeposit
    } = props

    useEffect(
        () => {
         

          async function fetchData() {
         
            // Get Applicant Persona Information
            let thisCurPersonaIdx
            if(applicant){
              let existingDid = await didRegistryContract.hasDID({accountId: applicant})
            
              if(existingDid){
                 
                  let personaAccount = new nearAPI.Account(near.connection, applicant)

                  thisCurPersonaIdx = await ceramic.getCurrentUserIdx(personaAccount, appIdx, didRegistryContract)
                  setCurPersonaIdx(thisCurPersonaIdx)
              
                  let result = await thisCurPersonaIdx.get('profile', thisCurPersonaIdx.id)
                  console.log('result proposal persona card', result)
                  
                  if(result){
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                    result.name ? setName(result.name) : setName('')
                  }
              }
            }

              // Set Existing Proposal Data       
            if(curDaoIdx){
              let propResult = await curDaoIdx.get('proposalDetails', curDaoIdx.id)
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
            
            // // Load DAO Proposal information
            // let result = await curDaoIdx.get('proposals', daoDid)
            // console.log('result here proposal card', result)
           
                    
            return true  
          }

          fetchData()
            .then((res) => {

            })
          
    }, [applicant, avatar, intro, isUpdated]
    )

    function handleUpdate(property){
      setIsUpdated(property)
    }
  
    const handleEditProposalClick = () => {
      handleExpanded()
      handleEditProposalClickState(true)
    }
  
    function handleEditProposalClickState(property){
      setEditProposalClicked(property)
    }

    const handleProposalDetailsClick = () => {
      handleExpanded()
      handleProposalDetailsClickState(true)
    }
  
    function handleProposalDetailsClickState(property){
      setProposalDetailsClicked(property)
    }
  
    function handleExpanded() {
      setAnchorEl(null)
    }

    return(
        <>
        <Card raised={true} className={classes.card}>
          {proposalType === 'Member' ? (
           <> 
           <Typography variant="h6" align="left" style={{float: 'left', marginLeft: '5px'}} color="textSecondary">{proposalType} Proposal</Typography>
           <Typography variant="h6" align="right" style={{float: 'right', marginRight: '5px'}} color="textSecondary">#{requestId}</Typography>
           <div style={{clear: 'both'}}></div>
            <CardHeader
              title={<><center><Avatar src={avatar} className={classes.large} /><Typography variant="h6">{name + ' (' + applicant + ')'}</Typography>
              </center></>}
              subheader={
                <Grid container alignItems="center" justify="space-evenly">
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                    <Typography variant="overline">Proposed: {created}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                    <Typography variant="overline">Proposed By: {proposer}</Typography>
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

          {proposalType === 'GuildKick' ? (
            <> <Typography variant="h6" align="center" color="textSecondary">{proposalType} Proposal</Typography>
          
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

          {proposalType === 'Commitment' ? (
            <> <Typography variant="h6" align="center" color="textSecondary">{proposalType} Proposal</Typography>
            {status == 'Sponsored' ? <Typography variant="overline" align="center" color="textSecondary">Sponsored by: {sponsor}</Typography> : null }
            <CardHeader
              title={<Chip
                avatar={<Avatar alt="Funding Commitment" src="../../../images/dollar.png" />}
                label={proposer}
                variant="outlined"
              />}
              subheader={`Proposed: ${created}`}
            /></>
          ) : null }

            <CardContent>
                {console.log('proposalType', proposalType)}
            {proposalType == 'Member' ? (
              <Grid container alignItems="center" justify="space-evenly" style={{marginBottom:'20px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '-20px', marginBottom:'20px'}}>
                  <Typography variant="overline">Shares: {shares} | </Typography>
                  <Typography variant="overline">{`Tribute: ${tribute} Ⓝ`}</Typography>
                </Grid>
              
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Typography variant="body1" color="initial" noWrap={true} align="center"
                  onClick={handleProposalDetailsClick}
                  >{intro ? intro.replace(/(<([^>]+)>)/gi, ""): 'No Details'}</Typography>
                </Grid>  
             
              </Grid>
            ) : null}

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
                  <Typography variant="h6" noWrap={true} style={{border: '1px solid', padding: '2px', textAlign: 'center', fontWeight: '800', color: 'black'}}
                  onClick={(e) => handleFundingProposalDetailsClick(requestId, applicant, status, e)}
                  >{title}</Typography>
                </Grid>    
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <Typography variant="h5" align="center" style={{marginBottom: '10px'}}>Funding Requested</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Typography variant="h5" align="center">{`${funding} Ⓝ`}</Typography>
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
                    <Button
                      variant="contained"
                      className={classes.greenButton}
                      align="center"
                      startIcon={<SendIcon />}
                      onClick={(e) => handleProcessAction(requestId, proposalType)}
                    >
                    Finalize
                    </Button>
                  </Grid>
                </Grid>
                </>
              ) : null }

              {status == 'Passed' || status == 'Not Passed' ? (
                <Grid container alignItems="center" justify="space-between" spacing={1}>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5} align="left" >
                    <StyledBadge badgeContent={yesVotes} color="primary">
                      <IconButton onClick={(e) => handleVotingAction(requestId, 'yes')} disabled={true}>
                        <ThumbUpIcon fontSize='small' color="primary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="center" >
                    <Typography variant="body2">
                      {status}
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
              ) : null }
               
              <Grid container alignItems="center" justify="space-evenly" spacing={1}>

                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  {(accountId != proposer && accountId != applicant) && status=='Submitted' && memberStatus == true ? 
                  <><Button 
                      color="primary" 
                      onClick={(e) => handleSponsorConfirmationClick(requestId, e)}
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
                  {proposalType === 'Member' || proposalType === 'GuildKick' || proposalType === 'Commitment' || proposalType === 'Payout' ? (
                    <><Button 
                        color="primary" 
                        onClick={handleEditProposalClick}>
                          Edit
                      </Button>
                    </>)
                  : null }
                {proposalType === 'Commitment' ? (
                  <><Button 
                      variant="contained" 
                      color="primary" 
                      onClick={(e) => handleFundingProposalDetailsClick(requestId, applicant, status, e)}>
                        Proposal Details
                    </Button>
                  </>) : null } </>: <LinearProgress /> : null }
              </Grid>
            
              </Grid>

                
               
        </Card>

        {editProposalClicked ? <EditProposalForm
          state={state}
          handleEditProposalClickState={handleEditProposalClickState}
          curDaoIdx={curDaoIdx}
          curPersonaIdx={curPersonaIdx}
          applicant={applicant}
          handleUpdate={handleUpdate}
          did={did}
          accountId={accountId}
          proposalId={requestId}
          /> : null }

          {proposalDetailsClicked ? <ProposalDetails
            proposer={proposer}
            handleProposalDetailsClickState={handleProposalDetailsClickState}
            curDaoIdx={curDaoIdx}
            curPersonaIdx={curPersonaIdx}
            applicant={applicant}
            handleUpdate={handleUpdate}
            did={did}
            proposalId={requestId}
            /> : null }

        </>
    )
}