import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'


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


export default function RepDaoCard(props) {

    const[createDAOClicked, setCreateDAOClicked] = useState(false)

    const classes = useStyles();

    const { register, handleSubmit, watch, errors } = useForm()

    const {   
        accountId,
        hasDao,
        tokenName,
        contract,
        daoContract,
        handleInitChange,
        currentDaosList,
        depositToken,
        proposalDeposit,
        contractId,
        didsContract,
        idx,
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

   

    return(
        <>
        <Card className={classes.root}>
      
        <CardActionArea>
         
          <CardContent>
          
            <Typography gutterBottom variant="h5" component="h2">
                Republic DAO
            </Typography>
         
                <List dense={true}>
                    <ListItem>
                        <ListItemIcon>
                            <GavelIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Representatives Rule" />
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
                        <ListItemText primary="Vote delegation" />
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

     

      {createDAOClicked ? <CreateRepDAO
        contract={contract}
        factoryContract={factoryContract}
        handleCreateDAOClickState={handleCreateDAOClickState}
        depositToken={depositToken}
        proposalDeposit={proposalDeposit}
        tokenName={tokenName}
        daoContract={daoContract}
        didsContract={didsContract}
        idx={idx}
        accountId={accountId}/> : null }
        </>
    )
}