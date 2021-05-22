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
    const [display, setDisplay] = useState(true)
    const [isUpdated, setIsUpdated] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    const [did, setDid] = useState()
    const [finished, setFinished] = useState(false)
    const [created, setCreated] = useState(formatDate(props.created))

    const classes = useStyles();

    const { 
      summoner,
      contractId,
      link
   } = props

   const {
     near,
     didRegistryContract,
     appIdx
   } = state

    useEffect(
      () => {

      async function fetchData() {
              // if(summoner == state.accountId){
              //   setDisplay(true)
              // }
              setFinished(false)
             
              // Set Dao Idx
              if(contractId && near){
                 
                  // let existingDid = await didRegistryContract.hasDID({accountId: contractId})
            
                  // if(existingDid){
                      // let thisDid = await didRegistryContract.getDID({
                      //     accountId: contractId
                      // })
                      // setDid(thisDid)
                    
                      let daoAccount = new nearAPI.Account(near.connection, contractId);
                    
                      let thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                     
                      setCurDaoIdx(thisCurDaoIdx)

                      try{
                        let result = await appIdx.get('daoProfile', thisCurDaoIdx.id)
                                           
                        if(result){
                          result.name ? setName(result.name) : setName('')
                          result.date ? setDate(result.date) : setDate('')
                          result.logo ? setLogo(result.logo) : setLogo(imageName)
                          result.purpose ? setPurpose(result.purpose) : setPurpose('')
                          result.category ? setCategory(result.category) : setCategory('')
                          return true
                        }
                      } catch (err) {
                        console.log('error retrieving DAO profile', err)
                      }
                      return true
                //  }

                  // if(!existingDid){
                   
                  //   // let daoAccount = new nearAPI.Account(near.connection, contractId);
                 
                  //   // let thisCurDaoIdx = await ceramic.getCurrentDaoIdxNoDid(appIdx, didRegistryContract, daoAccount)
                  //   // setCurDaoIdx(thisCurDaoIdx)

                  //   // try{
                  //   //   let result = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)
                      
                  //   //   if(result){
                  //   //     result.name ? setName(result.name) : setName('')
                  //   //     result.date ? setDate(result.date) : setDate('')
                  //   //     result.logo ? setLogo(result.logo) : setLogo(imageName)
                  //   //     result.purpose ? setPurpose(result.purpose) : setPurpose('')
                  //   //     result.category ? setCategory(result.category) : setCategory('')
                  //   //     return true
                  //   //   }
                  //   // } catch (err) {
                  //   //   console.log('error retrieving DAO profile')
                  //   // }
                  //   // return true
                  // }
              }
            }

      fetchData()
          .then((res) => {
            setFinished(true)
          })
  }, [isUpdated, near]
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
              <CardContent >
                <Avatar variant="rounded" src={logo} className={classes.square} />
                <Typography  variant="overline" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {name ? name : contractId}<br></br>
                  {finished ? (<span style={{fontSize: '80%'}}>{created}</span>) : <LinearProgress />}
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