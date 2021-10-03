import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { revokeDelegatedVotes } from '../../state/near'

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
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

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

export default function ManageDelegations(props) {
  const [open, setOpen] = useState(true)
  const [finished, setFinished] = useState(true)
  const [receiver, setReceiver] = useState('')
  
  const [quantity, setQuantity] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [delegationInfo, setDelegationInfo] = useState([])
  
  const classes = useStyles()
  const { register, handleSubmit, watch, errors } = useForm()

  const { 
    contractId,
    state,
    contract,
    maxDelegation,
    delegateTo,
    allMemberInfo,
    delegatedShares,
    shares,
    depositToken,
    proposalDeposit,
    handleManageDelegationsClickState,
    remainingDelegates
   } = props

   useEffect(
    () => {

      async function fetchData() {
        if(allMemberInfo && allMemberInfo.length > 0){
          let delegationArray = []
          let i = 0
          while (i < allMemberInfo.length){
            try{
              if(parseInt(allMemberInfo[i].receivedDelegations) > 0){
                let delegationInfo = await contract.getDelegationInfo({member: state.accountId, delegatee: allMemberInfo[i].delegateKey})
                console.log('delegationInfo', delegationInfo)
                if(delegationInfo && (Object.keys(delegationInfo).length > 0 || delegationInfo.length > 0)){
                  let delegations = {
                    delegatedTo: delegationInfo.delegatedTo,
                    shares: delegationInfo.shares
                  }
                  delegationArray.push(delegations)
                }
              }
            } catch (err) {
              console.log('error retrieving and storing delegation info', err)
            }
            i++
          }
          setDelegationInfo(delegationArray)
        
        }
      }
      
      fetchData()
   }, [allMemberInfo]
   )

  const handleClose = () => {
    handleManageDelegationsClickState(false)
  }

  async function revokeVotes(receiver, shares) {
    setFinished(false)
    try{
      revokeDelegatedVotes(
        state.wallet,
        contractId,
        state.accountId,
        receiver,
        shares
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
        <DialogTitle id="form-dialog-title">Manage Your Vote Delegations</DialogTitle>
        <DialogContent className={classes.rootForm} align="center">
        <Typography variant="body1">You have delegated <b>{delegatedShares}</b> of your <b>{shares}</b> votes.</Typography>
        <Typography variant="body1">You have delegated to <b>{delegationInfo && delegationInfo.length ? delegationInfo.length : '0'} personas</b>.<br></br>
        You have <b>{remainingDelegates}</b> remaining.</Typography>
        <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Delegated To</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
         
          <TableBody>
          {delegationInfo && delegationInfo.length > 0 ? (
            delegationInfo.map((row) => {
              console.log('delegation row', row)
              return (
                <TableRow key={row.delegatedTo}>
                <TableCell component="th" scope="row">
                  {row.delegatedTo}
                </TableCell>
                <TableCell>
                  {row.shares}
                </TableCell>
                <TableCell>
                  {parseInt(row.shares) > 0 ? <Button onClick={(e) => revokeVotes(row.delegatedTo, row.shares, e)}>Revoke</Button> : null }
                </TableCell>
              </TableRow>
              )
            })            
          ) : null }            
          </TableBody>
        </Table>
      </TableContainer>
          </DialogContent>
        <DialogActions>
        {finished ? <><Button onClick={handleClose} color="primary">Close</Button></> : null }
        </DialogActions>
      </Dialog>
      
    </div>
  )
}
