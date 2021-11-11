import React, { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { tokenFactorySuffix } from '../../state/near'
import { TOKEN_FACTORY_DEPOSIT } from '../../state/near'
import { appStore, onAppMount } from '../../state/app'

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



const useStyles = makeStyles((theme) => ({
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  root: {
    margin: 'auto'
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  }));

export default function AddFTForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [id, setId] = useState('')
    const [clicked, setClicked] = useState(false)
    const [confirm, setConfirm] = useState(false)

    const { register, handleSubmit, watch, errors, transform } = useForm()

    const {
       handleAddFTClick,
    } = props
    
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      wallet,
      app
    } = state

    useEffect(() => {
        
    },[])

    const handleClose = () => {
        handleAddFTClick(false)
        setOpen(!open)
    }

    const handleConfirmChange = (event) => {
      setConfirm(event.target.checked)
    }

    const onSubmit = async (values) => {
      try{
        wallet.fundFTAccount(id, accountId)
      } catch (err) {
        console.log('error creating dao', err)
      }
    }
    
        return (
            <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" className={classes.root}>
              <DialogTitle id="form-dialog-title">Create Fungible Token</DialogTitle>
              <DialogContent>
                    
                        <TextField
                          fullWidth
                          id="ftName"
                          required
                          placeholder=" "
                          autoFocus
                          margin="dense"
                          variant="outlined"
                          name="id"
                          label="Fungible Token Name"
                          helperText="2-48 characters, no spaces, no symbols (except -)"
                          minLength={state.app.accountTaken ? 999999 : 2}
                          maxLength={48}
                          pattern="^(([a-z\d]+[\-_])*[a-z\d]+$"
                          value={id}
                          inputRef={register({
                              validate: {
                              notTaken: value => !app.accountTaken
                              }        
                          })}
                          InputProps={{
                              endAdornment: <><InputAdornment position="end">{tokenFactorySuffix}</InputAdornment></>,
                          }}
                          onChange={(e) => {
                              const v = e.target.value.toLowerCase()
                              setId(v)
                              wallet.isFTAccountTaken(v)
                          }}
                        />
                    {errors.id && <p style={{color: 'red'}}>You must provide an community account name.</p>}
                    <div>
                        {app.accountTaken ? 'Token name is already taken' : null}
                    </div>                
                   
                    <Card>
                      <CardContent>
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
                              <WarningIcon fontSize='large' className={classes.warning} />
                              <Typography variant="body2" gutterBottom>Creating a token requires <b>{parseFloat(TOKEN_FACTORY_DEPOSIT)} Ⓝ</b>.</Typography>
                              <Typography variant="body2">The <b>{TOKEN_FACTORY_DEPOSIT} Ⓝ</b> covers your token's contract storage costs on the NEAR chain.</Typography>     
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                   
     
                </DialogContent>
              {!finished ? <LinearProgress className={classes.progress} style={{marginBottom: '25px' }}/> : (
              <DialogActions>
              <Button
                disabled={app.accountTaken || clicked}
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSubmit)}
                >
                CREATE TOKEN
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