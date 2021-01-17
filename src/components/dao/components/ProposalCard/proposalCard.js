import React, { useState, useEffect } from 'react'

// Material UI Components
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import ThumbUpAlt from '@material-ui/icons/ThumbUpAlt'
import ThumbDownAlt from '@material-ui/icons/ThumbDownAlt'
import Badge from '@material-ui/core/Badge'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import PanToolIcon from '@material-ui/icons/PanTool'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      marginTop: '15px',
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
        isVotingPeriod, isGracePeriod, voted, gracePeriod, votingPeriod, currentPeriod, periodDuration, cancelFinish, sponsorFinish,
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

    }, [status]
    )


    return(
        <>
        <Card raised={true} className={classes.card}>
            <CardHeader
                avatar={<Avatar className={classes.avatar}>M</Avatar>}
                action={
                    <IconButton aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                }
                  title={proposer}
                  subheader={created}
            />
            <CardContent>
                <Typography className={classes.pos} color="textSecondary">
                  {proposalType}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Status: {status}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                    {shares} {shares > 1 ? 'shares' : 'share'}, {loot}, {tribute}
                </Typography>


            </CardContent>
            <CardActions disableSpacing>

              {status == 'Sponsored' && isVotingPeriod && !isGracePeriod ? (
                <Grid container alignItems="center" spacing={1}>
                  <Grid xs={4} sm={4} md={4} lg={4} xl={4} alignContent="left">
                    <StyledBadge badgeContent={yesVotes} color="primary">
                      <IconButton onClick={(e) => handleYesVotingAction(requestId, e)} disabled={voted}>
                        <ThumbUpIcon fontSize='large' color="primary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                  <Grid xs={4} sm={4} md={4} lg={4} xl={4} alignContent="center">
                    <Typography variant="body2" align="center">
                      {status}
                    </Typography>
                  </Grid>
                  <Grid xs={4} sm={4} md={4} lg={4} xl={4} alignContent="right">
                    <StyledBadge badgeContent={noVotes} color="secondary">
                      <IconButton onClick={(e) => handleNoVotingAction(requestId, e)} disabled={voted}>
                        <ThumbDownIcon fontSize='large' color="secondary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                  <Typography variant="caption" display="block">Voting Ends in {((votingPeriod - currentPeriod)+1) * periodDuration / 60} minutes</Typography>
                </Grid>
              ) : null }

              {status == 'Sponsored' && isGracePeriod && !isVotingPeriod && vote != 'yes' ? (
                <Grid container alignItems="center" spacing={1}>
                <Grid xs={12} sm={12} md={12} lg={12} xl={12} alignContent="center">
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
                <Typography variant="caption" display="block">RageQuit ends in {((gracePeriod - currentPeriod)+1) * periodDuration / 60} {(((gracePeriod - currentPeriod)+1) * periodDuration / 60) > 1 ? 'minutes':'minute'}</Typography>
              </Grid>
              ) : null }

              {status == 'Passed' || status == 'Not Passed' ? (
                <Grid container alignItems="center" spacing={1}>
                  <Grid xs={4} sm={4} md={4} lg={4} xl={4} alignContent="left">
                    <StyledBadge badgeContent={yesVotes} color="primary">
                      <IconButton onClick={(e) => handleYesVotingAction(requestId, e)} disabled={true}>
                        <ThumbUpIcon fontSize='large' color="primary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                  <Grid xs={4} sm={4} md={4} lg={4} xl={4} alignContent="center">
                    <Typography variant="body2" align="center">
                      {status}
                    </Typography>
                  </Grid>
                  <Grid xs={4} sm={4} md={4} lg={4} xl={4} alignContent="right">
                    <StyledBadge badgeContent={noVotes} color="secondary">
                      <IconButton onClick={(e) => handleNoVotingAction(requestId, e)} disabled={true}>
                        <ThumbDownIcon fontSize='large' color="secondary" />
                      </IconButton>
                    </StyledBadge>
                  </Grid>
                </Grid>
              ) : null }
               
                {proposalType === 'Member' ? <><Button variant="contained" color="primary" onClick={(e) => handleMemberProposalDetailsClick(requestId, applicant, e)}>Details</Button></> : null }
                {proposalType === 'Funding' ? <><Button variant="contained" color="primary" onClick={(e) => handleFundingProposalDetailsClick(requestId, applicant, e)}>Details</Button></> : null }
                {status == 'Submitted' && accountId == proposer ? <Typography variant="caption" display="block">Awaiting Sponsor</Typography> : null}
                {(accountId != proposer && accountId != applicant) && status=='Submitted' ? sponsorFinish ? <><Button variant="contained" color="primary" onClick={(e) => handleSponsorConfirmationClick(requestId, e)}>Sponsor</Button></> : <CircularProgress /> : null}
               
                {(accountId == proposer || (accountId == applicant && proposalType != 'GuildKick')) && status=='Submitted' ? cancelFinish ? <><Button variant="contained" color="primary" onClick={() => handleCancelAction(requestId, tribute)}>Cancel</Button> </>: <CircularProgress /> : null } 
                
                </CardActions>
        </Card>
        </>
    )
}