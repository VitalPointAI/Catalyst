import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { get, set, del } from '../../utils/storage'
import { ceramic } from '../../utils/ceramic'
import { IDX } from '@ceramicstudio/idx'
import EditDaoForm from '../EditDao/editDao'
import AppFramework from '../AppFramework/appFramework'
import * as nearAPI from 'near-api-js'


// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'
import { CardHeader, LinearProgress } from '@material-ui/core'

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
      cursor: 'pointer',
      verticalAlign: 'middle',
      marginLeft: '10px',
      marginRight: '10px',
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

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function DaoCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [logo, setLogo] = useState(imageName)
    const [purpose, setPurpose] = useState('')
    const [category, setCategory] = useState('')

    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [display, setDisplay] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    const [did, setDid] = useState()
    const [finished, setFinished] = useState(false)

    const classes = useStyles();

    const { 
      summoner,
      contractId,
      link
   } = props

    useEffect(
      () => {

      async function fetchData() {
              if(summoner == state.accountId){
                setDisplay(true)
              }
              setFinished(false)
             
              // Set Dao Idx
              if(contractId){
                  let existingDid = await state.didRegistryContract.hasDID({accountId: contractId})
                  console.log('existing DID', existingDid)
                  if(existingDid){
                      let thisDid = await state.didRegistryContract.getDID({
                          accountId: contractId
                      })
                      setDid(thisDid)
                     
                      //let daoAccount = new nearAPI.Account(state.near.connection, contractId)
                      let daoAccount = new nearAPI.Account(state.near.connection, contractId);
                      // console.log('wallet', wallet)
                      // let daoAccount = await wallet._near.account(contractId)
                      console.log('daoAccount', daoAccount)
                      
                      let summonerAccounts = get(DAO_LINKS, [])
                      let b = 0
                      let summoner
                      while(b < summonerAccounts.length) {
                          if(summonerAccounts[b].contractId == contractId){
                          summoner = summonerAccounts[b].summoner
                          break
                          }
                      b++
                      }
                      const ownerAccount = new nearAPI.Account(state.near.connection, summoner)
                      console.log('ownerAccount', ownerAccount)
                      const summonerIdx = await ceramic.getCurrentUserIdx(ownerAccount, state.appIdx, state.didRegistryContract, summoner)
                      console.log('summonerIdx', summonerIdx)
                      let thisCurDaoIdx = await ceramic.getCurrentUserIdx(daoAccount, state.appIdx, state.didRegistryContract, summoner, summonerIdx)
                      console.log('curdaoidx', thisCurDaoIdx)
                      setCurDaoIdx(thisCurDaoIdx)
                      update('', { thisCurDaoIdx })
                      
                  
                      let result = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)
                      
                      if(result){
                        result.name ? setName(result.name) : setName('')
                        result.date ? setDate(result.date) : setDate('')
                        result.logo ? setLogo(result.logo) : setLogo(imageName)
                        result.purpose ? setPurpose(result.purpose) : setPurpose('')
                        result.category ? setCategory(result.category) : setCategory('')
                        return true
                      }
                      return true
                  }

                  if(!existingDid){
                    // let wallet = new nearAPI.WalletAccount(state.near);
                    // console.log('wallet', wallet)
                    // let account = await wallet._near.account(contractId)
                    let daoAccount = new nearAPI.Account(state.near.connection, contractId);
                    console.log('account', daoAccount)
                    let thisCurDaoIdx = await ceramic.getCurrentUserIdxNoDid(state.appIdx, state.didRegistryContract, daoAccount)
                    setCurDaoIdx(thisCurDaoIdx)
                    console.log('curdaoidx', thisCurDaoIdx)
                    update('', { thisCurDaoIdx })

                    let result = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)
                      
                    if(result){
                      result.name ? setName(result.name) : setName('')
                      result.date ? setDate(result.date) : setDate('')
                      result.logo ? setLogo(result.logo) : setLogo(imageName)
                      result.purpose ? setPurpose(result.purpose) : setPurpose('')
                      result.category ? setCategory(result.category) : setCategory('')
                      return true
                    }
                    return true
                  }
              }
            }

      fetchData()
          .then((res) => {
            setFinished(true)
          })
      
  }, [isUpdated]
  )

  function handleUpdate(property){
    setIsUpdated(property)
  }

  const handleEditDaoClick = () => {
    handleExpanded()
    handleEditDaoClickState(true)
  }

  function handleEditDaoClickState(property){
    setEditDaoClicked(property)
  }

  function handleExpanded() {
    setAnchorEl(null)
  }
    

    return(
        <>
        {!display ? <LinearProgress /> : 
                     
          finished ? 
      
          (
            <Card className={classes.card}>
              <CardContent >
                <Avatar variant="rounded" src={logo} className={classes.square} />
                <Typography  variant="overline" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {name ? name : contractId}<br></br>
                  {finished ? (<span style={{fontSize: '80%'}}>{date}</span>) : <LinearProgress />}
                </Typography>
              </CardContent>
              <CardActions>
                <Link to={`/dao/${contractId}`}>
                  <Button color="primary" style={{float: 'left'}}>
                    Visit
                  </Button>
                </Link>
                {state.accountId == summoner ? (
                <Button color="primary" onClick={handleEditDaoClick} style={{float: 'right'}}>
                  Edit Details
                </Button>
                ) : null }
              </CardActions>
            </Card>
          ) 
          : null
        }
       
          {editDaoClicked ? <EditDaoForm
            state={state}
            handleEditDaoClickState={handleEditDaoClickState}
            curDaoIdx={curDaoIdx}
            handleUpdate={handleUpdate}
            did={did}
            contractId={contractId}
            /> : null }

        </>
       
    )
}