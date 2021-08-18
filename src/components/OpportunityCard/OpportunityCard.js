import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { useParams } from 'react-router-dom'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'
import { dao } from '../../utils/dao'
import Persona from '@aluhning/get-personas-js'
import FundingProposal from '../FundingProposal/fundingProposal'
import EditFundingProposalForm from '../EditProposal/editFundingProposal'
import OpportunityProposalDetails from '../ProposalDetails/opportunityProposalDetails'
import EditOpportunityProposalForm from '../EditProposal/editOpportunityProposal'
import MemberProposal from '../MemberProposal/memberProposal'
import MemberProfileDisplay from '../MemberProfileDisplay/memberProfileDisplay'
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
import DoneIcon from '@material-ui/icons/Done'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import BlockIcon from '@material-ui/icons/Block'

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
  const defaultImage = require('../../img/default_logo.png')

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
    const [communityName, setCommunityName] = useState('')
    const [logo, setLogo] = useState(defaultImage)
    const [thisContractId, setThisContractId] = useState()
    const [memberProfileDisplayClicked, setMemberProfileDisplayClicked] = useState(false)
    const [editFundingProposalDetailsClicked, setEditFundingProposalDetailsClicked] = useState(false)
    const [editOpportunityProposalDetailsClicked, setEditOpportunityProposalDetailsClicked] = useState(false)
    const [opportunityProposalDetailsClicked, setOpportunityProposalDetailsClicked] = useState(false)
    const [memberProposalClicked, setMemberProposalClicked] = useState(false)
    const [fundingProposalClicked, setFundingProposalClicked] = useState(false)
    const [dateValid, setDateValid] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [formattedTime, setFormattedTime] = useState('')
    const { state, dispatch, update } = useContext(appStore)
    const [currDate, setCurrDate] = useState(0)
    const [oldDate, setOldDate] = useState(0)
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
      opportunityId,
      skillCount,
      skillMatch,
      developerSkillCount,
      developerSkillMatch,
      suitabilityScore,
      passedContractId
    } = props

    const {
      contractId
    } = useParams()

    const active = green[500]
    const inactive = red[500]

    const data = new Persona()
    let useContractId

    useEffect(
        () => {
        
        async function fetchData() {
          if(didRegistryContract && near){
            state.isUpdated
            if(!contractId && passedContractId) {
              useContractId = passedContractId
              setThisContractId(passedContractId)
            }
            if(contractId) {
              useContractId = contractId
              setThisContractId(contractId)
            }
            if(useContractId){
              let thisCurDaoIdx
              let daoAccount = new nearAPI.Account(near.connection, useContractId)
               
              thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
            
              setCurDaoIdx(thisCurDaoIdx)
            }
          }
          
          
          if(useContractId && near){
            let contract = await dao.initDaoContract(state.wallet.account(), useContractId)
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
            const daoContract = await dao.initDaoContract(wallet.account(), useContractId)
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

          // get community information
          let daoResult = await data.getDao(useContractId)
          if(daoResult){
            daoResult.name ? setCommunityName(daoResult.name) : setCommunityName('')
            daoResult.logo ? setLogo(daoResult.logo) : setLogo(defaultImage)
          }
          
         
        }
        async function initializeTime(){
          let dateVar = Date.now()
          let oldDateVar 
          setCurrDate(dateVar) 

          if(curDaoIdx){
            let propResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
            console.log('propResult', propResult)
            if(propResult) {
              let i = 0
              while (i < propResult.opportunities.length){
                if(propResult.opportunities[i].opportunityId == opportunityId){
                    oldDateVar = Date.parse(propResult.opportunities[i].deadline)
                    setOldDate(oldDateVar)
                  }
                i++
              }
            }
          }
          //current date must be less than old date + one day in milliseconds to cover
          //day of deadline
          if(dateVar > oldDateVar + 86399999)
          {
            setDateValid(false)
          }
          else{
            setDateValid(true)
          }

        }
        async function setTime(){
          let dateVar = Date.now()
          let oldDateVar 
          setCurrDate(dateVar) 
          if(curDaoIdx){
            let propResult = await curDaoIdx.get('opportunities', curDaoIdx.id)
            console.log('propResult', propResult)
            if(propResult) {
              let i = 0
              while (i < propResult.opportunities.length){
                if(propResult.opportunities[i].opportunityId == opportunityId){
                    oldDateVar = Date.parse(propResult.opportunities[i].deadline)
                    setOldDate(oldDateVar)
                  }
                i++
              }
            }
          }


          //Calculate time to deadline
          if(dateVar > oldDateVar + 86399999){
            setFormattedTime("0:0:0:0")
          }
          else{
          let distance = new Date(oldDateVar) - new Date(dateVar)
          let days = Math.floor(distance / (1000 * 60 * 60 * 24))
          let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          let seconds = Math.floor((distance % (1000 * 60)) / 1000)
          if(days && hours && minutes && seconds){
            setFormattedTime(days + ":" + hours + ":" + minutes + ":" + seconds)
          }
        }
        }
        
        initializeTime()
        setInterval(setTime,1010);
        let mounted = true 
        if(mounted){
        fetchData()
          .then((res) => {
          
          })
        return() => mounted = false
        }
    }, [avatar, status, name, state, near, contractId, isUpdated]
    )
    
    function formatDate(timestamp) {
      let stringDate = timestamp.toString()
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
    }

    function handleUpdate(property){
      setIsUpdated(property)
    }

     // Opportunity Proposal Functions

     const handleEditOpportunityProposalDetailsClick = () => {
      handleExpanded()
      handleEditOpportunityProposalDetailsClickState(true)
    }
  
    function handleEditOpportunityProposalDetailsClickState(property){
      setEditOpportunityProposalDetailsClicked(property)
    }

    // Funding Commitment Proposal Functions

    const handleEditFundingProposalDetailsClick = () => {
      handleExpanded()
      handleEditFundingProposalDetailsClickState(true)
    }
  
    function handleEditFundingProposalDetailsClickState(property){
      setEditFundingProposalDetailsClicked(property)
    }

    const handleMemberProfileDisplayClick = () => {
      handleExpanded()
      handleMemberProfileDisplayClickState(true)
    }

    function handleMemberProfileDisplayClickState(property){
      setMemberProfileDisplayClicked(property)
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
   
        <Card raised={true} className={classes.card}>
          <Grid container alignItems="center" justifyContent="center" spacing={1} style={{padding: '5px'}}>
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Link to={`/dao/${thisContractId}`}>
                <Avatar variant="square" src={logo} />
              </Link>
            </Grid>
            <Grid item xs={12} sm={12} md={9} lg={9} xl={9}>
              <Link to={`/dao/${thisContractId}`}>
                <Typography variant="body1">{communityName ? communityName : thisContractId}</Typography>
              </Link>
            </Grid>
          </Grid>
          <CardHeader
          title={
            <>
            <Button 
             color="primary"
             style={{fontWeight: '800', fontSize: '110%', lineHeight: '1.1em'}}
             onClick={handleOpportunityProposalDetailsClick}
            >{title}
            </Button>
            </>}
          subheader={ <> <Grid container alignItems="flex-start" justifyContent="space-between">
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
             <Typography variant="overline">Added: {created ? formatDate(created) : null}</Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '10px'}}>
          <Typography variant="overline">Proposer:</Typography>
            <Chip avatar={<Avatar src={avatar} className={classes.small} onClick={handleMemberProfileDisplayClick}/>} label={name != '' ? name : creator}/>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '10px'}}>
          <Typography variant="overline">TIme Remaining: {formattedTime}</Typography>

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
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Typography variant="h6" align="center">Base Reward</Typography>
                <Typography variant="h6" align="center">{reward} Ⓝ</Typography><br></br>
                <Chip
                  label={`Suitability Score: ${suitabilityScore}%`}
                  icon={suitabilityScore > 75 ? <DoneIcon /> 
                    : suitabilityScore > 50 && suitabilityScore < 75 ? <HelpOutlineIcon />
                    : suitabilityScore < 50 ? <BlockIcon />
                    : <BlockIcon />}
                  variant="outlined"
                  align="center"
                />
              </Grid>
              
            </Grid>
          </CardContent>
          <CardActions>
          {status == 'Passed' ? 
          dateValid ? (
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
          ) : (
            <>
            <Button 
               color="primary" 
               disabled>
                Expired
             </Button>
             </>
          ): null}
          
            <Button 
              color="primary"
              align="right"
              onClick={handleOpportunityProposalDetailsClick}>
                Details
            </Button>
            {accountId == creator ? (
            <Button 
              color="primary"
              align="right"
              onClick={handleEditOpportunityProposalDetailsClick}>
                Edit
            </Button>
            ) : null }
          </CardActions>
        </Card>

        {memberProfileDisplayClicked ? <MemberProfileDisplay
          handleMemberProfileDisplayClickState={handleMemberProfileDisplayClickState}
          member={accountId}
          /> : null }

        {fundingProposalClicked ? <FundingProposal
          contractId={thisContractId}
          handleFundingProposalClickState={handleFundingProposalClickState}
          state={state}
          depositToken={'Ⓝ'}
          proposalDeposit={proposalDeposit}
          tokenName={'Ⓝ'}
          accountId={accountId} 
          reference={opportunityId}
          /> : null }

        {memberProposalClicked ? <MemberProposal
          contractId={thisContractId}
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
          contractId={thisContractId}
          /> : null }

          {editOpportunityProposalDetailsClicked ? <EditOpportunityProposalForm
            state={state}
            handleEditOpportunityProposalDetailsClickState={handleEditOpportunityProposalDetailsClickState}
            curDaoIdx={curDaoIdx}
            applicant={accountId}
            proposer={creator}
            handleUpdate={handleUpdate}
            accountId={accountId}
            opportunityId={opportunityId}
            contractId={thisContractId}
            /> : null }

          </>
    )
}