import React, {useState, useEffect} from 'react'
import logo from '../../img/catalyst-by-vpai.png'
import * as nearAPI from 'near-api-js'
import { login } from '../../state/near'
import { config } from '../../state/config'

//material ui imports
import { CircularProgress } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

const Receiver = ({state}) => {

    const {
        app, wallet, links, claimed, accountId, curInfo, finished, appIdx, near, didRegistryContract
    } = state
    const [sname, setsName] = useState('')
    const linkArray = (window.location.pathname.split("/")).slice(2);
    const link = window.location.origin + "/dao/" + `${linkArray[0]}` + "." + `${config.factoryContractName}`
    const classes = useStyles()

    useEffect(() => {
        async function fetchData(){
            let thisCurDaoIdx
            try{
                let daoAccount = new nearAPI.Account(near.connection, `${linkArray[0]}` + "." + `${config.factoryContractName}`)
                thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, near, didRegistryContract)
            } catch (err) {
              console.log('problem getting curdaoidx', err)
              return false
            }
            let result = await thisCurDaoIdx.get('profile', thisCurDaoIdx.id)
           
            if(result){
                   result.name != '' ? setsName(result.name) : setsName('')
            }
        }
        fetchData()
    },[]);

    return (
        <>
        {finished? 
        <Grid container spacing={6} direction="column" alignItems='center' justifyContent='center' style={{flexGrow: 1}}>
                <Grid item xs={6}>
                    <img style={{width: 300}} src={logo}/>
                </Grid>
                <Grid item xs={6}>
                    <Typography style={{fontSize: 24}}>You've been invited to {`${sname}`}!</Typography>
                </Grid>
                <Grid item xs={6}>
                {wallet && wallet.signedIn? 
                  <Button  style={{backgroundColor: '#ffa366'}} variant="outlined" href={link}>
                    Go to Community
                  </Button>
                 :
                 <Button style={{backgroundColor: '#ffa366'}} variant="contained" onClick={login}>
                     Accept Invitation
                 </Button>}
                </Grid>
        </Grid>:
        <CircularProgress />}
        </>
    )
}

export default Receiver 