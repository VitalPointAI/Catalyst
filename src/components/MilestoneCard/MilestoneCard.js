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
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import RestoreFromTrashIcon from '@material-ui/icons/RestoreFromTrash'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      margin: 'auto',
      width: '100%',
      minWidth: '100%',
      marginBottom: '10px',
      paddingLeft: '2px'
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
      cancelled,
      editForm,
      form
    } = props

    const {
      contractId
    } = useParams()

console.log('id:', id)
console.log('cancelled', cancelled)
    const classes = useStyles()
    
    function formatDate(timestamp) {
      let stringDate = timestamp.toString()
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
    }
    
    let referenceIds = [{
      proposal: proposalId.toString(), 
      milestone: id,
      title: name
    }]

    console.log('reference ids', referenceIds)

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
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3} align="left" >
              <Typography variant="body2">{name}</Typography>
            </Grid>
            <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="left" >
              <Typography variant="body2">{description}</Typography>
            </Grid>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="left" >
              <Typography variant="body2">{deadline}</Typography>
            </Grid>
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3} align="left">
              <Typography variant="body2" align="center">{parseFloat(payout).toFixed(2)} Ⓝ</Typography>
            </Grid>
            {proposalStatus == 'Passed' ?
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="right">
              {!editForm ? 
                paid ? 
                    <Typography variant="body1">Paid</Typography> 
                    :
                    !cancelled ? 
                      proposalStatus == 'Passed' && accountId == applicant ? 
                      (<>
                        <IconButton variant="outlined" onClick={handlePayoutProposalClick}>
                          <MonetizationOnIcon/>
                        </IconButton>
                        <IconButton variant="outlined" onClick={handleCancelCommitmentProposalClick}>
                          <RestoreFromTrashIcon />
                        </IconButton>
                      </>
                      ) : 
                        proposalStatus == 'Passed' && Date.now() > new Date(deadline) ? 
                          <IconButton variant="outlined" onClick={handleCancelCommitmentProposalClick}>
                            <RestoreFromTrashIcon />
                          </IconButton>
                        : null
                    : <Typography variant="overline">Cancelled</Typography>
              : null }
              </Grid>
            : null }
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