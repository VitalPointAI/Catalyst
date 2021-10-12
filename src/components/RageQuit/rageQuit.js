import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { rageQuit } from '../../state/near'


// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'

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
    state,
    contractId,
    depositToken,
    handleRageQuitClickState, 
    accountId,
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
           
          })

    },[])

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleRageQuitClickState(false)
  };

  const handleSharesToBurnChange = (event) => {
    setShares(event.target.value.toString());
  };

  const handleLootToBurnChange = (event) => {
    setLoot(event.target.value.toString());
  };

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)
    
    try {
      await rageQuit(
        state.wallet,
        contractId,
        sharesToBurn,
        lootToBurn
        )
      } catch (err) {
        console.log('problem with rage quit', err)
      }
      setFinished(true)
      setOpen(false)
      handleClose()
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
            <Typography variant="body1">You can burn and then withdraw up to the following:</Typography>
            <Typography variant="h5">Shares: {memberShares}</Typography>
            <Typography variant="h5">Loot: {memberLoot}</Typography>
            </DialogContentText>)}
            <Typography variant="h5" style={{marginBottom: 20}}>{applicant}</Typography>
              <div>
                <TextField
                    autoFocus
                    margin="dense"
                    id="ragequit-sharesToBurn"
                    variant="outlined"
                    name="shares"
                    label="Shares to Burn"
                    placeholder="0"
                    value={shares}
                    onChange={handleSharesToBurnChange}
                    inputRef={register({              
                      required: true,
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
              placeholder="0"
              value={loot}
              onChange={handleLootToBurnChange}
              inputRef={register({              
                required: true,
              })}
              InputProps={{
                endAdornment: <InputAdornment position="end">Ⓝ</InputAdornment>,
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
                Rage Quit
        </Button>
        <Button onClick={handleClose} color="primary">
            Cancel
        </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
