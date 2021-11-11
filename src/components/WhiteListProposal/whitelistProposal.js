import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { submitProposal, STORAGE, nameSuffix } from '../../state/near'
import FungibleTokens from '../../utils/fungibleTokens'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import InputAdornment from '@material-ui/core/InputAdornment'
import WarningIcon from '@material-ui/icons/WarningTwoTone'
import Grid from '@material-ui/core/Grid'
import Checkbox from '@material-ui/core/Checkbox'
import Avatar from '@material-ui/core/Avatar'


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

const defaultToken = require('../../img/default-coin.png') // default no-token image

export default function WhiteListProposal(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [token, setToken] = useState('')
  const [tokenImage, setTokenImage] = useState()
  const [tokenName, setTokenName] = useState()
  const [isToken, setIsToken] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [confirm, setConfirm] = useState(false)

  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { getMetadata } = FungibleTokens

  const { 
    state,
    handleWhitelistClickState,
    proposalDeposit,
    contractId,
    } = props

  useEffect(
    () => {
      if(state.app.accountTaken){
        getMetadata(token).then((meta) => {
          console.log('meta', meta)
          if(meta && meta.symbol != '') {
            setTokenName(meta.symbol)
            setIsToken(true)
            setDisabled(false)
          }
          if(meta && meta.icon != '') {
            setTokenImage(meta.icon)
            setIsToken(true)
            setDisabled(false)
          }
        })
      }
      if(!state.app.accountTaken) {
        setTokenName('')
        setTokenImage(defaultToken)
        setDisabled(true)
        setIsToken(false)
      }
    },[state.app.accountTaken, token]
  )

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    handleWhitelistClickState(false)
  }

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked)
  }

  const handleToken = (e) => {
    const v = e.target.value.toLowerCase()
    setToken(v)
    state.wallet.isToken(v)
  }

  const onSubmit = async (values) => {
    event.preventDefault()
    setFinished(false)
   
    try{
      await submitProposal(
        state.wallet,
        contractId,
        'Whitelist',
        state.accountId,
        '0',
        '0',
        '0',
        '0',
        [''],
        [],
        token
        )
      } catch (err) {
        console.log('problem submitting whitelist proposal', err)
      }
}

  return (
    <div>
     
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Propose Token to Whitelist</DialogTitle>
        <DialogContent className={classes.rootForm}>  
        {!finished ? <LinearProgress className={classes.progress} /> : (
          <DialogContentText style={{marginBottom: 10}}>
          Enter the account name of the token you wish to have whitelisted.
          </DialogContentText>)}

          <Grid container alignItems="center" justifyContent="center" spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <TextField
                id="tokenName"
                required
                placeholder="yourtoken.tkn.near"
                autoFocus
                margin="dense"
                variant="outlined"
                name="token"
                label="Token Account Name"
                helperText="2-48 characters, no spaces, no symbols (except -)"
                minLength={state.app.accountTaken ? 999999 : 2}
                maxLength={48}
                pattern="^(([a-z\d]+[\-_])*[a-z\d]+$"
                value={token}
                inputRef={register({
                    validate: {
                    exists: value => isToken
                    }        
                })}
               
                onChange={handleToken}
              />
              {errors.token && <p style={{color: 'red'}}>You must provide a valid token account name.</p>}
              <div>
                  {!isToken ? 'Not a valid token account name.' : null}
              </div>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Avatar src={tokenImage ? tokenImage : defaultToken} /><br></br>
                <Typography variant="h6">{tokenName}</Typography>
                <Typography variant="overline">{token}</Typography>
            </Grid>
          </Grid>
            
            <Card>
        <CardContent>
          <WarningIcon fontSize='large' className={classes.warning} />
          <Typography variant="body1" gutterBottom>You are proposing to whitelist {tokenName}. After submitting
          this proposal, you must provide enough supporting detail to help other members vote on and decide whether to approve your proposal or not.</Typography> 
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
            <Grid item xs={10} sm={10} md={10} lg={10} xl={10} style={{margin:'auto'}}>
              <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{parseFloat(proposalDeposit) + parseFloat(STORAGE)} Ⓝ</b>:</Typography>
              <Grid container justifyContent="center" spacing={0}>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="body2"><u>Proposal passes:</u></Typography>
                    <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                      <li>
                        <Typography variant="body2">{token} will be whitelisted.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{proposalDeposit} Ⓝ proposal deposit is returned to you.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{STORAGE} Ⓝ is put in the contract to cover storage cost for this proposal.</Typography>
                      </li>
                    </ul>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="body2"><u>Proposal fails or is cancelled:</u></Typography>
                    <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                      <li>
                        <Typography variant="body2">{token} is not whitelisted.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{proposalDeposit} Ⓝ proposal deposit is returned to you.</Typography>
                      </li>
                      <li>
                        <Typography variant="body2">{STORAGE} Ⓝ stays in the contract to cover storage cost for this proposal.</Typography>
                      </li>
                    </ul>
                </Grid>
              </Grid>
             </Grid>
            </Grid>
          </CardContent>
         </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit(onSubmit)} disabled={disabled} color="primary" type="submit">
            Submit Whitelist Proposal
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
