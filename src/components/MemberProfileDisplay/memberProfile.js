import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { makeStyles } from '@material-ui/core/styles'
import { dao } from '../../utils/dao'
import Communities from '../Communities/communities'
import CommunityCount from '../CommunityCount/communityCount'
import MemberCommunityCount from '../MemberCommunityCount/memberCommunityCount'
import MemberCommunities from '../MemberCommunities/memberCommunities'

// Material UI components
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Rating from '@material-ui/lab/Rating'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

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
    accHeading: {
      fontSize: theme.typography.pxToRem(18),
      fontWeight: theme.typography.fontWeightRegular,
    },
    heading: {
      fontSize: 18,
      marginLeft: '10px'
    },
    }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function MemberProfile(props) {
    const [open, setOpen] = useState(true)
    const [avatar, setAvatar] = useState(imageName)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
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
    const [personaSkillSet, setPersonaSkillSet] = useState([])
    const [personaSpecificSkillSet, setPersonaSpecificSkillSet] = useState([])
    const [memberDaos, setMemberDaos] = useState([])
    const [memberCommunities, setMemberCommunities] = useState([])

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      isUpdated,
      curUserIdx,
      appIdx,
      near,
      did,
      currentDaosList,
      accountId
    } = state

    const {
      member
    }= props

    useEffect(
      () => {
          async function fetchMemberData() {
              let contract
              let memberDaos = []
              
              let j = 0
              while (j < currentDaosList.length){
                  try{
                      contract = await dao.initDaoContract(state.wallet.account(), currentDaosList[j].contractId)
                    } catch (err) {
                      console.log('problem initializing dao contract', err)
                    }

                  let thisMemberStatus
                  let thisMemberInfo
                  try {
                    thisMemberInfo = await contract.getMemberInfo({member: accountId})
                    thisMemberStatus = await contract.getMemberStatus({member: accountId})
                   
                    if(thisMemberStatus && thisMemberInfo[0].active){
                      memberDaos.push(currentDaosList[j])
                    } 
                  } catch (err) {
                    console.log('no member info yet')
                  }
              j++
              }
              setMemberDaos(memberDaos)

          }
          
          fetchMemberData()
          .then((res) => {

          })

      }, [currentDaosList]
  )
   
    useEffect(
        () => {
 
          async function fetchData() {
            if(isUpdated){}
            if(did){
              let result = await appIdx.get('profile', did)
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
                  setSkillSet(result.skillSet)
                }
                if(result.developerSkillSet){
                setDeveloperSkillSet(result.developerSkillSet)
                }
                if(result.personaSkills){
                  setPersonaSkillSet(result.personaSkills)
                }
                if(result.personaSpecificSkills){
                  setPersonaSpecificSkillSet(result.personaSpecificSkills)
                }
              }
            }
          }

          fetchData()
            .then((res) => {
              setFinished(true)
            })
          
    }, [did, isUpdated]
    )

 

    const languages = language.map((item, i) => {
      if (i == language.length -1){
        item = item
      } else {
        item = item + ', '
      }
      return (
        <Typography key={i} variant="overline">{item}</Typography>
        ) 
      })

        return (
            <div>
     
           
              {finished ? (<>
              
                <Grid container justifyContent="space-evenly" spacing={1} style={{marginTop:'20px'}}>
                    
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
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                <Typography variant="body1" color="primary">More</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Grid container spacing={1} justifyContent="center">
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="h6">General Skills</Typography>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableHead>
                      
                      </TableHead>
                      <TableBody>
                      {skillSet ?
                        Object.entries(skillSet).map(([key, value]) => {
                            if(value){
                              return(
                                <TableRow key={key}>
                                <TableCell>{key}</TableCell>
                                </TableRow>
                              )
                            }
                        })
                        : null
                      }
                      {personaSkillSet && personaSkillSet.length > 0 ?
                      
                        personaSkillSet.map((values, index) => {
                          
                            return (
                              <TableRow key={values.name}>
                                <TableCell>{values.name}</TableCell>
                              </TableRow>
                            )
                        
                      })
                      : null
                    }
                          
                              
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  <Typography variant="h6">Specific Skills</Typography>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableHead>
                      
                      </TableHead>
                      <TableBody>
                      
                      {developerSkillSet ?
                        Object.entries(developerSkillSet).map(([key, value]) => {
                            if(value){
                              return(
                                
                                <TableRow key={key}>
                                  <TableCell>{key}</TableCell>
                                </TableRow>
                                
                              )
                            }
                        })
                        : null
                      }
                      {personaSpecificSkillSet && personaSpecificSkillSet.length > 0 ?
                      
                          personaSpecificSkillSet.map((values, index) => {
                            
                              return (
                                <TableRow key={values.name}>
                                  <TableCell>{values.name}</TableCell>
                                </TableRow>
                              )
                          
                        })
                        : null
                      }
                      
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <Typography variant="overline">Level of crypto/blockchain familiarity: <Rating readOnly value={parseInt(familiarity)} /> </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <Typography variant="h6">Contacts and Connections</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
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
                </Grid>
                </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <CommunityCount />
                </AccordionSummary>
                <AccordionDetails>
                <Grid container justifyContent="center" alignItems="center" spacing={1}>
                  <Grid className='profile' item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Communities />
                  </Grid>
                </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <MemberCommunityCount memberDaos={memberDaos}/>
                </AccordionSummary>
                <AccordionDetails>
                <Grid container justifyContent="center" alignItems="center" spacing={1}>
                  <Grid className='profile' item xs={12} sm={12} md={12} lg={12} xl={12}>                      
                      <MemberCommunities memberDaos={memberDaos} />
                  </Grid>
                </Grid>
                </AccordionDetails>
              </Accordion>
              </>)
              : (
                    <div className={classes.progress}>
                        <CircularProgress size={100} color="primary"  />
                   </div>
              )}
           
          </div>
        )
}