import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LogoutButton from '../common/LogoutButton/logoutButton'
import ActionSelector from '../ActionSelector/actionSelector'
import ProposalList from '../ProposalList/proposalList'
import BalanceChart from '../BalanceGraphs/balanceGraph'
import RightSideDrawer from './RightSideDrawer'
import InfoPopup from '../../../common/InfoPopup'
import { Translate } from 'react-localize-redux'
import { IDX } from '@ceramicstudio/idx'

import { dao } from '../../../../utils/dao'
import { dids } from '../../../../utils/dids'
import { ceramic } from '../../../../utils/ceramic'
import { wallet } from '../../../../utils/wallet'

// Material UI imports
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { red, blue, white } from '@material-ui/core/colors';
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'
import Chip from '@material-ui/core/Chip'
import AccountCircleTwoToneIcon from '@material-ui/icons/AccountCircleTwoTone'
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import AccountBalanceWalletTwoToneIcon from '@material-ui/icons/AccountBalanceWalletTwoTone'
import Tooltip from '@material-ui/core/Tooltip'
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    root: {
      padding: '10px'
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    centered: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      alignItems: 'center',
      marginBottom: '25px'
  },
    customCard: {
        maxWidth: 275,
        margin: 'auto',
        padding: 20
    },
    media: {
      height: 0,
      paddingTop: '35.25%', // 16:9
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    top: {
      marginBottom: '10px',
      fontSize: '24px'
    },
    avatar: {
      backgroundColor: blue[500],
      fontColor: '#FFFFFF'
    },
  }));

  
export default function AppFramework(props) {

    const [graphData, setGraphData] = useState([])
    const [sharesLabel, setSharesLabel] = useState('Shares: 0')
    const [lootLabel, setLootLabel] = useState('Loot: 0')
    const [memberIcon, setMemberIcon] = useState(<NotInterestedIcon />)
    const [guildBalanceChip, setGuildBalanceChip] = useState()
    const [escrowBalanceChip, setEscrowBalanceChip] = useState()
    const [nearPrice, setNearPrice] = useState()

    const [tabValue, setTabValue] = useState('1')
    const [contract, setContract] = useState()
    const [allMemberInfo, setAllMemberInfo] = useState([])
    const [contractIdx, setContractIdx] = useState()
    const [didsContract, setDidsContract] = useState()
    const [memberStatus, setMemberStatus] = useState()
    const [memberInfo, setMemberInfo] = useState()
    const [currentPeriod, setCurrentPeriod] = useState()
    const [curUserIdx, setCurUserIdx] = useState()
    const [curUserCeramicClient, setCurUserCeramicClient] = useState()
    const [accountId, setAccountId] = useState()
    const [summoner, setSummoner] = useState()
    const [totalShares, setTotalShares] = useState()
    const [escrowBalance, setEscrowBalance] = useState()
    const [guildBalance, setGuildBalance] = useState()
    const [depositToken, setDepositToken] = useState()
    const [proposalDeposit, setProposalDeposit] = useState()
    const [periodDuration, setPeriodDuration] = useState()
    const [proposalEvents, setProposalEvents] = useState([])
    
    const classes = useStyles()
    
    const {      
    //  handleSetCurrentPeriod,
     
     
    //  memberStatus,
    //  memberInfo,
    //  depositToken,
      tributeToken,
      tributeOffer,
      processingReward,
     // proposalDeposit,
     // guildBalance,
     // escrowBalance,
     // proposalEvents,
      handleProposalEventChange,
     // handleGuildBalanceChanges,
     // handleEscrowBalanceChanges,
      handleUserBalanceChanges,
      handleSuccessMessage,
      handleErrorMessage,
      handleSnackBarOpen,
      handleHasDao,
      hasDao,
      factoryContract,
    //  currentPeriod,
    //  periodDuration,
      tokenName,
      minSharePrice,
      proposalComments,
     
      daoContract,
      handleInitChange,
      appIdx,
     // summoner,
     // totalShares,

    // accountId,
    handleContractIdx,
     appClient,
     refreshAccount,
    //  idx,
     // didsContract,
     // contractId,
     // contractIdx 
    } = props
      

      const {
        contractId
      } = useParams()
      console.log('contractid', contractId)

      async function handleGuildBalanceChanges() {
        try {
          let currentGuildBalance = await contract.getGuildTokenBalances()
          if(currentGuildBalance) {
            setGuildBalance(currentGuildBalance)
            await refreshAccount()
          }
          return true
        } catch (err) {
          return false
        }
      }

      async function handleEscrowBalanceChanges() {
        try {
          let currentEscrowBalance = await contract.getEscrowTokenBalances()
          if(currentEscrowBalance) {
            setEscrowBalance(currentEscrowBalance)
            await refreshAccount()
          }
          return true
        } catch (err) {
          return false
        }
      }
      
      function handleTabValueState(value) {
        setTabValue(value)
      }
    
      useEffect(
        () => {
          let isMounted = true; // note this flag denote mount status

            async function fetchData() {

              let accountObj = await dao.loadAccountObject()
              let accountId     
              if(accountObj){
                  accountId = accountObj.accountId
                  setAccountId(accountId)
              }
              let curAccount = await wallet.getAccount(accountId)
              console.log('curaccount', curAccount)
              let seed = await ceramic.getSeed(curAccount)
              let thisCurrentUserCeramicClient = await ceramic.getCeramic(curAccount, seed)
              setCurUserCeramicClient(thisCurrentUserCeramicClient)
              
              //Set App Ceramic Client
              let appSeed = Buffer.from(process.env.FACTORY_PRIV_KEY.slice(0, 32))
              let appAccount = await wallet.getAccount(process.env.FACTORY_CONTRACT)
              
              let appClient = await ceramic.getCeramic(appAccount, appSeed)

              let contract = await dao.loadDAO(contractId)
              setContract(contract)
              console.log('dao contract', contract)

              let init = await contract.getInit()
              console.log('init', init)

              let thisDIDsContract = await dids.loadDIDs(process.env.DIDS_CONTRACT)
              setDidsContract(thisDIDsContract)

              let thisContractIdx
              let currentAliases = {}
              try {
                  let allAliases = await thisDIDsContract.getAliases()
                 
                  //reconstruct aliases
                  let i = 0
                  
                  while (i < allAliases.length) {
                      let key = allAliases[i].split(':')
                      let alias = {[key[0]]: key[1]}
                      currentAliases = {...currentAliases, ...alias}
                      i++
                  }
                  if(allAliases) {
                      thisContractIdx = new IDX({ ceramic: appClient, aliases: currentAliases})
                      setContractIdx(thisContractIdx)
                      handleContractIdx(thisContractIdx)
                  }
              } catch (err) {
                  console.log('error retrieving aliases and setting app Idx', err)
              }
              console.log('contractidx', thisContractIdx)

              // Set Current User Ceramic Client
              console.log('accountid', accountId)
                   
              let thisUserIdx = new IDX({ ceramic: thisCurrentUserCeramicClient, aliases: currentAliases})
              setCurUserIdx(thisUserIdx)              
            
              let did = await thisDIDsContract.getDID({accountId: contractId})
              console.log('did', did)

              let memberEvents = await thisContractIdx.get('member', did)
              console.log('memberEvents', memberEvents)
              setAllMemberInfo(memberEvents.events)

              let memberProposalEvents = await thisContractIdx.get('memberProposal')
              console.log('memberproposalevents', memberProposalEvents)
              if(memberProposalEvents && memberProposalEvents.events.length > 0){
              console.log('memberProposalEvents', memberProposalEvents)
              setProposalEvents(memberProposalEvents.events)
              }

              let thisMemberInfo
              let thisMemberStatus

              try {
                thisMemberStatus = await contract.getMemberStatus({member: accountId})
                console.log('member status', thisMemberStatus)
                if(isMounted) {
                setMemberStatus(thisMemberStatus)
                }
              } catch (err) {
                console.log('no member status yet')
               
              }
             
              try {
                thisMemberInfo = await contract.getMemberInfo({member: accountId})
                console.log('member info', thisMemberInfo)
                if(isMounted) {
                setMemberInfo(thisMemberInfo)
                }
              } catch (err) {
                console.log('no member info yet')
               
              }

              try {
                let owner = await contract.getSummoner()
                if(isMounted) {
                setSummoner(owner)
                console.log('summoner', summoner)
                }
              } catch (err) {
                console.log('no summoner yet')
               
              }
  
              try {
                let shares = await contract.getTotalShares()
                console.log('shares', shares)
                if(isMounted) {
                setTotalShares(shares)
                }
              } catch (err) {
                console.log('no total shares yet')
               
              }

              try {
                let token = await contract.getDepositToken()
                if(isMounted) {
                setDepositToken(token)
                }
              } catch (err) {
                console.log('no deposit token yet')
               
              }
                  
              try {
                let deposit = await contract.getProposalDeposit()
                console.log('proposal deposit', deposit)
                if(isMounted) {
                setProposalDeposit(deposit)
                }
              } catch (err) {
                console.log('no proposal deposit yet')
               
              }
  
              try {
                let duration = await contract.getPeriodDuration()
                if(isMounted) {
                setPeriodDuration(duration)
                }
              } catch (err) {
                console.log('no period duration yet')
               
              }

              let ebalance
              try {
                ebalance = await contract.getEscrowTokenBalances()
                console.log('escrow balance', ebalance)
                if(isMounted) {
                setEscrowBalance(ebalance)
                }
              } catch (err) {
                console.log('no escrow balance')
               
              }

              let gbalance
              try {
                gbalance = await contract.getGuildTokenBalances()
                if(isMounted) {
                setGuildBalance(gbalance)
                }
              } catch (err) {
                console.log('no guild balance')
              
              }

              if(thisMemberStatus && thisMemberInfo !== undefined) {
              if(isMounted) {
                setMemberIcon(<CheckCircleIcon />)
                setSharesLabel('Shares: ' + thisMemberInfo[0].shares)
                setLootLabel('Loot: ' + thisMemberInfo[0].loot)
              }
              }

              let guildRow
                if(gbalance) {
                  for (let i = 0; i < gbalance.length; i++) {
                    guildRow = (<>{gbalance[i].balance} {gbalance[i].token}</>
                    )
                  }
                } else {
                  guildRow = '0 Ⓝ'
                }

                if(isMounted){
                setGuildBalanceChip(<>{guildRow}</>)
                }

              let escrowRow
                if(ebalance) {
                  for (let i = 0; i < ebalance.length; i++) {
                    escrowRow = (<>{ebalance[i].balance} {ebalance[i].token}</>)
                  }
                } else {
                  escrowRow = '0 Ⓝ'
                }

                if(isMounted) {
                setEscrowBalanceChip(<>{escrowRow}</>)
                }

              let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
              console.log('nearprice', getNearPrice.data.near.usd)
              if(isMounted){
                setNearPrice(getNearPrice.data.near.usd)
              }


              if(currentPeriod == undefined || currentPeriod == 0){
                try {
                  let period = await contract.getCurrentPeriod()
                  if(isMounted) {
                    setCurrentPeriod(period)
                  }
                } catch (err) {
                  console.log('get period issue', err)
                }
              }

              let i = 1
              setTimeout(async function refreshCurrentPeriod() {
                let start = true
                let init
                try{
                    init = await contract.getInit()
                } catch (err) {
                    console.log('cant retreive init', err)
                }
                if(init=='done'){
                try {
                let period = await contract.getCurrentPeriod()
                setCurrentPeriod(period)
                console.log('get period success')
                } catch (err) {
                console.log('get period issue', err)
                }
                start = false
                i++
                if(start == false){
                setTimeout(refreshCurrentPeriod, 10000)
                }
            }
            }, 10000)
            }

            fetchData()
              .then((res) => {
               
              })
              return () => { isMounted = false } // use effect cleanup to set flag false if unmounted
        }, [ memberStatus ]
      )

    function handleTabValueState(value) {
      setTabValue(value)
    }
    
  
    return (
            <>
            <Grid container style={{padding:'20px'}}>
            <Grid container justify="space-evenly" alignItems="center" style={{marginBottom:'15px'}} spacing={0}>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <div style={{marginLeft: '10px'}}>
                <ActionSelector 
                  handleProposalEventChange={handleProposalEventChange}
                  handleEscrowBalanceChanges={handleEscrowBalanceChanges}
                  handleGuildBalanceChanges={handleGuildBalanceChanges}
                  handleUserBalanceChanges={handleUserBalanceChanges}
                  handleTabValueState={handleTabValueState}
                  accountId={accountId}
                  tokenName={tokenName}
                  depositToken={depositToken}
                  minSharePrice={minSharePrice}
                  contract={contract}
                  daoContract={daoContract}
                  proposalDeposit={proposalDeposit}
                  didsContract={didsContract}
                  contractIdx={contractIdx}
                  curUserIdx={curUserIdx}
                />
              </div>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <div style={{float:'right'}}>
              {summoner == accountId ?<div style={{float:'right',marginTop:'-5px',marginLeft:'5px'}}><RightSideDrawer 
                handleInitChange={handleInitChange} 
                accountId={accountId} 
                contract={contract}
                hasDao={hasDao}
                factoryContract={factoryContract} 
                handleHasDao={handleHasDao} 
                handleErrorMessage={handleErrorMessage} 
                handleSuccessMessage={handleSuccessMessage}
                handleSnackBarOpen={handleSnackBarOpen} /></div>: null }
                <Chip variant="outlined" label="Member" icon={memberIcon} />
                <Chip variant="outlined" label={lootLabel}  />
                <Chip variant="outlined" label={sharesLabel}  />
                <Chip variant="outlined" icon={<AccessTimeIcon />} label={'Period: ' + currentPeriod} />
               
                </div>
              </Grid>
            </Grid>
        
          <Grid container justify="center" alignItems="center" spacing={1} className={classes.top}> 
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Typography variant="h6" color="textPrimary" align="center">Fund: {guildBalanceChip} {guildBalance && guildBalance.length > 0 ? guildBalance[0].balance > 0 ? '($' + (parseInt(guildBalance[0].balance) * nearPrice).toFixed(2) + ' USD)' : '($0.00 USD)' : null } </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Typography variant="h6" color="textPrimary" align="center">Escrow: {escrowBalanceChip} {escrowBalance && escrowBalance.length > 0 ? escrowBalance[0].balance > 0 ? '($' + (parseInt(escrowBalance[0].balance) * nearPrice).toFixed(2) + ' USD)' : '($0.00 USD)' : null }</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Typography variant="h6" color="textPrimary" align="center">Total Shares: {totalShares}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
              <Typography variant="h6" color="textPrimary" align="center">Share Value: {guildBalance && guildBalance.length > 0 ? guildBalance[0].balance > 0 ? '$' + ((guildBalance[0].balance/totalShares)*nearPrice).toFixed(2) + ' USD' : '$0.00 USD' : null }</Typography>
            </Grid>
          </Grid>
          

          <Divider variant="middle" align="center" style={{width:'75%', margin: 'auto'}}/>

        

          <Grid container justify="space-evenly" alignItems="center" spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
              <ProposalList 
                accountId={accountId} 
                guildBalance={guildBalance}
                handleTabValueState={handleTabValueState}
                tabValue={tabValue}
                handleProposalEventChange={handleProposalEventChange}
                handleGuildBalanceChanges={handleGuildBalanceChanges}
                handleEscrowBalanceChanges={handleEscrowBalanceChanges}
                proposalEvents={proposalEvents}
                memberStatus={memberStatus}
                proposalDeposit={proposalDeposit}
                depositToken={depositToken}
                tributeToken={tributeToken}
                tributeOffer={tributeOffer}
                processingReward={processingReward}
                currentPeriod={currentPeriod}
                periodDuration={periodDuration}
                proposalComments={proposalComments}
                contract={contract}
                daoContract={daoContract}
                allMemberInfo={allMemberInfo}
                handleSnackBarOpen={handleSnackBarOpen}
                handleSuccessMessage={handleSuccessMessage}
                handleErrorMessage={handleErrorMessage}
                summoner={summoner}
                contractIdx={contractIdx}
                curUserIdx={curUserIdx}
                didsContract={didsContract}
                contractId={contractId}
                appIdx={appIdx}
                appClient={appClient}
              />
            </Grid>
          </Grid>
        </Grid>
        </>
      
    )
    
}