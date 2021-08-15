import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import Fuse from 'fuse.js'
import SmallDaoCard from '../SmallDaoCard/smallDaoCard'
import Carousel from 'react-material-ui-carousel'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'

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
    const[daoCount, setDaoCount] = useState(0)
    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)
    const [searchDaos, setSearchDaos] = useState([])
    const [loaded, setLoaded] = useState(false)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    let someDaos = []

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

    function makeSearchDaos(dao){
      let i = 0
      let exists
      if(dao != false){
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
          console.log('search daos', searchDaos)
      }
    }

    const searchData = (pattern) => {
      if (!pattern) {
          let sortedDaos = _.sortBy(currentDaosList, 'created')
          setDaos(sortedDaos)
        
          return
      }
      console.log('searchDaos', searchDaos)
      
      const fuse = new Fuse(searchDaos, {
          keys: ['category'],
          findAllMatches: true
      })
      console.log('fuse', fuse)

      const result = fuse.search(pattern)
      console.log('fuse result', result)

      const matches = []
      if (!result.length) {
          setDaos([])
         
      } else {
          result.forEach(({item}) => {
              matches.push(item)
      })
      console.log('matches', matches)
          setDaos(matches)
         
      }
    }

    return (
        <>
        <div className={classes.root}>
        
       
        <Grid container alignItems="center" justifyContent="space-between" spacing={3} style={{padding: '20px'}} >
            { daos && daos.length > 0 ? 
                (<>
                  {console.log('daos', daos)}
                  <Grid container alignItems="center" justifyContent="space-between" spacing={0} >
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                     
                    </Grid>
                  </Grid>
                <Grid container alignItems="center" justifyContent="center" spacing={3} style={{padding: '20px', minHeight: '150px'}}>
                <Carousel
                    autoPlay={false}
                >
                
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
                        makeSearchDaos={makeSearchDaos}
                    />   
                    )}
                </Carousel>
                </Grid>
            </>)
            : null
            } 
        </Grid>
        </div>
       
        </>
    )
}