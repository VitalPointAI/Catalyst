import React, { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import * as nearAPI from 'near-api-js'
import { appStore, onAppMount } from '../../state/app'
import { useForm, useFieldArray } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ceramic } from '../../utils/ceramic'
import { ft } from '../../utils/ft'
import { initFT, logFTInitEvent, FT_FIRST_INIT, IPFS_PROVIDER } from '../../state/near'
import FileUpload from '../IPFSupload/ipfsUpload'
import { get, set, del } from '../../utils/storage'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 50
  },
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
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
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    float: 'left'
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

const defaultToken = require('../../img/default-coin.png') // default no-token image

export default function FTInitialize(props) {
    const[done, setDone] = useState(props.done)
    const [tokenName, setTokenName] = useState()
    const [tokenSymbol, setTokenSymbol] = useState('')
    const [tokenIcon, setTokenIcon] = useState()
    const [tokenDecimals, setTokenDecimals] = useState('')
    const [maxSupply, setMaxSupply] = useState()

    const [confirm, setConfirm] = useState(false)
    const [clicked, setClicked] = useState(false)
    const [creator, setCreator] = useState()
    const [essentials, setEssentials] = useState(false)
    const [currentFTAccount, setCurrentFTAccount] = useState()
    const [curFTIdx, setCurFTIdx] = useState()
    const [FTContract, setFTContract] = useState()
    const [tokenIconUrl, setTokenIconUrl] = useState()

    const [finished, setFinished] = useState(false)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore);

    const {
      accountId,
      currentTokensList,
      didRegistryContract,
      near,
      appIdx
    } = state

    const {
      contractId
    } = useParams()

    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm({
      defaultValues: {
           
        }
    })   
   
    useEffect(
      () => {
        let i = 0
        if(currentTokensList){
          while(i < currentTokensList.length){
            if(currentTokensList[i].contractId == contractId){
              let owner = currentTokensList[i].creator
              setCreator(owner)
              break
            }
            i++
          }
        }
      }, [currentTokensList])

    useEffect(
    () => {
      async function essentials(){
        if(near && contractId){
          let ftAccount
          try{
            ftAccount = new nearAPI.Account(near.connection, contractId)
            setCurrentFTAccount(ftAccount)
          } catch (err) {
            console.log('no account', err)
            return false
          }
          
          let curFTIdx
          try{
            curFTIdx = await ceramic.getCurrentFTIdx(ftAccount, appIdx, didRegistryContract)
            setCurFTIdx(curFTIdx)
            console.log('curftidx', curFTIdx)
          } catch (err) {
            console.log('problem getting curftidx', err)
            return false
          }

          let ftContract
          try{
            ftContract = await ft.initFTContract(ftAccount, contractId)
            setFTContract(ftContract)
          } catch (err) {
            console.log('problem getting ftcontract', err)
            return false
          }
        }
        return true
      } 

      essentials()
        .then((res) => {
          res ? setEssentials(true) : setEssentials(false)
        })
    }, [near]
    )

    useEffect(
      () => {
        async function processTriggers(){
          if(curFTIdx){
            console.log('trigger curftidx', curFTIdx)
            let urlVariables = window.location.search
            const urlParameters = new URLSearchParams(urlVariables)
            let transactionHash = urlParameters.get('transactionHashes')
            let errorCode = urlParameters.get('errorCode')
            console.log('errorCode', errorCode)

            // check for first init to log token summon events
            let firstFTInit = get(FT_FIRST_INIT, [])
        
            let cc = 0
            while(cc < firstFTInit.length){
              if(firstFTInit[cc].contractId==contractId && firstFTInit[cc].init == true){
              
                let logged = await logFTInitEvent(
                  contractId, 
                  curFTIdx, 
                  FTContract, 
                  state.accountId,
                  firstFTInit[cc].metadata,
                  firstFTInit[cc].maxSupply,
                  firstFTInit[cc].creationTime,
                  transactionHash)
                console.log('logged', logged)
                if (logged) {
                  del(FT_FIRST_INIT)
                  window.location.assign('/fts')
                }
              }
              cc++
            }
          }
        }

        if(essentials){
        processTriggers()
          .then((res) => {

          })
        }

      }, [essentials, curFTIdx]
    )

      function handleFileHash(hash) {
        console.log('hash', hash)
        setTokenIcon(IPFS_PROVIDER + hash)
      }

      const handleTokenNameChange = (event) => {
        setTokenName(event.target.value)
      }

      const handleToken = (event) => {
        const reader = new FileReader()
        reader.readAsDataURL(event.target.files[0])
        reader.addEventListener("load", function () {
          // convert image file to base64 string
          setTokenIconUrl(reader.result);
        }, false);
        // reader.readAsDataURL(event.target.files[0])
        // console.log('reader', reader)
        // console.log('readerresult', reader.result)
        // setTokenIconUrl(reader.result)
      }
  
      const handleTokenSymbolChange = (event) => {
        let v = event.target.value
        let formattedV = v.toUpperCase()
        setTokenSymbol(formattedV)
      }
  
      const handleTokenDecimalsChange = (event) => {
          setTokenDecimals(event.target.value)
      }
  
      const handleMaxSupplyChange = (event) => {
          setMaxSupply(event.target.value)
      }

      const onSubmit = async (values) => {
        try{
          await initFT(
            state.wallet, 
            contractId,
            tokenName,
            tokenSymbol,
            tokenIconUrl,
            '',
            '',
            tokenDecimals,
            maxSupply
            )
          setFinished(true)
        } catch (err) {
          console.log('error initializing token', err)
          setFinished(true)
        }
        setFinished(false)
      }
  console.log('tokenicon', tokenIcon)
  console.log('tokeniconurl', tokenIconUrl)
      return (
        <>
        {creator == accountId ? (
        <Grid container className={classes.confirmation} spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '50px'}}>
          <Typography variant="subtitle1">These settings are permanent - choose wisely.</Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} align="center"></Grid>
        
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{textAlign: 'center'}}>
        <Card>
            <CardContent>
                <Typography variant="h6">Token Settings</Typography>
      
                <TextField
                fullWidth
                margin="dense"
                id="tokenName"
                variant="outlined"
                name="tokenName"
                label="Token Name"
                required={true}
                value={tokenName}
                onChange={handleTokenNameChange}
                inputRef={register({
                    required: true
                })}
                placeholder="MyToken"
                InputProps={{
                  endAdornment: <>
                  <Tooltip TransitionComponent={Zoom} title="Human readable name of your token.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />
   
              <TextField
                fullWidth
                margin="dense"
                id="tokenSymbol"
                variant="outlined"
                required={true}
                name="tokenSymbol"
                label="Token Symbol"
                placeholder="MYT"
                value={tokenSymbol}
                onChange={handleTokenSymbolChange}
                inputRef={register({
                    required: true,
                    validate: value => value.length <= 5 || <p style={{color:'red'}}>Token symbol should be no more than 5 characters long.</p>
                })}
                InputProps={{
                  endAdornment: <>
                  <Tooltip TransitionComponent={Zoom} title="The ticker symbol of your token - typically 3-5 characters long.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />
              
              <Avatar src={tokenIconUrl} style={{float: 'left', marginRight: '20px'}}/>
              <span style={{verticalAlign: 'top', display: 'inline-block'}}>
              <Button
                variant="contained"
                color="primary"
                component="label"
              >
                Upload Token Icon
                <input
                  accept="image/*"
                  type="file"
                  hidden
                  onChange={handleToken}
                />
                </Button><br></br>
                <Typography variant="caption" style={{marginTop: '5px'}}>32px x 32px (SVG recommended)</Typography>
              </span>
     
              <TextField
                fullWidth
                margin="dense"
                id="tokenDecimals"
                variant="outlined"
                required={true}
                name="tokenDecimals"
                label="Decimals"
                placeholder="24"
                value={tokenDecimals}
                onChange={handleTokenDecimalsChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <>
                  <Tooltip TransitionComponent={Zoom} title="Usually set to 24 for a token on NEAR">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />

              <TextField
                fullWidth
                margin="dense"
                id="maxSupply"
                variant="outlined"
                required={true}
                name="maxSupply"
                label="Max Supply"
                placeholder="1000000000"
                value={maxSupply}
                onChange={handleMaxSupplyChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">tokens</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="Maximum supply of tokens that will be available.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />
             
              </CardContent>
              </Card>
              <br></br>
              <Button
              disabled={state.app.accountTaken || clicked}
              variant="contained"
              color="primary"
              onClick={handleSubmit(onSubmit)}>
                INITIALIZE TOKEN
              </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={4} lg={4} xl={4} align="center"></Grid>
      </Grid>
        ) : 'Fungible Token not initialized yet'}
        </>
    )
  
}