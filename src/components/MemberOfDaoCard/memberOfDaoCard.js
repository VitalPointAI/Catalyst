import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { dao } from '../../utils/dao'
import Persona from '@aluhning/get-personas-js'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { LinearProgress } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    card: {
      verticalAlign: 'middle',
      margin: '10px 10px 10px 10px',
      padding: '2px',
      minWidth: '220px'
    },
    square: {
      float: 'left',
      marginRight: '10px',
      marginTop: '5px',
    }
  }));

const imageName = require('../../img/default_logo.png') // default no-image avatar

export default function MemberOfDaoCard(props) {

    const [sname, setsName] = useState('')
    const [slogo, setsLogo] = useState(imageName)
    const [display, setDisplay] = useState(true)
    const [isUpdated, setIsUpdated] = useState()
    const [finished, setFinished] = useState(false)
    const [totalMembers, setTotalMembers] = useState()

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      contractId
     } = props

   const Dao = new Persona()

    useEffect(
      () => {

      async function fetchData() {
         if(contractId){
           try{
            let contract = await dao.initDaoContract(state.wallet.account(), contractId)
            let allMembers = await contract.getTotalMembers()
            console.log('allmembers', allMembers)
            setTotalMembers(allMembers)
           } catch (err) {
             console.log('error retrieving member count', err)
           }
           let result = await Dao.getDao(contractId)
           if(result){
                  result.name != '' ? setsName(result.name) : setsName('')
                  result.logo !='' ? setsLogo(result.logo) : setsLogo(imageName)
           }
         }
      }
        
      let mounted = true
      if(mounted){
        fetchData()
            .then((res) => {
              setFinished(true)
            })
      return () => mounted = false
      }
      
  }, [state, isUpdated]
  )
  
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
                <Typography  variant="h6" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {sname != '' ? sname : contractId.split('.')[0]}
                </Typography><br></br>
                <Typography  variant="overline" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {totalMembers} {totalMembers == 1 ? 'Member' : 'Members'}
                </Typography>
              </CardContent>
            </Card>
          ) 
          : null
        }
        </>
       
    )
}