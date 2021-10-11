import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { submitProposal, STORAGE } from '../../state/near'
import Persona from '@aluhning/get-personas-js'
import { formatNearAmount } from 'near-api-js/lib/utils/format'

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
import Avatar from '@material-ui/core/Avatar'

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
  logoImage: {
    width: '140px'
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

  const defaultImage = require('../../img/default_logo.png')

export default function MemberProposal(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [applicant, setApplicant] = useState(props.accountId)
  const [shares, setShares] = useState('')
  const [loot, setLoot] = useState('')
  const [tribute, setTribute] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [logo, setLogo] = useState(defaultImage)
  
  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { 
    contractId,
    state,
    depositToken,
    proposalDeposit,
    handleMemberProposalClickState,
   } = props

   const data = new Persona()

   useEffect(
    () => {
      async function fetchData() {
        // get community information
        console.log('contractId mem', contractId)
        if(contractId){
          let daoResult = await data.getDao(contractId)
          console.log('daoResult memb', daoResult)
          if(daoResult){
            daoResult.name ? setCommunityName(daoResult.name) : setCommunityName('')
            daoResult.logo ? setLogo(daoResult.logo) : setLogo(defaultImage)
          }
        }
      }

      fetchData()
        .then((res) => {

        })

   }, [contractId]
   )

  const handleClose = () => {
    handleMemberProposalClickState(false)
  }

  const handleApplicantChange = (event) => {
    setApplicant(event.target.value.toString())
  }

  const handleTributeChange = (event) => {
    setTribute(event.target.value)
  }

  const handleLootChange = (event) => {
    setLoot(event.target.value)
  }

  const handleSharesChange = (event) => {
    setShares(event.target.value)
  }

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked)
  }

  const onSubmit = async (values) => {
    setFinished(false)
    try{
      await submitProposal(
                      state.wallet,
                      contractId,
                      'Member',
                      applicant,
                      loot,
                      tribute,
                      shares,
                      '0'
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
        <Grid container alignItems="center" justifyContent="center" style={{padding: '5px'}}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <img src={logo} className={classes.logoImage} /><br></br>
          {logo ? null : <Typography variant="h6">{communityName ? communityName : contractId}</Typography>}
          </Grid>
        </Grid>
        <DialogTitle id="form-dialog-title">Request Membership</DialogTitle>
        <DialogContent className={classes.rootForm}>
          <div>
            <TextField
                autoFocus
                margin="dense"
                id="votingrights-proposal"
                variant="outlined"
                name="applicant"
                label="Applicant"
                helperText="enter NEAR account name of applicant"
                placeholder="someaccount.near"
                value={applicant}
                onChange={handleApplicantChange}
                inputRef={register({
                    required: true,                        
                })}
            />
            {errors.applicant && <p style={{color: 'red'}}>You must provide a valid NEAR account.</p>}
          </div>
             
              <TextField
                margin="dense"
                id="member-proposal-tribute"
                variant="outlined"
                name="memberTribute"
                label="Contribution"
                placeholder="100"
                value={tribute}
                onChange={handleTributeChange}
                inputRef={register({
                    required: true,
                    validate: (value) => {
                      if (value == '') return 'You must make a contribution.'
                      if (value == '0') return 'Contribution must be greater than zero.'
                    }
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="The amount of NEAR the member is contributing to the community fund.  This is typically done in return for voting shares. This fund is used to fund proposals that benefit the community in some way that members vote on and decide collectively to pass.  Shares (voting or non-voting) represent a member's portion of the community fund.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
              {errors.memberTribute && <p style={{color: 'red'}}>You must enter a contribution amount.</p>}
            
              <TextField
              margin="dense"
              id="member-proposal-loot"
              variant="outlined"
              name="memberShares"
              label="Voting Shares"
              placeholder="100"
              value={shares}
              onChange={handleSharesChange}
              inputRef={register({
                  required: false,
              })}
              InputProps={{
                endAdornment: <><InputAdornment position="end">shares</InputAdornment>
                <Tooltip TransitionComponent={Zoom} title="The number of voting shares being requested.">
                    <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                </Tooltip>
                </>
              }}
              />

            <TextField
              margin="dense"
              id="member-proposal-loot"
              variant="outlined"
              name="memberLoot"
              label="Non-Voting Shares"
              placeholder="100"
              value={loot}
              onChange={handleLootChange}
              inputRef={register({
                  required: false,
              })}
              InputProps={{
                endAdornment: <><InputAdornment position="end">shares</InputAdornment>
                <Tooltip TransitionComponent={Zoom} title="The number of non-voting shares being requested.">
                    <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                </Tooltip>
                </>
              }}
            />
          
              <Card>
              <CardContent>
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body1">You are requesting that <b>{applicant}</b> become a member of <b>{communityName? communityName : contractId}</b>.  After submitting
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
                    <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{(tribute ? parseFloat(tribute) : 0) + parseFloat(proposalDeposit) + parseFloat(STORAGE)} Ⓝ</b>:</Typography>
                    <Grid container justifyContent="center" spacing={0}>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Typography variant="body2"><u>Proposal passes:</u></Typography>
                          <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                            <li>
                              <Typography variant="body2">Applicant becomes a member and receives {shares ? parseInt(shares) : 0} voting shares.</Typography>
                            </li>
                            <li>
                              <Typography variant="body2">Applicant receives {loot ? parseInt(loot) : 0} non-voting shares.</Typography>
                            </li>
                            <li>
                              <Typography variant="body2">Contribution of {tribute ? parseFloat(tribute) : 0} Ⓝ goes into the community fund.</Typography>
                            </li>
                            <li>
                              <Typography variant="body2">{proposalDeposit} Ⓝ proposal deposit is returned to you</Typography>
                            </li>
                            <li>
                              <Typography variant="body2">{STORAGE} Ⓝ goes to the contract to cover storage cost for this proposal.</Typography>
                            </li>
                          </ul>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Typography variant="body2"><u>Proposal fails or is cancelled:</u></Typography>
                          <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                            <li>
                              <Typography variant="body2">Applicant does not become a member.</Typography>
                            </li>
                             <li>
                              <Typography variant="body2">Contribution of {tribute ? parseFloat(tribute) : 0} Ⓝ is returned to you.</Typography>
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
                    <Typography variant="body2">Your contribution of <b>{tribute ? parseFloat(tribute) : 0} Ⓝ</b> immediately goes into the community escrow and stays there until the proposal is processed (finalized) or cancelled.</Typography>     
                  </Grid>
              </Grid>
                </CardContent>
          </Card>
          </DialogContent>
        <DialogActions>
        {finished ? <><Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">Submit Proposal</Button></> : <LinearProgress className={classes.progress} />}
        {finished ? <><Button onClick={handleClose} color="primary">Cancel</Button></> : null }
        </DialogActions>
      </Dialog>
      
    </div>
  )
}
