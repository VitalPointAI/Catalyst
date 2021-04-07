import React, { useState, useEffect, useContext } from 'react'
import * as nearApiJs from 'near-api-js'
import { Link } from 'react-router-dom'
import CeramicClient from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'

import { wallet } from '../../../../utils/wallet'
import { ceramic } from '../../../../utils/ceramic'

import { DaoCeramicAppContext } from '../../../../contexts/daoCeramicAppContext'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      marginTop: '10px',
      maxWidth: '200px'
    },
    avatar: {
      backgroundColor: red[500],
    },
  }));

const imageName = require('../../../../images/default-profile.png') // default no-image avatar

export default function DAOCard(props) {

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [logo, setLogo] = useState(imageName)
    const [purpose, setPurpose] = useState('')
    const [memberCount, setMemberCount] = useState(0)
    const [stateDID, setStateDID] = useState()
    const [dataObj, setDataObj] = useState({})
    const [did, setDid] = useState()
    const [contractIdx, setContractIdx] = useState()

    const classes = useStyles();

    const { 
      contractId
   } = props
   console.log('contractIddaocard', contractId)

     const {
       appIdx,
       didContract,
       aliases,
       near
     } = useContext(DaoCeramicAppContext)

    useEffect(
      () => {

      async function fetchData() {
      
        if(contractId && appIdx && didContract){
          let existingDid = await didContract.hasDID({accountId: contractId})
          if(existingDid){
              let thisDid = await didContract.getDID({
                  accountId: contractId
              })
              setDid(thisDid)
              console.log('this did', thisDid)
              let contractAccount = new nearApiJs.Account(near.connection, contractId)
              let thisContractIdx = await ceramic.getDaoIdx(appIdx, didContract, contractAccount, thisDid)
              setContractIdx(thisContractIdx)
              console.log(thisContractIdx)

              let result = await thisContractIdx.get('daoProfile')
              console.log('result', result)
              if(result){
                result.date ? setDate(result.date) : setDate('')
                result.logo ? setLogo(result.logo) : setLogo(imageName)
                result.purpose ? setPurpose(result.purpose) : setPurpose('')
                result.name ? setName(result.name) : setName('')
              }
              let members = await thisContractIdx.get('member')
              console.log('members', members)
          // 5.  Finally, if there is a data record in the profile for the DID, we set it
          // to some state variables so we can use them in the app wherever we like. Have
          // commented out all the profile fields except avatar for this example.
        //   let dataObj = {
        //     contract: contractId,
        //     did: did,
        //     date: result ? result.profiles[0].date : '',
        //     logo: result ? result.profiles[0].logo : '',
        //     purpose: result ? result.profiles[0].purpose : '',
        //     name: result ? result.profiles[0].name : '',
        //     memberCount: members? members.events.length : 0
        //   }
        // setDataObj(dataObj)         
        }
      }
      }
    
      fetchData()
        .then((res) => {

        })
    
    }, [appIdx, didContract]);    

    return(
        <>
          <Card className={classes.card}>
              <Avatar variant="square" src={dataObj.logo} className={classes.square} />
            <CardActionArea>
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {name}
                </Typography>
                <Typography gutterBottom variant="h6">
                  {contractId}
                </Typography>
                <Typography gutterBottom variant="h6">
                  {dataObj.did}
                </Typography>
                <Typography gutterBottom variant="h6">
                  Created: {date}
                </Typography>
                <Typography gutterBottom variant="h6">
                  {purpose}
              </Typography>
                <Typography gutterBottom variant="h6">
                  Members: {dataObj.memberCount}
                </Typography>
              </CardContent>
            </CardActionArea>

            <CardActions>
              <Link color="primary" to={`/dao/${dataObj.contract}`}>
                Visit
              </Link>
            </CardActions>
          </Card>
        </>
    )
}