import React, { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { appStore, onAppMount } from '../../state/app';
import { useForm } from 'react-hook-form'
import { get, set, del } from '../../utils/storage'
const base58 = require('bs58')


// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { CardActions, CardHeader } from '@material-ui/core'
import { ACCOUNT_LINKS } from '../../state/near'

const bip39 = require('bip39')

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 50
  },
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  customCard: {
    maxWidth: 300,
    minWidth: 275,
    margin: 'auto',
    padding: 20
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
  }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function Import(props) {
    const[seedPhrase, setSeedPhrase] = useState(bip39.generateMnemonic())
    const [seedHidden, setSeedHidden] = useState(true)
    const [exists, setExists] = useState(true)
    const [recoverSeed, setRecoverSeed] = useState('')
    
    const classes = useStyles()

    const { register, handleSubmit, watch, errors } = useForm()

    const { state, dispatch, update } = useContext(appStore);

    const {
      accountId
    } = state
    
    useEffect(
      () => {

        async function fetchData() {
         
          let currentAccounts = get(ACCOUNT_LINKS, [])
          let i = 0
          let exists = false
          while (i < currentAccounts.length) {
            if(currentAccounts[i].accountId == accountId){
              exists = true
              break
            }
            i++
          }
          if(exists){
            setExists(true)
          } else {
            setExists(false)
          }
        }

        fetchData()
         
      }, [recoverSeed])

      const onSubmit = async (values) => {
        let currentAccounts = get(ACCOUNT_LINKS, [])
        let newAccount = { key: (base58.encode(await bip39.mnemonicToSeed(seedPhrase))), accountId: accountId, owner: accountId, keyStored: Date.now() }
        currentAccounts.push(newAccount)
        set(ACCOUNT_LINKS, currentAccounts)
        window.location.assign('/')
        setExists(true)
      }

      const onRecover = async (values) => {
        let currentAccounts = get(ACCOUNT_LINKS, [])
        let newAccount = { key: (base58.encode(await bip39.mnemonicToSeed(recoverSeed))), accountId: accountId, owner: accountId, keyStored: Date.now() }
        currentAccounts.push(newAccount)
        set(ACCOUNT_LINKS, currentAccounts)
        window.location.assign('/')
        setExists(true)
      }

      return (
        <>
        {!exists ?
        (<Grid container spacing={1}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
            <Typography variant="h5" style={{marginTop:'20px', marginBottom: '20px'}}>Oops, Looks Like This Account is Missing it's Seed!</Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
          <Card>
          <CardHeader 
            title="Have Your Seed Phrase?"
            align="center"
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>If you have your Catalyst 12 word seed phrase, enter it below.</Typography>
            <Typography variant="body1" gutterBottom>Note: Recommend you do not use your account's private key seed phrase here.</Typography>
            <div class="form-floating mb-3" align="center">
                <div>
                  <TextField
                      fullWidth
                      id="recoverPhrase"
                      required
                      placeholder="12 word seed phrase"
                      autoFocus
                      margin="dense"
                      variant="outlined"
                      name="id"
                      label="12 Word Recovery Seed Phrase"
                      helperText="12 words, 1 space between each word"
                      value={recoverSeed}
                      onChange={(e) => {
                          const v = e.target.value.toLowerCase()
                          setRecoverSeed(v)
                      }}
                  />
                </div>
              <Button color="primary" onClick={handleSubmit(onRecover)}>
                  Recover It!
              </Button>
            </div>
          </CardContent>
          </Card>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
          <Card>
          <CardHeader 
            title="Lost Your Seed Phrase?"
            align="center"
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>This will set a new 12 word seed phrase for this account that is unique to Catalyst.</Typography>
            <Typography variant="body1" gutterBottom>It does not allow access to your wallet, however, you should still protect it and treat it like any other secret key.</Typography>
            <Typography variant="body1" gutterBottom>You will need it to recover your data if your browser's localstorage gets cleared.</Typography>
            <Typography variant="body1" gutterBottom>Catalyst cannot recover this seed for you.</Typography>
            <div class="form-floating mb-3" align="center">
            {seedHidden && <Button color="primary" style={{marginBottom: '10px'}} onClick={() => { setSeedHidden(!seedHidden) }}>
                REVEAL MY SECRET SEED PHRASE
            </Button>}
           
                <textarea readonly class="form-control" id="seedPhrase" value={seedHidden ? `************` : seedPhrase} style={{marginTop: '10px', marginBottom: '10px'}}/>
            
            {!seedHidden && <Button color="primary" onClick={handleSubmit(onSubmit)}>
                  I Wrote It Down! Set It!
              </Button>
            }
            </div>
          </CardContent>
          </Card>
          </Grid>
        </Grid>) : null }
        </>
    )
  
}