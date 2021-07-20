import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { utils } from 'near-api-js'
import { GAS, FACTORY_DEPOSIT } from '../../utils/ceramic'

import CreateDemDAO from '../CreateDAO/createDemDAO'
import OliDaoCard from './DaoFrameworks/oliDaoCard'
import PlutoDaoCard from './DaoFrameworks/plutoDaoCard'
import RepDaoCard from './DaoFrameworks/repDaoCard'
import AutoDaoCard from './DaoFrameworks/autoDaoCard'
import DemDaoCard from './DaoFrameworks/demDaoCard'
import { Header } from '../Header/header'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        margin: 'auto',
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

export default function CreateDao(props) {
    const itemsPerPage = 10
    const[finished, setFinished] = useState(true)
    const[createDAOClicked, setCreateDAOClicked] = useState(false)
    const[page, setPage] = useState(1)
    const[noOfPages, setNoOfPages] = useState()

    const classes = useStyles()
    const { register, handleSubmit, watch, errors } = useForm()

    const {
        state,
    } = props

    const {
        currentDaosList, 
        daoFactory
    } = state

    useEffect(
        () => {
        async function fetchData() {
            if(currentDaosList){
                setNoOfPages(Math.ceil(currentDaosList.length/itemsPerPage))
            }
        }
        fetchData()
            .then((res) => {

            })
    }, []
    )

    const handleCreateDAOClick = () => {
        setCreateDAOClicked(true)
    };

    function handleCreateDAOClickState(property) {
    setCreateDAOClicked(property)
    }
       
  

    const handleChange = (event, value) => {
        setPage(value)
    }

    const onSubmit = async (values) => {
        setFinished(false)
        let finished

        let accountName = accountId.split('.')
       
        let name = accountName[0]
      
            // create DAO for account
            try{
                finished = await daoFactory.createDAO({
                        name: name
                    }, GAS, utils.format.parseNearAmount(FACTORY_DEPOSIT))
                setFinished(true)
            } catch (err) {
                console.log('error creating dao', err)
                setFinished(true)
            }
        
    }

    const onDeleteSubmit = async (values) => {
        setFinished(false)
        let finished
        console.log('delete contract', contract)
        try {
        let accountName = accountId.split('.')
        console.log('accountName', accountName[0])
        let name = accountName[0]
        
            // create Fleet for account
           finished = await contract.deleteDAO({
                name: name,
                beneficiary: accountId
            }, GAS)
            console.log('finished', finished)
            if(finished) {
               
            } else {
                console.log('error deleting Dao')
                setFinished(true)
            }
        
        } catch (err) {
        console.log('error deleting dao', err)
        setFinished(true)
        }
        if(finished) {
            setFinished(true)
        }
    }

    


    return (
        <>
        <div className={classes.root}>
        <Header state={state}/>
            <Grid container alignItems="center" justify="space-evenly" spacing={2} style={{marginTop:'40px', marginBottom:'40px'}}>
                <Grid item xs={12} sm={12} md={8} lg={8} xl={8} >
                    <Typography style={{color:'#2d68e6', fontSize:'80px',fontWeight:'700', lineHeight:'1em', marginBottom:'10px', alignVertical:'middle'}}>
                        Choose Your DAO's Governance Model
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={12} md={4} lg={4} xl={4} >
                    <DemDaoCard
                        state={state}
                        daoFactory={daoFactory}
                        handleCreateDAOClickState={handleCreateDAOClickState}
                       
                    />
                </Grid>

            </Grid>

            <Grid container alignItems="stretch" justify="space-evenly" spacing={2}>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} >
                    <OliDaoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} >
                    <PlutoDaoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} >
                    <RepDaoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} >
                    <AutoDaoCard />
                </Grid>
            </Grid>
                
           
        </div>
        
      
        
        {createDAOClicked ? <CreateDemDAO
            state={state}
            daoFactory={daoFactory}
            handleCreateDAOClickState={handleCreateDAOClickState}
          
          /> : null }
        
        </>
    )
}