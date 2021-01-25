import React, { useState, useEffect } from 'react'
import LogoutButton from '../common/LogoutButton/logoutButton'
import ActionSelector from '../ActionSelector/actionSelector'
import ProposalList from '../ProposalList/proposalList'
import BalanceChart from '../BalanceGraphs/balanceGraph'
import RightSideDrawer from './RightSideDrawer'
import InfoPopup from '../../../common/InfoPopup'
import { Translate } from 'react-localize-redux'

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
    
    const classes = useStyles()
    
    const {      
      tabValue,
      handleTabValueState, 
      accountId,
      memberStatus,
      memberInfo,
      depositToken,
      tributeToken,
      tributeOffer,
      processingReward,
      proposalDeposit,
      guildBalance,
      escrowBalance,
      proposalEvents,
      handleProposalEventChange,
      handleGuildBalanceChanges,
      handleEscrowBalanceChanges,
      handleUserBalanceChanges,
      currentPeriod,
      periodDuration,
      tokenName,
      minSharePrice,
      proposalComments,
      contract,
      daoContract,
      handleInitChange,
      summoner,
      totalShares,
      allMemberInfo } = props

      useEffect(
        () => {
          let isMounted = true; // note this flag denote mount status
            async function fetchData() {
              if(memberStatus && memberInfo !== undefined) {
              if(isMounted) {
                setMemberIcon(<CheckCircleIcon />)
                setSharesLabel('Shares: ' + memberInfo[0].shares)
                setLootLabel('Loot: ' + memberInfo[0].loot)
              }
              }

              let guildRow
                if(guildBalance) {
                  for (let i = 0; i < guildBalance.length; i++) {
                    guildRow = (<>{guildBalance[i].balance} {guildBalance[i].token}</>
                    )
                  }
                } else {
                  guildRow = '0 Ⓝ'
                }
                if(isMounted){
                setGuildBalanceChip(<>{guildRow}</>)
                }

              let escrowRow
                if(escrowBalance) {
                  for (let i = 0; i < escrowBalance.length; i++) {
                    escrowRow = (<>{escrowBalance[i].balance} {escrowBalance[i].token}</>)
                  }
                } else {
                  escrowRow = '0 Ⓝ'
                }
                if(isMounted) {
                setEscrowBalanceChip(<>{escrowRow}</>)
                }

              let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
              if(isMounted){
                setNearPrice(getNearPrice.data.near.usd)
              }
            }

            fetchData()
              .then((res) => {
               
              })
              return () => { isMounted = false } // use effect cleanup to set flag false if unmounted
        }, [escrowBalance, guildBalance]
      )
  
    return (
            <>
            <Grid container style={{padding:'5px'}}>
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
                />
              </div>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <div style={{float:'right'}}>
              {summoner == accountId ?<div style={{float:'right',marginTop:'-5px',marginLeft:'5px'}}><RightSideDrawer handleInitChange={handleInitChange} accountId={accountId} contract={contract}/></div>: null }
                <Chip variant="outlined" label="Member" icon={memberIcon} />
                <Chip variant="outlined" label={lootLabel}  />
                <Chip variant="outlined" label={sharesLabel}  />
                <Chip variant="outlined" icon={<AccessTimeIcon />} label={'Period: ' + currentPeriod} />
               
                </div>
              </Grid>
            </Grid>
        
          <Grid container justify="center" alignItems="center" spacing={1} className={classes.top}> 
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Typography variant="h6" color="textPrimary" align="center">Fund: {guildBalanceChip} {guildBalance.length > 0 ? guildBalance[0].balance > 0 ? '($' + (parseInt(guildBalance[0].balance) * nearPrice).toFixed(2) + ' USD)' : '($0.00 USD)' : null } </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Typography variant="h6" color="textPrimary" align="center">Escrow: {escrowBalanceChip} {escrowBalance.length > 0 ? escrowBalance[0].balance > 0 ? '($' + (parseInt(escrowBalance[0].balance) * nearPrice).toFixed(2) + ' USD)' : '($0.00 USD)' : null }</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Typography variant="h6" color="textPrimary" align="center">Total Shares: {totalShares}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
              <Typography variant="h6" color="textPrimary" align="center">Share Value: {guildBalance.length > 0 ? guildBalance[0].balance > 0 ? '$' + ((guildBalance[0].balance/totalShares)*nearPrice).toFixed(2) + ' USD' : '$0.00 USD' : null }</Typography>
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
              />
            </Grid>
          </Grid>
        </Grid>
        </>
      
    )
    
}