import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { ft } from '../../utils/ft'
import { ceramic } from '../../utils/ceramic'
import * as nearAPI from 'near-api-js'
import { GAS, parseNearAmount, formatNearAmount } from '../../state/near'


// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import AddBoxIcon from '@material-ui/icons/AddBox'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'
import { CardActionArea, CardHeader, LinearProgress } from '@material-ui/core'
import NotInterestedIcon from '@material-ui/icons/NotInterested'


import { config } from '../../state/config'

export const {
    DAO_LINKS
} = config

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      minWidth: '200px',
      maxWidth: '200px',
      //cursor: 'pointer',
      verticalAlign: 'middle',
      margin: '10px 10px 10px 10px',
      padding: '2px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    square: {
      float: 'left',
      marginRight: '10px',
      marginTop: '5px',
    }
  }));

const imageName = require('../../img/default_logo.png') // default no-image avatar
const defaultToken = require('../../img/default-coin.png') // default no-token image

export default function TokenCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [sdate, setsDate] = useState()
    const [sname, setsName] = useState('')
    const [slogo, setsLogo] = useState(imageName)
    const [spurpose, setsPurpose] = useState('')
    const [scategory, setsCategory] = useState('')
    const [owner, setOwner] = useState('')
    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [purposeClicked, setPurposeClicked] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [display, setDisplay] = useState(true)
    const [isUpdated, setIsUpdated] = useState()
    const [anchorEl, setAnchorEl] = useState(null)
    const [anchorE2, setAcnhorE2] = useState(null)
    const [did, setDid] = useState()
    const [finished, setFinished] = useState(false)
    const [detailsClicked, setDetailsClicked] = useState(false) 
    const [amemberStatus, setaMemberStatus] = useState() 
    const [memberIcon, setMemberIcon] = useState(<NotInterestedIcon />)
    
    const [tokenName, setTokenName] = useState('')
    const [tokenIcon, setTokenIcon] = useState(defaultToken)
    const [tokenSymbol, setTokenSymbol] = useState('')
    const [totalSupply, setTotalSupply] = useState('')
    const [FTContract, setFTContract] = useState()
    const [curUserFTContract, setCurUserFTContract] = useState()

    const classes = useStyles();

    const { 
      creator,
      contractId,
      created,
      metadata,
      makeSearchTokens
   } = props
 
   const {
     accountId,
     near,
     appIdx,
     didRegistryContract
   } = state

   useEffect(
    () => {
      async function essentials(){
        if(near && contractId){
          console.log('contractId', contractId)
          let ftAccount
          try{
            ftAccount = new nearAPI.Account(near.connection, contractId)
            console.log('ftaccount', ftAccount)
          } catch (err) {
            console.log('no account', err)
            return false
          }
          
          let curFTIdx
          try{
            curFTIdx = await ceramic.getCurrentFTIdx(ftAccount, appIdx, didRegistryContract)
            
            console.log('curftidx', curFTIdx)
          } catch (err) {
            console.log('problem getting curftidx', err)
            return false
          }

          let ftContract
          try{
            ftContract = await ft.initFTContract(ftAccount, contractId)
            setFTContract(ftContract)
          } catch (err) {
            console.log('problem getting ft contract', err)
            return false
          }

          // populate metadata
          if(ftContract){
            console.log('ftcontract', ftContract)
            let metadata = await ftContract.ft_metadata()
            console.log('metadata', metadata)
            setTokenName(metadata.name)
            setTokenIcon(metadata.icon)
            setTokenSymbol(metadata.symbol)

            let supply = await ftContract.ft_total_supply()
            setTotalSupply(formatNearAmount(supply))
            console.log('accountid', accountId)

            let balance = await ftContract.storage_balance_of({account_id: accountId})
            console.log('storage balance', balance)

            let ftbalance = await ftContract.ft_balance_of({account_id: accountId})
            console.log('ftbalance', ftbalance)
            
            //token registration - needs to be hooked up to user's wallet
            let curUserAccount = new nearAPI.Account(near.connection, accountId)
            let userFTContract = await ft.initFTContract(state.wallet.account(), contractId)
            setCurUserFTContract(userFTContract)
            
          }

        }
        return true
      } 

      essentials()
        .then((res) => {
         
        })
    }, [near]
    )

    useEffect(
      () => {

      async function fetchData() {
         let result = {}
         
         if(contractId){
          //  let memberStatus
    
          //  try{
          //   let contract = await dao.initDaoContract(state.wallet.account(), contractId)
          //   memberStatus = await contract.getMemberStatus({member: accountId})
           
          //   setaMemberStatus(memberStatus)
          //   memberStatus ? setMemberIcon(<CheckCircleIcon />) : setMemberIcon(<NotInterestedIcon />)
          //  } catch (err) {
          //    console.log('error retrieving member status', err)
          //  }
          //  result = await Creat.getDao(contractId)
           
          //  if(result){
          //         result.name != '' ? setsName(result.name) : setsName('')
          //         result.date ? setsDate(result.date) : setsDate('')
          //         result.logo !='' ? setsLogo(result.logo) : setsLogo(imageName)
          //         result.purpose != '' ? setsPurpose(result.purpose) : setsPurpose('')
          //         result.category != '' ? setsCategory(result.category) : setsCategory('')
          //         result.owner != '' ? setOwner(result.owner) : setOwner('')
          //         result.status = memberStatus
          //  } else {
          //    setsName('')
          //    setsDate('')
          //    setsLogo(imageName)
          //    setsPurpose('')
          //    setsCategory('')
          //    setOwner('')
          //  }

          // setTokenName(metadata.name)
          // setTokenImage(metadata.icon)
          // setTotalSupply(metadata.max_supply)
         }
        return true
      }

      let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
            setFinished(true)
            makeSearchTokens(res)
          })
        return () => mounted = false
        }

  }, [contractId]
  )

  // function handleUpdate(property){
  //   setIsUpdated(property)
  // }

  // const handleEditDaoClick = () => {
  //   handleExpanded()
  //   handleEditDaoClickState(true)
  // }
  // const handleDetailsClick= () => {
  //   handleExpandedDetails()
  //   handleDetailsClickedState(true)
  // }

  // function handleDetailsClickedState(property){
  //   setDetailsClicked(property)
  // }

  // function handleEditDaoClickState(property){
  //   setEditDaoClicked(property)
  // }

  // const handlePurposeClick = () => {
  //   handleExpanded()
  //   handlePurposeClickState(true)
  // }

  // function handlePurposeClickState(property){
  //   setPurposeClicked(property)
  // }

  // function handleExpanded() {
  //   setAnchorEl(null)
  // }

  // function handleExpandedDetails(){
  //   setAcnhorE2(null)
  // }
  
  function formatDate(timestamp) {
    let stringDate = timestamp.toString()
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
  }

  const handleRegister = async () => {
    console.log('curusercontract', curUserFTContract)
    let cost = await FTContract.storage_balance_bounds()
    console.log('cost', cost)
    console.log('parse cost', formatNearAmount(cost.min))
    let registered = await curUserFTContract.storage_deposit({
      accountId: accountId,
      registration_only: true
    }, GAS, cost.min)
    console.log('registered', registered)
  }
  

    return(
        <>
        {!display ? <LinearProgress /> : 
                     
          finished ? 
          (
            <Card className={classes.card}>
              <CardContent align="center">
           
                <div style={{width: '100%', 
                height: '50px',
                backgroundImage: `url(${tokenIcon})`, 
                backgroundSize: 'contain',
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
         
                
                <Typography  variant="h6" display="inline" noWrap={false} style={{lineHeight: 0}}>
                  {tokenName != '' ? tokenName : ''}<br></br>
                  {tokenSymbol != '' ? tokenSymbol : ''}
                </Typography><br></br>
                 
                <Typography  variant="overline" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {finished ? (<span style={{fontSize: '80%'}}>Created: {formatDate(created)}</span>) : <LinearProgress />}<br></br>
                  {totalSupply ? (<span style={{fontSize: '80%'}}>Total Supply<br></br>{totalSupply}</span>): (<span style={{fontSize: '80%'}}>Total Supply<br></br>{totalSupply}</span>)}<br></br>
              
                </Typography>
               
               
              </CardContent>
              <CardActions>
                <Button
                  onClick={handleRegister}>
                  <AddBoxIcon />
                </Button>
              </CardActions>
              
            </Card>
          ) 
          : null
        }
       
        
        </>
       
    )
}