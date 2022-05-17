import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import * as nearAPI from 'near-api-js'
import { appStore, onAppMount } from '../../state/app'
import SupporterCard from '../Cards/SupporterCard/SupporterCard'
import { ceramic } from '../../utils/ceramic'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { Divider } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'

const useStyles = makeStyles((theme) => ({
  root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    menuButton: {
      marginRight: theme.spacing(0),
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    drawer: {
        marginTop: '5px'
    }
  }));
  
  const logoName = require('../../img/default_logo.png') // default no logo
  
export default function Supporters(props) {

    const [result, setResult] = useState()
    const [donations, setDonations] = useState()

    const [logo, setLogo] = useState(logoName)
    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [purpose, setPurpose] = useState('')
    const [category, setCategory] = useState('')
  

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      near,
      appIdx,
      didRegistryContract,
      daoFactory,
      currentDaosList,
      curDaoIdx
    } = state
   
    const {
      contractId
    } = useParams()

    useEffect(
        () => {
          async function fetchData() {
            
              if(near && appIdx){
                let daoAccount = new nearAPI.Account(near.connection, contractId)
               
                let thisCurDaoIdx
                    try{
                      thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                    } catch (err) {
                      console.log('error retrieving dao idx', err)
                    }
               
                if(thisCurDaoIdx){
                  let donations = await appIdx.get('donations', thisCurDaoIdx.id)
                  setDonations(donations)
                }
              }
           
          }

          fetchData()
    }, [near, appIdx, currentDaosList]
    )

    useEffect(() => {
      async function fetchData() {
        if(currentDaosList && appIdx){
          try{
            let summoner
            for(let x = 0; x < currentDaosList.length; x++){
              if(currentDaosList[x].contractId == contractId){
                summoner = currentDaosList[x].summoner
                break
              }
            }
            console.log('summoner', summoner)
            let daoDid = await ceramic.getDid(summoner, daoFactory, didRegistryContract)
            let result = await appIdx.get('guildProfile', daoDid)
            console.log('dao result', result)
            if(result){
              result.name ? setName(result.name) : setName('')
              result.date ? setDate(result.date) : setDate('')
              result.logo ? setLogo(result.logo) : setLogo(logoName)
              result.purpose ? setPurpose(result.purpose) : setPurpose('')
              result.category ? setCategory(result.category) : setCategory('')
            } else {
              setName('')
              setDate('')
              setLogo(logoName)
              setPurpose('')
              setCategory('')
            }
          } catch (err) {
            console.log('problem retrieving DAO profile')
          }
        }
      }

      fetchData()
      .then((res) => {

      })
    }, [currentDaosList, appIdx]
    )
    
    return (
        <>
        <Grid container justifyContent="space-evenly" alignItems="center" style={{marginBottom:'15px'}} spacing={0}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <IconButton
              className='invite'
              style={{ float: 'left'}}
              aria-controls="fade-menu"
              aria-haspopup="true"
            >
            <a href={`/dao/${contractId}`}>
              <ArrowBackIcon fontSize="large" />
            </a>
            </IconButton>
            <div style={{width: '100%', 
            height: '50px',
            backgroundImage: `url(${logo})`, 
            backgroundSize: 'contain',
            backgroundPosition: 'center', 
            backgroundRepeat: 'no-repeat',
            backgroundOrigin: 'content-box',
            marginBottom: '15px',
            marginTop: '15px'
            }}/>
          </Grid>     
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'30px'}}>
          <Typography variant='h6' style={{padding: '5px'}}>Thank you to all our supporters.</Typography>
          <Divider variant="middle"/>
        </Grid>
        
         
            {donations && donations.donations.length > 0 ?
              donations.donations.map((fr, i) => {
              console.log('fr', fr)
                return(
                  
                    <SupporterCard 
                      key={i}
                      accountId={fr.contributor}
                      donation= {fr.donation}
                      contributed={fr.contributed}
                      transactionHash={fr.transactionHash}
                    />
                  
                )
              }) : null }
          
        </Grid>
        </>
    )
}