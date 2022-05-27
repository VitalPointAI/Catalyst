import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { appStore, onAppMount } from '../../../state/app'
import { useParams } from 'react-router-dom'
import { get, set, del } from '../../../utils/storage'
import {OPPORTUNITY_NOTIFICATION, PROPOSAL_NOTIFICATION, networkId} from '../../../state/near' 
import { ceramic } from '../../../utils/ceramic'
import { dao } from '../../../utils/dao'
import FundingProposal from '../../FundingProposal/fundingProposal'
import OpportunityProposalDetails from '../../ProposalDetails/opportunityProposalDetails'
import EditOpportunityProposalForm from '../../EditProposal/editOpportunityProposal'
import MemberProposal from '../../MemberProposal/memberProposal'
import MemberProfileDisplay from '../../MemberProfileDisplay/memberProfileDisplay'
import { getStatus, daoRootName } from '../../../state/near'
import { parseNearAmount, formatNearAmount } from 'near-api-js/lib/utils/format'

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
import LinearProgress from '@material-ui/core/LinearProgress'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      maxWidth: '250px',
      margin: '10px 10px 10px 10px'
    },
    logoImage: {
      width: 'fit-content',
      height: '60px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    header: {
      display: 'inherit'
    }
  }));

  function LinearProgressWithLabel(props) {
    return (<>
      <Typography variant="overline" align="center">Suitability Score</Typography>  
      <Tooltip TransitionComponent={Zoom} title="The higher the score, the more skills you have that match the opportunity requirements.">
        <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
      </Tooltip>
     
      <Box alignItems="center">
        <Box maxWidth={75}>
          <Typography variant="body2" color="textSecondary">
          {`${props.value} % `}
            {
              props.value >= 75 ? (
                <Tooltip TransitionComponent={Zoom} title="Go for it!">
                  <DoneIcon fontSize="small" style={{marginRight:'10px', marginTop:'-3px'}} />
                </Tooltip>
              )
              : props.value > 50 && props.value <= 74 ? (
                <Tooltip TransitionComponent={Zoom} title="Doable with some learning.">
                  <HelpOutlineIcon fontSize="small" style={{marginRight:'10px', marginTop:'-3px'}} />
                </Tooltip>
              )
              : props.value <= 50 ? (
                <Tooltip TransitionComponent={Zoom} title="Not Recommended.">
                  <BlockIcon fontSize="small" style={{marginRight:'10px', marginTop:'-3px'}} />
                </Tooltip>
              )
              : (
                <Tooltip TransitionComponent={Zoom} title="Not Recommended.">
                  <BlockIcon fontSize="small" style={{marginRight:'10px', marginTop:'-3px'}} />
                </Tooltip>
              )
            }
            </Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center">
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">0</Typography>
        </Box>
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">100</Typography>
        </Box>
      </Box>
      </>
    )
  }

  LinearProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate and buffer variants.
     * Value between 0 and 100.
     */
    value: PropTypes.number.isRequired,
  }

  const imageName = require('../../../img/default-profile.png') // default no-image avatar
  const defaultImage = require('../../../img/default_logo.png')
  const logoName = require('../../../img/default_logo.png') // default no-logo image

export default function OpportunityCard(props) {

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

    const [accountType, setAccountType] = useState('')

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [reward, setReward] = useState('Calculating...')
    
    const [communityName, setCommunityName] = useState('')
    const [logo, setLogo] = useState(defaultImage)
  
    const [contract, setContract] = useState()
    const [memberProfileDisplayClicked, setMemberProfileDisplayClicked] = useState(false)
    const [editOpportunityProposalDetailsClicked, setEditOpportunityProposalDetailsClicked] = useState(false)
    const [opportunityProposalDetailsClicked, setOpportunityProposalDetailsClicked] = useState(false)
    const [memberProposalClicked, setMemberProposalClicked] = useState(false)
    const [fundingProposalClicked, setFundingProposalClicked] = useState(false)
    const [dateValid, setDateValid] = useState(false)
    const [dateLoaded, setDateLoaded] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [formattedTime, setFormattedTime] = useState('')
    const [days, setDays] = useState(0)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)
    const [memberProposalPresent, setMemberProposalPresent] = useState(false)
    const [memberStatus, setMemberStatus] = useState(false)
    const { state, dispatch, update } = useContext(appStore)
    const [progress, setProgress] = useState(0)

    const {
      didRegistryContract,
      near, 
      appIdx,
      account,
      accountId,
      wallet,
      deposit,
      daoFactory,
      isUpdated, 
      nearPrice,
      proposalDeposit,
      currentDaosList
    } = state

    const classes = useStyles();

    const {
      creator,
      created,
      curDaoIdx,
      passedProposalDeposit,
      status,
      updated,
      title,
      details,
      projectName,
      category,
      opportunityStatus,
      permission,
      opportunityId,
      skillMatch,
      allSkills,
      suitabilityScore,
      passedContractId,
      deadline,
      budget,
      usd,
      did
    } = props


    const {
      contractId
    } = useParams()

    console.log('opp card proposal deposit', proposalDeposit)
    console.log('opp card passed prop deposit', passedProposalDeposit)


    useEffect(() => {
      async function fetchPrice() {
          if(usd > 0 && nearPrice > 0 ){
            let near = (usd / nearPrice).toFixed(3)
            let parse = parseNearAmount(near)
            let formatNear = formatNearAmount(parse, 3)
            setReward(formatNear)
          } 
          if(!nearPrice){
            setReward('Calculating ')
          }
          if((!usd || usd == 0) && nearPrice) {
            setReward('0')
          }
      }

      fetchPrice()
      
    }, [usd, nearPrice]
    )

    useEffect(() => {
      async function fetchMemberStatus(){
        if(contract && accountId){
          let thisMemberStatus = await contract.getMemberStatus({member: accountId})
          setMemberStatus(thisMemberStatus)
        }
      }

      fetchMemberStatus()
      .then((res) => {

      })
    }, [contract, accountId]
    )


    useEffect(() => {
      if(deadline){
        let timer = setInterval(function() {
          setDateLoaded(false)
          let splitDate = deadline.split("-")
          let countDownDate = new Date(splitDate[0], splitDate[1]-1, splitDate[2]).getTime()
          let now = new Date().getTime()
          let distance = countDownDate - now
          if(distance > 0){
            let thisDays = Math.floor(distance / (1000 * 60 * 60 * 24))
            let thisHours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 *60 * 60))
            let thisMinutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            let thisSeconds = Math.floor((distance % (1000 * 60)) / 1000)
            if(thisDays && thisHours && thisMinutes && thisSeconds){
              setDays(thisDays)
              setHours(thisHours)
              setMinutes(thisMinutes)
              setSeconds(thisSeconds)
              setDateValid(true)
            }
          } else {
            setDays(0)
            setHours(0)
            setMinutes(0)
            setSeconds(0)
            setDateValid(false)
            clearInterval(timer)
          }
          setDateLoaded(true)
        }, 1000)
      } 
    }, [deadline])


    useEffect(
        () => {
          if(isUpdated){}
        async function fetchData() {
         
          let notificationFlag = get(OPPORTUNITY_NOTIFICATION, [])
          if(notificationFlag[0]){
            //open the proposal with the correct id
            if(opportunityId == notificationFlag[0].proposalId){
              del(OPPORTUNITY_NOTIFICATION)
              handleOpportunityProposalDetailsClick()
            }
          }

           // Get Persona Information           
           if(creator && appIdx){

            let thisAccountType
            try{
                thisAccountType = await didRegistryContract.getType({accountId: accountId})
                setAccountType(thisAccountType)
              } catch (err) {
                thisAccountType = 'none'
                console.log('account not registered, not type avail', err)
            }
            
            
            // Proposer
            let proposerDid = await ceramic.getDid(creator, daoFactory, didRegistryContract)
            if(thisAccountType != 'guild') {
              let result = await appIdx.get('profile', proposerDid)
              console.log('indiv result', result)
              if(result){
                  result.avatar ? setProposerAvatar(result.avatar) : setProposerAvatar(imageName)
                  result.name ? setProposerName(result.name) : setProposerName('')
                  result.profileNft ? setPfpProposerAvatar(result.profileNft) : setPfpProposerAvatar('')
              }
            } else {
                if(thisAccountType == 'guild'){
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
          
          // get community information
          if(appIdx && currentDaosList){
            let daoDid

            for(let x = 0; x < currentDaosList.length; x++){
              if(currentDaosList[x].contractId == passedContractId || currentDaosList[x].contractId == contractId){
                daoDid = currentDaosList[x].did
                break
              }
            }
           console.log('daodid', daoDid)
            let daoResult = await appIdx.get('daoProfile', daoDid)
            if(daoResult){
              daoResult.name ? setCommunityName(daoResult.name) : setCommunityName('')
              daoResult.logo ? setLogo(daoResult.logo) : setLogo(defaultImage)
            }
          }
          
        }

        let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
            
          })
        return() => mounted = false
        }
    }, [appIdx, currentDaosList, isUpdated]
    )
    
    useEffect(() => {
      async function getProposalStatus(){
        if(contract && accountId){
          console.log('accountid here', accountId)
          try{
            console.log('contract', contract)
            let proposalPresent = await contract.getMemberProposalPresent({applicant: accountId})
            setMemberProposalPresent(proposalPresent)
          } catch (err) {
            console.log('error getting proposal present', err)
          }
        }
      }

      getProposalStatus()
      .then((res) => {

      })
    },[contract, accountId]
    )

    useEffect(() => {
      if(progress < parseInt(suitabilityScore)){
        const timer = setInterval(() => {
          setProgress((prevProgress) => (prevProgress < parseInt(suitabilityScore) ? prevProgress + 1 : prevProgress))
        }, 25)
        return () => {
          clearInterval(timer)
        }
      }
    }, [])

    useEffect(() => {
      async function fetchContract(){
        if(account && (contractId || passedContractId)){
          let thisContract
          if(contractId){
            thisContract = await dao.initDaoContract(account, contractId)
            setContract(thisContract)
          }
          if(passedContractId){
            thisContract = await dao.initDaoContract(account, passedContractId)
            setContract(thisContract)
          }
        }
      }

      fetchContract()
      .then(() => {

      })
    }, [account, passedContractId, contractId])
    
   
    function formatDate(timestamp) {
      let stringDate = timestamp.toString()
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
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

    // Member proposal functions

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

    // Funding Proposal Acceptance Functions

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
  
    let daoLink = `localhost:3003/dao/${contractId ? contractId : passedContractId}`

    return(
        <>
   
        <Card raised={true} className={classes.card}>

          <Grid container alignItems="center" justifyContent="center" spacing={1} style={{padding: '5px'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              { status == 'Passed' && dateValid && budget > 0 && opportunityStatus ?
                <Chip label="Active" style={{marginRight: '10px', backgroundColor: 'green', color:'white'}}/>
              : <Chip label="Inactive" style={{marginRight: '10px', backgroundColor: 'red', color:'white'}}/>
              }
              <div style={{float:'right'}}>
                <Typography variant="subtitle2">
                {dateValid ? 
                  dateLoaded ? 'Expires: ' + days+'d:'+hours+'h:'+minutes+'m:'+seconds
                : 'Calculating...'
                : 'Expired'
                }</Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <a href={networkId == 'localhost' || networkId == 'testnet' ? 'http://' + daoLink : 'https://'+ daoLink}>
              <div style={{width: '95%', 
                height: '50px',
                backgroundImage: `url(${logo})`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
              }}/>
              {logo ? null : <Typography variant="h6">{communityName ? communityName : contractId ? contractId : passedContractId}</Typography>}
            </a>
            </Grid>
          </Grid>

          <CardHeader
            title={
              <>
              <Button 
              color="primary"
              style={{fontWeight: '800', fontSize: '1.25rem', lineHeight: '1.1em'}}
              onClick={handleOpportunityProposalDetailsClick}
              >{title}
              </Button>
              </>
            }
          />
          <CardContent>
            <Grid container alignItems="center" style={{marginTop: '-20px', display:'inherit'}}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Typography variant="h6" align="center">Reward</Typography>
                <Typography variant="h6" align="center">{reward} Ⓝ</Typography>
                <Typography variant="subtitle1" color="textSecondary" align="center">~${usd ? usd + ' USD': null}</Typography><br></br>
                
                <div className={classes.root}>
                  <LinearProgressWithLabel value={progress} />
                </div>
                
                  
              </Grid>
              
            </Grid>
          </CardContent>
          <CardActions>
          {status == 'Passed' ? (
            memberStatus ? (
              dateValid ? (  
                budget > 0 ? (
                  opportunityStatus ? (
                    <>
                    <Button 
                      color="primary" 
                      onClick={handleFundingProposalClick}>
                        Accept
                    </Button>
                    </>
                  ) : 
                    <>
                    <Button 
                      color="primary" 
                      disabled>
                        Inactive
                    </Button>
                    </>
                ) :
                    <>
                  <Button 
                    color="primary" 
                    disabled>
                      Out of Budget
                  </Button>
                  </>            
              ) :
                <>
                <Button 
                  color="primary" 
                  disabled>
                    Expired
                </Button>
                </>
            ) :
              !memberProposalPresent ?
                <>
                <Button 
                  color="primary" 
                  onClick={handleMemberProposalClick}>
                    Join Community
                </Button>
                </>
              : 
              <a href={`${daoRootName}/dao/${contractId? contractId: passedContractId}`}> 
                Membership Pending
              </a>
          ) : null }
          
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
          passedContractId={contractId ? contractId : passedContractId}
          handleFundingProposalClickState={handleFundingProposalClickState}
          depositToken={'Ⓝ'}
          passedProposalDeposit={passedProposalDeposit? formatNearAmount(passedProposalDeposit): proposalDeposit}
          tokenName={'Ⓝ'}
          usd={usd}
          applicant={accountId} 
          reference={opportunityId}
          budget={budget}
          contract={contract}
          appIdx={appIdx}
          did={did}
          state={state}
          /> : null }

        {memberProposalClicked ? <MemberProposal
          contractId={contractId ? contractId : passedContractId}
          state={state}
          depositToken={'Ⓝ'}
          passedProposalDeposit={passedProposalDeposit? formatNearAmount(passedProposalDeposit): proposalDeposit}
          handleMemberProposalClickState={handleMemberProposalClickState} 
          accountId={accountId}
          appIdx={appIdx}
          did={did}
    
          /> : null }

        {opportunityProposalDetailsClicked ? <OpportunityProposalDetails
          proposer={creator}
          handleOpportunityProposalDetailsClickState={handleOpportunityProposalDetailsClickState}
          curDaoIdx={curDaoIdx}
          applicant={accountId}
          opportunityId={opportunityId}
          contractId={contractId ? contractId : passedContractId}
          status={status}
          dateValid={dateValid}
          budget={budget}
          deadline={deadline}
          memberStatus={memberStatus}
          did={did}
          suitabilityScore={suitabilityScore}

          /> : null }

          {editOpportunityProposalDetailsClicked ? <EditOpportunityProposalForm
            state={state}
            handleEditOpportunityProposalDetailsClickState={handleEditOpportunityProposalDetailsClickState}
            curDaoIdx={curDaoIdx}
            applicant={accountId}
            proposer={creator}
            accountId={accountId}
            opportunityId={opportunityId}
            contractId={contractId ? contractId : passedContractId}
            /> : null }

          </>
    )
}