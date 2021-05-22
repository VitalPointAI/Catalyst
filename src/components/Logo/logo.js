import React, { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'

// Material UI
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    logo: {
        maxWidth: 175,
        margin: 'auto',
        paddingLeft: '10px'
    },
  }));

const defaultLogo = require('../../img/catalyst-logo-cropped.png')

export default function Logo(props) {
    const [logo, setLogo] = useState(defaultLogo)

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
            let thisCurDaoIdx
            if(near && contractId){
                let daoAccount = new nearAPI.Account(near.connection, contractId)
                console.log('daoAccount', daoAccount)
                    
                thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                
                if(thisCurDaoIdx){
                    try{
                        let result = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)
                        console.log('dao logo result', result)
                        if(result){
                        result.logo ? setLogo(result.logo) : setLogo(defaultLogo)
                        }
                    } catch (err) {
                        console.log('problem retrieving DAO profile')
                    }
                }
            }
        }

        fetchData()

    }, [near]
    )
    
    return (
        <Link to={`${contractId}`}>
            <img src={logo} alt="Logo" className={classes.logo}/>
        </Link>
    )
}
