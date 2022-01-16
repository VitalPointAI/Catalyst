import React, { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { nameSuffix, parseNearAmount, STORAGE, GAS } from '../../state/near'
import { appStore, onAppMount } from '../../state/app'
import { ceramic } from '../../utils/ceramic'
import * as nearAPI from 'near-api-js'
import { generateSeedPhrase } from 'near-seed-phrase'

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

const { seedPhrase, publicKey } = generateSeedPhrase()

export default function RegisterForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [id, setId] = useState('')
    const [clicked, setClicked] = useState(false)
    const [confirm, setConfirm] = useState(false)
    const [seedHidden, setSeedHidden] = useState(true)
   // const [did, setDid] = useState()

    const { register, handleSubmit, watch, errors, transform } = useForm()

    const {
       handleRegisterClickState,
    } = props
    
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      wallet,
      app,
      didRegistryContract,
      near,
      appIdx,
      did
    } = state

    useEffect(() => {
        async function fetchData() {
       
          let thisDid = await generateDid()
          console.log('this did', thisDid)
          setDid(thisDid)
          
        }
        fetchData()
    },[])

    const handleClose = () => {
        handleRegisterClickState(false)
        setOpen(!open)
    }

    const handleConfirmChange = (event) => {
      setConfirm(event.target.checked)
    }

    

    async function generateDid(accountId){
      let account = new nearAPI.Account(near.connection, accountId)
      let newIDX = await ceramic.getCurrentDaoIdx(account, appIdx, near, didRegistryContract, seedPhrase)
      console.log('newIdx', newIDX)
      return newIDX.id
    }

    const onSubmit = async (values) => {
      if(did){
        try{
          await didRegistryContract.putDID({
            accountId: accountId,
            did: did
          }, GAS, parseNearAmount((parseFloat(STORAGE)).toString()))
        } catch (err) {
          console.log('error registering dao', err)
        }
      }
    }
    
        return (
            <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" className={classes.root}>
              <DialogTitle id="form-dialog-title">Register</DialogTitle>
              <DialogContent>
                    <Typography variant="h3">{accountId}</Typography>
                    <Grid container alignItems="center" justifyContent="center">
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                        <Card>
                        <CardContent>
                          
                          <Divider variant="middle" />
                          <Typography variant="h5" gutterBottom >IMPORTANT!</Typography>
                          <Typography variant="body1" gutterBottom>Your seed phrase is like an account password. 
                          We <b>do not store it for you and can't recover it</b>.  If you lose it, 
                          you can not access change the profile data for the account you are registering.</Typography>
                          <Typography variant="body1">It's a good idea to write it down and store it somewhere safe (offline) and <b>do not share it with anyone.</b></Typography>
                        </CardContent>
                        </Card> 
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                      {seedHidden && <Button color="primary" style={{marginBottom: '10px'}} onClick={() => {
                          setSeedHidden(!seedHidden)
                      }}>
                          REVEAL MY SECRET SEED PHRASE
                      </Button>}
                      </Grid>
                    </Grid>
                    <div class="form-floating mb-3" align="center">
                        <textarea readonly class="form-control" id="seedPhrase" value={seedHidden ? `************` : seedPhrase} />
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
                              <Typography variant="body2" gutterBottom>Registration requires <b>{parseFloat(STORAGE)} Ⓝ</b> to help cover NEAR storage costs.</Typography>    
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                   
     
                </DialogContent>
              {!finished ? <LinearProgress className={classes.progress} style={{marginBottom: '25px' }}/> : (
              <DialogActions>
              <Button
                disabled={!app.accountTaken || clicked}
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSubmit)}
                >
                REGISTER
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