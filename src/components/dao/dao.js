import 'regenerator-runtime/runtime'
//import 'fontsource-roboto';
import React, { useState, useEffect } from 'react'
import { dao } from '../../utils/dao'
import { proposalEvent } from '../../utils/proposalEvents'
import { summonEvent } from '../../utils/summonEvents'
import { memberEvent } from '../../utils/memberEvent'
import { daoContractSend } from '../../utils/daoContractSender'
import { makeStyles } from '@material-ui/core/styles'
import { TaskTimer } from 'tasktimer'
import { initiateDB, initiateAppDB } from '../../utils/threadsDB'

// Material UI imports
import Typography from '@material-ui/core/Typography'
import LinearWithValueLabel from './components/common/LinearProgressWithLabel/linearProgressWithLabel'
import Grid from '@material-ui/core/Grid'

// DApp component imports
import Initialize from './components/Initialize/initialize'
import AppFramework from './components/AppFramework/appFramework'

// import stylesheets
import './global.css'

const BN = require('bn.js')

const useStyles = makeStyles((theme) => ({
  root: {
   height: '100%',
   display: 'flex',
   justifyContent: 'center',
   alignItems: 'center'
  },
  }));

export default function Dao(props) {

  // state setup
  const [initialized, setInit] = useState()
  const [done, setDone] = useState(false)
  const [accountId, setAccountId] = useState()  
  const [tabValue, setTabValue] = useState('1')
  const [currentPeriod, setCurrentPeriod] = useState(0)
  const [proposalEvents, setProposalEvents] = useState([])
  const [summoner, setSummoner] = useState()
  const [guildBalance, setGuildBalance] = useState()
  const [escrowBalance, setEscrowBalance] = useState()
  const [depositToken, setDepositToken] = useState('')
  const [memberStatus, setMemberStatus] = useState()
  const [userBalance, setUserBalance] = useState()
  const [memberInfo, setMemberInfo] = useState()
  const [proposalDeposit, setProposalDeposit] = useState()
  const [tributeToken, setTributeToken] = useState()
  const [tributeOffer, setTributeOffer] = useState()
  const [periodDuration, setPeriodDuration] = useState()
  const [proposalComments, setProposalComments] = useState([])
  const [contract, setContract] = useState()
  const [daoContractSender, setDaoContractSender] = useState()
  const [allMemberInfo, setAllMemberInfo] = useState()
  const [totalShares, setTotalShares] = useState()
  const [initEvents, setInitEvents] = useState()

  const classes = useStyles()

  const {
    refreshAccount
  } = props

  const timer = new TaskTimer(1000)

  function handleInitChange(newState) {
    setInit(newState)
  }

  function handleContractChange(contract) {
    setContract(contract)
  }

  function handleSummonerChange(newSummoner) {
    setSummoner(newSummoner)
  }

  async function refreshCurrentPeriod() {
    try {
      let period = await contract.getCurrentPeriod()
      setCurrentPeriod(period)
    } catch (err) {
      console.log('get period issue', err)
    }
  }

  async function refreshProposalEvents() {
    try {
      let requests = await contract.getAllProposalEvents()
      if(requests.length != 0) {
          setProposalEvents(requests)
      }
    } catch (err) {
      console.log('error retrieving proposal events')
    } 
  }

  async function refreshEscrowBalance() {
    try {
      let currentEscrowBalance = await contract.getEscrowTokenBalances()
      if(currentEscrowBalance) {
        setEscrowBalance(currentEscrowBalance)
      }
      return true
    } catch (err) {
      return false
    }
  }

  async function refreshGuildBalance() {
    try {
      let currentGuildBalance = await contract.getGuildTokenBalances()
      if(currentGuildBalance) {
        setGuildBalance(currentGuildBalance)
      }
      return true
    } catch (err) {
      return false
    }
  }

  async function handleProposalEventChange() {
    try {
      let proposalLength = await contract.getProposalsLength()
      let currentProposalEvents = await proposalEvent.retrieveAllEvents(proposalLength, 'ProposalEvents')
      //let currentProposalEvents = await contract.getAllProposalEvents()
      console.log('currentproposalevents', currentProposalEvents)
      setProposalEvents(currentProposalEvents)
      return true
    } catch (err) {
      console.log('error retrieving proposal events', err)
      return false
    }
  }

  async function handleGuildBalanceChanges() {
    try {
      let currentGuildBalance = await contract.getGuildTokenBalances()
      if(currentGuildBalance) {
        setGuildBalance(currentGuildBalance)
        await props.refreshAccount()
      }
      return true
    } catch (err) {
      return false
    }
  }

  async function handleUserBalanceChanges() {
    try {
      let currentUserBalance = await contract.getUserTokenBalance({user: accountId, token: depositToken})
      if(currentUserBalance) {
        setUserBalance(currentUserBalance)
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
        await props.refreshAccount()
      }
      return true
    } catch (err) {
      return false
    }
  }

  function handleTabValueState(value) {
    setTabValue(value)
  }

  function formatAmount(amount){
    return BigInt(utils.format.parseNearAmount(amount.toString()))
  }

  

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  useEffect(
      () => {
      // in this case, we only care to query the contract when signed in
     //if (wallet.connection.isSignedIn()) {
        
      //  setLoginState(true)      
        let isMounted = true; // note this flag denote mount status
        
        async function fetchData() {

          await initiateDB()
          await initiateAppDB()

          let accountObj = await dao.loadAccountObject()
          let accountId = accountObj.accountId
          if(isMounted) {
          setAccountId(accountObj.accountId)
          }
          let contract = await dao.loadDAO()
          if(isMounted) {
          handleContractChange(contract)
          }

          let daoContractSender = await daoContractSend.loadDAO()
          if(isMounted) {
          setDaoContractSender(daoContractSender)
          }

          try {
            let isInit = await contract.getInit({})
            if(isInit == 'done') {
              if(isMounted) {
              handleInitChange(true)
              }
            } else {
              if(isMounted) {
              handleInitChange(false)
              }
            }
          } catch (err) {
            console.log('initilization not complete', err)
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

          try{

            try {
              let result = await contract.getMemberStatus({member: accountId})
              if(isMounted) {
              setMemberStatus(result)
              }
            } catch (err) {
              console.log('no member status yet')
             
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
                
            try {
              let result1 = await contract.getUserTokenBalance({user: accountId, token: depositToken})
              if(isMounted) {
              setUserBalance(result1)
              }
            } catch (err) {
              console.log('no user token balance yet')
             
            }

            try {
              let result2 = await contract.getMemberInfo({member: accountId})
              if(isMounted) {
              setMemberInfo(result2)
              }
            } catch (err) {
              console.log('no member info yet')
             
            }

            // try {
            //   let result2 = await contract.getAllMemberInfo()
            //   if(isMounted) {
            //   setAllMemberInfo(result2)
            //   }
            // } catch (err) {
            //   console.log('no list of members yet', err)
             
            // }
            
            try {
              let owner = await contract.getSummoner()
              if(isMounted) {
              setSummoner(owner)
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
              let balance = await contract.getEscrowTokenBalances()
              if(isMounted) {
              setEscrowBalance(balance)
              }
            } catch (err) {
              console.log('no escrow balance')
             
            }

            try{
              let allComments = await contract.getAllComments()
              if(isMounted) {
              setProposalComments(allComments)
              }
            } catch (err) {
                console.log('no comments')
               
            }

            try {
              let balance = await contract.getGuildTokenBalances()
              if(isMounted) {
              setGuildBalance(balance)
              }
            } catch (err) {
              console.log('no guild balance')
            
            }

            try {
              let proposalLength = await contract.getProposalsLength()
              console.log('proposals length', proposalLength)

              let currentProposalEvents = await proposalEvent.retrieveAllEvents(proposalLength)
              console.log('proposal events', currentProposalEvents)

              if(currentProposalEvents.length != 0) {
                if(isMounted) {
                  setProposalEvents(currentProposalEvents)
                }
              }
            } catch (err) {
              console.log('error retrieving proposal events', err)
            }

            try {
              let initEventsLength = await contract.getInitEventsLength()
              console.log('init events length', initEventsLength)

              let currentInitEvents = await summonEvent.retrieveAllSummonEvents(initEventsLength)
              console.log('init events', currentInitEvents)

              if(currentInitEvents.length != 0) {
                if(isMounted) {
                  setInitEvents(currentInitEvents)
                }
              }
            } catch (err) {
              console.log('error retrieving init events', err)
            }

            try {
              let memberEventsLength = await contract.getTotalMembers()
              console.log('member events length', parseInt(memberEventsLength))

              let currentMemberEvents = await memberEvent.retrieveAllMemberEvents(parseInt(memberEventsLength))
              console.log('member events', currentMemberEvents)

              if(currentMemberEvents.length != 0) {
                if(isMounted) {
                  setAllMemberInfo(currentMemberEvents)
                }
              }
            } catch (err) {
              console.log('error retrieving member events', err)
            }

            return true
          } catch (err) {
            console.log('not done', err)
            return false
          }
          return true
        }
        
       
        fetchData()
          .then((res) => {
            if(isMounted) {
            res ? setDone(true) : setDone(false)
            
            }
          })


        return () => { isMounted = false } // use effect cleanup to set flag false if unmounted

    },

    // The second argument to useEffect tells React when to re-run the effect
    // it compares current value and if different - re-renders
    [initialized]
  )


  if(done && initialized) {
    // if(periodDuration == undefined){
    //   let periodDuration = 10
    // }
    // timer.add([
    //   {
    //     id: 'refreshCurrentPeriod',
    //     tickInterval: periodDuration,
    //     totalRuns: 0,
    //     callback(task) {
    //       refreshCurrentPeriod()
    //     }
    //   }
    // ])
    // timer.start()
    let i = 1
    setTimeout(async function refreshCurrentPeriod() {
      let start = true
      try {
        let period = await contract.getCurrentPeriod()
        setCurrentPeriod(period)
      } catch (err) {
        console.log('get period issue', err)
      }
      start = false
      i++
      if(start == false){
      setTimeout(refreshCurrentPeriod, 30000)
      }
    }, 30000)


  }
  
  

  // if not done loading all the data, show a progress bar, otherwise show the content

  if(!done) {
    return (
      <Grid container alignItems="center" justify="center">
        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} >
          <Typography component="h2">Just setting things up, please wait a moment.</Typography>
          <LinearWithValueLabel />
        </Grid>
      </Grid>
    )
  }
  
  if(done && (initialized != undefined  && !initialized)) {
      return (
        <Initialize
          accountId={accountId}
          done={done} 
          handleInitChange={handleInitChange} 
          initialized={initialized}
          contract={contract}
        />
      )
  } else {
      return (
        <AppFramework
          handleSummonerChange={handleSummonerChange}
          done={done}
          guildBalance={guildBalance}
          escrowBalance={escrowBalance}
          tabValue={tabValue}
          handleTabValueState={handleTabValueState}
          accountId={accountId}
          userBalance={userBalance}
          handleProposalEventChange={handleProposalEventChange}
          handleEscrowBalanceChanges={handleEscrowBalanceChanges}
          handleGuildBalanceChanges={handleGuildBalanceChanges}
          handleUserBalanceChanges={handleUserBalanceChanges}
          currentPeriod={currentPeriod}
          periodDuration={periodDuration}
          memberStatus={memberStatus}
          memberInfo={memberInfo}
          tokenName='Ⓝ'
          proposalEvents={proposalEvents}
          depositToken={depositToken}
          tributeToken={tributeToken}
          tributeOffer={tributeOffer}
          proposalDeposit={proposalDeposit}
          proposalComments={proposalComments}
          summoner={summoner}
          contract={contract}
          daoContract={daoContractSender}
          handleInitChange={handleInitChange}
          allMemberInfo={allMemberInfo}
          totalShares={totalShares}
          initEvents={initEvents}
          />
      )
  }
}
