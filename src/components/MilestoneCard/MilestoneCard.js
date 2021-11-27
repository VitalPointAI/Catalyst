import React, { useState, useEffect, useContext } from 'react'
import { explorerUrl } from '../../state/near'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import PayoutProposal from '../PayoutProposal/payoutProposal'
import CancelCommitmentProposal from '../CancelCommitment/cancelCommitmentProposal'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      margin: 'auto',
      width: '100%',
      minWidth: '100%',
      marginBottom: '10px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    header: {
      display: 'inherit'
    }
  }));

  const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function MilestoneCard(props) {

    const [payoutProposalClicked, setPayoutProposalClicked] = useState(false)
    const [cancelCommitmentProposalClicked, setCancelCommitmentProposalClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)

    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near, 
      appIdx,
      accountId, 
      proposalDeposit,
      tokenName,
      depositToken
    } = state

    const {
      id,
      name,
      deadline,
      payout,
      description,
      proposalId,
      proposalStatus,
      applicant,
      paid,
      cancelled
    } = props

    const {
      contractId
    } = useParams()

    const classes = useStyles()


    useEffect(
        () => {
         
        async function fetchData() {
        }
        
        fetchData()
          .then((res) => {
           
          })

    }, []
    )
    
    function formatDate(timestamp) {
      let stringDate = timestamp.toString()
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
    }
    
    let referenceIds = [{
      proposal: proposalId,
      milestone: id
    }]

    const handlePayoutProposalClick = () => {
      handleExpanded()
      setPayoutProposalClicked(true)
    }

    function handlePayoutProposalClickState(property) {
      setPayoutProposalClicked(property)
    }

    const handleCancelCommitmentProposalClick = () => {
      handleExpanded()
      setCancelCommitmentProposalClicked(true)
    }

    function handleCancelCommitmentProposalClickState(property) {
      setCancelCommitmentProposalClicked(property)
    }


    function handleExpanded() {
      setAnchorEl(null)
    }
  
    return(
        <>
        <Card raised={true} className={classes.card} >
          <Grid container justifyContent="flex-start" alignItems="center" spacing={1}>
            <Grid item xs={1} sm={1} md={1} lg={1} xl={1} align="center">
              <Typography variant="body2" noWrap="true">{id}</Typography>
            </Grid>
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3} align="left" >
              <Typography variant="body2">{name}</Typography>
            </Grid>
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3} align="left" >
              <Typography variant="body2">{description}</Typography>
            </Grid>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="left" >
              <Typography variant="body2">{deadline}</Typography>
            </Grid>
            <Grid item xs={1} sm={1} md={1} lg={1} xl={1} align="left">
              <Typography variant="body2" align="center">{payout} Ⓝ</Typography>
            </Grid>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="center">
            {paid ? <Typography variant="overline">Paid</Typography> :
              proposalStatus == 'Passed' && accountId == applicant && !cancelled ? (
                <Button onClick={handlePayoutProposalClick} variant="contained" color="primary">Request Payout</Button>
              ) : null
            }<br></br>
            {cancelled ? <Typography variant="overline">Cancelled</Typography> :
              proposalStatus == 'Passed' && Date.now() > new Date(deadline) ? (
                <Button onClick={handleCancelCommitmentProposalClick} variant="contained" color="primary">Propose Cancellation</Button>
              ) : null
            }
            </Grid>
          </Grid>
        </Card>

        {payoutProposalClicked ? <PayoutProposal
          contractId={contractId}
          state={state}
          proposalDeposit={proposalDeposit}
          depositToken={depositToken}
          tokenName={tokenName}
          handlePayoutProposalClickState={handlePayoutProposalClickState}
          reference={referenceIds}
          accountId={accountId}
          milestonePayout={payout}
          /> : null }

        {cancelCommitmentProposalClicked ? <CancelCommitmentProposal
          contractId={contractId}
          state={state}
          proposalDeposit={proposalDeposit}
          depositToken={depositToken}
          tokenName={tokenName}
          handleCancelCommitmentProposalClickState={handleCancelCommitmentProposalClickState}
          reference={referenceIds}
          accountId={accountId}
          milestonePayout={payout}
          /> : null }
        </>

       
    )
}