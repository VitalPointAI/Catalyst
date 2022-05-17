import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { useForm } from 'react-hook-form'
import { get, set, del } from '../../utils/storage'
import confidential from '../../img/confidential.png'

// Material UI components
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { ACCOUNT_LINKS } from '../../state/near'

const bip39 = require('bip39')
const base58 = require('bs58')

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
    padding: '20px',
    textAlign: 'center',
    color: '#000000',
  },
  customCard: {
    maxWidth: 300,
    minWidth: 275,
    margin: 'auto',
    padding: 20
  },
  rootForm: {
    '& > *': {
      margin: '10px',
    },
  },
  heading: {
    fontSize: '24px',
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: '18px',
    color: '#000000',
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: '20px',
    },
  },
  }));

  const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: '100px',
      fontSize: '12px',
      border: '1px solid #dadde9',
    },
  }))(Tooltip)

export default function Import(props) {
    const [seedPhrase, setSeedPhrase] = useState(bip39.generateMnemonic())
    const [seedHidden, setSeedHidden] = useState(true)
    const [exists, setExists] = useState(true)
    const [recoverSeed, setRecoverSeed] = useState('')
    const [expanded, setExpanded] = useState(false)
    
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')

    const { register, handleSubmit, watch, errors } = useForm()

    const { state, dispatch, update } = useContext(appStore);

    const {
      accountId,
      accountType
    } = state
    
    const handleRecoverSeed = (event) => {
    let lowercase = (event.target.value).toLowerCase()
    setRecoverSeed(lowercase)
    }

    const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    }

    // replaces existing key complete - no recover
    const onSubmit = async (values) => {
    let currentAccounts = get(ACCOUNT_LINKS, [])
    let i = 0
    while (i < currentAccounts.length) {
        if(currentAccounts[i].accountId == accountId){
        currentAccounts.splice[i,1]
        break
        }
        i++
    }

    let newAccount = { 
      key: (base58.encode(await bip39.mnemonicToSeed(seedPhrase))), 
      accountId: accountId,
      type: 'guild',
      owner: accountId, 
      keyStored: Date.now() }
    currentAccounts.push(newAccount)
    set(ACCOUNT_LINKS, currentAccounts)
    update('', {key: false})
    window.location.assign('/')
    }

    // recovers an existing key
    const onRecover = async (values) => {
    let currentAccounts = get(ACCOUNT_LINKS, [])
    let i = 0
    while (i < currentAccounts.length) {
        if(currentAccounts[i].accountId == accountId){
        currentAccounts.splice[i,1]
        break
        }
        i++
    }

    let newAccount = { 
      key: (base58.encode(await bip39.mnemonicToSeed(recoverSeed))),
      accountId: accountId,
      type: 'guild',
      owner: accountId, 
      keyStored: Date.now() }
    currentAccounts.push(newAccount)
    set(ACCOUNT_LINKS, currentAccounts)
    update('', {key: false})
    window.location.assign('/')
    }

    return (
      <>
     {!matches ?
      <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <Typography variant="h4" style={{marginTop:'40px'}}>Welcome to Catalyst</Typography><br></br>
            
              <Typography variant="body1">What's a data stream seed phrase?
              <HtmlTooltip
              title={
                <>
                    <Typography variant="h6">What's a Seed Phrase?</Typography>

                    <Typography variant="body2">Catalyst is an open web application that gives
                    you complete control of your guild's data.</Typography>
                    <br></br>
                    <Typography variant="body2">Seed phrases are common in crypto. They are like a long password. It
                    allows you to access your data to add, update, or delete at will.
                    </Typography>
                    <br></br>
                    <Typography variant="body2">You need to keep it safe. Nobody else, including Catalyst,
                    can change your guild's data without control of your seed phrase.
                    </Typography>
                    <br></br>
                    <Typography variant="body2">
                    Your guild's seed phrase is the key to it's unique identity, not it's wallet. 
                    <b>DO NOT USE</b> the account's wallet seed phrase as the guild's data stream seed phrase.
                    </Typography>
                </>
              }
              placement="bottom-start"
              ><InfoIcon />
              </HtmlTooltip>
              </Typography>
          <Typography variant="h6" style={{marginTop: '20px', marginBottom:'20px'}}>This account's data stream is missing.
          Go to {accountType=='guild' ? <a href="https://nearguilds.live">NEAR Guilds</a> 
          : <a href="https://nearpersonas.live">NEAR Personas</a>} to get the seed phrase to manage this account's data or 
          if you have it, recover it below:</Typography>
        </Grid>
      
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginLeft: '10px', marginRight: '10px'}}>
        <Card>
        <CardHeader 
          title="Have the Guild's Data Stream Seed Phrase?"
          align="center"
        />
        <CardContent>
          <Typography variant="body1" gutterBottom>If you have your guild's data stream 12 word seed phrase, enter it below.</Typography>
          <Typography variant="body1" gutterBottom><b>DO NOT USE use the your account wallet seed phrase.</b></Typography>
          <div class="form-floating mb-3" align="center">
              <div>
                <TextField
                    fullWidth
                    id="recoverPhrase"
                    placeholder="12 word seed phrase"
                    margin="dense"
                    variant="outlined"
                    name="id"
                    label="12 Word Recovery Seed Phrase"
                    helperText="12 words, 1 space between each word"
                    value={recoverSeed}
                    onChange={handleRecoverSeed}
                />
              </div>
            <Button color="primary" onClick={handleSubmit(onRecover)}>
                Recover It!
            </Button>
          </div>
        </CardContent>
        </Card>
        </Grid>
      
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
          <img src={confidential} style={{width:'80%', marginTop:'20px'}}/>
        </Grid>
      </Grid>
      :
      <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <Typography variant="h4" style={{marginTop:'40px'}}>Welcome to Catalyst</Typography><br></br>
            
              <Typography variant="body1">What's a seed phrase?
              <HtmlTooltip
              title={
                <>
                    <Typography variant="h6">What's a Seed Phrase?</Typography>

                    <Typography variant="body2">Catalyst is an open web application that gives
                    you complete control of your guild's data.</Typography>
                    <br></br>
                    <Typography variant="body2">Seed phrases are common in crypto. They are like a long password. It
                    allows you to access your data to add, update, or delete at will.
                    </Typography>
                    <br></br>
                    <Typography variant="body2">You need to keep it safe. Nobody else, including Catalyst,
                    can change your guild's data without control of your seed phrase.
                    </Typography>
                    <br></br>
                    <Typography variant="body2">
                    Your guild's seed phrase is the key to it's unique identity, not it's wallet. 
                    <b>DO NOT USE</b> the account's wallet seed phrase as the guild's data stream seed phrase.
                    </Typography>
                </>
              }
              placement="bottom-start"
              ><InfoIcon />
              </HtmlTooltip>
              </Typography>
          <Typography variant="h6" style={{marginTop: '20px', marginBottom:'20px'}}>This account's data stream is missing.
          Go to <a href="https://nearguilds.live">NEAR Guilds</a> to get the seed phrase to manage this account's data or 
          if you have it, recover it below:</Typography>
        </Grid>
      
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginLeft: '10px', marginRight: '10px'}}>
        <Card>
        <CardHeader 
          title="Have the Guild's Data Stream Seed Phrase?"
          align="center"
        />
        <CardContent>
          <Typography variant="body1" gutterBottom>If you have your guild's data stream 12 word seed phrase, enter it below.</Typography>
          <Typography variant="body1" gutterBottom><b>DO NOT USE use the your account wallet seed phrase.</b></Typography>
          <div class="form-floating mb-3" align="center">
              <div>
                <TextField
                    fullWidth
                    id="recoverPhrase"
                    placeholder="12 word seed phrase"
                    margin="dense"
                    variant="outlined"
                    name="id"
                    label="12 Word Recovery Seed Phrase"
                    helperText="12 words, 1 space between each word"
                    value={recoverSeed}
                    onChange={handleRecoverSeed}
                />
              </div>
            <Button color="primary" onClick={handleSubmit(onRecover)}>
                Recover It!
            </Button>
          </div>
        </CardContent>
        </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
          <img src={confidential} style={{width:'80%', marginTop:'20px'}}/>
        </Grid>
      </Grid>
      }
      </>
  )
  
}