import React, { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { ceramic } from '../../../../utils/ceramic'
import { wallet } from '../../../../utils/wallet'
import { IDX } from '@ceramicstudio/idx'
import { DaoCeramicAppContext } from '../../../../contexts/daoCeramicAppContext'

import DAOCard from '../DAOCard/daoCard'

// Material UI components

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      margin: 'auto',
      maxWidth: 325,
      minWidth: 325,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      },
    featureDAO: {
        minHeight: '200px',
        backgroundColor:'#eff3fb',
        padding: '20px',
    },
    paginator: {
        justifyContent: "center",
        padding: "10px"
    }
}));
  

export default function ExploreDaos(props) {
    const[finished, setFinished] = useState(true)
    const[dataObj, setDataObj] = useState({})
    const[daos, setDaos] = useState([])

    const classes = useStyles()
    const { register, handleSubmit, watch, errors } = useForm()

    const {
        factoryContract,
        didsContract,
        aliases,
        daoList, 
        appIdx
    } = useContext(DaoCeramicAppContext)

    useEffect(
        () => {
            async function fetchData() {
                setDaos(daoList)
            }

            fetchData()

    }, [daoList]
    )
       
    return (
        <>
        <Grid container alignItems="center" justify="space-evenly" spacing={2} style={{marginTop:'40px', marginBottom:'40px'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} className={classes.featureDAO}>
                <Typography align="center" style={{color:'#1341a4', fontSize:'80px',fontWeight:'700', marginTop:'30px', lineHeight:'1em', verticalAlign:'middle'}}>{daoList ? daoList.length : 'Counting...'} DAOs Run on Catalyst</Typography>
            </Grid>
        </Grid>

        <Grid container alignItems="center" justify="space-evenly" spacing={2} style={{marginTop:'40px', marginBottom:'40px'}}>
            {daos && daos.length > 0 ? 
                daos.map((fr, i) => 
                   
                    <DAOCard
                        key={i}
                        contractId={fr}
                    />
                )
             : 'No Daos yet' }
        </Grid>
        </>
    )
}