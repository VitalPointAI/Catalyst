import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { get, set, del } from '../../utils/storage'
import { ceramic } from '../../utils/ceramic'
import { IDX } from '@ceramicstudio/idx'
import EditPersonaForm from '../EditPersona/editPersona'
import * as nearAPI from 'near-api-js'


// Material UI Components
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import { red } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'
import Badge from '@material-ui/core/Badge'
import EditIcon from '@material-ui/icons/Edit'
import IconButton from '@material-ui/core/IconButton'
import { CardHeader, LinearProgress } from '@material-ui/core'

import { config } from '../../state/config'

export const {
    ACCOUNT_LINKS
} = config

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      minWidth: '200px',
      //maxWidth: '200px',
  //    cursor: 'pointer',
      verticalAlign: 'middle',
      margin: 'auto'
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

const StyledBadgeProposer = withStyles((theme) => ({
  badge: {
    backgroundColor: '#f9f1f1',
    right: -30,
    top: 25,
    border: `1px solid #000000`,
    padding: '0 4px',
  },
}))(Badge)

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function PersonaCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [editPersonaClicked, setEditPersonaClicked] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const [curUserIdx, setCurUserIdx] = useState()
    const [display, setDisplay] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [did, setDid] = useState()
    const [finished, setFinished] = useState(false)

    const classes = useStyles();

    const {
      appIdx,
      didRegistryContract,
      near
    } = state

    const { 
      owner,
      accountId,
      link
   } = props

    useEffect(
      () => {

      async function fetchData() {
              if(owner == state.accountId){
                setDisplay(true)
              }
              setFinished(false)
             
              // Set Card Persona Idx
              if(accountId && near && didRegistryContract){
             
                  let existingDid = await didRegistryContract.hasDID({accountId: accountId})
               
                  if(existingDid){
                     
                      let personaAccount = new nearAPI.Account(near.connection, accountId)

                    
                      let thisCurPersonaIdx
                      try{
                        thisCurPersonaIdx = await ceramic.getCurrentUserIdx(personaAccount, appIdx, didRegistryContract)
                       
                        setCurUserIdx(thisCurPersonaIdx)
                      } catch (err) {
                        console.log('error retrieving idx', err)
                      }

                      let i = 0
                   
                      while (i < state.claimed.length) {
                        if(state.claimed[i].accountId == accountId){
                          setClaimed(true)
                         
                          break
                        }
                        i++
                      }
                  
                      let result = await thisCurPersonaIdx.get('profile', thisCurPersonaIdx.id)
                    
                      if(result){
                        result.date ? setDate(result.date) : setDate('')
                        result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                        result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                        result.name ? setName(result.name) : setName('')
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

  const handleEditPersonaClick = () => {
    handleExpanded()
    handleEditPersonaClickState(true)
  }

  function handleEditPersonaClickState(property){
    setEditPersonaClicked(property)
  }

  function handleExpanded() {
    setAnchorEl(null)
  }
    

    return(
        <>
        {!display ? <LinearProgress /> : 
                     
          finished && !claimed ? 
      
          (
            <Card className={classes.card}>
              <CardHeader
              avatar={
                <Avatar src={avatar}  />
              }
              action={
                <IconButton aria-label="edit" onClick={handleEditPersonaClick}>
                  <EditIcon />
                </IconButton>
              }
              title={name ? name : accountId}
              subheader={<>{finished ? (<span style={{fontSize: '80%'}}>{date}</span>) : <LinearProgress />}</>}
              />
              <CardActions>
                <Link color="primary" href={link}>
                  Claim
                </Link>
              </CardActions>
            </Card>
          ) 
          : 
          (
            <Card className={classes.card}>
            <CardHeader
            avatar={
              <Avatar src={avatar}  />
            }
            action={
              <IconButton aria-label="edit" onClick={handleEditPersonaClick}>
                <EditIcon />
              </IconButton>
            }
            title={name ? name : accountId}
            subheader={<>{finished ? (<span style={{fontSize: '80%'}}>{date}</span>) : <LinearProgress />}</>}
          />
           
            </Card>
          )
        }
         
          {editPersonaClicked ? <EditPersonaForm
            state={state}
            handleEditPersonaClickState={handleEditPersonaClickState}
            curPersonaIdx={curUserIdx}
            handleUpdate={handleUpdate}
            did={did}
            accountId={accountId}
            /> : null }

        </>
       
    )
}