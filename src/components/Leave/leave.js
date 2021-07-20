import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { leaveCommunity } from '../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
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

export default function Leave(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [share, setShare] = useState('')
  const [confirm, setConfirm] = useState(false)
  
  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { 
    daoContract,
    contractId,
    state,
    handleLeaveClickState,
    fairShare
   } = props

  const handleClose = () => {
    handleLeaveClickState(false)
  }

  const handleShareChange = (event) => {
    setShare(event.target.value)
  }

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked)
  }

  const onSubmit = async (values) => {
    setFinished(false)
    try{
      await leaveCommunity(
                      daoContract,
                      contractId,
                      share,
                      state.accountId,
                      fairShare
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
        <DialogTitle id="form-dialog-title">Leave Community</DialogTitle>
        <DialogContent className={classes.rootForm}>
          <DialogContentText>Your current fair share of the fund is: <b>{fairShare} Ⓝ</b>.<br></br>
          That is the maximum you may leave with.  If you choose to leave with less, the difference will be donated to the community on your behalf.          
          </DialogContentText>
             
            <div>
              <TextField
                margin="dense"
                id="share-donation"
                variant="outlined"
                name="memberFairShare"
                label="Withdraw"
                placeholder="100"
                value={share}
                onChange={handleShareChange}
                inputRef={register({
                    required: true,
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="The amount of NEAR up to their fair share the member is entitled to leave with.  
                  Anything less than the current fair share will be donated on their behalf to the community fund. g to the community fund.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
              {errors.memberFairShare && <p style={{color: 'red'}}>You must enter an amount to withdraw.</p>}
            </div>
              <Card>
              <CardContent>
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body1">You are leaving the community.  This action is not reversible.  If you decide to rejoin the community later, you must submit a new
                member proposal.</Typography>
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
                    <Typography variant="body2" gutterBottom>You understand this request means you will no longer be a member of the community.
                    {console.log('fairshare', fairShare)}
                    You are withdrawing <b>{(share ? share : 0)} Ⓝ</b>.  You are donating <b>{share ? (parseFloat(fairShare)) - (parseFloat(share)) : 0}</b> Ⓝ to the community as you leave.</Typography>
                  </Grid>
                </Grid>
                </CardContent>
          </Card>
          </DialogContent>
        <DialogActions>
        {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Leave Community</Button></> : <LinearProgress className={classes.progress} />}
        {finished ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
        </DialogActions>
      </Dialog>
      
    </div>
  )
}
