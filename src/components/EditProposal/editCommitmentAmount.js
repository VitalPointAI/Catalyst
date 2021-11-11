import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import { flexClass } from '../../App'
import Persona from '@aluhning/get-personas-js'
import FungibleTokens from '../../utils/fungibleTokens'
import { submitProposalChange } from '../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import { CircularProgress } from '@material-ui/core'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'


const useStyles = makeStyles((theme) => ({
    progress: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
    large: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        textAlign: 'center'
    },
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const imageName = require('../../img/default-profile.png') // default no-image avatar
const defaultToken = require('../../img/default-coin.png') // default no-token image

export default function EditCommitmentAmountForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)

    // Persona Fields
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')

    const [fundingRequested, setFundingRequested] = useState()
    const [fundingToken, setFundingToken] = useState()
    const [thisTokenName, setThisTokenName] = useState('')
    const [tokenImage, setTokenImage] = useState(defaultToken)
    const [isToken, setIsToken] = useState(false)
    const [disabled, setDisabled] = useState(true)
    const [confirm, setConfirm] = useState(false)

    const { state, dispatch, update } = useContext(appStore)

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        handleUpdate,
        handleCommitmentAmountChangeClickState,
        applicant,
        proposer,
        curDaoIdx,
        proposalId,
    } = props

    const {
      wallet
    } = state

    const {
      contractId
    } = useParams()

    const { getMetadata } = FungibleTokens
    
    const classes = useStyles()

    useEffect(
      () => {
        if(state.app.accountTaken){
          getMetadata(fundingToken).then((meta) => {
            console.log('meta', meta)
            if(meta && meta.symbol != '') {
              setThisTokenName(meta.symbol)
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
          setThisTokenName('')
          setTokenImage(defaultToken)
          setDisabled(true)
          setIsToken(false)
        }
      },[state.app.accountTaken, fundingToken]
    )

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)
           
            // Set Existing Persona Data      
            if(applicant){
              const thisPersona = new Persona()
              let result = await thisPersona.getPersona(applicant)
                  if(result){
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                    result.name ? setName(result.name) : setName('')
                    result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                    result.date ? setDate(result.date) : setDate('')
                  }
           }

           // Set Existing Proposal Data       
           if(curDaoIdx){
              let propResult = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
           
              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
                    propResult.proposals[i].paymentRequested ? setFundingRequested(propResult.proposals[i].paymentRequested) : setFundingRequested('')
                    propResult.proposals[i].paymentToken ? setFundingToken(propResult.proposals[i].paymentToken) : setFundingToken('')  
                    break
                  }
                  i++
                }
              }
           }
        }
       
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
    },[])

    const handleClose = () => {
      handleCommitmentAmountChangeClickState(false)
        setOpen(false)
    }

    const handleFundingRequestedChange = (event) => {
        let value = event.target.value;
        setFundingRequested(value)
    }

    const handleConfirmChange = (event) => {
      setConfirm(event.target.checked)
    }
  
    const handleFundingTokenChange = (e) => {
      const v = e.target.value.toLowerCase()
      setFundingToken(v)
      state.wallet.isToken(v)
    }

    const onSubmit = async (values) => {
      event.preventDefault()
      setFinished(false)

      try{
        await submitProposalChange(
          wallet,
          contractId,
          proposalId,
          fundingRequested,
          fundingToken          
          )
      } catch (err) {
        console.log('problem submitting whitelist proposal', err)
      }
    }
    
        return (
           
            <div>
       
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<>
              <DialogTitle id="form-dialog-title">Change Funding Commitment Amount or Token</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Please change as necessary:
                  </DialogContentText>
                    <TextField
                      margin="dense"
                      id="change-funding-amount"
                      variant="outlined"
                      name="funding"
                      label="Funding Requested"
                      placeholder="e.g. 100000"
                      value={fundingRequested}
                      onChange={handleFundingRequestedChange}
                      inputRef={register({
                          required: true,
                          validate: value => value != '' || <p style={{color:'red'}}>You must specify the amount you are requesting.</p>
                      })}
                      InputProps={{
                        endAdornment: <>
                        <Tooltip TransitionComponent={Zoom} title="The amount of the indicated token the applicant is requesting be committed to their proposal.">
                            <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                        </Tooltip>
                        </>
                      }}
                    />

                    <TextField
                      margin="dense"
                      id="change-token"
                      variant="outlined"
                      name="token"
                      label="Token Requested"
                      placeholder="e.g. cat.tkn.near"
                      value={fundingToken}
                      onChange={handleFundingTokenChange}
                      inputRef={register({
                          required: true,
                          validate: value => value != '' || <p style={{color:'red'}}>You must specify the type of token you are requesting.</p>
                      })}
                      InputProps={{
                        endAdornment: <>
                        <Tooltip TransitionComponent={Zoom} title="The type of token the applicant wants to be paid in.">
                            <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                        </Tooltip>
                        </>
                      }}
                    />
                    <Avatar src={tokenImage}/><br></br>
                    {thisTokenName}
                </DialogContent>
               
              {!finished ? <LinearProgress className={classes.progress} style={{marginBottom: '25px' }}/> : (
              <DialogActions>
              <Button onClick={handleSubmit(onSubmit)} disabled={disabled} color="primary" type="submit">
                  Submit Details
                </Button>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
              </DialogActions>)}
              <Divider style={{marginBottom: 10}}/>
              
              </>) : <><div className={classes.waiting}><div class={flexClass}><CircularProgress/></div><Grid container spacing={1} alignItems="center" justifyContent="center" >
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h5" align="center">Loading Proposal Data</Typography>
              </Grid>
              </Grid></div></> }
            </Dialog>
           
          </div>
        
        )
}