import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { ceramic } from '../../../utils/ceramic'
import { appStore, onAppMount } from '../../../state/app'
import MemberProfileDisplay from '../../MemberProfileDisplay/memberProfileDisplay'
import Delegation from '../../Delegation/delegation'
import ManageDelegations from '../../ManageDelegations/manageDelegations'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import CardActions from '@material-ui/core/CardActions'
import Badge from '@material-ui/core/Badge'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      marginTop: '10px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    header: {
      display: 'inherit',
      marginBottom: '-15px'
    }
  }));

  const imageName = require('../../../img/default-profile.png') // default no-image avatar
  const logoName = require('../../../img/default_logo.png') // default no-logo

export default function MemberCard(props) {

    const [avatar, setAvatar] = useState(imageName)

    const [allShares, setAllShares] = useState()
    const [votingPower, setVotingPower] = useState()
    const [memberProfileDisplayClicked, setMemberProfileDisplayClicked] = useState(false)
    const [manageDelegationsClicked, setManageDelegationsClicked] = useState(false)
    const [delegationClicked, setDelegationClicked] = useState(false)
    const [maxDelegation, setMaxDelegation] = useState()
    const [anchorEl, setAnchorEl] = useState(null)
    const [curUserDelegatedTo, setCurUserDelegatedTo] = useState('0')

    const [logo, setLogo] = useState(logoName)
    const [pfpLogo, setPfpLogo] = useState('')
    const [pfpAvatar, setPfpAvatar] = useState('')
    const [name, setName] = useState('')
    const [accountType, setAccountType] = useState('')
    const [thisMemberDid, setThisMemberDid] = useState('')
    
    const { state, dispatch, update } = useContext(appStore)

    const {
      near, 
      appIdx,
      accountId,
      isUpdated,
      didRegistryContract,
      daoFactory,
      contract,
      summoner,
      active,
      totalShares
    } = state

    const classes = useStyles();

    const {
      accountName, 
      shares,
      loot,
      delegatedShares,
      receivedDelegations,
      currentMemberInfo,
      allMemberInfo,
      remainingDelegates,
      joined
    } = props

    const {
      contractId
    } = useParams()
    

    useEffect(
        () => {
         
        async function fetchData() {
          if(isUpdated){}
          if(contract && parseInt(receivedDelegations) > 0){
            try{
              let delegationInfo = await contract.getDelegationInfo({member: state.accountId, delegatee: accountName})
              setCurUserDelegatedTo(delegationInfo.shares)
            } catch (err) {
              console.log('error retrieving delegation info', err)
            }
          }

          let thisAccountType
          try{
              thisAccountType = await didRegistryContract.getType({accountId: accountName})
              setAccountType(thisAccountType)
              console.log('accountid: '+ accountName + ', account type:', thisAccountType)
            } catch (err) {
              accountType = 'none'
              console.log('account not registered, not type avail', err)
          }

          if(accountName && appIdx){
             let memberDid = await ceramic.getDid(accountName, daoFactory, didRegistryContract)
             setThisMemberDid(memberDid)
             if(memberDid != 'none' && thisAccountType != 'guild'){
                let result = await appIdx.get('profile', memberDid)
                console.log('result member', result)
                if(result){
                  result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                  result.name ? setName(result.name) : setName('')
                  result.profileNft ? setPfpAvatar(result.profileNft) : setPfpAvatar('')
                }
            } else {
              if(memberDid != 'none' && thisAccountType == 'guild'){
                let result = await appIdx.get('guildProfile', memberDid)
                console.log('result member', result)
                if(result){
                  result.logo ? setLogo(result.logo) : setLogo(logoName)
                  result.name ? setName(result.name) : setName('')
                  result.profileNft ? setPfpLogo(result.profileNft) : setPfpLogo('')
                }
              }
            }
          }

          let combinedShares
          if(shares){
            combinedShares = parseInt(shares) + parseInt(receivedDelegations)
            setAllShares(combinedShares)
          }

          if(currentMemberInfo && currentMemberInfo.length > 0){
            let currentMaxDelegation = parseInt(currentMemberInfo[0].shares) - parseInt(currentMemberInfo[0].delegatedShares)
            setMaxDelegation(currentMaxDelegation)
          }

          let votePower = Math.round(((combinedShares - parseInt(delegatedShares)) / totalShares)*100, 2)
          console.log('combined shares', combinedShares)
          console.log('delegated shares', delegatedShares)
          console.log('total shares', totalShares)
          console.log('votepower', votePower)
          setVotingPower(votePower)

        }
        
        let mounted = true
      if(mounted){
        fetchData()
            .then((res) => {
              
            })
      return () => mounted = false
      }

    }, [appIdx, currentMemberInfo, isUpdated]
    )
    
    function formatDate(timestamp) {
      let stringDate = timestamp.toString()
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
    }

    const handleMemberProfileDisplayClick = () => {
      handleExpanded()
      handleMemberProfileDisplayClickState(true)
    }

    function handleMemberProfileDisplayClickState(property){
      setMemberProfileDisplayClicked(property)
    }

    const handleDelegationClick = () => {
      handleExpanded()
      handleDelegationClickState(true)
    }

    function handleDelegationClickState(property){
      setDelegationClicked(property)
    }

    const handleManageDelegationsClick = () => {
      handleExpanded()
      handleManageDelegationsClickState(true)
    }

    function handleManageDelegationsClickState(property){
      setManageDelegationsClicked(property)
    }

    function handleExpanded() {
      setAnchorEl(null)
    }

    return(
        <>
        <Card raised={true} className={classes.card} >
        <Grid container justifyContent="space-evenly" spacing={1} style={{marginTop:'20px'}}>
          
          <Typography variant="overline"  style={{width: '100%', float: 'right'}}>
          {accountType == 'guild' ? (
            <a href={`https://nearguilds.live/guild-profiles/${thisMemberDid}`}>
              <div style={{ 
                  height: '40px',
                  backgroundImage: `url(${pfpLogo != logoName && pfpLogo != '' ? pfpLogo : logo})`, 
                  backgroundSize: 'contain',
                  backgroundPosition: 'center', 
                  backgroundRepeat: 'no-repeat',
                  backgroundOrigin: 'content-box'
              }}/>
              <center><Chip label={name != '' ? name : accountName} style={{marginBottom: '3px'}}/></center>
              </a>
              )
          :  (
            <a href={`https://nearpersonas.live/indiv-profiles/${thisMemberDid}`}>
              <Avatar src={pfpAvatar != imageName && pfpAvatar != '' ? pfpAvatar : avatar} style={{marginRight: '5px'}}/>
              <center><Chip label={name != '' ? name : accountName} style={{marginBottom: '3px'}}/></center>
              </a>
              )
          }
        </Typography>
            

        </Grid>
         
          <CardHeader
          subheader={ <><center>
          <Typography variant="overline" align="center">Joined: {formatDate(joined)}</Typography><br></br>
          <Typography variant="overline" align="center">{active ? 'Active' : 'Inactive'}
          {summoner == accountName ? <Chip size="small" color="secondary" label='summoner' style={{marginLeft: '10px'}}/> : null}
          </Typography></center></>}
          className={classes.header}
          />
 
          <CardContent>
            <Grid container alignItems="center" style={{marginTop: '-20px', marginBottom:'20px', display:'inherit'}}>
             
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '20px', marginBottom:'30px'}}>
              <center><Chip label={accountName} variant="outlined" style={{marginBottom: '3px'}}/></center>
              <TableContainer component={Paper}>
              <Table className={classes.table} size="small" aria-label="a dense table">
                
               
                <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row" colSpan={2} align="center">
                   <Typography variant="overline">Voting Shares: <b>{shares}</b></Typography><br></br>
                   <Typography variant="overline">Non-Voting Shares: <b>{loot ? loot : '0'}</b></Typography>
                  </TableCell>
                </TableRow>
               
                  <TableRow>
                    <TableCell>All Votes</TableCell>
                    <TableCell>Delegated Out</TableCell>
                  </TableRow>
                  <TableRow key='first'>
                      <TableCell component="th" scope="row" align="center">
                          <Typography variant="overline">{allShares ? parseInt(allShares) - parseInt(delegatedShares) : null}</Typography>
                      </TableCell>
                      <TableCell component="th" scope="row" align="center">
                          <Typography variant="overline">{delegatedShares ? delegatedShares : '0'}</Typography>
                      </TableCell>
                  </TableRow>
      
                  <TableRow>
                  <TableCell component="th" scope="row" colSpan={2} align="center">
                   <Typography variant="overline">Voting Power: <b>
                  {votingPower  && votingPower < 100 && votingPower > 1 ? votingPower +'%' :
                    votingPower && votingPower > 0 && votingPower < 1 ? '<1%':
                    votingPower && votingPower >= 100 ? '100%':
                    '0%'
                  }
                  </b></Typography>
                  </TableCell>
                  </TableRow>
                  
                </TableBody>
              </Table>
            </TableContainer>
            </Grid>
            </Grid>
          </CardContent>
          <CardActions style={{marginTop: '-40px'}}>
          <>
          {accountId != accountName && currentMemberInfo && currentMemberInfo.length > 0 && currentMemberInfo[0].active ? (
            <Badge color="secondary" badgeContent={curUserDelegatedTo} max={9999999}>
              <Button
              color="primary"
              onClick={handleDelegationClick}>
                Delegate Votes
              </Button>
            </Badge>
          ) :  
          accountId == accountName ? (
          <Button
          color="primary"
          onClick={handleManageDelegationsClick}>
            Manage Vote Delegations
          </Button>)
          : null }
          </>
          </CardActions>
        </Card>

        {memberProfileDisplayClicked ? <MemberProfileDisplay
          handleMemberProfileDisplayClickState={handleMemberProfileDisplayClickState}
          member={accountName}
          /> : null }

        {delegationClicked ? <Delegation
          handleDelegationClickState={handleDelegationClickState}
          contractId={contractId}
          maxDelegation={maxDelegation}
          state={state}
          delegateTo={accountName}
          remainingDelegates={remainingDelegates}
          /> : null }

        {manageDelegationsClicked ? <ManageDelegations
          handleManageDelegationsClickState={handleManageDelegationsClickState}
          contractId={contractId}
          maxDelegation={maxDelegation}
          state={state}
          delegateTo={accountName}
          contract={contract}
          allMemberInfo={allMemberInfo}
          delegatedShares={delegatedShares}
          shares={shares}
          remainingDelegates={remainingDelegates}
          /> : null }

        </>
    )
}