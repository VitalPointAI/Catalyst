import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { utils } from 'near-api-js'
import Fuse from 'fuse.js'
import { dao } from '../../utils/dao'
import DaoCard from '../Cards/DAOCard/daoCard'
import SearchBar from '../../components/common/SearchBar/search'
import { GAS, STORAGE, parseNearAmount, REGISTRY_API_URL } from '../../state/near'
import { queries } from '../../utils/graphQueries'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Paper from '@material-ui/core/Paper'
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
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
    const [membersOnly, setMembersOnly] = useState(false)
    const [activeOnly, setActiveOnly] = useState(true)
    const [resources, setResources] = useState(0)
    const [searchDaos, setSearchDaos] = useState([])
    const [contract, setContract] = useState()
    const [anchorEl, setAnchorEl] = useState(null)
    const [notCatalystCommunities, setNotCatalystCommunities] = useState([])
   
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      currentDaosList,
      accountId,
      near,
      isUpdated,
      did,
      didRegistryContract,
      nearPrice
    } = state

    const matches = useMediaQuery('(max-width:500px)')

    let sortedDaos

    // useEffect(
    //     () => {
    //         async function fetchRegistryData(){
                
    //         .then((data) => {
    //             console.log('data', data)
    //             let exists = false
    //             let nonCatalystCommunities = []
    //             let registrations = []
    //             let deletions = []
    //             let filtered = []
    //             let z = 0
    //             while (z < data.data.accounts.length){
    //                 let registryData = JSON.parse(data.data.accounts[z].log[0])
    //                 console.log('reg registryData', registryData)
    //                 if(registryData.EVENT_JSON.event == 'putDID'){
    //                     console.log('reg here')
    //                     registrations.push(registryData)
    //                 }
    //                 z++
    //             }
    //             console.log('registrations', registrations)
    //             let y = 0
    //             while (y < data.data.accounts.length){
    //                 let registryData = JSON.parse(data.data.accounts[y].log[0])
    //                 console.log('del registryData', registryData)
    //                 if(registryData.EVENT_JSON.event == 'deleteDID'){
    //                     console.log('del here')
    //                     deletions.push(registryData)
    //                 }
    //                 y++
    //             }
    //             console.log('deletions', deletions)
    //             let w = 0
    //             let isHere = false
    //             while (w < registrations.length){
    //                 let x = 0
    //                 while(x < deletions.length){
    //                     if(registrations[w].EVENT_JSON.data.accountId == deletions[x].EVENT_JSON.data.accountId){
    //                         isHere = true
    //                         break
    //                     }
    //                     x++
    //                 }
    //                 if(!isHere){
    //                     filtered.push(registrations[w])
    //                 }
    //                 w++
    //             }
    //             console.log('filtered', filtered)

    //             let i = 0
    //             while(i < filtered.length){
    //                 let k = 0
    //                 while(k < currentDaosList.length){
    //                     if(filtered[i].EVENT_JSON.data.accountId == currentDaosList[k].contractId){
    //                         exists = true
    //                     }
    //                 k++
    //                 }
    //                 if(!exists){
    //                     let dao = {
    //                         contractId: filtered[i].EVENT_JSON.data.accountId,
    //                         created: filtered[i].EVENT_JSON.data.registered,
    //                         did: filtered[i].EVENT_JSON.data.did,
    //                         status: 'active',
    //                         summoner: filtered[i].EVENT_JSON.data.owner
    //                     }
    //                     nonCatalystCommunities.push(dao)
    //                 }
    //             i++
    //             }
    //             setNotCatalystCommunities(nonCatalystCommunities)
    //             console.log('noncat communities', nonCatalystCommunities)
              
    //         })
    //         .catch((err) => {
    //           console.log('Error fetching data:', err)
    //         })
    //     }
    //     fetchRegistryData()

    //     }, [currentDaosList]
    // )

    useEffect(
        () => {
            if(isUpdated){}
            async function fetchData() {
                if(near){
                    setDaoCount(currentDaosList.length)
                    sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
                   
                    let statusCommunity = []
                    let j = 0
                    while (j < sortedDaos.length){
                        if(sortedDaos[j].status == 'active'){
                            statusCommunity.push(sortedDaos[j])
                        } 
                    j++
                    }
                  //  let combined = statusCommunity.concat(notCatalystCommunities)
                  //  console.log('combined', combined)
                   // setDaos(combined)
                   setDaos(statusCommunity)

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
                        
                            let formatted = utils.format.formatNearAmount(account.amount, 0)
                            balance = balance + parseFloat(formatted)
                          
                        }
                        i++
                    }
                    setResources(balance)
                 
                }
            }

        let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
         
          })
        return () => mounted = false
        }

    }, [near, isUpdated]
    )
    
    function handleEditDaoClick(property){
        setEditDaoClicked(property)
    }

    function handleDaoUpdate(result){
        let newDaos = daos.push(result)
        setDaos(newDaos)
    }

    function handleExpanded() {
        setAnchorEl(null)
    }


    const handleMembersOnlyChange = async (event) => {
        setMembersOnly(event.target.checked)
     
        if(event.target.checked){
            let contract
            let memberDaos = []
            let i = 0
           
            while (i < daos.length){
                try{
                    contract = await dao.initDaoContract(state.wallet.account(), daos[i].contractId)
                } catch (err) {
                    console.log('problem initializing dao contract', err)
                }

                let thisMemberStatus
                let thisMemberInfo
                try {
                thisMemberInfo = await contract.getMemberInfo({member: accountId})
                thisMemberStatus = await contract.getMemberStatus({member: accountId})
                if(thisMemberStatus && thisMemberInfo[0].active){
                    memberDaos.push(daos[i])
                } 
                } catch (err) {
                console.log('no member info yet')
                }
            i++
            }
            setDaos(memberDaos)
        } else {
            let memberDaos = []
            setDaos(memberDaos)
            let i = 0
         
            let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
            while (i < sortedDaos.length){
                memberDaos.push(sortedDaos[i])
                i++
            }
            setDaos(memberDaos)
        }
    }

    const handleStatusChange = async (event) => {
        setActiveOnly(event.target.checked)
        
        if(event.target.checked){
            let contract
            let statusCommunity = []
            let i = 0
            while (i < daos.length){
                if(daos[i].status == 'active'){
                    statusCommunity.push(daos[i])
                } 
            i++
            }
            setDaos(statusCommunity)
        } else {
            let statusCommunity = []
            setDaos(statusCommunity)
            let i = 0
            let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
            while (i < sortedDaos.length){
                statusCommunity.push(sortedDaos[i])
                i++
            }
            setDaos(statusCommunity)
        }
    }

    function makeSearchDaos(dao){
       let i = 0
        let exists
        let someDaos = []
        if(dao != false && searchDaos.length > 0){
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
        }
    }

    const searchData = (pattern) => {
        if (!pattern) {
            let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
            setDaos(sortedDaos)
            return
        }
        
        const fuse = new Fuse(searchDaos, {
            keys: ['category']
        })
     

        const result = fuse.search(pattern)

        const matches = []
        if (!result.length) {
            setDaos([])
        } else {
            result.forEach(({item}) => {
                matches.push(item)
        })
            setDaos(matches)
        }
    }
  

    return (
        <>
        {!matches ? (<>
        <Grid container alignItems="center" justifyContent="center" spacing={0} style={{margin:'auto', width:'98%'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <Paper elevation={3}>
                <Typography align="center" style={{color:'#1341a4', fontSize:'60px',fontWeight:'700', marginTop: '5px', lineHeight:'1em', verticalAlign:'middle'}}>
                Catalyst Powers</Typography>
                <Grid container alignItems="center" justifyContent="space-evenly" spacing={1}>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                        <Typography style={{color:'#1341a4', fontSize:'80px',fontWeight:'700', marginTop: '5px', lineHeight:'1em', verticalAlign:'middle'}}>
                            {daos ? daoCount : null} 
                        </Typography>
                        <Typography variant="overline" style={{color:'#1341a4', fontSize:'30px', marginBottom: '10px', fontWeight:'700', lineHeight:'1em', verticalAlign:'middle'}}>
                            {daos && daoCount > 1 ? 'Communities': null} 
                            {daos && daoCount == 1 ? 'Community': null}
                            {daos && daoCount == 0 ? 'Communities': null}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} >
                        <Typography align="center" style={{color:'#1341a4', fontSize:'80px',fontWeight:'700', marginTop: '5px', lineHeight:'1em', verticalAlign:'middle'}}>
                            {resources && resources > 0 ? resources + ' Ⓝ' : null}
                        </Typography>
                        <Typography align="center" style={{color:'#b9b9b9', fontSize:'30px', marginBottom: '10px', lineHeight:'1em', verticalAlign:'middle'}}>
                           ~ {resources && resources > 0 ? '$' + Math.round(resources * nearPrice, 2) + ' USD' : null}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
            </Grid>
        </Grid>
        </>
        ) : (<>
            <Grid container alignItems="center" justifyContent="space-between" spacing={0}  style={{margin:'auto', width:'98%'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Paper elevation={3}>
                    <Typography align="center" style={{color:'#1341a4', fontSize:'40px',fontWeight:'700', marginTop:'10px', lineHeight:'1em', verticalAlign:'middle'}}>
                    Catalyst Powers</Typography>
                    <Grid container alignItems="center" justifyContent="space-evenly" spacing={1}>
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                            <Typography style={{color:'#1341a4', fontSize:'40px',fontWeight:'700', marginTop:'5px', lineHeight:'1em', verticalAlign:'middle'}}>
                                {daos ? daoCount : null} 
                            </Typography>
                            <Typography variant="overline" style={{color:'#1341a4', fontSize:'20px',fontWeight:'700', lineHeight:'1em', verticalAlign:'middle'}}>
                                {daos && daoCount > 1 ? 'Communities': null} 
                                {daos && daoCount == 1 ? 'Community': null}
                                {daos && daoCount == 0 ? 'Communities': null}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} >
                            <Typography align="center" style={{color:'#1341a4', fontSize:'40px',fontWeight:'700', marginTop:'10px', lineHeight:'1em', verticalAlign:'middle'}}>
                                {resources && resources > 0 ? resources + ' Ⓝ' : null}
                            </Typography>
                            <Typography align="center" style={{color:'#b9b9b9', fontSize:'20px', lineHeight:'1em', verticalAlign:'middle'}}>
                               ~ {resources && resources > 0 ? '$' + Math.round(resources * nearPrice, 2) + ' USD' : null}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
                </Grid>
            </Grid>
            </>

        )}
        
        <Grid container alignItems="center" justifyContent="space-between" spacing={0} >
           
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
            <SearchBar
                placeholder="Search"
                onChange={(e) => searchData(e.target.value)}
            />
            </Grid>
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
            </Grid>
        </Grid>
        <Grid container spacing={1} justifyContent="center" alignItems="center" style={{paddingLeft:'40px', paddingRight:'40px'}}>
        <FormControl component="fieldset" >
            <FormLabel component="legend">Filter Communities</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={membersOnly} onChange={handleMembersOnlyChange} name="membersOnly" />}
                label="Member"
              />
              <FormControlLabel
                control={<Switch checked={activeOnly} onChange={handleStatusChange} name="onlyActiveCommunities" />}
                label="Active"
              />
              
            </FormGroup>
            <FormHelperText>Choose community filters.</FormHelperText>
          </FormControl>
          {daos && daoCount > 0 ? 
            (<>
              
            {daos.map(({contractId, created, did, summoner, status}, i) => {
                console.log('explore daos', daos)
                return ( 
                    <DaoCard
                        key={i}
                        contractId={contractId}
                        created={created}
                        summoner={summoner}
                        daoDid={did}
                        contract={contract}
                        state={state}
                        handleEditDaoClick={handleEditDaoClick}
                        makeSearchDaos={makeSearchDaos}
                        status={status}
                    />
               )
            }
            )}
       
            </>)
        : null
        }
        </Grid>
        </>
    )
}