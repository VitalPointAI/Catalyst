import 'regenerator-runtime/runtime'
//import 'fontsource-roboto';
import React, { useState, useEffect } from 'react'
import FleetHQ from './components/landingPages/catalystHQ'
import { dao } from '../../utils/dao'
import { factory } from '../../utils/factory'
import { proposalEvent } from '../../utils/proposalEvents'
import { summonEvent } from '../../utils/summonEvents'
import { memberEvent } from '../../utils/memberEvent'
import { daoContractSend } from '../../utils/daoContractSender'
import { makeStyles } from '@material-ui/core/styles'
import { initiateDB, initiateAppDB } from '../../utils/threadsDB'
import { utils } from 'near-api-js'

// Material UI imports
import Typography from '@material-ui/core/Typography'
import LinearWithValueLabel from './components/common/LinearProgressWithLabel/linearProgressWithLabel'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'

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
 // const [accountId, setAccountId] = useState()  
  const [tabValue, setTabValue] = useState('1')
  //const [currentPeriod, setCurrentPeriod] = useState(0)
  //const [proposalEvents, setProposalEvents] = useState([])
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
 // const [contract, setContract] = useState()
 // const [daoContractSender, setDaoContractSender] = useState()
  const [allMemberInfo, setAllMemberInfo] = useState()
  const [totalShares, setTotalShares] = useState()
  const [initEvents, setInitEvents] = useState()
 // const [proposalsLength, setProposalsLength] = useState()
  const [appDB, setAppDB] = useState()
  const [userDB, setUserDB] = useState()
 // const [factoryContract, setFactoryContract] = useState()
 
  const [accountHasDao, setAccountHasDao] = useState()
  const [landing, setLanding] = useState(true)
  const [daoContractId, setDaoContractId] = useState()
  const [errorMessage, setErrorMessage] = useState()
  const [severity, setSeverity] = useState()
  const [successMessage, setSuccessMessage] = useState()
  const [snackBarOpen, setSnackBarOpen] = useState(false)

  const classes = useStyles()

  const{
    proposalEvents,
    currentPeriod,
    proposalsLength,
    handleSetProposalsLength,
    handleSetProposalEvents,
    handleSetCurrentPeriod,
    handleProposalEventChange,
    factoryContract,
    daoContractSender,
    contract,
    hasDao,
    accountId, 
    daoList,
    idx,
    daoIdx,
    contractId,
    didsContract
  } = props  

  console.log('dao daoList', daoList)

  function handleInitChange(newState) {
    setInit(newState)
  }

  function handleContractChange(contract) {
    setContract(contract)
  }

  function handleSummonerChange(newSummoner) {
    setSummoner(newSummoner)
  }

  async function handleHasDao(property) {
    setAccountHasDao(property)
    await props.refreshAccount()
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

  function handleErrorMessage(message, severity) {
    setErrorMessage(message)
    setSeverity(severity)
  }

  function handleSuccessMessage(message, severity) {
    setSuccessMessage(message)
    setSeverity(severity)
  }

  function handleSnackBarOpen(property) {
    setSnackBarOpen(property)
  }

  

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  useEffect(
      () => {
      // in this case, we only care to query the contract when signed in
     //if (wallet.connection.isSignedIn()) {
        
      //  setLoginState(true)      
        let isMounted = true; // note this flag denote mount status

        // async function initFleet() {

        //   // if(!appDB){
        //   //   let app = await initiateAppDB()
        //   //    setAppDB(true)
        //   //  }
        //   //  if(!userDB) {
        //   //    let user = await initiateDB()
        //   //    setUserDB(true)
        //   //  }
         
           
 
        //   //  let accountObj = await dao.loadAccountObject()
        //   //  let accountId = accountObj.accountId
        //   //  if(isMounted) {
        //   //  setAccountId(accountObj.accountId)
        //   //  }
        //   //  let daoName = accountId.split('.')
        //   //  let dname = daoName[0]
        //   //  console.log('dname', dname)
        //   //  let factoryContract = await factory.loadFactory(dname+'.'+process.env.FACTORY_CONTRACT)
        //   //  if(isMounted) {
        //   //    setFactoryContract(thisfactoryContract)
        //   //    console.log('factoryContract', factoryContract)
        //   //  }

        //   //  try {
        //   //   let accountName = accountId.split('.')
        //   //   console.log('accountName', accountName[0])
        //   //   let name = accountName[0]
        //   //   let hasDao = await factoryContract.findDAO({account: name + '.' + process.env.FACTORY_CONTRACT})
           
        //   //   console.log('hasDao', hasDao)
        //   //   if(isMounted && hasDao){
        //   //     setAccountHasDao(true)
        //   //     console.log('has Fleet?', hasDao)
        //     //   if(!hasDao){
        //     //     setLanding(true)
        //     //     // setDaoContractId(name + '.' + process.env.FACTORY_CONTRACT)
        //     //     // console.log('dao contract id', daoContractId)
        //     //     return false
        //     //   } else {
        //     //     setLanding(false)
        //     //     return true
        //     //   }
        //     // }
        //   // } catch (err) {
        //   //   console.log('error determining if account has a fleet', err)
        //   // }
      
        //   // console.log('dao contract id 2', daoContractId)
        //   // let accountName = accountId.split('.')
        //   // console.log('accountName', accountName[0])
        //   // let name = accountName[0]
        //   //  let contract = await dao.loadDAO(name + '.' + process.env.FACTORY_CONTRACT)
        //   //  if(isMounted) {
        //   //  handleContractChange(contract)
        //   //  }
 
        //   //  let daoContractSender = await daoContractSend.loadDAO(daoContractId)
        //   //  if(isMounted) {
        //   //  setDaoContractSender(daoContractSender)
        //   //  }
        //   return true
        // }
        
        
        async function fetchData() {
          // let accountObj = await dao.loadAccountObject()
          // let accountId = accountObj.accountId
          // setAccountId(accountObj.accountId)
          // let accountName = accountId.split('.')
          // console.log('accountName', accountName[0])
          // let name = accountName[0]
          // let contract = await dao.loadDAO(name + '.' + process.env.FACTORY_CONTRACT)
          // console.log('fetch data contract', contract)
          //  if(isMounted) {
          //  handleContractChange(contract)
          //  }
          console.log('dao contract', props.contract)
          console.log('dao contract sender', props.daoContractSender)
          console.log('factory contract', props.factoryContract)
          console.log('dao has dao', props.hasDao)
          
          if(contract){
            let isInit
            try {
              isInit = await contract.getInit({})
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

          if(isInit == 'done'){
          if(currentPeriod == undefined || currentPeriod == 0){
            try {
              let period = await contract.getCurrentPeriod()
              if(isMounted) {
                handleSetCurrentPeriod(period)
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
              let currentProposalEvents = await proposalEvent.retrieveAllEvents(proposalLength)
              if(currentProposalEvents.length != 0) {
                if(isMounted) {
                  handleSetProposalEvents(currentProposalEvents)
                }
              }
            } catch (err) {
              console.log('error retrieving proposal events', err)
            }

            try {
              let initEventsLength = await contract.getInitEventsLength()
              let currentInitEvents = await summonEvent.retrieveAllSummonEvents(initEventsLength)
              if(currentInitEvents && currentInitEvents.length != 0) {
                if(isMounted) {
                  setInitEvents(currentInitEvents)
                }
              }
            } catch (err) {
              console.log('error retrieving init events', err)
            }

            try {
              let memberEventsLength = await contract.getTotalMembers()
              let currentMemberEvents = await memberEvent.retrieveAllMemberEvents(parseInt(memberEventsLength))
              if(currentMemberEvents && currentMemberEvents.length != 0) {
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
        }
        return true
        }
        
        initFleet()
          .then((res) => {
            console.log('res init fleet', res)
          })
        
        fetchData()
          .then((nextRes) => {
             if(isMounted) {
                console.log('next res', nextRes)
                 nextRes ? setDone(true) : setDone(false)
             }
          })
       
        return () => { isMounted = false } // use effect cleanup to set flag false if unmounted

    },

    // The second argument to useEffect tells React when to re-run the effect
    // it compares current value and if different - re-renders
    [initialized, currentPeriod, hasDao]
  )

  if(!hasDao) {
    return (
      <FleetHQ
        accountId={accountId}
        tokenName='Ⓝ'
        contract={contract}
        daoContract={daoContractSender}
        handleInitChange={handleInitChange}
        factoryContract={factoryContract}
        hasDao={accountHasDao}
        handleSnackBarOpen={handleSnackBarOpen}
        handleSuccessMessage={handleSuccessMessage}
        handleErrorMessage={handleErrorMessage}
        handleHasDao={handleHasDao}
        snackBarOpen={snackBarOpen}
        severity={severity}
        errorMessage={errorMessage}
        successMessage={successMessage}
        daoList={daoList}
        idx={idx}
        didsContract={didsContract}
      />
    )
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
  
  if(done && (initialized != undefined && !initialized)) {
      return (
        <Initialize
          accountId={accountId}
          done={done} 
          handleInitChange={handleInitChange} 
          initialized={initialized}
          contract={contract}
          handleSetCurrentPeriod={handleSetCurrentPeriod}
          handleSetProposalsLength={handleSetProposalsLength}
          handleSetProposalEvents={handleSetProposalEvents}
          idx={idx}
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
          handleSnackBarOpen={handleSnackBarOpen}
          handleSuccessMessage={handleSuccessMessage}
          handleErrorMessage={handleErrorMessage}
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
          factoryContract={factoryContract}
          hasDao={accountHasDao}
          idx={idx}
          didsContract={didsContract}
          />
      )
  }
}
