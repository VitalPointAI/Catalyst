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
        width: theme.spacing(7),
        height: theme.spacing(7),
        textAlign: 'center',
        margin: 'auto'
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

        return (
            <div>
     
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Member Persona</DialogTitle>
              {finished ? (<>
                <DialogContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} className={classes.centered}>
                            <Typography variant="h6">Meet</Typography>
                            <Avatar src={avatar} className={classes.large} />
                            <Typography variant="h3">{name}</Typography>
                            <Typography variant="h5">{email ? <> E-mail: {email} </>: <></> }</Typography>

                            <Typography variant="h5">{birthdate ? <> Birth Date: {birthdate} </>: <></> }</Typography>                            
                            <Typography variant="h5">{country ? <> Country: {country} </>: <></> }</Typography>
                            {
                            language == [] ? 
                             ( <></> )
                            :
                              <Typography variant="h5">Languages: {language.map(item => { return <>
                              {
                              language[language.length-1] == item ? 
                              <>{item}</>
                              :
                              <>{item}, </>
                              }
                              </>})} </Typography>
                            }
                            {
                            skill != [] ? 
                              (
                              <Typography variant="h5">Skills: {skill.map(item => { return <>
                              {
                              skill[skill.length-1] == item ? 
                              <>{item}</>
                              :
                              <>{item}, </>
                              }
                               </>})}</Typography> )
                            : <></>
                            }
                            <Typography variant="h5">Account: {member}</Typography>
                            <Typography variant="h5">Crypto/Blockchain Familiarity: </Typography>
                            <Rating readOnly value={parseInt(familiarity)} />
                        </Grid>
                    </Grid>
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