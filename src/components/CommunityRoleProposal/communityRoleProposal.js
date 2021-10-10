import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { submitRoleConfigurationProposal, STORAGE } from '../../state/near'
import Persona from '@aluhning/get-personas-js'

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

export default function CommunityRoleProposal(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [applicant, setApplicant] = useState(props.accountId)
  const [communityName, setCommunityName] = useState('')
  const [logo, setLogo] = useState(defaultImage)

  const [roleName, setRoleName] = useState('')
  const [roleReward, setRoleReward] = useState('')
  const [roleStart, setRoleStart] = useState()
  const [roleEnd, setRoleEnd] = useState()
  const [roleDescription, setRoleDescription] = useState('')
  const [rolePermissions, setRolePermissions] = useState([])
  const [roleParticulars, setRoleParticulars] = useState([])
  const [roleAction, setRoleAction] = useState()

  const [confirm, setConfirm] = useState(false)
   
  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { 
    contractId,
    state,
    depositToken,
    proposalDeposit,
    handleCommunityRoleProposalClickState,
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

      let mounted = true
      if(mounted){
          fetchData()
          .then(res => {
            
          })
          return () => {
          mounted = false
          } 
      }

   }, [contractId]
   )

  const handleClose = () => {
    handleCommunityRoleProposalClickState(false)
  }

  const handleApplicantChange = (event) => {
    setApplicant(event.target.value.toString())
  }

  const handleRoleNameChange = (event) => {
    setRoleName(event.target.value)
  }

  const handleRoleRewardChange = (event) => {
    setRoleReward(event.target.value)
  }

  const handleRoleDescriptionChange = (event) => {
    setRoleDescription(event.target.value)
  }

  const handleRoleStartChange = (event) => {
    setRoleStart(event.target.value)
  }

  const handleRoleEndChange = (event) => {
    setRoleEnd(event.target.value)
  }

  const handleRoleParticularsChange = (event) => {
    setRoleParticulars(event.target.value)
  }

  const handleRoleActionChange = (event) => {
    setRoleAction(event.target.value)
  }

  const handleRolePermissionsChange = (event) => {
    setRolePermissions(event.target.value)
  }

  const handleConfirmChange = (event) => {
    setConfirm(event.target.checked)
  }

  const onSubmit = async (values) => {
    setFinished(false)

    let roleObject = {
      roleName: roleName,
      roleReward: roleReward,
      roleDescription: roleDescription,
      roleStart: roleStart,
      roleEnd: roleEnd,
      rolePermissions: rolePermissions,
      roleParticulars: roleParticulars,
      action: roleAction,
    }

    try{
      await submitRoleConfigurationProposal(
                      state.wallet,
                      contractId,
                      'RoleConfiguration',
                      applicant,
                      roleObject
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
          <Grid item xs={12} sm={12} md={1} lg={1} xl={1} >
          <Avatar variant="square" src={logo} />
          </Grid>
          <Grid item xs={12} sm={12} md={11} lg={11} xl={11} >
            <Typography variant="body1">{communityName ? communityName : contractId}</Typography>
          </Grid>
        </Grid>
        <DialogTitle id="form-dialog-title">Community Role Configuration Proposal</DialogTitle>
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
             
          <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <TextField
                margin="dense"
                className={classes.id}
                id="roleName"
                variant="outlined"
                name="roleName"
                label="Role Name"
                value={roleName}
                onChange={handleRoleNameChange}
                inputRef={register({
                    required: true                              
                })}
              />      
              {errors.roleName && <p style={{color: 'red', fontSize:'80%'}}>Provide a role name.</p>}
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <TextField
                fullWidth
                margin="dense"
                id="roleDescription"
                variant="outlined"
                name="roleDescription"
                label="Brief Description:"
                required
                placeholder="Allow people to..."
                value={roleDescription}
                onChange={handleRoleDescriptionChange}
                InputProps={{
                  endAdornment: <div>
                  <Tooltip TransitionComponent={Zoom} title="Short description of what this role is for.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </div>
                }}
              />
              {errors.roleDescription && <p style={{color: 'red', fontSize:'80%'}}>Provide community role description.</p>}
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
              <TextField
                margin="dense"
                id="roleStart"
                type = "date"
                name="roleStart"
                required
                label="Role Start Date:"
                value={roleStart}
                onChange={handleRoleStartChange}
                InputLabelProps={{shrink: true,}}
                InputProps={{
                  endAdornment: <div>
                  <Tooltip TransitionComponent={Zoom} title="Date when this role should become active.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </div>
                }}
                inputRef={register({
                  required: true                              
                })}
              />
              {errors.roleStart && <p style={{color: 'red', fontSize:'80%'}}>Provide a date when the role should come into effect.</p>}
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
              <TextField
                margin="dense"
                id="roleEnd"
                type = "date"
                name="roleEnd"
                required
                label="Role End Date:"
                value={roleEnd}
                onChange={handleRoleEndChange}
                InputLabelProps={{shrink: true,}}
                InputProps={{
                  endAdornment: <div>
                  <Tooltip TransitionComponent={Zoom} title="Date when this role should become inactive.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </div>
                }}
                inputRef={register({
                  required: true                              
                })}
              />
              {errors.roleStart && <p style={{color: 'red', fontSize:'80%'}}>Provide a date when the role should cease to be available.</p>}
            </Grid>
            
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <TextField
                margin="dense"
                fullWidth
                id="roleReward"
                variant="outlined"
                type="number"
                name="roleReward"
                label="Role Reward"
                value={roleReward}
                onChange={handleRoleRewardChange}
                InputProps={{ 
                  inputProps: {
                    required: true, 
                    min: 0
                  },
                  endAdornment: <div><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="Amount in NEAR of any reward amount that should be associated with holding the role.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </div>
                }}
              
              />
              {errors.roleReward && <p style={{color: 'red', fontSize:'80%'}}>Provide reward amount.  0 if no reward.</p>}
            </Grid>
          </Grid>

              <Card>
              <CardContent>
                <WarningIcon fontSize='large' className={classes.warning} />
                <Typography variant="body1">You are requesting to add a new role, <b>{applicant}</b>, to the community.  After submitting
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
                    <Typography variant="body2" gutterBottom>You understand this request requires you to transfer <b>{parseFloat(proposalDeposit) + parseFloat(STORAGE)} Ⓝ</b>:</Typography>
                    <Grid container justifyContent="center" spacing={0}>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Typography variant="body2"><u>Proposal passes:</u></Typography>
                          <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                            <li>
                              <Typography variant="body2">Role becomes available to assign to community members.</Typography>
                            </li>
                            <li>
                              <Typography variant="body2">{proposalDeposit} Ⓝ proposal deposit is returned to you</Typography>
                            </li>
                            <li>
                              <Typography variant="body2">{STORAGE} Ⓝ stays in the contract to cover storage cost for this proposal.</Typography>
                            </li>
                          </ul>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Typography variant="body2"><u>Proposal fails or is cancelled:</u></Typography>
                          <ul style={{paddingInlineStart:'10px', paddingInlineEnd:'10px'}}>
                            <li>
                              <Typography variant="body2">Role does not become available to assign to community members.</Typography>
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
