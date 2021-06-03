import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { get, set, del } from '../../utils/storage'
import { ceramic } from '../../utils/ceramic'
import { IDX } from '@ceramicstudio/idx'
import EditDaoForm from '../EditDao/editDao'
import AppFramework from '../AppFramework/appFramework'
import * as nearAPI from 'near-api-js'
import Persona from '@aluhning/get-personas-js'


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

export default function DaoCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [sdate, setsDate] = useState()
    const [sname, setsName] = useState('')
    const [slogo, setsLogo] = useState(imageName)
    const [spurpose, setsPurpose] = useState('')
    const [scategory, setsCategory] = useState('')
    const [owner, setOwner] = useState('')

    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [display, setDisplay] = useState(true)
    const [isUpdated, setIsUpdated] = useState()
    const [anchorEl, setAnchorEl] = useState(null)
    const [did, setDid] = useState()
    const [finished, setFinished] = useState(false)
    const [created, setCreated] = useState()

    const classes = useStyles();

    const { 
      summoner,
      contractId,
      link,
      handleUpdate,
      makeSearchDaos
   } = props
 
   const {
     near,
     didRegistryContract,
     appIdx
   } = state

   const Dao = new Persona()

    useEffect(
      () => {

      async function fetchData() {
         isUpdated
         if(contractId){
           console.log('contractid', contractId)
           let result = await Dao.getDao(contractId)
           console.log('result dao', result)
           if(result){
                  result.name != '' ? setsName(result.name) : setsName('')
                  result.date ? setsDate(result.date) : setsDate('')
                  result.logo !='' ? setsLogo(result.logo) : setsLogo(imageName)
                  result.purpose != '' ? setsPurpose(result.purpose) : setsPurpose('')
                  result.category != '' ? setsCategory(result.category) : setsCategory('')
                  result.owner != '' ? setOwner(result.owner) : setOwner('')
                 
           }
           makeSearchDaos(result)
         }
    //      
              // if(summoner == state.accountId){
              //   setDisplay(true)
              // }
              setFinished(false)
             
              // Set Dao Idx
            //   if(contractId && near){
                    
            //     let daoAccount = new nearAPI.Account(near.connection, contractId)
              
            //     let thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
            //     setCurDaoIdx(thisCurDaoIdx)

            //     try{
            //       let result = await appIdx.get('daoProfile', thisCurDaoIdx.id)
                                      
            //       if(result){
            //         result.name ? setName(result.name) : setName('')
            //         result.date ? setDate(result.date) : setDate('')
            //         result.logo ? setLogo(result.logo) : setLogo(imageName)
            //         result.purpose ? setPurpose(result.purpose) : setPurpose('')
            //         result.category ? setCategory(result.category) : setCategory('')
            //         return true
            //       }
            //     } catch (err) {
            //       console.log('error retrieving DAO profile', err)
            //     }
            //     return true
            // }
      }

      fetchData()
          .then((res) => {
            setFinished(true)
          })

  }, [contractId]
  )

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

  // function formatDate(timestamp) {
  //   let intDate = parseInt(timestamp)
  //   let options = {year: 'numeric', month: 'long', day: 'numeric'}
  //   return new Date(intDate).toLocaleString('en-US', options)
  // }
  
  function formatDate(timestamp) {
    let stringDate = timestamp.toString()
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
  }

    return(
        <>
        {!display ? <LinearProgress /> : 
                     
          finished ? 
          (
            <Card className={classes.card}>
              <CardContent align="center">
              <Link to={`/dao/${contractId}`}>
                <div style={{width: '100%', 
                height: '50px',
                backgroundImage: `url(${slogo})`, 
                backgroundSize: '180px auto', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            </Link>
                <Typography  variant="overline" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {sname != '' ? sname : contractId.split('.')[0]}<br></br>
                  {finished ? (<span style={{fontSize: '80%'}}>Updated: {sdate}</span>) : <LinearProgress />}<br></br>
                  {scategory ? (<span style={{fontSize: '80%'}}>Category: {scategory}</span>): (<span style={{fontSize: '80%'}}>Category: Undefined</span>)}
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
            contractId={contractId}
            /> : null }

        </>
       
    )
}