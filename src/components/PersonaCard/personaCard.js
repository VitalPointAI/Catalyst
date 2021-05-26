import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { get, set, del } from '../../utils/storage'
import { ceramic } from '../../utils/ceramic'
import { IDX } from '@ceramicstudio/idx'
import EditPersonaForm from '../EditPersona/editPersona'
import * as nearAPI from 'near-api-js'


// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import { red } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'
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
      maxWidth: '200px',
      cursor: 'pointer',
      verticalAlign: 'middle'
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
                console.log('did contract', didRegistryContract)
                  let existingDid = await didRegistryContract.hasDID({accountId: accountId})
                  console.log('existing did', existingDid)
                  if(existingDid){
                     
                      let personaAccount = new nearAPI.Account(near.connection, accountId)

                      // let ownerAccounts = get(ACCOUNT_LINKS, [])
                      // let b = 0
                      // let owner
                      // while(b < ownerAccounts.length) {
                      //     if(ownerAccounts[b].accountId == accountId){
                      //     owner = ownerAccounts[b].owner
                      //     break
                      //     }
                      // b++
                      // }
                      // const ownerAccount = new nearAPI.Account(near.connection, owner)
                      // const ownerIdx = await ceramic.getCurrentUserIdx(ownerAccount, appIdx, didRegistryContract, owner)
                      let thisCurPersonaIdx
                      try{
                        thisCurPersonaIdx = await ceramic.getCurrentUserIdx(personaAccount, appIdx, didRegistryContract)
                        console.log('thiscurpersonaidx', thisCurPersonaIdx)
                        setCurUserIdx(thisCurPersonaIdx)
                      } catch (err) {
                        console.log('error retrieving idx', err)
                      }

                      let i = 0
                      console.log('state claimed', state.claimed)
                      while (i < state.claimed.length) {
                        if(state.claimed[i].accountId == accountId){
                          setClaimed(true)
                          console.log('claimed', claimed)
                          console.log('account', accountId)
                          break
                        }
                        i++
                      }
                  
                      let result = await thisCurPersonaIdx.get('profile', thisCurPersonaIdx.id)
                      console.log('persona result', result)
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
              <CardContent onClick={handleEditPersonaClick}>
                <Avatar variant="rounded" src={avatar} className={classes.square} />
                <Typography  variant="overline" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {name ? name : accountId}<br></br>
                  {finished ? (<span style={{fontSize: '80%'}}>{date}</span>) : <LinearProgress />}
                </Typography>
              </CardContent>
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
              <CardContent onClick={handleEditPersonaClick}>
                <Avatar variant="rounded" src={avatar} className={classes.square} />
                  <Typography  variant="overline" display="inline" noWrap={true} style={{lineHeight: 0}}>
                    {name ? name : accountId}<br></br>
                    {finished ? (<span style={{fontSize: '80%'}}>{date}</span>) : <LinearProgress />}
                  </Typography>
              </CardContent>
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