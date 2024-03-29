import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { utils } from 'near-api-js'
import Fuse from 'fuse.js'
import { dao } from '../../utils/dao'
import DaoCard from '../Cards/DAOCard/daoCard'
import SearchBar from '../common/SearchBar/search'
import RegisterForm from '../Register/register'
import { GAS, STORAGE, parseNearAmount, REGISTRY_API_URL } from '../../state/near'

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

const registryQuery = `
    query{
        accounts{
            id
            log
        }
    }
`

const client = new ApolloClient({
  uri: REGISTRY_API_URL,
  cache: new InMemoryCache(),
})

client
  .query({
    query: gql(registryQuery),
  })
  .then((data) => {
      console.log('data', data)
    let registryData = JSON.parse(data.data.accounts[0].actionLogs[0])
    console.log('parsedJSON', registryData)
  })
  .catch((err) => {
    console.log('Error fetching data:', err)
  })
  
export default function Guilds(props) {
   
    const [daos, setDaos] = useState([])
    const [daoCount, setDaoCount] = useState(0)
    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [membersOnly, setMembersOnly] = useState(false)
    const [activeOnly, setActiveOnly] = useState(true)
    const [resources, setResources] = useState(0)
    const [nearPrice, setNearPrice] = useState()
    const [searchDaos, setSearchDaos] = useState([])
    const [contract, setContract] = useState()
    const [registerClicked, setRegisterClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
   

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      currentDaosList,
      accountId,
      near,
      isUpdated,
      did,
      didRegistryContract
    } = state

    const matches = useMediaQuery('(max-width:500px)')

    let sortedDaos

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
                    let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
                    setNearPrice(getNearPrice.data.near.usd)
                 
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

    const handleRegisterClick= () => {
        
        handleExpanded()
        handleRegisterClickState(true)
      }
    
    function handleRegisterClickState(property){
    setRegisterClicked(property)
    }

    const register = async (values) => {
        if(did){
          try{
            await didRegistryContract.putDID({
              accountId: accountId,
              did: did
            }, GAS, parseNearAmount((parseFloat(STORAGE)).toString()))
          } catch (err) {
            console.log('error registering dao', err)
          }
        }
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
                let thisCommunityStatus
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

    function handleUpdate(){
        setIsUpdated(!isUpdated)
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
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                <Button color="primary" style={{float: 'left'}} onClick={register}>
                    Register
                </Button>
            </Grid>
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
              
            {daos.map(({contractId, created, summoner, status}, i) => {
               console.log('status', status)
                return ( 
                    <DaoCard
                        key={i}
                        contractId={contractId}
                        created={created}
                        summoner={summoner}
                        contract={contract}
                        link={''}
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
    
        {registerClicked ? <RegisterForm
            handleRegisterClickState={handleRegisterClickState}        
            /> : null }
        </>
    )
}