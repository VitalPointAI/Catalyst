import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { utils } from 'near-api-js'

import DaoCard from '../DAOCard/daoCard'
import { Header } from '../Header/header'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
      //  maxWidth: 640,
        margin: 'auto',
      //  marginTop: 50,
        marginBottom: 50,
        minHeight: 550,
        padding: '20px',
    },
    featureDAO: {
        minHeight: '200px',
        backgroundColor:'#eff3fb',
        padding: '20px',
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
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
  
export default function ExploreDaos(props) {
   
    const [daos, setDaos] = useState([])
    const [daoCount, setDaoCount] = useState(0)
    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [resources, setResources] = useState(0)
    const [nearPrice, setNearPrice] = useState()

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      daoList,
      near
    } = state

    useEffect(
        () => {
            async function fetchData() {
                if(daoList){
                    console.log('daolist', daoList)
                    setDaoCount(daoList.daoList.length)
                    setDaos(daoList.daoList)

                    let i = 0
                    let balance = 0
                    while (i < daoList.daoList.length){
                        let account
                        try {
                            account = await near.connection.provider.query({
                                request_type: "view_account",
                                finality: "final",
                                account_id: daoList.daoList[i].contractId,
                            })
                        } catch (err) {
                            console.log('problem retrieving account', err)
                        }
                        if(account){
                            console.log('account', account)
                            let formatted = utils.format.formatNearAmount(account.amount, 0)
                            balance = balance + parseInt(formatted)
                            console.log('balance', balance)
                        }
                        i++
                    }
                    setResources(balance)
                    let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
                    setNearPrice(getNearPrice.data.near.usd)
                    console.log('nearprice', nearPrice)
                }
            }

            fetchData()

    }, [daoList, near, nearPrice]
    )
    
    function handleEditDaoClick(property){
        setEditDaoClicked(property)
    }

    return (
        
        <div className={classes.root}>
        <Header state={state}/>
        <Grid container alignItems="center" justify="space-between" spacing={0} style={{marginTop:'40px', marginBottom:'40px'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} className={classes.featureDAO}>
                <Typography align="center" style={{color:'#1341a4', fontSize:'60px',fontWeight:'700', marginTop:'30px', lineHeight:'1em', verticalAlign:'middle'}}>Catalyst Powers</Typography>
                <Grid container alignItems="center" justify="space-evenly" spacing={1}>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                        <Typography style={{color:'#1341a4', fontSize:'80px',fontWeight:'700', marginTop:'30px', lineHeight:'1em', verticalAlign:'middle'}}>
                            {daos ? daoCount : null} 
                        </Typography>
                        <Typography variant="overline" style={{color:'#1341a4', fontSize:'30px',fontWeight:'700', lineHeight:'1em', verticalAlign:'middle'}}>
                            {daos && daoCount > 1 ? 'Communities': null} 
                            {daos && daoCount == 1 ? 'Community': null}
                            {daos && daoCount == 0 ? 'Communities': null}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} >
                        <Typography align="center" style={{color:'#1341a4', fontSize:'80px',fontWeight:'700', marginTop:'30px', lineHeight:'1em', verticalAlign:'middle'}}>
                            {resources && resources > 0 ? resources + ' Ⓝ' : null}
                        </Typography>
                        <Typography align="center" style={{color:'#1341a4', fontSize:'30px',fontWeight:'700', lineHeight:'1em', verticalAlign:'middle'}}>
                            {resources && resources > 0 ? '$' + Math.round(resources * nearPrice, 2) + ' USD' : null}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>

        <Grid container alignItems="center" justify="space-between" spacing={2}>
            { daoCount > 0 ? 
                (<>
                  
                {daos.map(({ contractId, summoner, date}, i) => 
                    <DaoCard
                        key={i}
                        contractId={contractId}
                        summoner={summoner}
                        created={date}
                        link={''}
                        state={state}
                        handleEditDaoClick={handleEditDaoClick}
                    />
                    ).reverse()}
                </>)
            : null
            }
        </Grid>
        </div>
        
    )
}