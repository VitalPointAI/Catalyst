import React, { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'
import { dao } from '../../utils/dao'
import EditDaoForm from '../EditDao/editDao'

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import RightSideDrawer from '../AppFramework/RightSideDrawer'
import { CircularProgress } from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery'

const useStyles = makeStyles((theme) => ({
    logo: {
        maxWidth: 150,
        maxHeight: 60,
        margin: 'auto',
        paddingLeft: '10px'
    },
    chip: {
        marginTop: '25px',
        marginLeft: '60px'
    }
  }));

const catalystLogo = require('../../img/catalyst-logo-cropped.png')
const defaultLogo = require('../../img/default_logo.png')

export default function Logo(props) {
    const [logo, setLogo] = useState(defaultLogo)
    const [isUpdated, setIsUpdated] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [loaded, setLoaded] = useState(false)
    const [summoner, setSummoner] = useState()

    const { state, dispatch, update } = useContext(appStore)

    const classes = useStyles()

    const { 
        appIdx,
        didRegistryContract,
        near,
        accountId,
        wallet
      } = state

    const {
        contractId
    } = useParams()

    const matches = useMediaQuery('(max-width:500px)');

    useEffect(() => {

        async function fetchData() {

            if(!contractId){
                setLogo(catalystLogo)
                setLoaded(true)
            }
            let thisCurDaoIdx
            if(near && contractId){
                let daoAccount
                try{
                    daoAccount = new nearAPI.Account(near.connection, contractId)
                } catch (err) {
                    console.log('dao account does not exist', err)
                  
                }
                    
                thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                console.log('thiscurdaoIdx logo', thisCurDaoIdx)
                setCurDaoIdx(thisCurDaoIdx)
                
                if(thisCurDaoIdx){
                    try{
                        let result = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)
                        console.log('dao logo result', result)
                        if(result){
                        result.logo ? setLogo(result.logo) : setLogo(defaultLogo)
                        setLoaded(true)
                        }
                        if(!result){
                            setLogo(defaultLogo)
                            setLoaded(true)
                        }
                    } catch (err) {
                        console.log('problem retrieving DAO profile')
                    }
                }

                if(!thisCurDaoIdx){
                    setLogo(defaultLogo)
                    setLoaded(true)
                }

                let contract
                try{
                    contract = await dao.initDaoContract(wallet.account(), contractId)
                } catch (err) {
                    console.log('error retrieving contract', err)
                }
                
                try{
                let owner = await contract.getSummoner()
                setSummoner(owner)
                } catch (err) {
                    console.log('error retrieving summoner', err)
                }
            }
        }

        fetchData((res) => {
            
        })

    }, [near, isUpdated]
    )

    function handleUpdate(property){
        setIsUpdated(property)
    }

    const handleEditDaoClick = () => {
        handleExpanded()
        handleEditDaoClickState(true)
    }

    function handleEditDaoClickState(property){
        setEditDaoClicked(property)
    }

    function handleExpanded() {
        setAnchorEl(null)
    }
 
    return (
        <>        
        {loaded ? (
        logo != catalystLogo ?
            logo == defaultLogo ? 
                (<>
            
            <Link to={`/dao/${contractId}`}>
            {!matches ? (
                <div style={{width: '150px', 
                height: '60px', 
                marginLeft: '30px',
                backgroundImage: `url(${logo})`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'left', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            {accountId == summoner ? <Chip label="Change" onClick={handleEditDaoClick} clickable variant="outlined" className={classes.chip}/> : null }
            </div>
            ) : (
                <div style={{width: '150px', 
                height: '60px', 
                marginLeft: '10px',
                backgroundImage: `url(${logo})`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'left', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            {accountId == summoner ? <Chip label="Change" onClick={handleEditDaoClick} clickable variant="outlined" className={classes.chip}/> : null }
            </div>
            )}
            </Link>           
            </>
        ) : (
            <Link to={`/dao/${contractId}`}>
            {!matches ? (
                <div style={{width: '150px', 
                height: '60px', 
                marginLeft: '30px',
                backgroundImage: `url(${logo})`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'left', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            ) : (
                <div style={{width: '150px', 
                height: '60px', 
                marginLeft: '10px',
                backgroundImage: `url(${logo})`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'left', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            )}
            </Link>
            
        ) : (
            <Link to='/'>
            {!matches ? (
                <div style={{width: '150px', 
                height: '60px', 
                marginLeft: '30px',
                backgroundImage: `url(${logo})`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'left', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            ) : (
                <div style={{width: '150px', 
                height: '60px', 
                marginLeft: '10px',
                backgroundImage: `url(${logo})`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'left', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            )}
           
        </Link>
        )) : <CircularProgress />}
        

        {editDaoClicked ? <EditDaoForm
            state={state}
            handleEditDaoClickState={handleEditDaoClickState}
            curDaoIdx={curDaoIdx}
            handleUpdate={handleUpdate}
            contractId={contractId}
            /> : null }
        </>
    )
}
