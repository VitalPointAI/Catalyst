import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
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

export default function DAOCard(props) {

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [logo, setLogo] = useState()
    const [purpose, setPurpose] = useState('')
    const [memberCount, setMemberCount] = useState(0)
    const [stateDID, setStateDID] = useState()
    const [dataObj, setDataObj] = useState({})

    const classes = useStyles();

    const { 
      contractId
   } = props

     const {
       appIdx,
       didContract,
       aliases
     } = useContext(DaoCeramicAppContext)

    useEffect(
      () => {
    
      async function fetchdaoData() {
          if(daoList){
              setNoOfPages(Math.ceil(daoList.length/itemsPerPage))
          }
          
      }

      async function fetchData() {
      
        // 1. We check to ensure the NEAR account has a DID in the DID Registry on NEAR
        let didExists = await didContract.hasDID({accountId: contractId})
    
        // 2. Knowing it exists, we then retrieve it and all the available definitions
        if(didExists){
          let did = await didContract.getDID({accountId: contractId})
          let definitions = await didContract.getDefinitions()
         
          // 3. We need to build the profile alias from the definition based on how it's stored
          // in the DID Registry.  
          let m = 0
          let daoProfileAlias
          while (m < definitions.length) {
            let key = definitions[m].split(':')
            if (key[0] == contractId && key[1] == 'daoProfile'){
              daoProfileAlias = {'daoProfile': key[2]}
            break
            }
            m++
          }

          let n = 0
          let memberAlias
          while (n < definitions.length) {
            let key = definitions[n].split(':')
            if (key[0] == contractId && key[1] == 'member'){
              memberAlias = {'member': key[2]}
            break
            }
            m++
          }

          let aliases = {daoProfileAlias, memberAlias}
         
          // 4. We instantiate a ceramicClient and use it and the profile alias to instantiate
          // a new IDX.  That's what let's us get to the data record defined by the profile
          // definition.
          const API_URL = 'https://ceramic-clay.3boxlabs.com'
          const ceramicClient = new CeramicClient(API_URL, {docSyncEnabled: true})
          let userIdx = new IDX({ ceramic: ceramicClient, aliases: aliases})
          let result = await userIdx.get('profile', did)
          let members = await userIdx.get('member', did)
          
          // 5.  Finally, if there is a data record in the profile for the DID, we set it
          // to some state variables so we can use them in the app wherever we like. Have
          // commented out all the profile fields except avatar for this example.
          let dataObj = {
            contract: contractId,
            did: did,
            date: result ? result.profiles[0].date : '',
            logo: result ? result.profiles[0].logo : '',
            purpose: result ? result.profiles[0].purpose : '',
            name: result ? result.profiles[0].name : '',
            memberCount: members? members.events.length : 0
          }
        setDataObj(dataObj)         
        }
      }
    
      fetchData()
    
    }, []);    

    return(
        <>
          <Card className={classes.card}>
              <Avatar variant="square" src={dataObj.logo} className={classes.square} />
            <CardActionArea>
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {dataObj.name}
                </Typography>
                <Typography gutterBottom variant="h6">
                  {dataObj.contract}
                </Typography>
                <Typography gutterBottom variant="h6">
                  {dataObj.did}
                </Typography>
                <Typography gutterBottom variant="h6">
                  Created: {dataObj.date}
                </Typography>
                <Typography gutterBottom variant="h6">
                  {dataObj.purpose}
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