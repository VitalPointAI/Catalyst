import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { makeDonation } from '../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import WarningIcon from '@material-ui/icons/WarningTwoTone'
import Checkbox from '@material-ui/core/Checkbox'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'

const useStyles = makeStyles((theme) => ({
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  confirmation: {
    textAlign: 'left',
    margin: 'auto',
    paddingTop: '20px'
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

export default function Donation(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [contributor, setContributor] = useState(props.accountId)
  
  const [donation, setDonation] = useState('')
  const [confirm, setConfirm] = useState(false)
  
  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { 
    contractId,
    state,
    depositToken,
    proposalDeposit,
    handleDonationProposalClickState,
   } = props

  const handleClose = () => {
    handleDonationProposalClickState(false)
  }

  const handleContributorChange = (event) => {
    setContributor(event.target.value.toString())
  }

  const handleDonationChange = (event) => {
    setDonation(event.target.value)
  }

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked)
  }

  const onSubmit = async (values) => {
    setFinished(false)
    try{
      makeDonation(
        state.wallet,
        contractId,
        depositToken,
        contributor,
        donation
        )
            
    } catch (err) {
      setFinished(true)
      setOpen(false)
      handleClose()
    }
}

  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Donate to the Community</DialogTitle>
        <DialogContent className={classes.rootForm}>
          <div>
            <TextField
                autoFocus
                margin="dense"
                id="donation-contributor"
                variant="outlined"
                name="contributor"
                label="Contributor"
                helperText="enter NEAR account name of contributor"
                placeholder="someaccount.near"
                value={contributor}
                onChange={handleContributorChange}
                inputRef={register({
                    required: true,                        
                })}
            />
            {errors.contributor && <p style={{color: 'red'}}>You must provide a valid NEAR account.</p>}
          </div>
             
            <div>
              <TextField
                margin="dense"
                id="donation-amount"
                variant="outlined"
                name="donation"
                label="Contribution"
                placeholder="100"
                value={donation}
                onChange={handleDonationChange}
                inputRef={register({
                    required: true,
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="The amount of NEAR being donated to the community fund. This fund is used to fund proposals that benefit the community in some way that members vote on and decide collectively to pass.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
              {errors.donation && <p style={{color: 'red'}}>You must enter a contribution amount.</p>}
            </div>
            <Card>
              <CardContent>
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body1">You are about to donate {donation} Ⓝ.  Thank you for supporting this community.</Typography>
                
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
                    <Typography variant="body2" gutterBottom>You understand that donations do not give you voting shares, and are instant (no voting/ragequitting). The entire donation of <b>{parseInt(donation)} Ⓝ</b> goes directly into the community fund.  
                    </Typography>
                    {errors.confirmCheck && <p style={{color: 'red', marginTop: '10px'}}>You must confirm your understanding.</p>}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </DialogContent>
        <DialogActions>
        {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Make Donation</Button></> : <LinearProgress className={classes.progress} />}
        {finished ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
        </DialogActions>
      </Dialog>
      
    </div>
  )
}
