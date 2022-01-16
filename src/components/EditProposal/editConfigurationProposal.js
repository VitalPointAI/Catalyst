import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { flexClass } from '../../App'
import { IPFS_PROVIDER } from '../../utils/ceramic'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { formatNearAmount } from '../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { CircularProgress } from '@material-ui/core'

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

export default function EditConfigurationProposalForm(props) {

  const { state, dispatch, update } = useContext(appStore)

  const {
    periodDuration,
    votingPeriodLength,
    gracePeriodLength,
    proposalDeposit,
    dilutionBound,
    voteThreshold,
    platformPercent,
    platformAccount,
    curDaoIdx,
    isUpdated
  } = state

  const {
    handleEditConfigurationProposalDetailsClickState,
    proposer,
    proposalId,
    configuration
  } = props

    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)

    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    // Configuration Proposal Fields
    const [details, setDetails] = useState(EditorState.createEmpty())
   
    const { register, handleSubmit, watch, errors } = useForm()

    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)
           
           // Set Existing Proposal Data       
           if(curDaoIdx){
              let propResult = await curDaoIdx.get('configurationProposalDetails', curDaoIdx.id)

              if(propResult) {
                let i = 0
                while (i < propResult.proposals.length){
                  if(propResult.proposals[i].proposalId == proposalId){
                    if (propResult.proposals[i].details){
                      let contentBlock = htmlToDraft(propResult.proposals[i].details)
                      if (contentBlock){
                        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
                        const editorState = EditorState.createWithContent(contentState)
                        setDetails(editorState)
                      }
                      } else {
                        setDetails(EditorState.createEmpty())
                      }
                      propResult.proposals[i].likes ? setCurrentLikes(propResult.proposals[i].likes) : setCurrentLikes([])
                      propResult.proposals[i].dislikes ? setCurrentDisLikes(propResult.proposals[i].dislikes) : setCurrentDisLikes([])
                      propResult.proposals[i].neutrals ? setCurrentNeutrals(propResult.proposals[i].neutrals) : setCurrentNeutrals([])
                      
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
    },[curDaoIdx])

    function handleFileHash(hash) {
      setAvatar(IPFS_PROVIDER + hash)
    }

    const handleClose = () => {
        handleEditConfigurationProposalDetailsClickState(false)
        setOpen(false)
    }

    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }

    const handleDetailsChange = (editorState) => {
      setDetails(editorState)
    }

    const onSubmit = async (values) => {
      event.preventDefault()
      setFinished(false)

      let now = new Date().getTime()
      let formattedDate = formatDate(now)
  
      // Load existing array of details
      let detailRecords = await curDaoIdx.get('configurationProposalDetails', curDaoIdx.id)
  
      if(!detailRecords){
        detailRecords = { proposals: [] }
      }

      let proposalRecord = {
          proposalId: proposalId.toString(),
          details: draftToHtml(convertToRaw(details.getCurrentContent())),
          proposer: proposer,
          submitDate: now,
          published: true,
          likes: currentLikes,
          dislikes: currentDisLikes,
          neutrals: currentNeutrals
      }

      // Update existing records
      let exists
      let i = 0
      while (i < detailRecords.proposals.length){
        if(detailRecords.proposals[i].proposalId == proposalId){
          detailRecords.proposals[i] = proposalRecord
          await curDaoIdx.set('configurationProposalDetails', detailRecords)
          exists = true
          break
        }
        i++
      }

      // Add record if it doesn't exist
      if(!exists){
        detailRecords.proposals.push(proposalRecord)
        await curDaoIdx.set('configurationProposalDetails', detailRecords)
      }
     
      setFinished(true)
      update('', {isUpdated: !isUpdated})
      setOpen(false)
      handleClose()
    }
    
        return (
           
            <div>
       
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<>
              <DialogTitle id="form-dialog-title">Configuration Proposal Details</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Please justify the highlighted configuration changes:
                  
                  </DialogContentText>
                  
                  <TableContainer component={Paper} style={{marginBottom: '20px'}}>
                        <Table className={classes.table} size="small" aria-label="a dense table">
                          <TableHead>
                            <TableRow>
                              <TableCell>Setting</TableCell>
                              <TableCell>Current</TableCell>
                              <TableCell>Proposed</TableCell>
                            </TableRow>
                          </TableHead>
                         
                          <TableBody>
                        
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Period Duration
                              </TableCell>
                              <TableCell>
                                {periodDuration ? periodDuration : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: periodDuration.toString() != configuration[0] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[0] : <CircularProgress />} seconds
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Voting Period Length
                              </TableCell>
                              <TableCell>
                                {votingPeriodLength ? votingPeriodLength : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: votingPeriodLength.toString() != configuration[1] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[1] : <CircularProgress />} {configuration.length > 0 ? parseInt(configuration[1]) > 1 ? 'periods' : 'period' : null}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Grace Period Length
                              </TableCell>
                              <TableCell>
                                {gracePeriodLength ? gracePeriodLength : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: gracePeriodLength.toString() != configuration[2] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[2] : <CircularProgress />} {configuration.length > 0 ? parseInt(configuration[2]) > 1 ? 'periods' : 'period' : null}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Proposal Deposit
                              </TableCell>
                              <TableCell>
                                {proposalDeposit ? proposalDeposit : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: proposalDeposit != configuration[3] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[3] : <CircularProgress />} Ⓝ
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Dilution Bound
                              </TableCell>
                              <TableCell>
                                {dilutionBound ? dilutionBound : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: dilutionBound.toString() != configuration[4] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[4] : <CircularProgress />}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Vote Threshold
                              </TableCell>
                              <TableCell>
                                {voteThreshold ? voteThreshold : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: voteThreshold.toString() != configuration[5] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[5] : <CircularProgress />}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Platform Support
                              </TableCell>
                              <TableCell>
                                {platformPercent ? formatNearAmount(platformPercent, 5) : <CircularProgress />}
                              </TableCell>
                              <TableCell style={{ 
                                backgroundColor: formatNearAmount(platformPercent, 5) != configuration[6] ? 'yellow' : ''
                              }}>
                                {configuration.length > 0 ? configuration[6] : <CircularProgress />}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell component="th" scope="row">
                              Platform Support Account
                            </TableCell>
                            <TableCell>
                              {platformAccount ? platformAccount : <CircularProgress />}
                            </TableCell>
                            <TableCell style={{ 
                              backgroundColor: platformAccount != configuration[7] ? 'yellow' : ''
                            }}>
                              {configuration.length > 0 ? configuration[7] : <CircularProgress />}
                            </TableCell>
                          </TableRow>
                                    
                          </TableBody>
                        </Table>
                      </TableContainer>
              
                <Paper style={{padding: '5px'}}>
                <Editor
                  editorState={details}
                  toolbarClassName="toolbarClassName"
                  wrapperClassName="wrapperClassName"
                  editorClassName="editorClassName"
                  onEditorStateChange={handleDetailsChange}
                  editorStyle={{minHeight:'200px'}}
                />
                </Paper>
                   
                </DialogContent>
               
              {!finished ? <LinearProgress className={classes.progress} style={{marginBottom: '25px' }}/> : (
              <DialogActions>
              <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
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