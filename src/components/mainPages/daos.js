import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import DaoCard from '../DAOCard/daoCard'
import { Header } from '../Header/header'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

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
  
export default function Daos(props) {
   
    const[daos, setDaos] = useState([])
    const[daoCount, setDaoCount] = useState(0)
    const [editDaoClicked, setEditDaoClicked] = useState(false)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      daoList,
    } = state

    useEffect(
        () => {
   
    }, []
    )
    
    function handleEditDaoClick(property){
        setEditDaoClicked(property)
    }

    return (
        
        <div className={classes.root}>
        <Header state={state}/>

        <Grid container alignItems="center" justify="flex-start" spacing={2}>
            { daoList && daoList.daoList.length > 0 ? 
                (<>
                  {console.log('daos', daoList)}
                {daoList.daoList.filter(dao => dao.summoner == accountId).map(({ contractId, date, summoner }, i) =>
                    <DaoCard
                        key={i}
                        contractId={contractId}
                        created={date}
                        summoner={summoner}
                        link={''}
                        handleEditDaoClick={handleEditDaoClick}
                    />              
                )}
            </>)
            : null
            } 
        </Grid>
        </div>
        
    )
}