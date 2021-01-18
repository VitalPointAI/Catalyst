import React, { useState, useEffect } from 'react'

// Material UI Components
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
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
      marginTop: '10px'
    },
    votes: {
      paddingLeft: 0,
      paddingRight: '10px'
    },
    avatar: {
      backgroundColor: red[500],
    },
  }));

  const StyledBadge = withStyles((theme) => ({
    badge: {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }))(Badge);

export default function ProposalCard(props) {


    const classes = useStyles();

    const { applicant, created, noVotes, yesVotes, proposalType, proposer, requestId, tribute, vote, loot, shares, status, accountId,
        isVotingPeriod, isGracePeriod, voted, gracePeriod, votingPeriod, currentPeriod, periodDuration, cancelFinish, sponsorFinish, sponsor,
        handleMemberProposalDetailsClick,
        handleFundingProposalDetailsClick,
        handleSponsorConfirmationClick,
        handleCancelAction,
        handleYesVotingAction,
        handleNoVotingAction,
        handleRageQuitClick
    } = props

    useEffect(
        () => {

    }, [status, voted]
    )


    return(
        <>
        <Card raised={true} className={classes.card}>
          {proposalType === 'Member' ? (
           <> <Typography variant="h6" align="center" color="textSecondary">{proposalType} Proposal</Typography>
         
            <CardHeader
              title={<Chip
                avatar={<Avatar alt="Member" src="../../../images/default-profile.png" />}
                label={applicant}
                variant="outlined"
              />}
              subheader={<><Typography variant="overline">Proposed: {created}</Typography><Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography></>}
            /></>
          ) : null }

          {proposalType === 'Funding' ? (
            <> <Typography variant="h6" align="center" color="textSecondary">{proposalType} Proposal</Typography>
             <Typography variant="overline" align="center" color="textSecondary">Sponsored by: {sponsor}</Typography>
            <CardHeader
              title={<Chip
                avatar={<Avatar alt="Funding" src="../../../images/dollar.png" />}
                label={proposer}
                variant="outlined"
              />}
              subheader={`Proposed: ${created}`}
            /></>
          ) : null }

            <CardContent>
              <Grid container alignItems="center" justify="space-evenly" style={{marginTop: '-20px', marginBottom:'20px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Typography variant="overline">Shares: {shares}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Typography variant="overline">{`Tribute: ${tribute} Ⓝ`}</Typography>
                </Grid>
              </Grid>
              <Grid container alignItems="center" justify="space-evenly" spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  {proposalType === 'Member' ? (
                    <><Button 
                        variant="contained" 
                        color="primary" 
                        onClick={(e) => handleMemberProposalDetailsClick(requestId, applicant, e)}>
                          Proposal Details
                      </Button>
                    </>) : null }

                  {proposalType === 'Funding' ? (
                    <><Button 
                        variant="contained" 
                        color="primary" 
                        onClick={(e) => handleFundingProposalDetailsClick(requestId, applicant, e)}>
                          Proposal Details
                      </Button>
                    </>) : null }
                  </Grid>
                </Grid>

                <Divider className={classes.divider}/>
                {status == 'Submitted' && accountId == proposer ? <Typography variant="subtitle2" display="block" align="center">Awaiting Sponsor</Typography> : null}

            </CardContent>
            <CardActions disableSpacing>

              {status == 'Sponsored' && isVotingPeriod && !isGracePeriod ? (
                <Grid container alignItems="center" justify="space-evenly" spacing={1}>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                      <StyledBadge badgeContent={yesVotes} color="primary">
                        <IconButton onClick={(e) => handleYesVotingAction(requestId, e)} disabled={voted}>
                          <ThumbUpIcon fontSize='large' color="primary" />
                        </IconButton>
                      </StyledBadge>
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} >
                    <Typography variant="body2" align="center">
                      {status}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} className={classes.votes} >
                      <StyledBadge badgeContent={noVotes} color="secondary">
                        <IconButton onClick={(e) => handleNoVotingAction(requestId, e)} disabled={voted}>
                          <ThumbDownIcon fontSize='large' color="secondary" />
                        </IconButton>
                      </StyledBadge>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                    <Typography variant="caption" display="block">Voting Ends in {(((votingPeriod - currentPeriod)+1) * periodDuration / 60).toFixed(2)} minutes</Typography>
                  </Grid>
                </Grid>
              ) : null }

              {status == 'Sponsored' && isGracePeriod && !isVotingPeriod && vote != 'yes' ? (
                <Grid container alignItems="center" justify="space-evenly" spacing={1}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                    <Button
                      variant="contained"
                      color="secondary"
                      className={classes.button}
                      startIcon={<PanToolIcon />}
                      onClick={handleRageQuitClick}
                    >
                    Rage Quit
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                    <Typography variant="caption" display="block">RageQuit ends in {(((gracePeriod - currentPeriod)+1) * periodDuration / 60).toFixed(2)} {(((gracePeriod - currentPeriod)+1) * periodDuration / 60) > 1 ? 'minutes':'minute'}</Typography>
                  </Grid>
                </Grid>
              ) : null }

              {status == 'Passed' || status == 'Not Passed' ? (
                <Grid container alignItems="center" justify="space-evenly" spacing={1}>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} className={classes.votes}>
                    <StyledBadge badgeContent={yesVotes} color="primary">
                      <IconButton onClick={(e) => handleYesVotingAction(requestId, e)} disabled={true}>
                        <ThumbUpIcon fontSize='large' color="primary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} >
                    <Typography variant="body2" align="center">
                      {status}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} className={classes.votes}>
                    <StyledBadge badgeContent={noVotes} color="secondary">
                      <IconButton onClick={(e) => handleNoVotingAction(requestId, e)} disabled={true}>
                        <ThumbDownIcon fontSize='large' color="secondary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                </Grid>
              ) : null }
               
                
               
                {(accountId != proposer && accountId != applicant) && status=='Submitted' ? sponsorFinish ? <><Button color="primary" onClick={(e) => handleSponsorConfirmationClick(requestId, e)}>Sponsor</Button></> : <LinearProgress /> : null}
               
                {(accountId == proposer || (accountId == applicant && proposalType != 'GuildKick')) && status=='Submitted' ? cancelFinish ? <><Button color="primary" onClick={() => handleCancelAction(requestId, tribute)}>Cancel</Button> </>: <LinearProgress /> : null } 
                
                </CardActions>
        </Card>
        </>
    )
}