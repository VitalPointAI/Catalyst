import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
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
        
          let Persona = new Personas()
         
          let result = await Persona.getData('profile', accountId, state.appIdx)
          
       
          setResult(result)
          }

          fetchData()
    }, []
    )
    
    return (
       placholder
    )
}