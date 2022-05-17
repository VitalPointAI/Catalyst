import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { utils } from 'near-api-js'
import Fuse from 'fuse.js'
import { dao } from '../../utils/dao'
import TokenCard from '../TokenCard/tokenCard'
import FTInitialize from '../Initialize/ftInitialize'
import SearchBar from '../common/SearchBar/search'
import Persona from '@aluhning/get-personas-js'

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
  
export default function FTs(props) {
   
    const [tokens, setTokens] = useState([])
    const [tokenCount, setTokenCount] = useState(0)
    
    const [mintTokenClicked, setMintTokenClicked] = useState(false)
    const [membersOnly, setMembersOnly] = useState(false)
    const [activeOnly, setActiveOnly] = useState(true)
    const [resources, setResources] = useState(0)
    const [nearPrice, setNearPrice] = useState()
    const [searchTokens, setSearchTokens] = useState([])
    //const [isUpdated, setIsUpdated] = useState()
    const [contract, setContract] = useState()
   

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      currentTokensList,
      accountId,
      near,
      ftContract
    } = state

   // const Dao = new Persona()

    const matches = useMediaQuery('(max-width:500px)')

    let sortedTokens

    useEffect(
        () => {
            async function fetchData() {
                if(currentTokensList && near){
                    setTokenCount(currentTokensList.length)
                    sortedTokens = _.sortBy(currentTokensList, 'created').reverse()
                   
                    // let statusCommunity = []
                    // let j = 0
                    // while (j < sortedDaos.length){
                    //     if(sortedDaos[j].status == 'active'){
                    //         statusCommunity.push(sortedDaos[j])
                    //     } 
                    // j++
                    // }
                   // setDaos(statusCommunity)

                   setTokens(sortedTokens)

                    // let i = 0
                    // let balance = 0
                    // while (i < currentDaosList.length){
                    //     let account
                    //     try {
                    //         account = await near.connection.provider.query({
                    //             request_type: "view_account",
                    //             finality: "final",
                    //             account_id: currentDaosList[i].contractId,
                    //         })
                    //     } catch (err) {
                    //         console.log('problem retrieving account', err)
                    //     }
                    //     if(account){
                        
                    //         let formatted = utils.format.formatNearAmount(account.amount, 0)
                    //         balance = balance + parseFloat(formatted)
                          
                    //     }
                    //     i++
                    // }
                    // setResources(balance)
                    // let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
                    // setNearPrice(getNearPrice.data.near.usd)
                 
                }
            }

        let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
         
          })
        return () => mounted = false
        }

    }, [near, currentTokensList]
    )
    
    // function handleEditDaoClick(property){
    //     setEditDaoClicked(property)
    // }

    function handleMintTokenClick(property){
        setMintTokenClicked(property)
    }

    // function handleDaoUpdate(result){
    //     let newDaos = daos.push(result)
    //     setDaos(newDaos)
    // }

    const handleMembersOnlyChange = async (event) => {
        setMembersOnly(event.target.checked)
     
        if(event.target.checked){
            let contract
            let memberTokens = []
            let i = 0
           
            while (i < tokens.length){
                // try{
                //     contract = await ftContract.initDaoContract(state.wallet.account(), daos[i].contractId)
                // } catch (err) {
                //     console.log('problem initializing dao contract', err)
                // }

                // // let thisMemberStatus
                // // let thisMemberInfo
                // // try {
                // // thisMemberInfo = await contract.getMemberInfo({member: accountId})
                // // thisMemberStatus = await contract.getMemberStatus({member: accountId})
                // // if(thisMemberStatus && thisMemberInfo[0].active){
                //     memberDaos.push(daos[i])
                // } 
                // } catch (err) {
                // console.log('no member info yet')
                // }
                if(tokens.creator == accountId){
                    memberTokens.push(tokens[i])
                }
            i++
            }
            setTokens(memberTokens)
        } else {
            let memberTokens = []
            setTokens(memberTokens)
            let i = 0
         
            let sortedTokens = _.sortBy(currentTokensList, 'created').reverse()
            while (i < sortedTokens.length){
                memberTokens.push(sortedTokens[i])
                i++
            }
            setTokens(memberTokens)
        }
    }

    // const handleStatusChange = async (event) => {
    //     setActiveOnly(event.target.checked)
        
    //     if(event.target.checked){
    //         let contract
    //         let statusCommunity = []
    //         let i = 0
    //         while (i < daos.length){
    //             let thisCommunityStatus
    //             if(daos[i].status == 'active'){
    //                 statusCommunity.push(daos[i])
    //             } 
    //         i++
    //         }
    //         setDaos(statusCommunity)
    //     } else {
    //         let statusCommunity = []
    //         setDaos(statusCommunity)
    //         let i = 0
    //         let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
    //         while (i < sortedDaos.length){
    //             statusCommunity.push(sortedDaos[i])
    //             i++
    //         }
    //         setDaos(statusCommunity)
    //     }
    // }

    function makeSearchTokens(token){
       let i = 0
        let exists
        let someTokens = []
        if(token != false){
            while(i < searchTokens.length){
                if(searchTokens[i].metadata.name == token.creator){
                    exists = true
                }
                i++
            }
            if(!exists){
                someTokens.push(token)
                setSearchTokens(someTokens)
            }
        }
    }

    // function handleUpdate(){
    //     setIsUpdated(!isUpdated)
    // }

    const searchData = (pattern) => {
        if (!pattern) {
            let sortedTokens = _.sortBy(currentTokensList, 'created').reverse()
            setTokens(sortedTokens)
            return
        }
        
        const fuse = new Fuse(searchTokens, {
            keys: ['name']
        })
     

        const result = fuse.search(pattern)

        const matches = []
        if (!result.length) {
            setTokens([])
        } else {
            result.forEach(({item}) => {
                matches.push(item)
        })
            setTokens(matches)
        }
    }
  

    return (
        <FTInitialize state={state} />
    )
}