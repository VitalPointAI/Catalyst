import React, { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'
import EditDaoForm from '../EditDao/editDao'

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import RightSideDrawer from '../AppFramework/RightSideDrawer'
import { CircularProgress } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    logo: {
        maxWidth: 175,
        margin: 'auto',
        paddingLeft: '10px'
    },
    chip: {
        float: 'right',
        marginBottom: '-70px'
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

    const { state, dispatch, update } = useContext(appStore)

    const classes = useStyles()

    const { 
        appIdx,
        didRegistryContract,
        near
      } = state

    const {
        contractId
    } = useParams()

    useEffect(() => {

        async function fetchData() {
            if(!contractId){
                setLogo(catalystLogo)
                setLoaded(true)
            }
            let thisCurDaoIdx
            if(near && contractId){
                let daoAccount = new nearAPI.Account(near.connection, contractId)
                console.log('daoAccount', daoAccount)
                    
                thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                setCurDaoIdx(thisCurDaoIdx)
                
                if(thisCurDaoIdx){
                    try{
                        let result = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)
                        console.log('dao logo result', result)
                        if(result){
                        result.logo ? setLogo(result.logo) : setLogo(defaultLogo)
                        setLoaded(true)
                        }
                    } catch (err) {
                        console.log('problem retrieving DAO profile')
                    }
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
            <Link to={`${contractId}`}>
                <div style={{width: '180px', 
                height: '100px', 
                float: 'right', 
                backgroundImage: `url(${logo})`, 
                backgroundSize: '180px 100px', 
                backgroundPosition: 'left', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            </Link>
            <Chip label="Change" component="a" onClick={handleEditDaoClick} clickable variant="outlined" className={classes.chip}/>
           
            </>
        ) : (
            <Link to={`${contractId}`}>
                <img src={logo} alt="Logo" className={classes.logo}/>
            </Link>
        ) : (
            <Link to='/'>
            <img src={logo} alt=" Catalyst Logo" className={classes.logo}/>
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
