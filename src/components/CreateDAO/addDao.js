import React, { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { factorySuffix } from '../../state/near'
import { appStore, onAppMount } from '../../state/app';

//Material-UI Components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Divider from '@material-ui/core/Divider'
import WarningIcon from '@material-ui/icons/WarningTwoTone'
import InputAdornment from '@material-ui/core/InputAdornment'
import Grid from '@material-ui/core/Grid'
import Checkbox from '@material-ui/core/Checkbox'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'

const useStyles = makeStyles((theme) => ({
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  }));

export default function AddDaoForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [id, setId] = useState('')
    const [clicked, setClicked] = useState(false)

    const [periodDuration, setPeriodDuration] = useState('')
    const [votingPeriodLength, setVotingPeriodLength] = useState('')
    const [gracePeriodLength, setGracePeriodLength] = useState('')
    const [proposalDeposit, setProposalDeposit] = useState('')
    const [dilutionBound, setDilutionBound] = useState('')
    const [confirm, setConfirm] = useState(false)

    const { register, handleSubmit, watch, errors, transform } = useForm()

    const {
       handleAddDaoClick,
       handleSnackBarOpen, handleSuccessMessage, handleErrorMessage, snackBarOpen, severity, errorMessage, successMessage
    } = props
    
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    useEffect(() => {
        
    },[])

    const handleClose = () => {
        handleAddDaoClick(false)
        setOpen(!open)
    }

    const handlePeriodDurationChange = (event) => {
      setPeriodDuration(event.target.value);
    }

    const handleVotingPeriodLengthChange = (event) => {
        setVotingPeriodLength(event.target.value);
    }

    const handleGracePeriodLengthChange = (event) => {
        setGracePeriodLength(event.target.value);
    }

    const handleDilutionBoundChange = (event) => {
        setDilutionBound(event.target.value);
    }

    const handleProposalDepositChange = (event) => {
        setProposalDeposit(event.target.value);
    }

    const handleConfirmChange = (event) => {
      setConfirm(event.target.checked);
    }
    
        return (
            <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Create DAO</DialogTitle>
              <DialogContent>
                    
                        <TextField
                          fullWidth
                          id="daoName"
                          required
                          placeholder=" "
                          autoFocus
                          margin="dense"
                          variant="outlined"
                          name="id"
                          label="Dao Name"
                          helperText="2-48 characters, no spaces, no symbols (except -)"
                          minLength={state.app.accountTaken ? 999999 : 2}
                          maxLength={48}
                          pattern="^(([a-z\d]+[\-_])*[a-z\d]+$"
                          value={id}
                          inputRef={register({
                              validate: {
                              notTaken: value => !state.app.accountTaken
                              }        
                          })}
                          InputProps={{
                              endAdornment: <><InputAdornment position="end">{factorySuffix}</InputAdornment></>,
                          }}
                          onChange={(e) => {
                              const v = e.target.value.toLowerCase()
                              setId(v)
                              state.wallet.isDaoAccountTaken(v)
                          }}
                        />
                    {errors.id && <p style={{color: 'red'}}>You must provide an Dao name.</p>}
                    <div>
                        {state.app.accountTaken ? 'Dao name is already taken' : null}
                    </div>
                  
                   
     
                </DialogContent>
              {!finished ? <LinearProgress className={classes.progress} style={{marginBottom: '25px' }}/> : (
              <DialogActions>
              <Button
                disabled={state.app.accountTaken || clicked}
                variant="contained"
                color="primary"
                onClick={() => {
                  try{
                    let finish = state.wallet.fundDaoAccount(id, state.accountId)
                    // handleSuccessMessage('Successfully created Democracy DAO.', 'success')
                    // handleSnackBarOpen(true)
                    setFinished(true)
                    setOpen(false)
                    handleClose()
                  } catch (err) {
                    console.log('error creating dao', err)
                    // handleErrorMessage('There was a problem creating the Democracy DAO' + err.message, 'error')
                    // handleSnackBarOpen(true)
                    setFinished(true)
                    setOpen(false)
                    handleClose()
                  }
                  setFinished(false)
                }}>
                CREATE DAO
              </Button>
              
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
              </DialogActions>)}
              <Divider style={{marginBottom: 10}}/>
              
           
            </Dialog>
          </div>
        )
}