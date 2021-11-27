import React, { useState, useEffect, useContext} from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {appStore, onAppMount} from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import {get, set, del} from '../../utils/storage'
import {WARNING_FLAG} from '../../state/near'
import {ceramic} from '../../utils/ceramic'

// Material UI components
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import WarningIcon from '@material-ui/icons/WarningTwoTone'
import Checkbox from '@material-ui/core/Checkbox'

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

export default function WarningConfirmation(props) {

  const { state, dispatch, update } = useContext(appStore)
  
  const [open, setOpen] = useState(false)
  const [finished, setFinished] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [curDaoIdx, setCurDaoIdx] = useState()

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const {
      near,
      accountId,
      appIdx
  } = state

  const { 
      returnFunction
  } = props

  const {
      contractId
  } = useParams()

  useEffect(
    () => {
        async function fetchData(){
                let warningFlag = get(WARNING_FLAG, [])
                if(!warningFlag[0]){
                setOpen(true)
                }
    
            }
            let mounted = true
            if(mounted){
                fetchData()
                .then((res) => {
                               
                })
              return() => mounted = false
            }
        }, [near]
    )

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleSponsorConfirmationClickState(false)
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked);
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)

    let warningFlag = []
    warningFlag.push({'accepted':true})
    set(WARNING_FLAG, warningFlag)
    setFinished(true)
    setOpen(false)
    console.log("DID IT")

    if(appIdx){
    let resultArray = await ceramic.downloadKeysSecret(appIdx, 'waivers')
   
    console.log('waivers', resultArray)
    let now = new Date().getTime()
    // let hookArray = []
    resultArray.push(
      {
      account: accountId,
      time: now
      }
    )
    //must get curDaoIdx and accountId
    let result2 = await ceramic.storeKeysSecret(appIdx, resultArray, 'waivers', appIdx.id)
    }
    else if(!appIdx){
        console.log("NOID")
    }
    returnFunction() 
    
  }


  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Thanks For Your Interest in Catalyst</DialogTitle>
        <DialogContent className={classes.rootForm}>
              <Card>
              <CardContent align="center">
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body1">Catalyst is undergoing lots of testing.</Typography>
                <Typography variant="body1">It's contracts have not been audited.</Typography>
                <Typography variant="h6">Use at your own risk.</Typography>
                
                <Grid container className={classes.confirmation} spacing={1}>
                  <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                    <Checkbox
                      checked={confirm}
                      onChange={handleConfirmChange}
                      name="confirmCheck"
                      color="primary"

                      inputRef={register({
                        required: true
                      })}
                    />
                   
                  </Grid>
                  <Grid item xs={11} sm={11} md={11} lg={11} xl={11} style={{margin:'auto'}}>
                    <Typography variant="body2" style={{color: 'red', marginLeft: '15px'}}>You must confirm your understanding.</Typography>
                  </Grid>
                </Grid>
                </CardContent>
          </Card>
          </DialogContent>
        <DialogActions>
        {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Continue</Button></> : <LinearProgress className={classes.progress} />}
        </DialogActions>
      </Dialog>
    </div>
  );
}
