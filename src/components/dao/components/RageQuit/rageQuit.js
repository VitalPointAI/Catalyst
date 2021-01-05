import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Big from 'big.js'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Chip from '@material-ui/core/Chip'
import Paper from '@material-ui/core/Paper'

const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed()


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

export default function RageQuit(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [applicant, setApplicant] = useState(props.accountId)
  const [shares, setShares] = useState('0')
  const [loot, setLoot] = useState('0')
  const [memberShares, setMemberShares] = useState()
  const [memberLoot, setMemberLoot] = useState()
  

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()
  const { 
    handleRageQuitClickState, 
    handleProposalEventChange,
    handleGuildBalanceChanges,
    handleEscrowBalanceChanges,
    tokenName, 
    minSharePrice,
    accountId,
    depositToken,
    contract } = props

    useEffect(() => {
        async function fetchData() {
            let shares = await contract.getMemberShares({member: accountId})
            setMemberShares(shares)
            let loot = await contract.getMemberLoot({member: accountId})
            setMemberLoot(loot)
        }
       
        fetchData()
          .then((res) => {
            console.log('res', res)
          })

    },[])

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleRageQuitClickState(false)
    setOpen(false)
  };

  const handleSharesToBurnChange = (event) => {
    setShares(event.target.value.toString());
  };

  const handleLootChange = (event) => {
    setLoot(event.target.value.toString());
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)
    
    let finished = await contract.ragequit({
                    sharesToBurn: parseInt(shares),
                    lootToBurn: parseInt(loot)
                    }, BOATLOAD_OF_GAS)
                  
    let changed = await handleProposalEventChange()
    
    if(finished && changed) {
      setFinished(true)
      setOpen(false)
      handleRageQuitClickState(false)
    }
  }

  const isShares = shares.length > 0
  const isLoot = loot.length > 0

  return (
    <div>
     
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Rage Quit</DialogTitle>
        <DialogContent>
        {!finished ? <LinearProgress className={classes.progress} /> : (
            <DialogContentText style={{marginBottom: 10}}>
            You can burn and then withdraw up to the following:
            <Typography component="h5">Shares: {memberShares}</Typography>
            <Typography component="h5">Loot: {memberLoot}</Typography>
            </DialogContentText>)}
            <Typography component="h5" style={{marginBottom: 20}}>{applicant}</Typography>
              <div>
                <TextField
                    autoFocus
                    margin="dense"
                    id="ragequit-sharesToBurn"
                    variant="outlined"
                    name="shares"
                    label="Shares to Burn"
                    placeholder="10"
                    value={shares}
                    onChange={handleSharesToBurnChange}
                    inputRef={register({              
                    })}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">Shares</InputAdornment>,
                    }}
                />
              {errors.shares && <p style={{color: 'red'}}>You must provide a number.</p>}
            </div><div>
            <TextField
              margin="dense"
              id="ragequit-lootToBurn"
              variant="outlined"
              name="loot"
              label="Loot To Burn"
              placeholder="1"
              value={loot}
              onChange={handleLootChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">{tokenName}</InputAdornment>,
                }}
              />
              {errors.loot && <p style={{color: 'red'}}>You must provide a number.</p>}
              </div>
          </DialogContent>
        <DialogActions>
        <Button 
            disable = {isShares || isLoot ? false : true}
            onClick={handleSubmit(onSubmit)} 
            color="primary" 
            type="submit">
                Submit Rage Quit
        </Button>
        <Button onClick={handleClose} color="primary">
            Cancel
        </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
