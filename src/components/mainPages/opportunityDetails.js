import React, { useEffect, useState, useContext, useRef } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router'
import * as nearAPI from 'near-api-js'
import { dao } from '../../utils/dao'
import { 
  getStatus, 
  daoRootName, 
  getProposalStatus, 
  generateId, 
  formatDate, 
  formatDateString,
  parseNearAmount,
  formatNearAmount } from '../../state/near'
import { ceramic } from '../../utils/ceramic'
import CommentForm from '../common/Comment/commentForm'
import FundingProposal from '../FundingProposal/fundingProposal'
import MemberProposal from '../MemberProposal/memberProposal'


// Material UI
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'
import Card from '@material-ui/core/Card'
import Rating from '@material-ui/lab/Rating'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

const axios = require('axios').default

import './dashboard.css'

// CSS Styles

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
    minWidth: 325,
    minHeight: 325,      
  },
  card: {
    margin: 'auto',
    padding: '5px'
  },
  progress: {
      display: 'flex',
      justifyContent: 'center',
      height: '200px',
      width: '200px',
      alignItems: 'center',
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
      textAlign: 'center',
      margin: 'auto'
  },
  centered: {
      textAlign: 'center'
  },
  heading: {
    fontSize: 24,
    marginLeft: '10px'
  },
  }));

const logoName = require('../../img/default_logo.png')
const imageName = require('../../img/default-profile.png')

export default function OpportunityDetails(props) {

  const [applicant, setApplicant] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [applicantAvatar, setApplicantAvatar] = useState(imageName)
  const [pfpApplicantAvatar, setPfpApplicantAvatar] = useState('')
  const [pfpProposerAvatar, setPfpProposerAvatar] = useState('')
  const [applicantLogo, setApplicantLogo] = useState(logoName)

  const [proposer, setProposer] = useState('')
  const [proposerLogo, setProposerLogo] = useState(logoName)
  const [proposerName, setProposerName] = useState('')
  const [proposerAvatar, setProposerAvatar] = useState(imageName)
  const [pfpProposerLogo, setPfpProposerLogo] = useState('')
  const [pfpApplicantLogo, setPfpApplicantLogo] = useState('')
   
  const [accountType, setAccountType] = useState('')
  const [contract, setContract] = useState()
  const [sponsor, setSponsor] = useState()
  const [status, setStatus] = useState()
  const [created, setCreated] = useState()
  const [logo, setLogo] = useState(logoName)
  const [name, setName] = useState('')

  const [curUserAvatar, setCurUserAvatar] = useState()
  const [curUserName, setCurUserName] = useState()
  const [memberStatus, setMemberStatus] = useState(props.memberStatus)
 
  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState(0)
  const [details, setDetails] = useState()
  const [reward, setReward] = useState('')
  const [category, setCategory] = useState('')
  const [projectName, setProjectName] = useState('')
  const [opportunityStatus, setOpportunityStatus] = useState('')
  const [permission, setPermission] = useState('')
  const [familiarity, setFamiliarity] = useState('0')
  const [deadline, setDeadline] = useState('')
  const [submitDate, setSubmitDate] = useState(0)
  const [dateValid, setDateValid] = useState(false)
  const [dateLoaded, setDateLoaded] = useState(false)
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const [desiredSkillSet, setDesiredSkillSet] = useState([])
  const [desiredDeveloperSkillSet, setDesiredDeveloperSkillSet] = useState([])
  const [opportunitySkillSet, setOpportunitySkillSet] = useState([])
  
  const [active, setActive] = useState(false)
  const [usd, setUsd] = useState()
  
  const [memberProposalClicked, setMemberProposalClicked] = useState(false)
  const [fundingProposalClicked, setFundingProposalClicked] = useState(false)

  const [proposalComments, setProposalComments] = useState([])
  const [finished, setFinished] = useState(false)

  const [anchorEl, setAnchorEl] = useState(null)

  const classes = useStyles()
    
    const [oppsLoaded, setOppsLoaded] = useState(false)

    const { state, dispatch, update } = useContext(appStore)
   
    const matches = useMediaQuery('(max-width:500px)')

    let communities = []
    
    const {
      accountId,
      currentDaosList,
      near,
      appIdx,
      didRegistryContract,
      daoFactory,
      isUpdated,
      nearPrice
    } = state 
      
    const {
      contractId,
      communityDid,
      opportunityId,
    } = useParams()

    useEffect(() => {
      if(nearPrice && usd){
        if(usd > 0 && nearPrice > 0){
          let near = (usd / nearPrice).toFixed(3)
          let parse = parseNearAmount(near)
          let formatNear = formatNearAmount(parse, 3)
          setReward(formatNear)
        }
      }
    }, [nearPrice]
    )

    useEffect(
      () => {
        let timer

        async function updateNearPrice() {
            try {
              let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
              update('', {nearPrice: getNearPrice.data.near.usd})
            } catch (err) {
              console.log('get near price issue', err)
            }
        }
  
        function stop() {
          if (timer) {
              clearInterval(timer)
              timer = 0
          }
        }

        timer = setInterval(updateNearPrice, 5000)
    
        return () => {
          stop()
        }

      }, []
    )

    useEffect(() => {
      async function getCurrentStatus(){
        if(contractId && near){
          let thisMemberStatus
          let thisMemberInfo
          let daoAccount = new nearAPI.Account(near.connection, contractId)
          let daoContract = await dao.initDaoContract(daoAccount, contractId)
          setContract(daoContract)
          try {
            thisMemberInfo = await daoContract.getMemberInfo({member: accountId}) 
            thisMemberStatus = await daoContract.getMemberStatus({member: accountId})
            if(thisMemberStatus && thisMemberInfo[0].active){
              setMemberStatus(true)
            }
          } catch (err) {
            console.log('error getting member status', err)
          }
          
        }
      }

     
        getCurrentStatus()
        .then((res) => {

        })
      
    }, [contractId, near])

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
          if(currentDaosList && currentDaosList.length > 0){
            let i = 0
            while (i < currentDaosList.length){
              if(currentDaosList[i].contractId == contractId){
                currentDaosList[i].status == 'active' ? setActive(true) : setActive(false)
                break
              }
              i++
            }
          }

          async function fetchData() {

            if(appIdx && contract){
              let proposal = await contract.getProposal({proposalId: parseInt(opportunityId)})
              console.log('proposal', proposal)
              if(proposal){
                proposal.sponsor ? setSponsor(proposal.sponsor) : setSponsor('')
                proposal.applicant ? setApplicant(proposal.applicant) : setApplicant('')
                proposal.proposalSubmitted ? setCreated(proposal.proposalSubmitted) : setCreated()
                let thisStatus = getProposalStatus(proposal.flags)
                setStatus(thisStatus)
              }

              let propResult = await appIdx.get('opportunities', communityDid)
              console.log('propResult', propResult)
              if(propResult) {
                let i = 0
                while (i < propResult.opportunities.length){
                  if(propResult.opportunities[i].opportunityId == opportunityId.toString() && propResult.opportunities[i].contractId == contractId){
                    propResult.opportunities[i].title ? setTitle(propResult.opportunities[i].title) : setTitle('')
                    propResult.opportunities[i].budget ? setBudget(propResult.opportunities[i].budget) : setBudget(0)
                    propResult.opportunities[i].details ? setDetails(propResult.opportunities[i].details) : setDetails()
                    propResult.opportunities[i].deadline ? setDeadline(propResult.opportunities[i].deadline) : setDeadline('n/a')
                    propResult.opportunities[i].reward ? setReward(propResult.opportunities[i].reward) : setReward('')
                    propResult.opportunities[i].usd ? setUsd(propResult.opportunities[i].usd) : setUsd('')
                    propResult.opportunities[i].category ? setCategory(propResult.opportunities[i].category) : setCategory('')
                    propResult.opportunities[i].projectName ? setProjectName(propResult.opportunities[i].projectName) : setProjectName('')
                    propResult.opportunities[i].status ? setOpportunityStatus(propResult.opportunities[i].status) : setOpportunityStatus('')
                    propResult.opportunities[i].submitDate ? setSubmitDate(propResult.opportunities[i].submitDate) : setSubmitDate('')
                    propResult.opportunities[i].permission ? setPermission(propResult.opportunities[i].permission) : setPermission('')
                    propResult.opportunities[i].familiarity ? setFamiliarity(propResult.opportunities[i].familiarity) : setFamiliarity('0')
                    if(propResult.opportunities[i].desiredSkillSet ){
                      setDesiredSkillSet(propResult.opportunities[i].desiredSkillSet)
                    }
                    if(propResult.opportunities[i].desiredDeveloperSkillSet){
                        setDesiredDeveloperSkillSet(propResult.opportunities[i].desiredDeveloperSkillSet)
                    }
                    if(propResult.opportunities[i].opportunitySkills){
                      setOpportunitySkillSet(propResult.opportunities[i].opportunitySkills)
                    }
                    break
                  }
                  i++
                }
              }

              // get Project logo and name
              let daoResult = await appIdx.get('daoProfile', communityDid)
              if(daoResult){
                daoResult.logo ? setLogo(daoResult.logo) : setLogo(logoName)
                daoResult.name ? setName(daoResult.name) : setName('')
              }
  
              // Set Existing Proposal Comments      
            
              let commentResult = await appIdx.get('comments', communityDid)
              if(!commentResult){
                commentResult = { comments: [] }
              }
            
              if(commentResult && Object.keys(commentResult).length != 0) {
                let j = 0
                let comments = []
                while (j < commentResult.comments.length){
                  if(commentResult.comments[j].parent == opportunityId){
                    comments.push(commentResult.comments[j])
                  }
                  j++
                }
            
                setProposalComments(comments)
              }
            }
           
           // Get Persona Information           
           if(applicant && proposer && appIdx){

            let thisAccountType
            try{
                thisAccountType = await didRegistryContract.getType({accountId: accountId})
                setAccountType(thisAccountType)
              } catch (err) {
                thisAccountType = 'none'
                console.log('account not registered, not type avail', err)
            }
            
            // Applicant
            let applicantDid = await ceramic.getDid(applicant, daoFactory, didRegistryContract)
            if(thisAccountType != 'guild') {
              let result = await appIdx.get('profile', applicantDid)
              console.log('indiv result', result)
              if(result){
                  result.avatar ? setApplicantAvatar(result.avatar) : setApplicantAvatar(imageName)
                  result.name ? setApplicantName(result.name) : setApplicantName('')
                  result.profileNft ? setPfpApplicantAvatar(result.profileNft) : setPfpApplicantAvatar('')
              }
            } else {
                if(thisAccountType == 'guild'){
                    let result = await appIdx.get('guildProfile', applicantDid)
                    console.log('guild result', result)
                    if(result){
                        result.logo ? setApplicantLogo(result.logo) : setApplicantLogo(logoName)
                        result.name ? setApplicantName(result.name) : setApplicantName('')
                        result.profileNft ? setPfpApplicantLogo(result.profileNft) : setPfpApplicantLogo('')
                    }
                }
            }
            
            // Proposer
            let proposerDid = await ceramic.getDid(proposer, daoFactory, didRegistryContract)
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

         
          
                  
          return true  
        }

          fetchData()
            .then((res) => {
              setFinished(true)
            })
          
    }, [contract, appIdx, isUpdated]
    )

    const handleMemberProposalClick = () => {
      handleExpanded()
      handleMemberProposalClickState(true)
    }

    function handleExpanded() {
      setAnchorEl(null)
    }

    function handleMemberProposalClickState(property) {
      setMemberProposalClicked(property)
    }

    const handleFundingProposalClick = () => {
      handleExpanded()
      setFundingProposalClicked(true)
    }

    function handleFundingProposalClickState(property) {
      setFundingProposalClicked(property)
    }


    let Comments
    let author = ''
    let preview = ''
    let color = 'white'
    if (proposalComments && proposalComments.length > 0) {
        Comments = proposalComments.map(comment => {
            if(comment.originalAuthor && comment.originalContent){
              author = comment.originalAuthor
              let previewLength
              if(comment.originalContent.length > 43){
                previewLength = 40;
              }
              else{
                previewLength = comment.originalContent.length - 5; 
              }
              preview = ': ' + comment.originalContent.substring(3, previewLength) + '...'
              if(author == accountId){
                color = '#ffecc7'
              }
              else{
                color = '#dedad3'
              }
            }
          
            return (
              <div >
                   {author != '' ? 
                      <Typography style={{marginTop: 10}}>
                      In reply to {author}{preview}
                      </Typography>: null} 
                    <CommentDetails
                        key={comment.commentId}
                        proposalId={opportunityId}
                        proposalApplicant={applicant}
                        commentId={comment.commentId}
                        comments={proposalComments}
                        commentAuthor={comment.author}
                        commentParent={comment.parent}
                        commentPublished={comment.published}
                        commentBody={comment.body}
                        commentPostDate={comment.postDate}
                        commentSubject={comment.subject}
                    />
                </div>
                  )
          })
    }

    return (
      <Grid container justifyContent="center" alignItems="flex-start" spacing={1} style={{padding: '5px'}}>
        {finished ? (
            <>
             <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '15px'}}>
              <Link to={daoRootName + `/dao/${contractId}`}>
                <div style={{width: '95%', 
                  height: '50px',
                  backgroundImage: `url(${logo})`, 
                  backgroundSize: 'contain', 
                  backgroundPosition: 'center', 
                  backgroundRepeat: 'no-repeat',
                  backgroundOrigin: 'content-box'
                }}/>
                {logo ? null : <Typography variant="h6">{name ? name : passedContractId}</Typography>}
              </Link>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '15px', marginBottom: '15px'}}>
              {status == 'Passed' && dateValid && budget > 0 && opportunityStatus ?
              <Chip label="Active" style={{float:'left', backgroundColor: 'palegreen', marginBottom: '10px', marginLeft: '10px', marginTop:'5px'}}/>
              : <Chip label="InActive" style={{float:'left', backgroundColor: 'palevioletred', marginBottom: '10px', marginLeft: '10px', marginTop:'5px'}}/>
              }
              {dateValid ? 
                dateLoaded ? 
                <Chip label={`Expires: ${days} d: ${hours} h: ${minutes} m: ${seconds} s`} variant="outlined" style={{float:'right', backgroundColor: 'white', marginBottom: '10px', marginRight: '10px', marginTop:'5px'}}/>
              : <Chip label="Calculating..." variant="outlined" style={{float:'right', backgroundColor: 'white', marginBottom: '10px', marginRight: '10px', marginTop:'5px'}}/>
              : <Chip label="Expired" variant="outlined" style={{float:'right', backgroundColor: 'white', marginBottom: '10px', marginRight: '10px', marginTop:'5px'}}/>
              }
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '10px'}}>
              <Typography variant="subtitle2">
                
              </Typography>
            </Grid>

            {!details ? 
              <Typography variant="body1">This opportunity has no details yet.</Typography>
            : (<>
                <Grid container alignItems="flex-start" justifyContent="space-between" style={{marginBottom: '30px'}}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                      <Typography variant="h4">{title}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
                      <Typography variant="h6" style={{marginBottom: '10px'}}>{projectName}</Typography><br></br>
                      <Chip color="primary" label={category} style={{marginBottom: '10px'}}/>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center" >
                      <Typography variant="overline" style={{marginBottom:'5px'}}>Proposed: {created ? formatDate(created) : formatDate(submitDate)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="overline" >Proposer:</Typography>
                    <Chip avatar={<Avatar src={proposerAvatar} className={classes.small} />} label={proposerName != '' ? proposerName : proposer} style={{marginBottom:'5px'}} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                    <Typography variant="overline">Deadline:</Typography>
                    <Chip label={deadline}/>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{marginBottom: '30px'}}>
                  <Typography variant="overline">Reward:</Typography>
                    <Chip label={usd ? usd + ' USD' + '= ~' + reward + ' Ⓝ' : reward * nearPrice + ' USD' + '= ~' + reward + ' Ⓝ'}/>
                  </Grid>
                  {opportunityStatus == 'Sponsored' ? (
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom: '30px'}}>
                    <Typography variant="overline" color="textSecondary">Sponsor: {sponsor}</Typography>
                  </Grid>
                  ) : null }
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '20px'}}>
                    <Card className={classes.card}>
                      <div dangerouslySetInnerHTML={{ __html: details }} />
                    </Card>
                  </Grid>
                </Grid>

                <Grid container justifyContent="space-evenly" spacing={1} style={{marginTop:'20px', marginBottom: '20px'}}>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className={classes.centered}>
                    <Typography variant="h6">General Skills Required</Typography>
                    <TableContainer component={Paper}>
                      <Table className={classes.table} size="small" aria-label="a dense table">
                        <TableHead>
                        
                        </TableHead>
                        <TableBody>
                        {desiredSkillSet ?
                          Object.entries(desiredSkillSet).map(([key, value]) => {
                              if(value){
                                return(
                                  <TableRow key={key}>
                                  <TableCell>{key}</TableCell>
                                  </TableRow>
                                )
                              }
                          })
                          : null
                        }
                        
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className={classes.centered}>
                  <Typography variant="h6">Specific Skills</Typography>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableHead>
                      
                      </TableHead>
                      <TableBody>
                      
                      {desiredDeveloperSkillSet ?
                        Object.entries(desiredDeveloperSkillSet).map(([key, value]) => {
                            if(value){
                              return(
                                
                                <TableRow key={key}>
                                  <TableCell>{key}</TableCell>
                                </TableRow>
                                
                              )
                            }
                        })
                        : null
                      }
                      {opportunitySkillSet && opportunitySkillSet.length > 0 ?
                      
                          opportunitySkillSet.map((values, index) => {
                            
                              return (
                                <TableRow key={values.name}>
                                  <TableCell>{values.name}</TableCell>
                                </TableRow>
                              )
                          
                        })
                        : null
                      }
                      
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <Typography variant="overline">Level of crypto/blockchain familiarity: <Rating readOnly value={parseInt(familiarity)} /> </Typography>
                </Grid>
                </Grid>
            </>)}
                
            {status == 'Passed' ? (
              memberStatus ? (
                dateValid ? (  
                  budget > 0 ? (
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
                <>
                <Button 
                  color="primary" 
                  onClick={handleMemberProposalClick}>
                    Join Community
                </Button>
                </>
            ) : null }
                   
            <Divider style={{marginBottom: 10}}/>
                   
            {memberStatus ? (
            <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Comments</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    {Comments}
                </Grid>
              
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h5" style={{marginLeft: '10px'}}>New Comment</Typography>
                    <CommentForm
                      reply={false}
                      proposalApplicant={applicant}
                      avatar={curUserAvatar}
                      name={curUserName}
                      proposalId={opportunityId}
                    />
                </Grid>
              </Grid>
            </AccordionDetails>
            </Accordion>
            ) : null }
          </>)
          : (
            <div style={{minWidth: '150px', minHeight: '150px', margin: 'auto'}}>
              <CircularProgress style={{position: 'fixed', top: '50%', left: '50%', marginLeft:'-20px', marginTop: '-20px'}}/>
            </div>
          )}
             
                {fundingProposalClicked ? <FundingProposal
                  handleFundingProposalClickState={handleFundingProposalClickState}
                  depositToken={'Ⓝ'}
                  reference={opportunityId}
                  budget={budget}
                  applicant={applicant}
                  usd={usd}
                  tokenName={'Ⓝ'}
                  nearPrice={nearPrice}
                  /> : null }
        
                {memberProposalClicked ? <MemberProposal
                  contractId={contractId}
                  depositToken={'Ⓝ'}
                  proposalDeposit={proposalDeposit}
                  appIdx={appIdx}
                  didRegistryContract={didRegistryContract}
                  daoFactory={daoFactory}
                  handleMemberProposalClickState={handleMemberProposalClickState} 
                  /> : null }
          
        </Grid>
    )
}