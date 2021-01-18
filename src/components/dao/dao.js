import 'regenerator-runtime/runtime'
//import 'fontsource-roboto';
import React, { useState, useEffect } from 'react'
import { dao } from '../../utils/dao'
import { daoContractSend } from '../../utils/daoContractSender'
import { makeStyles } from '@material-ui/core/styles'

// Material UI imports
import Typography from '@material-ui/core/Typography'
import LinearWithValueLabel from './components/common/LinearProgressWithLabel/linearProgressWithLabel'
import Grid from '@material-ui/core/Grid'

// DApp component imports
import Initialize from './components/Initialize/initialize'
import TokenData from './components/TokenData/tokenData'

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

  const classes = useStyles()

  function handleInitChange(newState) {
    setInit(newState)
  }

  function handleContractChange(contract) {
    setContract(contract)
  }

  function handleSummonerChange(newSummoner) {
    setSummoner(newSummoner)
  }

  // async function getCurrentPeriod() {
  //   try {
  //     let period = await contract.getCurrentPeriod()
  //     setCurrentPeriod(period)
  //   } catch (err) {
  //     console.log('get period issue', err)
  //   }
  // }

  async function refreshProposalEvents() {
    try {
      let requests = await contract.getAllProposalEvents()
      if(requests.length != 0) {
          setProposalEvents(requests)
      }
    } catch (err) {
      console.log('error retrieving proposal events')
    }
    try {
      let period = await contract.getCurrentPeriod()
      setCurrentPeriod(period)
    } catch (err) {
      console.log('get period issue', err)
    }
  }

  async function handleProposalEventChange() {
    try {
      let currentProposalEvents = await contract.getAllProposalEvents()
      if(currentProposalEvents.length > proposalEvents.length){
        setProposalEvents(currentProposalEvents)
      }
      return true
    } catch (err) {
      return false
    }
  }

  async function handleGuildBalanceChanges() {
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

        async function fetchContract() {
          let accountObj = await dao.loadAccountObject()
          setAccountId(accountObj.accountId)
          let daoContract = await dao.loadDAO()
          handleContractChange(daoContract)

          let daoContractSender = await daoContractSend.loadDAO()
          setDaoContractSender(daoContractSender)
          return true
        }

        async function fetchInit() {         
          try {
            let isInit = await contract.getInit({})
            if(isInit == 'done') {
              handleInitChange(true)
            } else {
              handleInitChange(false)
            }
          } catch (err) {
            console.log('initilization not complete', err)
          }
        }

        async function fetchData() {

          await fetchContract()

          await fetchInit()
          
            try {
              let result = await contract.getMemberStatus({member: accountId})
              setMemberStatus(result)
            } catch (err) {
              console.log('no member status yet')
            }

            try {
              let token = await contract.getDepositToken()
              setDepositToken(token)
            } catch (err) {
              console.log('no deposit token yet')
            }
                
            try {
              let deposit = await contract.getProposalDeposit()
              setProposalDeposit(deposit)
            } catch (err) {
              console.log('no proposal deposit yet')
            }

            try {
              let duration = await contract.getPeriodDuration()
              setPeriodDuration(duration)
            } catch (err) {
              console.log('no period duration yet')
              
            }
                
            try {
              let result1 = await contract.getUserTokenBalance({user: accountId, token: depositToken})
              setUserBalance(result1)
            } catch (err) {
              console.log('no user token balance yet')
              
            }

            try {
              let result2 = await contract.getMemberInfo({member: accountId})
              setMemberInfo(result2)
            } catch (err) {
              console.log('no member info yet')
              
            }

            try {
              let result2 = await contract.getAllMemberInfo()
              console.log('result2', result2)
              setAllMemberInfo(result2)
            } catch (err) {
              console.log('no list of members yet', err)
              
            }
            
            try {
              let owner = await contract.getSummoner()
              setSummoner(owner)
            } catch (err) {
              console.log('no summoner yet')
              
            }

            try {
              let balance = await contract.getEscrowTokenBalances()
              setEscrowBalance(balance)
            } catch (err) {
              console.log('no escrow balance')
            }

            try{
              let allComments = await contract.getAllComments()
              setProposalComments(allComments)
            } catch (err) {
                console.log('no comments')
            }

            try {
              let balance = await contract.getGuildTokenBalances()
              setGuildBalance(balance)
            } catch (err) {
              console.log('no guild balance')
            }

            try {
              let requests = await contract.getAllProposalEvents()
              if(requests.length != 0) {
                  setProposalEvents(requests)
              }
            } catch (err) {
              console.log('error retrieving proposal events')
            }
            return true
         
        }

        fetchData()
          .then((res) => {
            res ? setDone(true) : setDone(false)
            console.log('done', done)
            console.log('initialized', initialized)
        })
        return function cleanup() {}
  //    }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // it compares current value and if different - re-renders
    [done, initialized]
  )

  
  if(done && initialized) {
    window.setInterval(refreshProposalEvents, 30000)
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
        <TokenData
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
         // getCurrentPeriod={getCurrentPeriod}
          refreshProposalEvents={refreshProposalEvents}
          />
      )
  }
}
