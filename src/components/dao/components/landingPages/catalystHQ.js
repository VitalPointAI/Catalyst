import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import styled from 'styled-components'
import { utils } from 'near-api-js'

import CreateDAO from '../CreateDAO/createRepDAO'
import OliDaoCard from './DaoFrameworks/oliDaoCard'
import PlutoDaoCard from './DaoFrameworks/plutoDaoCard'
import RepDaoCard from './DaoFrameworks/repDaoCard'
import AutoDaoCard from './DaoFrameworks/autoDaoCard'
import DemDaoCard from './DaoFrameworks/demDaoCard'

// Material UI components
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import Container from'@material-ui/core/Container'

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
  
const StyledContainer = styled.div`

    &&& {
        margin: 35px 5px 0 5px;
        position: relative;
      //  text-align: center;

        @media (max-width: 767px) {
            margin: 0;
            overflow: hidden;
            margin-top: -13px;
        }

        svg {
            opacity: 0.4;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            z-index: -1;

            @media (max-width: 992px) {
                top: -120px;
            }

            @media (max-width: 470px) {
                top: -86px;
                width: 900px;
                left: unset;
            }
        }

        .small-centered {
            padding-top: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        h1 {
            font-weight: 600;
        }

        h3 {
            font-weight: 400 !important;

            span {
                span {
                    font-weight: 500;
                }
            }
        }

        .buttons {
            margin-top: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1;

            .blue {
                font-weight: 500 !important;
                letter-spacing: normal;
                margin: 0;
                text-transform: none;

                :not(.link) {
                    min-width: 200px;
                    max-width: 220px;
                    height: auto;
                    text-transform: none;
                    padding: 12px 6px;
                }
            }

            .link {
                text-decoration: none;
                padding: 0;
                :hover {
                    background-color: transparent;
                    text-decoration: underline;
                }
            }

            span {
                margin: 20px;
            }

            @media (min-width: 768px) {
                flex-direction: row;
            }
        }

        .img-wrapper {
            min-height: 300px;

            @media (min-width: 768px) {
                min-height: 600px;
            }
        }

        img {
            margin-top: 65px;
            margin-bottom: 50px;
            width: 500px;
            height: auto;

            @media (min-width: 768px) {
                width: 675px;
                margin-bottom: 75px;
            }
        }

        .email-subscribe {
            margin-top: -140px;
            margin-bottom: 50px;
            padding-top: 80px;

            @media (max-width: 767px) {
                margin-bottom: 0;
                margin-top: -100px;
            }
        }
    }
`

export default function HQ(props) {
    const itemsPerPage = 10
    const[finished, setFinished] = useState(true)
    const[createDAOClicked, setCreateDAOClicked] = useState(false)
    const[page, setPage] = useState(1)
    const[noOfPages, setNoOfPages] = useState()

    const classes = useStyles()
    const { register, handleSubmit, watch, errors } = useForm()

    const {   
        accountId,
        hasDao,
        tokenName,
        contract,
        handleSuccessMessage,
        handleErrorMessage,
        handleSnackBarOpen,
        snackBarOpen,
        severity,
        errorMessage,
        successMessage,
        daoContract,
        handleInitChange,
        daoList,
        depositToken,
        proposalDeposit,
        contractId,
        didsContract,
        curUserIdx,
        appIdx,
        ceramicClient,
        appClient,
        factoryContract } = props

    useEffect(
        () => {
        async function fetchData() {
            if(daoList){
                setNoOfPages(Math.ceil(daoList.length/itemsPerPage))
            }
        }
        fetchData()
            .then((res) => {

            })
    }, []
    )

    const handleCreateDAOClick = () => {
        setCreateDAOClicked(true)
        };

    function handleCreateDAOClickState(property) {
    setCreateDAOClicked(property)
    }
       
    const snackBarHandleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        handleSnackBarOpen(false);
        };
    
    function Alert(props) {
        return <MuiAlert elevation={6} variant="filled" {...props} />
    }

    const handleChange = (event, value) => {
        setPage(value)
    }

    const onSubmit = async (values) => {
        setFinished(false)
        let finished

        let accountName = accountId.split('.')
       
        let name = accountName[0]
      
            // create DAO for account
            try{
                finished = await factoryContract.createDAO({
                        name: name
                    }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount(process.env.FACTORY_DEPOSIT))
                  
              
                handleSuccessMessage('Successfully created DAO.', 'success')
                handleSnackBarOpen(true)
                setFinished(true)
            } catch (err) {
                console.log('error creating dao', err)
                handleErrorMessage('There was a problem creating the DAO' + err.message, 'error')
                handleSnackBarOpen(true)
                setFinished(true)
            }
        
    }

    const onDeleteSubmit = async (values) => {
        setFinished(false)
        let finished
        console.log('delete contract', contract)
        try {
        let accountName = accountId.split('.')
        console.log('accountName', accountName[0])
        let name = accountName[0]
        
            // create Fleet for account
           finished = await contract.deleteDAO({
                name: name,
                beneficiary: accountId
            }, process.env.DEFAULT_GAS_VALUE)
            console.log('finished', finished)
            if(finished) {
                handleSuccessMessage('Successfully deleted DAO.', 'success')
                handleSnackBarOpen(true)
            } else {
                console.log('error deleting Dao')
                handleErrorMessage('There was a problem deleting the DAO' + err.message, 'error')
                handleSnackBarOpen(true)
                setFinished(true)
            }
        
        } catch (err) {
        console.log('error deleting dao', err)
        handleErrorMessage('There was a problem deleting the DAO' + err.message, 'error')
        handleSnackBarOpen(true)
        setFinished(true)
        }
        if(finished) {
            setFinished(true)
        }
    }

    


    return (
        <>
       <Container>
            <Grid container alignItems="center" justify="space-evenly" spacing={2} style={{marginTop:'40px', marginBottom:'40px'}}>
                <Grid item xs={12} sm={12} md={8} lg={8} xl={8} >
                    <Typography style={{color:'#2d68e6', fontSize:'80px',fontWeight:'700', lineHeight:'1em', marginBottom:'10px', alignVertical:'middle'}}>Choose Your DAO's Governance Model</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={4} xl={4} >
                    <DemDaoCard 
                        contract={contract}
                        factoryContract={factoryContract}
                        handleCreateDAOClickState={handleCreateDAOClickState}
                        depositToken={depositToken}
                        proposalDeposit={proposalDeposit}
                        tokenName={tokenName}
                        handleSnackBarOpen={handleSnackBarOpen}
                        handleErrorMessage={handleErrorMessage}
                        handleSuccessMessage={handleSuccessMessage}
                        daoContract={daoContract}
                        didsContract={didsContract}
                        curUserIdx={curUserIdx}
                        appIdx={appIdx}
                        accountId={accountId}
                    />
                </Grid>
            </Grid>
            <Grid container alignItems="stretch" justify="space-evenly" spacing={2}>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} >
                    <OliDaoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} >
                    <PlutoDaoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} >
                    <RepDaoCard 
                        contract={contract}
                        factoryContract={factoryContract}
                        handleCreateDAOClickState={handleCreateDAOClickState}
                        depositToken={depositToken}
                        proposalDeposit={proposalDeposit}
                        tokenName={tokenName}
                        handleSnackBarOpen={handleSnackBarOpen}
                        handleErrorMessage={handleErrorMessage}
                        handleSuccessMessage={handleSuccessMessage}
                        daoContract={daoContract}
                        didsContract={didsContract}
                        curUserIdx={curUserIdx}
                        appIdx={appIdx}
                        accountId={accountId}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} >
                    <AutoDaoCard />
                </Grid>
            </Grid>
                
           
        </Container>
        
        <Snackbar open={snackBarOpen} autoHideDuration={4000} onClose={snackBarHandleClose}>
        <Alert onClose={snackBarHandleClose} severity={severity}>
        {severity=='success' ? successMessage : errorMessage}
        </Alert>
        </Snackbar>
        
        {createDAOClicked ? <CreateDAO
            contract={contract}
            factoryContract={factoryContract}
            handleCreateDAOClickState={handleCreateDAOClickState}
            depositToken={depositToken}
            proposalDeposit={proposalDeposit}
            tokenName={tokenName}
            handleSnackBarOpen={handleSnackBarOpen}
            handleErrorMessage={handleErrorMessage}
            handleSuccessMessage={handleSuccessMessage}
            daoContract={daoContract}
            didsContract={didsContract}
            curUserIdx={curUserIdx}
            appIdx={appIdx}
            accountId={accountId}/> : null }
        
        </>
    )
}