import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import Import from '../Import/import'
import { Header } from '../Header/header'

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
  
export default function NewKey(props) {

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    useEffect(
        () => {
   
    }, []
    )
    
    return (
        
        <div className={classes.root}>
        <Header state={state}/>
        <Import />
        </div>
        
    )
}