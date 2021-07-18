import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import CommentForm from '../common/Comment/commentForm'
import CommentDetails from '../common/Comment/commentDetails'
import Persona from '@aluhning/get-personas-js'

// Material UI components
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import CircularProgress from '@material-ui/core/CircularProgress';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'
import Rating from '@material-ui/lab/Rating'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

// CSS Styles

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 800,
      minWidth: 325,
      minHeight: 325,
      
    },
    card: {
      margin: 'auto',
    },
    progress: {
        display: 'flex',
        justifyContent: 'center',
        height: '200px',
        width: '200px',
        alignItems: 'center',
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
    large: {
        width: theme.spacing(15),
        height: theme.spacing(15),
        textAlign: 'center',
        marginRight: '15px',
        float: 'left'
    },
    centered: {
        textAlign: 'center'
    },
    heading: {
      fontSize: 24,
      marginLeft: '10px'
    },
    }));

export default function MemberProfileDisplay(props) {
    const [open, setOpen] = useState(true)
    const [avatar, setAvatar] = useState()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [isUpdated, setIsUpdated] = useState(false)
    const [finished, setFinished] = useState(false)
    const [twitter, setTwitter] = useState('')
    const [reddit, setReddit] = useState('')
    const [discord, setDiscord] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [country, setCountry] = useState('')
    const [language, setLanguage] = useState([])
    const [skill, setSkill] = useState([])
    const [familiarity, setFamiliarity] = useState('')
    const [skillSet, setSkillSet] = useState([])
    const [developerSkillSet, setDeveloperSkillSet] = useState([])

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserIdx
    } = state

    const {
        handleMemberProfileDisplayClickState,
        member,
    } = props

    const thisPersona = new Persona()
   
    useEffect(
        () => {
 
          async function fetchData() {
         
            // Get Applicant Persona Information
           console.log('member', member)
            if(member){     
             
                              
                  let result = await thisPersona.getPersona(member)
                      if(result){
                        result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                        result.name ? setName(result.name) : setName('')
                        result.email ? setEmail(result.email) : setEmail('')
                        result.discord? setDiscord(result.discord) : setDiscord('')
                        result.reddit ? setReddit(result.reddit) : setReddit('')
                        result.twitter ? setTwitter(result.twitter) : setTwitter('')
                        result.country ? setCountry(result.country) : setCountry('')
                        result.birthdate ? setBirthdate(result.birthdate) : setBirthdate('')
                        result.language ? setLanguage(result.language) : setLanguage([])
                        result.skill ? setSkill(result.skill) : setSkill([])
                        result.familiarity ? setFamiliarity(result.familiarity): setFamiliarity('')
                        if(result.skillSet){
                          let skillArray = []
                          skillArray.push(result.skillSet)
                          console.log('skillarray', skillArray)
                          setSkillSet(skillArray)
                        }
                        if(result.developerSkillSet){
                          let developerSkillSetArray = []      
                          developerSkillSetArray.push(result.developerSkillSet)
                          setDeveloperSkillSet(developerSkillSetArray)
                        }
                      }
            }         
                    
            return true  
          }

          fetchData()
            .then((res) => {
              setFinished(true)
            })
          
    }, [member, avatar, isUpdated]
    )

    const handleClose = () => {
        handleMemberProfileDisplayClickState(false)
        setOpen(false)
    }

    console.log('skillset', skillSet)

        return (
            <div>
     
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              {finished ? (<>
                <DialogContent>
                  <Grid container justify="space-evenly" spacing={1} style={{marginTop:'20px'}}>
                    
                    <center><Typography variant="h5"><Avatar src={avatar} className={classes.large}  />{name ? name : member}</Typography></center>
                  </Grid>
                  <Typography variant="h6">General Information</Typography>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableHead>
                      
                      </TableHead>
                      <TableBody>
                      {member ? <TableRow key={member}><TableCell>NEAR Account</TableCell><TableCell component="th" scope="row">{member}</TableCell></TableRow> : null }
                      {birthdate ? <TableRow key={birthdate}><TableCell>Birthday</TableCell><TableCell component="th" scope="row">{birthdate}</TableCell></TableRow> : null }
                      {country ? <TableRow key={country}><TableCell>Country</TableCell><TableCell component="th" scope="row">{country}</TableCell></TableRow> : null }
                      {language && language.length > 0 ? <TableRow key='language'><TableCell>Language</TableCell><TableCell component="th" scope="row">{language.map((item, i) => { return (<><Typography key={i} variant="overline">{item},</Typography> </>) })}</TableCell></TableRow>: null }                
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Grid container justify="space-evenly" spacing={1} style={{marginTop:'20px', marginBottom: '20px'}}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Typography variant="h6">Crypto/Blockchain Familiarity: <Rating readOnly value={parseInt(familiarity)} /> </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className={classes.centered}>
                  <Typography variant="h6">Skills</Typography>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableHead>
                      
                      </TableHead>
                      <TableBody>
                      {skillSet && skillSet.length > 0 ?(
                        
                              <>
                              {skillSet[0].memeCreation ? <TableRow key={1}><TableCell>Meme Creation</TableCell></TableRow>: null}
                              {skillSet[0].videoCreation ? <TableRow key={2}><TableCell>Video Creation</TableCell></TableRow>: null}
                              {skillSet[0].writing ? <TableRow key={3}><TableCell>Writing</TableCell></TableRow>: null}
                              {skillSet[0].design ? <TableRow key={4}><TableCell>Design</TableCell></TableRow>: null}
                              {skillSet[0].eventOrganization ? <TableRow key={5}><TableCell>Event Organization</TableCell></TableRow>: null} 
                              {skillSet[0].socialMedia ? <TableRow key={6}><TableCell>Social Media</TableCell></TableRow>: null}
                              {skillSet[0].marketing ? <TableRow key={7}><TableCell>Marketing</TableCell></TableRow>: null}
                              {skillSet[0].translation ? <TableRow key={8}><TableCell>Translation</TableCell></TableRow>: null}
                              </>
                              )
                      : <TableRow key={0}><TableCell>None</TableCell></TableRow>
                      }
                         
                      </TableBody>
                    </Table>
                  </TableContainer>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} className={classes.centered}>
                  <Typography variant="h6">Developer Skills</Typography>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableHead>
                      
                      </TableHead>
                      <TableBody>
                      {developerSkillSet && developerSkillSet.length > 0 ? (
                         
                              <>
                              {developerSkillSet[0].rust ? <TableRow key={1}><TableCell>RUST</TableCell></TableRow>: null}
                              {developerSkillSet[0].assemblyScript ? <TableRow key={2}><TableCell>AssemblyScript</TableCell></TableRow>: null}
                              {developerSkillSet[0].javascript ? <TableRow key={3}><TableCell>JavaScript</TableCell></TableRow>: null}
                              {developerSkillSet[0].typescript ? <TableRow key={4}><TableCell>TypeScript</TableCell></TableRow>: null}
                              {developerSkillSet[0].solidity ? <TableRow key={5}><TableCell>Solidity</TableCell></TableRow>: null}
                              {developerSkillSet[0].webDevelopment ? <TableRow key={6}><TableCell>Web Development</TableCell></TableRow>: null}
                              </>
                            )
                       
                        : <TableRow key={0}><TableCell>None</TableCell></TableRow>
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                  </Grid>
                  </Grid>

                  <Typography variant="h6">Contacts and Connections</Typography>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableHead>
                      
                      </TableHead>
                      <TableBody>
                      {email ? <TableRow key={email}><TableCell>Email</TableCell><TableCell component="a" href={`mailto:${email}`} scope="row">{email}</TableCell></TableRow> : null }
                      {discord ? <TableRow key={discord}><TableCell>Discord</TableCell><TableCell component="th" scope="row">{discord}</TableCell></TableRow> : null }
                      {twitter ? <TableRow key={twitter}><TableCell>Twitter</TableCell><TableCell component="a" href={`https://twitter.com/${twitter}`} scope="row">{twitter}</TableCell></TableRow> : null }
                      {reddit ? <TableRow key={reddit}><TableCell>Reddit</TableCell><TableCell component="a" href={`https://reddit.com/user/${reddit}`} scope="row">{reddit}</TableCell></TableRow> : null }
                      </TableBody>
                    </Table>
                  </TableContainer>

                 
                </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Close
                </Button>
              </DialogActions>
              </>)
              : (
                    <div className={classes.progress}>
                        <CircularProgress size={100} color="primary"  />
                   </div>
              )}
            </Dialog>
          </div>
        )
}