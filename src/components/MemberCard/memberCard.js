import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import Persona from '@aluhning/get-personas-js'
import MemberProfileDisplay from '../MemberProfileDisplay/memberProfileDisplay'
import Delegation from '../Delegation/delegation'
import ManageDelegations from '../ManageDelegations/manageDelegations'

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

  const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function MemberCard(props) {

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [did, setDid] = useState()
    const [curUserIdx, setCurUserIdx] = useState()
    const [joined, setJoined] = useState(props.joined)
    const [allShares, setAllShares] = useState()
    const [memberProfileDisplayClicked, setMemberProfileDisplayClicked] = useState(false)
    const [manageDelegationsClicked, setManageDelegationsClicked] = useState(false)
    const [delegationClicked, setDelegationClicked] = useState(false)
    const [maxDelegation, setMaxDelegation] = useState()
    const [anchorEl, setAnchorEl] = useState(null)
    const [curUserDelegatedTo, setCurUserDelegatedTo] = useState('0')
    
    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near, 
      appIdx,
      accountId,
      isUpdated,
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
      memberCount,
      totalShares,
      active,
      summoner,
      contract,
      remainingDelegates
    } = props

    const {
      contractId
    } = useParams()
    

    useEffect(
        () => {
         
        async function fetchData() {
          isUpdated
          if(contract && parseInt(receivedDelegations) > 0){
            try{
              let delegationInfo = await contract.getDelegationInfo({member: state.accountId, delegatee: accountName})
              setCurUserDelegatedTo(delegationInfo.shares)
            } catch (err) {
              console.log('error retrieving delegation info', err)
            }
          }
          if(accountName && state){
            const thisPersona = new Persona()
            let result = await thisPersona.getPersona(accountName)
        
            if(result){
              result.date ? setDate(result.date) : setDate('')
              result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
              result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
              result.name ? setName(result.name) : setName('')
            }
          }
          if(shares){
            let combinedShares = parseInt(shares) + parseInt(receivedDelegations)
           
            setAllShares(combinedShares)
          }
          if(currentMemberInfo && currentMemberInfo.length > 0){
           
            let currentMaxDelegation = parseInt(currentMemberInfo[0].shares) - parseInt(currentMemberInfo[0].delegatedShares)
         
            setMaxDelegation(currentMaxDelegation)
          }
        }
        
        let mounted = true
      if(mounted){
        fetchData()
            .then((res) => {
              
            })
      return () => mounted = false
      }

    }, [avatar, currentMemberInfo, isUpdated]
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

    const votingPower = Math.round(((allShares - parseInt(delegatedShares)) / totalShares)*100, 2)

    return(
        <>
        <Card raised={true} className={classes.card} >
        <Grid container justifyContent="space-evenly" spacing={1} style={{marginTop:'20px'}}>
          <Button
          color="primary"
          onClick={handleMemberProfileDisplayClick}
          >
            <Avatar src={avatar} className={classes.large}  />
            <center><Chip label={name != '' ? name : accountName} style={{marginBottom: '3px'}}/></center>
          </Button>
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