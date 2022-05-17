import React, { useEffect, useState, useContext, useRef } from 'react'
import { appStore, onAppMount } from '../../state/app'
import AccountInfo from '../AccountInfo/accountInfo'

// Material UI
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

export default function FrontPage(props) {

    const { state, dispatch, update } = useContext(appStore)

    const {
        accountId,
        currentDaosList,
        near,
        wallet,
        appIdx,
        didRegistryContract,
        did,
        daoFactory,
        isUpdated
      } = state

    return(
        <Grid container spacing={1} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '15px', marginBottom: '15px'}}>
                Welcome to Catalyst
            </Grid>
        </Grid>
    )
}
