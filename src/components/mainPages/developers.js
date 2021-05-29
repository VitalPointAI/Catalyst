import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { Header } from '../Header/header'
import Personas from '@aluhning/get-personas-js'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'

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
  
export default function Developers(props) {

    const [result, setResult] = useState()

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    useEffect(
        () => {
          async function fetchData() {

          let accountId = 'testing2.testnet'
          console.log('accountid', accountId)

          let Persona = new Personas()
          console.log(Persona)
          let result = await Persona.getPersona(accountId)
          
          console.log('dev result', result)
          setResult(result)
          }

          fetchData()
    }, []
    )
    
    return (
        
        <div className={classes.root}>
        <Header state={state}/>
        {result && result.avatar ? <img src={result.avatar}></img> : 'no avatar' }
        </div>
        
    )
}