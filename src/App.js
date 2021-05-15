import React, { useState, useContext, useEffect } from 'react';
import { appStore, onAppMount } from './state/app';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams
  } from "react-router-dom";

import { Container } from './components/Container'
import { Receiver } from './components/Receiver'
import { PersonaPage } from './components/mainPages/personas'
import ExploreDaos from './components/mainPages/exploreDaos'
import CreateDao from './components/mainPages/createDao'
import AppFramework from './components/AppFramework/appFramework'
import { Home } from './components/Home'
import Daos from './components/mainPages/daos'

// Material-UI Components
import { CircularProgress } from '@material-ui/core';

// helpers
export const btnClass = 'btn btn-sm btn-outline-primary mb-3 '
export const flexClass = 'd-flex justify-content-evenly align-items-center '
export const qs = (s) => document.querySelector(s)

const App = () => {
    const { state, dispatch, update } = useContext(appStore);

    const [errorMessage, setErrorMessage] = useState()
    const [severity, setSeverity] = useState()
    const [successMessage, setSuccessMessage] = useState()
    const [snackBarOpen, setSnackBarOpen] = useState(false)

    const onMount = () => {
        dispatch(onAppMount());
    };
    useEffect(onMount, []);

    window.onerror = function (message, url, lineNo) {
        alert('Error: ' + message + 
       '\nUrl: ' + url + 
       '\nLine Number: ' + lineNo);
    return true;   
    }

    function handleErrorMessage(message, severity) {
        setErrorMessage(message)
        setSeverity(severity)
      }
    
    function handleSuccessMessage(message, severity) {
    setSuccessMessage(message)
    setSeverity(severity)
    }

    function handleSnackBarOpen(property) {
    setSnackBarOpen(property)
    }

   
    
    const {
        accountData, funding, wallet
    } = state
    
    let children = null

    if (!accountData || !wallet) {
        children = <CircularProgress />
    }

    if (accountData) {
        children = <Receiver {...{ state, dispatch }} />
    }

    if (funding) {
        children = <div class="container container-custom">
            <h2>DO NOT CLOSE OR REFRESH THIS PAGE</h2>
            <h2>Creating Persona...</h2>
        </div>
    }

    if (wallet) {
        children = <PersonaPage {...{ state, dispatch, update }} />
    }
    
    return(
        <Router>
            <Switch>
                <Route exact path="/">
                    <Home 
                        state={state}
                        handleSnackBarOpen={handleSnackBarOpen}
                        handleSuccessMessage={handleSuccessMessage}
                        handleErrorMessage={handleErrorMessage}
                        snackBarOpen={snackBarOpen}
                        severity={severity}
                        errorMessage={errorMessage}
                        successMessage={successMessage}>
                        { children }
                    </Home>
                </Route>
                <Route path="/daos">
                    <Daos state={state}/>
                </Route>
                <Route path="/explore">
                    <ExploreDaos state={state}/>
                </Route>
                <Route path="/personas">
                    <Container state={state}
                        handleSnackBarOpen={handleSnackBarOpen}
                        handleSuccessMessage={handleSuccessMessage}
                        handleErrorMessage={handleErrorMessage}
                        snackBarOpen={snackBarOpen}
                        severity={severity}
                        errorMessage={errorMessage}
                        successMessage={successMessage}>{ children }
                    </Container>
                </Route>
                <Route path="/createDao">
                    <CreateDao 
                        state={state}
                        handleSnackBarOpen={handleSnackBarOpen}
                        handleSuccessMessage={handleSuccessMessage}
                        handleErrorMessage={handleErrorMessage}
                        snackBarOpen={snackBarOpen}
                        severity={severity}
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                    />
                </Route>
                <Route path="/dao/:contractId">
                    <AppFramework
                        state={state}
                        handleSnackBarOpen={handleSnackBarOpen}
                        handleSuccessMessage={handleSuccessMessage}
                        handleErrorMessage={handleErrorMessage}
                        snackBarOpen={snackBarOpen}
                        severity={severity}
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                    />
                </Route>
            </Switch>
        </Router>
    )
}

export default App;
