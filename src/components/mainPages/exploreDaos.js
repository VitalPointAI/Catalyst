import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { utils } from 'near-api-js'
import Fuse from 'fuse.js'

import DaoCard from '../DAOCard/daoCard'
import { Header } from '../Header/header'
import SearchBar from '../../components/common/SearchBar/search'
import Persona from '@aluhning/get-personas-js'

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
        padding: '0px',
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
    const [searchDaos, setSearchDaos] = useState([])
    const [isUpdated, setIsUpdated] = useState()

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    let someDaos = []

    const {
      currentDaosList,
      near
    } = state

    const Dao = new Persona()

    useEffect(
        () => {
            async function fetchData() {
                if(currentDaosList){
                    console.log('daolist', currentDaosList)
                    setDaoCount(currentDaosList.length)
                    let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
                    setDaos(sortedDaos)
                    // let daos = []
                    // let z = 0
                    // while(z < currentDaosList.length){
                    //     try{
                    //         let thisDao = await Dao.getDao(currentDaosList[z])
                    //         console.log('this dao', thisDao)
                    //         if(thisDao && thisDao.contractId == currentDaosList[z]){
                    //             daos.push(thisDao)
                    //         }
                    //     } catch (err) {
                    //         console.log('can not retrieve dao info', err)
                    //     }
                    //     z++                        
                    // }
                    // console.log('daos', daos)
                    // let sortedDaos = _.sortBy(daos, (new Date('date')).getTime()).reverse()
                    // setDaos(sortedDaos)
                   //setDaos(currentDaosList)

                    let i = 0
                    let balance = 0
                    while (i < currentDaosList.length){
                        let account
                        try {
                            account = await near.connection.provider.query({
                                request_type: "view_account",
                                finality: "final",
                                account_id: currentDaosList[i].contractId,
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

    }, [near, currentDaosList]
    )
    
    function handleEditDaoClick(property){
        setEditDaoClicked(property)
    }

    function handleDaoUpdate(result){
        let newDaos = daos.push(result)
        setDaos(newDaos)
    }

    function makeSearchDaos(dao){
        let i = 0
        let exists
        if(dao != false){
            while(i < searchDaos.length){
                if(searchDaos[i].contractId == dao.contractId){
                    exists = true
                }
                i++
            }
            if(!exists){
                someDaos.push(dao)
                setSearchDaos(someDaos)
            }
            console.log('search daos', searchDaos)
        }
    }

    function handleUpdate(){
        setIsUpdated(!isUpdated)
    }

    const searchData = (pattern) => {
        if (!pattern) {
            let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
            setDaos(sortedDaos)
            return
        }
        console.log('searchDaos', searchDaos)
        
        const fuse = new Fuse(searchDaos, {
            keys: ['category']
        })
        console.log('fuse', fuse)

        const result = fuse.search(pattern)
        console.log('fuse result', result)

        const matches = []
        if (!result.length) {
            setDaos([])
        } else {
            result.forEach(({item}) => {
                matches.push(item)
        })
        console.log('matches', matches)
            setDaos(matches)
        }
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
      
        <Grid container alignItems="center" justify="space-between" spacing={0} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <SearchBar
                placeholder="Search"
                onChange={(e) => searchData(e.target.value)}
            />
            </Grid>
        </Grid>

        <Grid container alignItems="center" justify="space-between" spacing={3} style={{padding: '20px'}}>
        {daos && daoCount > 0 ? 
                (<>
                  
                {daos.map(({contractId, created, summoner}, i) => {
                   
                    return ( 
                        <DaoCard
                            key={i}
                            contractId={contractId}
                            created={created}
                            summoner={summoner}
                            
                            link={''}
                            state={state}
                            handleEditDaoClick={handleEditDaoClick}
                            handleUpdate={handleUpdate}
                            makeSearchDaos={makeSearchDaos}
                        />
                   )
                }
                   
                    )}
                </>)
            : null
            }
        </Grid>
        </div>
        
    )
}