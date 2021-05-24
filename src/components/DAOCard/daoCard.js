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

    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [display, setDisplay] = useState(true)
    const [isUpdated, setIsUpdated] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    const [did, setDid] = useState()
    const [finished, setFinished] = useState(false)
    const [created, setCreated] = useState(formatDate(props.date))

    const classes = useStyles();

    const { 
      summoner,
      contractId,
      logo,
      date,
      name,
      category,
      purpose,
      link,
      handleUpdate
   } = props

   const {
     near,
     didRegistryContract,
     appIdx
   } = state

    useEffect(
      () => {

      async function fetchData() {

          name != '' ? setsName(name) : setsName('')
          date ? setsDate(date) : setsDate('')
          logo !='' ? setsLogo(logo) : setsLogo(imageName)
          purpose != '' ? setsPurpose(purpose) : setsPurpose('')
          category != '' ? setsCategory(category) : setsCategory('')
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

  }, [near, name, date, logo, purpose, created]
  )

  // function handleUpdate(property){
  //   setIsUpdated(property)
  // }

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

  function formatDate(timestamp) {
    let intDate = parseInt(timestamp)
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(intDate).toLocaleString('en-US', options)
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
                  {sname ? sname : contractId.split('.')[0]}<br></br>
                  {finished ? (<span style={{fontSize: '80%'}}>Updated: {created}</span>) : <LinearProgress />}<br></br>
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