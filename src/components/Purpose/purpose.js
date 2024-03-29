import React, { useState, useEffect, useRef, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { ceramic } from '../../utils/ceramic'

// Material UI components
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 'auto',
    maxWidth: 325,
    minWidth: 325,
  },
  card: {
    margin: 'auto',
  },
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  confirmation: {
    textAlign: 'left',
    margin: 'auto',
    paddingTop: '20px'
  },
  rootForm: {
  '& > *': {
    margin: theme.spacing(1),
  },
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  }));

export default function Purpose(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [purpose, setPurpose] = useState('')
  
  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()
  const { state, dispatch, update } = useContext(appStore)
  const { 
    handlePurposeClickState, 
    contract,
    contractId,
    curDaoIdx } = props
  
  const {
    daoFactory,
    didRegistryContract,
    appIdx
  } = state

    useEffect(
      () => {

        async function fetchData(){
          if(contractId){
            let contractDid = await ceramic.getDid(contractId, daoFactory, didRegistryContract)
            let community = await appIdx.get('daoProfile', contractDid)
            community ? setPurpose(community.purpose) : setPurpose('Not set yet!')
          }
        }
        fetchData()
      }, []
      )

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handlePurposeClickState(false)
  }


  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Community Purpose</DialogTitle>
        <DialogContent className={classes.rootForm}>
              <Card>
              <CardContent>
                
              <div dangerouslySetInnerHTML={{ __html: purpose}}></div>
                
               
                </CardContent>
          </Card>
          </DialogContent>
        <DialogActions>
     
        <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
