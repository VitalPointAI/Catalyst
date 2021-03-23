import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import CreateDemDAO from '../../CreateDAO/createDemDAO'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardHeader from '@material-ui/core/CardHeader'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import GroupAddIcon from '@material-ui/icons/GroupAdd'
import HowToVoteIcon from '@material-ui/icons/HowToVote'
import SendIcon from '@material-ui/icons/Send'
import GavelIcon from '@material-ui/icons/Gavel'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
  avatar: {
    backgroundColor: red[500],
  },
});


export default function DemDaoCard(props) {

    const[createDAOClicked, setCreateDAOClicked] = useState(false)

    const classes = useStyles();

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
        aliases,
        handleAliases,
        curUserIdx,
        appIdx,
        factoryContract } = props


    useEffect(
        () => {
         
    
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

    

    return(
        <>
        <Card className={classes.root}>
      
        <CardActionArea>
         
          <CardContent>
          
            <Typography gutterBottom variant="h5" component="h2">
                Democracy DAO
            </Typography>
          
            <List dense={true}>
                <ListItem>
                <ListItemIcon>
                    <GavelIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="People Rule" />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <GroupAddIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Anyone can join" />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <HowToVoteIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="One share = One vote" />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <SendIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="No vote delegation" />
                </ListItem>
            </List>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" color="primary" onClick={handleCreateDAOClick}>
            Create
          </Button>
          <Button size="small" color="primary">
            Learn More
          </Button>
        </CardActions>
      </Card>

      <Snackbar open={snackBarOpen} autoHideDuration={4000} onClose={snackBarHandleClose}>
      <Alert onClose={snackBarHandleClose} severity={severity}>
      {severity=='success' ? successMessage : errorMessage}
      </Alert>
      </Snackbar>

      {createDAOClicked ? <CreateDemDAO
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
        aliases={aliases}
        handleAliases={handleAliases}
        accountId={accountId}/> : null }
        </>
    )
}