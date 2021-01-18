import React, { useState, useEffect } from 'react'
import LogoutButton from '../../components/common/LogoutButton/logoutButton'
import ActionSelector from '../ActionSelector/actionSelector'
import ProposalList from '../ProposalList/proposalList'
import BalanceChart from '../BalanceGraphs/balanceGraph'
import RightSideDrawer from './RightSideDrawer'
//import Footer from '../common/Footer/footer'

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
    avatar: {
      backgroundColor: blue[500],
      fontColor: '#FFFFFF'
    },
  }));

  
export default function TokenData(props) {

    const [graphData, setGraphData] = useState([])
    const [sharesLabel, setSharesLabel] = useState('Shares: 0')
    const [lootLabel, setLootLabel] = useState('Loot: 0')
    const [memberIcon, setMemberIcon] = useState(<NotInterestedIcon />)
    const [guildBalanceChip, setGuildBalanceChip] = useState()
    const [escrowBalanceChip, setEscrowBalanceChip] = useState()
    
    const classes = useStyles()
    
    const {      
      tabValue,
      getCurrentPeriod,
      refreshProposalEvents,
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
      allMemberInfo } = props

      useEffect(
        () => {
            async function fetchData() {
              if(memberStatus && memberInfo !== undefined) {
                console.log('memberinfo', memberInfo)
                setMemberIcon(<CheckCircleIcon />)
                setSharesLabel('Shares: ' + memberInfo[0].shares)
                setLootLabel('Loot: ' + memberInfo[0].loot + ' Ⓝ')
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
                setGuildBalanceChip(<>{guildRow}</>)

              let escrowRow
                if(escrowBalance) {
                  for (let i = 0; i < escrowBalance.length; i++) {
                    escrowRow = (<>{escrowBalance[i].balance} {escrowBalance[i].token}</>)
                  }
                } else {
                  escrowRow = '0 Ⓝ'
                }
                setEscrowBalanceChip(<>{escrowRow}</>)
            }

            fetchData()
              .then((res) => {
                console.log(res)
              })
        }, [memberStatus, memberInfo]
      )
   

    return (
       <>
        <Grid container className={classes.root}>
        
          <Grid container className={classes.centered}>

            <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
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
                refreshProposalEvents={refreshProposalEvents}
              />
            </Grid>

            <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
              <Chip variant="outlined" avatar={
                <Avatar aria-label="guild-balances" className={classes.avatar}>
                  F
                </Avatar>
              } label={guildBalanceChip} style={{float: 'right', marginTop: '5px', marginRight: '2px'}} />
              <Chip variant="outlined" avatar={
                <Avatar aria-label="escrow-balances" className={classes.avatar}>
                  E
                </Avatar>
              } label={escrowBalanceChip} style={{float: 'right', marginTop: '5px', marginRight: '2px'}} />
            </Grid>

            <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
              <div style={{float:'right'}}><RightSideDrawer handleInitChange={handleInitChange} accountId={accountId} contract={contract}/></div>
              <Chip variant="outlined" icon={<AccessTimeIcon />} label={'Period: ' + currentPeriod} style={{float: 'right', marginTop: '5px', marginRight: '2px'}}/>
              <Chip variant="outlined" label={sharesLabel} style={{float: 'right', marginTop: '5px', marginRight: '5px'}} />
              <Chip variant="outlined" label={lootLabel} style={{float: 'right', marginTop: '5px', marginRight: '2px'}} />
              <Chip variant="outlined" label="Member" icon={memberIcon} style={{float: 'right', marginTop: '5px', marginRight: '2px'}}/>
            </Grid>

          </Grid>

          <Grid container>
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
                getCurrentPeriod={getCurrentPeriod}
                refreshProposalEvents={refreshProposalEvents}
              />
            </Grid>
          </Grid>

        </Grid>
      </>
    )
    
}