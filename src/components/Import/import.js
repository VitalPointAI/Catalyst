import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { useForm } from 'react-hook-form'
import { get, set, del } from '../../utils/storage'
const base58 = require('bs58')


// Material UI components
import { lighten, makeStyles, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'
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
  heading: {
    fontSize: theme.typography.pxToRem(24),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(18),
    color: theme.palette.text.secondary,
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  }));

  const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 300,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }))(Tooltip)

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function Import(props) {
    const[seedPhrase, setSeedPhrase] = useState(bip39.generateMnemonic())
    const [seedHidden, setSeedHidden] = useState(true)
    const [exists, setExists] = useState(true)
    const [recoverSeed, setRecoverSeed] = useState('')
    const [expanded, setExpanded] = useState(false)
    
    const classes = useStyles()

    const { register, handleSubmit, watch, errors } = useForm()

    const { state, dispatch, update } = useContext(appStore);

    const {
      accountId
    } = state
    
    useEffect(
      () => {

        async function fetchData() {
         
         
         
        }

        fetchData()
         
      }, [])

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
        let newAccount = { key: (base58.encode(await bip39.mnemonicToSeed(seedPhrase))), accountId: accountId, owner: accountId, keyStored: Date.now() }
        currentAccounts.push(newAccount)
        set(ACCOUNT_LINKS, currentAccounts)
        update('', {key: false})
        window.location.assign('/profile')
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
        let newAccount = { key: (base58.encode(await bip39.mnemonicToSeed(recoverSeed))), accountId: accountId, owner: accountId, keyStored: Date.now() }
        currentAccounts.push(newAccount)
        set(ACCOUNT_LINKS, currentAccounts)
        update('', {key: false})
        window.location.assign('/')
      }

      return (
        <>
       
        <Grid container spacing={1}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
            <Typography variant="h4" style={{marginTop:'40px'}}>Welcome to Catalyst!</Typography><br></br>
            <Typography variant="h5" style={{marginTop:'20px', marginBottom: '20px'}}>Step 1:  Let's get this account setup with a Seed!</Typography>
              
                <Typography variant="body1">What's a seed and why do you need one?
                <HtmlTooltip
                title={
                  <>
                      <Typography variant="h6">What's a Seed Phrase?</Typography>

                      <Typography variant="body2">Catalyst is an open web application that gives
                      you complete control of your data.</Typography>
                      <br></br>
                      <Typography variant="body2">This seed phrase is like a long password. It
                      allows you to access your data to add, update, or delete at will.
                      </Typography>
                      <br></br>
                      <Typography variant="body2">You need to keep it safe. Nobody else, including Catalyst,
                      can change your data without your seed phrase.
                      </Typography>
                      <br></br>
                      <Typography variant="body2">
                      Your Catalyst seed phrase is the seed phrase to your data stream, not your wallet. 
                      You <b>SHOULD NOT USE</b> your wallet seed phrase as your Catalyst seed phrase.
                      </Typography>
                  </>
                }
                placement="right"
                ><InfoIcon />
                </HtmlTooltip>
                </Typography>
            <Typography variant="h6" style={{marginTop: '20px', marginBottom:'20px'}}>Choose an option:</Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
          <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.heading}>Option 1</Typography>
            <Typography className={classes.secondaryHeading}>This is the first time this account has 
            signed into Catalyst.</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Card>
          <CardHeader 
            title="New to Catalyst?"
            align="center"
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>This sets a new 12 word seed phrase for this account's data stream.</Typography>
            <Typography variant="body1" gutterBottom>It does not allow access to your wallet. Protect it like any other secret key.</Typography>
            <Typography variant="body1" gutterBottom>Catalyst cannot recover this seed for you. It is your responsibility.</Typography>
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
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.heading}>Option 2</Typography>
            <Typography className={classes.secondaryHeading}>You've been here before but 
            have lost your Catalyst seed phrase for this account.</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Card>
          <CardHeader 
            title="Lost Your Seed Phrase?"
            align="center"
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>This sets a new 12 word seed phrase for this account's data stream.</Typography>
            <Typography variant="body1" gutterBottom>It does not allow access to your wallet. Protect it like any other secret key.</Typography>
            <Typography variant="body1" gutterBottom>Catalyst cannot recover this seed for you. It is your responsibility.</Typography>
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
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.heading}>Option 3</Typography>
            <Typography className={classes.secondaryHeading}>You have the Catalyst
            seed phrase for this account and need to restore it.</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Card>
          <CardHeader 
            title="Have Your Seed Phrase?"
            align="center"
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>If you have your Catalyst 12 word seed phrase, enter it below.</Typography>
            <Typography variant="body1" gutterBottom><b>Please DO NOT USE use your account's wallet seed phrase.</b></Typography>
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
          </AccordionDetails>
        </Accordion>
          
          </Grid>
          <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
        </Grid>
        </>
    )
  
}