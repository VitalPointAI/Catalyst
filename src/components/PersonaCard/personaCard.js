import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { ceramic } from '../../utils/ceramic'
import EditPersonaForm from '../EditPersona/editPersona'
import * as nearAPI from 'near-api-js'
import { get, set, del } from '../../utils/storage'

// Material UI Components
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar'
import Link from '@material-ui/core/Link'
import { red } from '@material-ui/core/colors'
import Badge from '@material-ui/core/Badge'
import EditIcon from '@material-ui/icons/Edit'
import IconButton from '@material-ui/core/IconButton'
import { CardHeader, LinearProgress } from '@material-ui/core'
import { Typography } from '@material-ui/core'

import { config } from '../../state/config'
import { KeyPair } from '../../state/near'

export const {
    ACCOUNT_LINKS
} = config

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      minWidth: '200px',
      verticalAlign: 'middle',
      margin: 'auto',
      marginBottom: '10px'
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
    const [anchorEl, setAnchorEl] = useState(null)
    const [did, setDid] = useState()
    const [finished, setFinished] = useState(false)

    const classes = useStyles();

    const {
      appIdx,
      didRegistryContract,
      near,
      isUpdated,
      daoFactory
    } = state

    const { 
      owner,
      accountId,
      link,
      claim
   } = props

    useEffect(
      () => {

      async function fetchData() {
          if(isUpdated){}
          if(owner == state.accountId){
            setDisplay(true)
          }

          setFinished(false)

          
          
          // Set Card Persona Idx
          if(accountId && near && didRegistryContract){

            // generate account for this accountId
            let personaAccount = new nearAPI.Account(near.connection, accountId)

                let thisCurUserIdx
                try{
                  thisCurUserIdx = await ceramic.getCurrentUserIdx(personaAccount, appIdx, near, didRegistryContract, daoFactory)
                  console.log('account: ' + personaAccount.accountId + ' did: ' + thisCurUserIdx.id)
                  setCurUserIdx(thisCurUserIdx)
                } catch (err) {
                  console.log('error retrieving idx', err)
                }

                let i = 0
                while (i < state.claimed.length) {
                  if(state.claimed[i].accountId == accountId){
                    if(thisCurUserIdx){
                      let did = await ceramic.getDid(personaAccount.accountId, daoFactory, didRegistryContract )
                      if(!did) {
                        did = thisCurUserIdx.id
                      }
                      if(did){
                        setDid(did)
                        let result = await appIdx.get('profile', did)
                        
                        if(result){
                          result.date ? setDate(result.date) : setDate('')
                          result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                          result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                          result.name ? setName(result.name) : setName('')
                        }
                      }
                    }
                    setClaimed(true)
                    return true
                  }
                  i++
                }
          }
        
      }

      fetchData()
          .then((res) => {
            setFinished(true)
          })
      
  }, [isUpdated, near]
  )

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
                <Link color="primary" href={link}>
                  Claim
                </Link>
              }
              title={name ? name : accountId}
              subheader={<>{finished ? (<span style={{fontSize: '80%'}}>{date}</span>) : <LinearProgress />}</>}
              />
              
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
            curUserIdx={curUserIdx}
            did={did}
            accountId={accountId}
            /> : null }

        </>
       
    )
}