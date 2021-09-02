import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import SmallDaoCard from '../SmallDaoCard/smallDaoCard'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

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
  
export default function Communities(props) {
   
    const[daos, setDaos] = useState([])
    const [isUpdated, setIsUpdated] = useState(false)
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      currentDaosList,
    } = state

    useEffect(
        () => {
            if(currentDaosList){
                let sortedDaos = _.sortBy(currentDaosList, 'created')
                setDaos(sortedDaos)
            }
    }, [currentDaosList, isUpdated]
    )
    
    function handleEditDaoClick(property){
        setEditDaoClicked(property)
    }

    function handleUpdate(){
        setIsUpdated(!isUpdated)
    }

    return (
        <>
        <div className={classes.root}>
        
       
        <Grid container alignItems="center" justifyContent="space-between" spacing={3} style={{padding: '20px'}} >
            { daos && daos.length > 0 ? 
                (<>
               
                  <Grid container alignItems="center" justifyContent="space-between" spacing={0} >
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                     
                    </Grid>
                  </Grid>
                <Grid container alignItems="center" justifyContent="center" spacing={3} style={{padding: '20px', minHeight: '150px'}}>
               
                {daos.filter(dao => dao.summoner == accountId).reverse().map(({ contractId, created, summoner }, i) =>
                    <SmallDaoCard
                        key={i}
                        contractId={contractId}
                        summoner={summoner}
                        created={created}
                        link={''}
                        state={state}
                        handleEditDaoClick={handleEditDaoClick}
                        handleUpdate={handleUpdate}
                    />   
                    )}
               
                </Grid>
            </>)
            : ( 
                <Grid container alignItems="center" justifyContent="center" spacing={0} >
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="body1">This persona has not founded any communities yet.</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )
            } 
        </Grid>
        </div>
       
        </>
    )
}