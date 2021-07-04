import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useParams } from 'react-router-dom'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'
import { dao } from '../../utils/dao'
import Persona from '@aluhning/get-personas-js'
import FundingProposal from '../FundingProposal/fundingProposal'
import EditFundingProposalForm from '../EditProposal/editFundingProposal'
import OpportunityProposalDetails from '../ProposalDetails/opportunityProposalDetails'
import MemberProposal from '../MemberProposal/memberProposal'
import { getStatus } from '../../state/near'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { green, red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      margin: 'auto',
      maxWidth: '250px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    header: {
      display: 'inherit'
    }
  }));

  const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function OpportunityCard(props) {

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [did, setDid] = useState()
    const [curUserIdx, setCurUserIdx] = useState()
    const [joined, setJoined] = useState(props.joined)
    const [contribution, setDonation] = useState()
    const [isUpdated, setIsUpdated] = useState()
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [status, setStatus] = useState()
    const [proposalDeposit, setProposalDeposit] = useState()
    const [memberStatus, setMemberStatus] = useState()

    const [editFundingProposalDetailsClicked, setEditFundingProposalDetailsClicked] = useState(false)
    const [opportunityProposalDetailsClicked, setOpportunityProposalDetailsClicked] = useState(false)
    const [memberProposalClicked, setMemberProposalClicked] = useState(false)
    const [fundingProposalClicked, setFundingProposalClicked] = useState(false)



    const [anchorEl, setAnchorEl] = useState(null)

    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near, 
      appIdx,
      accountId,
      wallet,
      deposit
    } = state

    const classes = useStyles();

    const {
      creator,
      created,
      updated,
      title,
      details,
      reward,
      projectName,
      category,
      opportunityStatus,
      permission,
      opportunityId
    } = props

    const {
      contractId
    } = useParams()

    const active = green[500]
    const inactive = red[500]

    const data = new Persona()

    useEffect(
        () => {
         
        async function fetchData() {

          if(didRegistryContract && near){
            if(contractId){
              let thisCurDaoIdx
              let daoAccount = new nearAPI.Account(near.connection, contractId)
               
              thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
            
              setCurDaoIdx(thisCurDaoIdx)
            }
          }

          if(contractId && near){
            let contract = await dao.initDaoContract(state.wallet.account(), contractId)
            try {
              let deposit = await contract.getProposalDeposit()
              setProposalDeposit(deposit)
            } catch (err) {
              console.log('no proposal deposit yet')
            }  
            
            try {
              let thisMemberInfo = await contract.getMemberInfo({member: accountId})
          
              let thisMemberStatus = await contract.getMemberStatus({member: accountId})
             
              if(thisMemberStatus && thisMemberInfo[0].active){
                setMemberStatus(true)
              } else {
                setMemberStatus(false)
              }
            } catch (err) {
              console.log('no member info yet')
            }

          }

          if(wallet && opportunityId){
            const daoContract = await dao.initDaoContract(wallet.account(), contractId)
            let proposal = await daoContract.getProposal({proposalId: parseInt(opportunityId)})
            let thisStatus = getStatus(proposal.f)
            setStatus(thisStatus)
          }

          if(creator){

            // Get Persona data
            let result = await data.getPersona(creator)
        
            if(result){
              result.date ? setDate(result.date) : setDate('')
              result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
              result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
              result.name ? setName(result.name) : setName('')
            }
          }
        }
        
        fetchData()
          .then((res) => {
           
          })

    }, [avatar, status, name, state, near, isUpdated]
    )
    
    function formatDate(timestamp) {
      let stringDate = timestamp.toString()
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
    }

    function handleUpdate(property){
      setIsUpdated(property)
    }

    // Funding Commitment Proposal Functions

    const handleEditFundingProposalDetailsClick = () => {
      handleExpanded()
      handleEditFundingProposalDetailsClickState(true)
    }
  
    function handleEditFundingProposalDetailsClickState(property){
      setEditFundingProposalDetailsClicked(property)
    }

    
    const handleMemberProposalClick = () => {
      handleExpanded()
      handleMemberProposalClickState(true)
    }

    function handleMemberProposalClickState(property) {
      setMemberProposalClicked(property)
    }

    const handleOpportunityProposalDetailsClick = () => {
      handleExpanded()
      handleOpportunityProposalDetailsClickState(true)
    }
  
    function handleOpportunityProposalDetailsClickState(property){
      setOpportunityProposalDetailsClicked(property)
    }

    const handleFundingProposalClick = () => {
      handleExpanded()
      setFundingProposalClicked(true)
    }

    function handleFundingProposalClickState(property) {
      setFundingProposalClicked(property)
    }
    
    function handleExpanded() {
      setAnchorEl(null)
    }


    return(
        <>
   
        <Card raised={true} className={classes.card} >         
          <CardHeader
          title={<Typography variant="h5" align="center">{title}</Typography>}
          subheader={ <> <Grid container alignItems="flex-start" justify="space-between">
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
             <Typography variant="overline">Added: {created ? formatDate(created) : null}</Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '10px'}}>
          <Typography variant="overline">Proposer:</Typography>
            <Chip avatar={<Avatar src={avatar} className={classes.small}  />} label={name != '' ? name : creator}/>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
            <Chip label={status == 'Passed' && opportunityStatus ? 'Active' : 'Inactive'} style={{marginRight: '10px'}}/>
            <Chip color="primary" label={category}/>
          </Grid>
          </Grid>
          </>}
          className={classes.header}
          />
 
          <CardContent>
            <Grid container alignItems="center" style={{marginTop: '-20px', display:'inherit'}}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Typography variant="h6" align="center">Base Reward</Typography>
                <Typography variant="h6" align="center">{reward} Ⓝ</Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
          {status == 'Passed' ? 
            memberStatus ? (
            <>
           <Button 
              color="primary" 
              onClick={handleFundingProposalClick}>
                Accept
            </Button>
            </>
            ) : (
              <>
              <Button 
                 color="primary" 
                 onClick={handleMemberProposalClick}>
                  Join Community
               </Button>
               </>
            )
            
            : null }
            <Button 
              color="primary"
              align="right"
              onClick={handleOpportunityProposalDetailsClick}>
                Details
            </Button>
          </CardActions>
        </Card>
       
        {fundingProposalClicked ? <FundingProposal
          contractId={contractId}
          handleFundingProposalClickState={handleFundingProposalClickState}
          state={state}
          depositToken={'Ⓝ'}
          proposalDeposit={proposalDeposit}
          tokenName={'Ⓝ'}
          accountId={accountId} 
         
          /> : null }

        {memberProposalClicked ? <MemberProposal
          contractId={contractId}
          state={state}
          depositToken={'Ⓝ'}
          proposalDeposit={proposalDeposit}
          handleMemberProposalClickState={handleMemberProposalClickState} 
          accountId={accountId} 
    
          /> : null }

        {editFundingProposalDetailsClicked ? <EditFundingProposalForm
          state={state}
          handleEditFundingProposalDetailsClickState={handleEditFundingProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          applicant={accountId}
          proposer={creator}
          handleUpdate={handleUpdate}
          accountId={accountId}
          proposalId={opportunityId}
          /> : null }

        {opportunityProposalDetailsClicked ? <OpportunityProposalDetails
          proposer={creator}
          handleOpportunityProposalDetailsClickState={handleOpportunityProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          applicant={accountId}
          handleUpdate={handleUpdate}
          opportunityId={opportunityId}
          /> : null }

          </>
    )
}