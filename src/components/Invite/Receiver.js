import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import logo from '../../img/catalyst-by-vpai.png'
import { appStore, onAppMount } from '../../state/app'
import { login } from '../../state/near'
import { config } from '../../state/config'
import { ceramic } from '../../utils/ceramic'

//material ui imports
import { CircularProgress } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

export default function Receiver(props) {

    const [sname, setsName] = useState('')
    const [slogo, setsLogo] = useState('')
    const linkArray = (window.location.pathname.split("/")).slice(2);
    const link = window.location.origin + "/dao/" + `${linkArray[0]}` + "." + `${config.factoryContractName}`
   
    const { state, dispatch, update } = useContext(appStore)
    const {
        wallet, 
        finished, 
        appIdx, 
        near,
        daoFactory,
        didRegistryContract
    } = state

    useEffect(() => {
        async function fetchData(){
            if(appIdx){
            
            let did = await ceramic.getDid(`${linkArray[0]}` + "." + `${config.factoryContractName}`, daoFactory, didRegistryContract)
            let result = await appIdx.get('daoProfile', did)
           console.log('result', result)
           
            if(result){
                   result.name ? setsName(result.name) : setsName(linkArray[0])
                   result.logo ? setsLogo(result.logo) : setsLogo('')
            } else {
                setsName(linkArray[0])
            }
        }
        }
        fetchData()
    },[appIdx]
    )

    return (
        <>
        {finished? 
        <Grid container spacing={6} direction="column" alignItems='center' justifyContent='center' style={{flexGrow: 1}}>
                <Grid item xs={6}>
                    <img style={{width: 300}} src={logo}/>
                </Grid>
                <Grid item xs={6}>
                    <Typography style={{fontSize: 24}}>You've been invited to {`${sname}`}!</Typography>
                    <br></br>
                    <Link to={link}>
                        <div style={{width: '100%', 
                        height: '50px',
                        backgroundImage: `url(${slogo})`, 
                        backgroundSize: 'contain',
                        backgroundPosition: 'center', 
                        backgroundRepeat: 'no-repeat',
                        backgroundOrigin: 'content-box'
                    }}>
                    </div>
                    </Link>
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
            <div style={{margin: 'auto', width: '200px'}}>
                <CircularProgress />
            </div>}
        </>
    )
}