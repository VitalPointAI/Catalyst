import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import Fuse from 'fuse.js'
import DaoCard from '../DAOCard/daoCard'
import { Header } from '../Header/header'
import Footer from '../../components/common/Footer/footer'
import SearchBar from '../../components/common/SearchBar/search'
import { dao } from '../../utils/dao'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

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
  
export default function Daos(props) {
   
    const[daos, setDaos] = useState([])
    const[daoCount, setDaoCount] = useState(0)
    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)
    const [searchDaos, setSearchDaos] = useState([])

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    let someDaos = []

    const {
      accountId,
      currentDaosList,
    } = state
    
    let sortedDaos 

    useEffect(
        () => {
            async function fetchData() {
                if(currentDaosList){
                    sortedDaos = _.sortBy(currentDaosList, 'created')
                    setDaos(sortedDaos)
                }
            }

            fetchData()

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
        
      }
    }

    const searchData = (pattern) => {
      if (!pattern) {
          let sortedDaos = _.sortBy(currentDaosList, 'created')
          setDaos(sortedDaos)
        
          return
      }
    
      
      const fuse = new Fuse(searchDaos, {
          keys: ['category'],
          findAllMatches: true
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
        <div className={classes.root}>
        <Header state={state}/>
       
        <Grid container alignItems="center" justifyContent="space-between" spacing={3} style={{padding: '20px'}} >
       
        { daos && daos.length > 0 ? 
                (<>
                  <Grid container alignItems="center" justifyContent="space-between" spacing={0} >
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <SearchBar
                          placeholder="Search"
                          onChange={(e) => searchData(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                <Grid container alignItems="center" justifyContent="center" spacing={3} style={{padding: '20px'}}>
                    {daos.filter(dao => dao.summoner == accountId).reverse().map(({ contractId, created, summoner }, i) =>
                    <DaoCard
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
                </Grid>
            </>)
            : null
            } 
        </Grid>
        </div>
        <Footer />
        </>
    )
}