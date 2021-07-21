
import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { flexClass } from '../../App'
import { ceramic, IPFS_PROVIDER } from '../../utils/ceramic'
import * as nearAPI from 'near-api-js'
import DOMPurify from "dompurify"


// Material UI components
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Table  from '@material-ui/core/Table'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Paper from '@material-ui/core/Paper'

// CSS Styles
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
    square: {
      //color: theme.palette.getContrastText(deepOrange[500]),
      //backgroundColor: deepOrange[500],
      width: '175px',
      height: 'auto'
    },
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const imageName = require('../../img/default_logo.png') // default no-image avatar

export default function DaoProfileDisplay(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [isUpdated, setIsUpdated] = useState(false)
    const [logo, setLogo] = useState(imageName)
    const [purpose, setPurpose] = useState('')
    const [category, setCategory] = useState('')
    const [webhook, setWebhook] = useState('')
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [twitter, setTwitter] = useState('')
    const [reddit, setReddit] = useState('')
    const [discord, setDiscord] = useState('')
    const [website, setWebsite] = useState('')
    const [telegram, setTelegram] = useState('')
    const [email, setEmail] = useState('')
    const [discordActivated, setDiscordActivated] = useState(false)
    const [proposalsActivated, setProposalsActivated] = useState(false)
    const [passedProposalsActivated, setPassedProposalsActivated] = useState(false)
    const [votingActivated, setVotingActivated] = useState(false) 
    const [sponsorActivated, setSponsorActivated] = useState(false) 

    const { register, handleSubmit, watch, errors } = useForm()

    const { state, dispatch, update } = useContext(appStore)

    const {
        handleUpdate,
        handleDetailsClickedState,
        contractId
    } = props

    const {
      near,
      appIdx,
      didRegistryContract
    } = state
    
    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)
         
           // Set Card Persona Idx       
           if(contractId && near){
             // Set Dao Idx
                               
              let daoAccount = new nearAPI.Account(near.connection, contractId)
            
              let thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
              setCurDaoIdx(thisCurDaoIdx)

              let result = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)

              let webhook = await ceramic.downloadKeysSecret(thisCurDaoIdx, 'apiKeys')
              console.log("webhook", webhook)
              if(webhook && Object.keys(webhook).length > 0){
                 setWebhook(webhook[0].api) 
              }
              else{
                 setWebhook('')
              }
              if(result) {
                result.name ? setName(result.name) : setName('')
                result.date ? setDate(result.date) : setDate('')
                result.logo ? setLogo(result.logo) : setLogo(imageName)
                result.purpose ? setPurpose(DOMPurify.sanitize(result.purpose)) : setPurpose('')
                result.category ? setCategory(result.category) : setCategory('')
                result.discordActivation ? setDiscordActivated(true) : setDiscordActivated(false)
                result.proposalActivation ? setProposalsActivated(true) : setProposalsActivated(false)
                result.passedProposalActivation ? setPassedProposalsActivated(true) : setPassedProposalsActivated(false)
                result.sponsorActivation ? setSponsorActivated(true) : setSponsorActivated(false)
                result.twitter ? setTwitter(result.twitter): setTwitter('')
                result.discord ? setDiscord(result.discord): setDiscord('')
                result.email ? setEmail(result.email): setEmail('')
                result.telegram ? setTelegram(result.telegram): setTelegram('')
                result.reddit ? setReddit(result.reddit): setReddit('')
                result.website ? setWebsite(result.website): setWebsite('')
              }
           }
        }
       
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
    },[near])

    function removeTags(string){
      var tmp = string.replace(/<[^>]+>/g, '')
      return tmp; 
    }

    const handleClose = () => {
        handleDetailsClickedState(false)
        setOpen(false)
    }
        return (
            <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<>
              <DialogTitle id="form-dialog-title">{name} Details</DialogTitle>
              <DialogContent>
                  <Grid>
                      <Grid item xs={12}>
                          {name!=""?
                            <center><Typography variant="h5"><Avatar src={logo} className={classes.large}/>Welcome to: {name}</Typography></center>:<></>}
                      </Grid>
                      <Grid item xs={12}>
                          {purpose!="" ?
                            <>
                            <Typography variant="h6" style={{marginTop: 10}}> Purpose: </Typography>
                            <div dangerouslySetInnerHTML={{ __html: purpose}} /></>:<></>}
                      </Grid>
                      <Grid item xs={12}>
                      <Typography variant="h6" style={{marginTop: 10}}>General Information</Typography>
                      <TableContainer component={Paper}>
                        <Table size="small" aria-label="a dense table">
                          <TableHead>
                           
                          </TableHead>
                          <TableBody>
                          {date ? <TableRow key={date}><TableCell>Date of Creation</TableCell><TableCell component="th" scope="row">{date}</TableCell></TableRow> : null }
                          {category? <TableRow key={category}><TableCell>Category</TableCell><TableCell component="th" scope="row">{category}</TableCell></TableRow> : null }
                          </TableBody>
                        </Table>
                      </TableContainer>
                      </Grid>
                      <Grid item xs={12}>
                      <Typography variant="h6" style={{marginTop: 10}}>Contact and Social</Typography>
                      <TableContainer component={Paper}>
                        <Table size="small" aria-label="a dense table">
                          <TableHead>
                           
                          </TableHead>
                          <TableBody>
                              {email ? <TableRow key={email}><TableCell>Email</TableCell><TableCell component="a" href={`mailto:${email}`} scope="row">{email}</TableCell></TableRow> : null }
                              {discord ? <TableRow key={discord}><TableCell>Discord</TableCell><TableCell component="th" scope="row">{discord}</TableCell></TableRow> : null }
                              {twitter ? <TableRow key={twitter}><TableCell>Twitter</TableCell><TableCell component="a" href={`https://twitter.com/${twitter}`} scope="row">{twitter}</TableCell></TableRow> : null }
                              {reddit ? <TableRow key={reddit}><TableCell>Subreddit</TableCell><TableCell component="a" href={`https://reddit.com/r/${reddit}`} scope="row">{reddit}</TableCell></TableRow> : null }
                              {website ? <TableRow key={website}><TableCell>Website</TableCell><TableCell component="a" href={website} scope="row">{website}</TableCell></TableRow> : null }
                              {telegram ? <TableRow key={telegram}><TableCell>Telegram</TableCell><TableCell component="th" scope="row">{telegram}</TableCell></TableRow> : null }
                          </TableBody>
                        </Table>
                      </TableContainer>
                      </Grid>
                      <Grid item xs={12}>
                          {date!=""?
                            <Typography style={{marginTop: 10}}>Date of Creation: {date}</Typography>:<></>}
                      </Grid>
                  </Grid>
              </DialogContent> 
              </>) : <><div className={classes.waiting}><div class={flexClass}><CircularProgress/></div><Grid container spacing={1} alignItems="center" justify="center" >
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h5" align="center">Loading DAO Details</Typography>
              </Grid>
              </Grid></div></> }
            </Dialog>
          </div>
        
        )
}
