import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import FileUpload from '../IPFSupload/ipfsUpload'
import { flexClass } from '../../App'
import { ceramic, IPFS_PROVIDER } from '../../utils/ceramic' 
import { config } from '../../state/config'
import * as nearAPI from 'near-api-js'

// Material UI components
import InfoIcon from '@material-ui/icons/Info'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Input from '@material-ui/core/Input'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Rating from '@material-ui/lab/Rating'
import FormLabel from '@material-ui/core/FormLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Checkbox from '@material-ui/core/Checkbox'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import EmailIcon from '@material-ui/icons/Email'
import RedditIcon from '@material-ui/icons/Reddit'
import TwitterIcon from '@material-ui/icons/Twitter'
import { InputAdornment } from '@material-ui/core'
import { CircularProgress } from '@material-ui/core'
import Zoom from '@material-ui/core/Zoom'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import AddBoxIcon from '@material-ui/icons/AddBox'

const axios = require('axios').default

const Airtable = require('airtable')

const useStyles = makeStyles((theme) => ({
    progress: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
    input: {
      minWidth: 100,
      maxWidth: 400,
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: '33.33%',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    large: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        textAlign: 'center'
    }, 
    formControl: {
      margin: theme.spacing(3),
    },
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const imageName = require('../../img/default-profile.png') // default no-image avatar
const discordIcon = require('../../img/discord-icon.png')

export const {
  FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, FACTORY_DEPOSIT, DAO_FIRST_INIT, CURRENT_DAO, REDIRECT,
  NEW_PROPOSAL, NEW_SPONSOR, NEW_CANCEL, KEY_REDIRECT, OPPORTUNITY_REDIRECT, NEW_PROCESS, NEW_VOTE, NEW_DONATION, NEW_EXIT, NEW_RAGE, NEW_DELEGATION, NEW_REVOCATION,
  networkId, nodeUrl, walletUrl, nameSuffix, factorySuffix, explorerUrl,
  contractName, didRegistryContractName, factoryContractName
} = config

export default function EditPersonaForm(props) {

    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [isUpdated, setIsUpdated] = useState(false)
    const [email, setEmail] = useState('')
    const [discord, setDiscord] = useState('')
    const [reddit, setReddit] = useState('')
    const [twitter, setTwitter] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [country, setCountry] = useState('')
    const [language, setLanguage] = useState([])
    const [skill, setSkill] = useState([])
    const [familiarity, setFamiliarity] = useState('0')
    const [airtableClicked, setAirtableClicked] = useState(false)
    const [airtableData, setAirtableData] = useState(false)
    
    const [otherSkills, setOtherSkills] = useState([])
    const [notifications, setNotifications] = useState([])
    const { state, dispatch, update } = useContext(appStore)

    const countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
    const languages = ['Abkhazian','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese','Armenian','Assamese','Avaric','Avestan','Aymara','Azerbaijani','Bambara','Bashkir','Basque','Belarusian','Bengali','Bihari languages','Bislama','Bosnian','Breton','Bulgarian','Burmese','Catalan, Valencian','Central Khmer','Chamorro','Chechen','Chichewa, Chewa, Nyanja','Chinese','Church Slavonic, Old Bulgarian, Old Church Slavonic','Chuvash','Cornish','Corsican','Cree','Croatian','Czech','Danish','Divehi, Dhivehi, Maldivian','Dutch, Flemish','Dzongkha','English','Esperanto','Estonian','Ewe','Faroese','Fijian','Finnish','French','Fulah','Gaelic, Scottish Gaelic','Galician','Ganda', 'Georgian','German','Gikuyu, Kikuyu','Greek (Modern)','Greenlandic, Kalaallisut','Guarani','Gujarati','Haitian, Haitian Creole','Hausa','Hebrew','Herero','Hindi','Hiri Motu','Hungarian','Icelandic','Ido','Igbo','Indonesian','Interlingua (International Auxiliary Language Association)','Interlingue','Inuktitut','Inupiaq','Irish','Italian','Japanese','Javanese','Kannada','Kanuri','Kashmiri','Kazakh','Kinyarwanda','Komi','Kongo','Korean','Kwanyama, Kuanyama','Kurdish','Kyrgyz','Lao','Latin','Latvian','Letzeburgesch, Luxembourgish','Limburgish, Limburgan, Limburger','Lingala','Lithuanian','Luba-Katanga','Macedonian','Malagasy','Malay','Malayalam','Maltese','Manx','Maori','Marathi','Marshallese','Moldovan, Moldavian, Romanian','Mongolian','Nauru','Navajo, Navaho','Northern Ndebele','Ndonga','Nepali','Northern Sami','Norwegian','Norwegian Bokmål','Norwegian Nynorsk','Nuosu, Sichuan Yi','Occitan (post 1500)','Ojibwa','Oriya','Oromo','Ossetian, Ossetic','Pali','Panjabi, Punjabi','Pashto, Pushto','Persian','Polish','Portuguese','Quechua','Romansh','Rundi','Russian','Samoan','Sango','Sanskrit','Sardinian','Serbian','Shona','Sindhi','Sinhala, Sinhalese','Slovak','Slovenian','Somali','Sotho, Southern','South Ndebele','Spanish, Castilian','Sundanese','Swahili','Swati','Swedish','Tagalog','Tahitian','Tajik','Tamil','Tatar','Telugu','Thai','Tibetan','Tigrinya','Tonga (Tonga Islands)','Tsonga','Tswana','Turkish','Turkmen','Twi','Uighur, Uyghur','Ukrainian','Urdu','Uzbek','Venda','Vietnamese','Volap_k','Walloon','Welsh','Western Frisian','Wolof','Xhosa','Yiddish','Yoruba','Zhuang, Chuang','Zulu' ]
    const [skillSet, setSkillSet] = useState({})
    const [developerSkillSet, setDeveloperSkillSet] = useState({})

    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
    const {
      fields: personaSkillsFields,
      append: personaSkillsAppend,
      remove: personaSkillsRemove} = useFieldArray({
     name: "personaSkills",
     control
    })

    const {
      fields: personaSpecificSkillsFields,
      append: personaSpecificSkillsAppend,
      remove: personaSpecificSkillsRemove} = useFieldArray({
     name: "personaSpecificSkills",
     control
    })

    const personaSkills = watch('personaSkills', personaSkillsFields)
    const personaSpecificSkills = watch('personaSpecificSkills', personaSpecificSkillsFields)

    const {
        handleUpdate,
        handleEditPersonaClickState,
        accountId,
        curPersonaIdx
    } = props

    const {
      near,
      appIdx,
      didRegistryContract,
      currentDaosList
    } = state

    const {
      contractId
    } = useParams()
    
    const classes = useStyles()

    let base 

   

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)

          // Set Dao Idx
          if(near){
              if(currentDaosList && currentDaosList.length > 0){
                let i = 0
                while (i < currentDaosList.length){
                  if(currentDaosList[i].status == 'active'){
                    let daoAccount = new nearAPI.Account(near.connection, currentDaosList[i].contractId)
                      
                    let thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                    
                    // Get Existing Community Skills
                    if(thisCurDaoIdx){
                      let daoProfileResult = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)
             
                      let currentSkills = {...skillSet}
                      let currentSpecificSkills = {...developerSkillSet}
                      if(daoProfileResult){
                        const skillsResult = daoProfileResult.skills.map((name, value) => {
                          currentSkills = ({...currentSkills, [name.name]: false})
                        })
                        const specificSkillsResult = daoProfileResult.specificSkills.map((name, value) => {
                          currentSpecificSkills = ({...currentSpecificSkills, [name.name]: false})
                        })
                      setSkillSet(currentSkills)
                      setDeveloperSkillSet(currentSpecificSkills)
                      }
                    }
                  }
                i++
                }
              }
          }

           // Set Card Persona Idx       
           if(accountId){
              let result = await curPersonaIdx.get('profile', curPersonaIdx.id)

              if(result) {
                result.date ? setDate(result.date) : setDate('')
                result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                result.name ? setName(result.name) : setName('')
                result.email ? setEmail(result.email): setEmail('')
                result.discord ? setDiscord(result.discord): setDiscord('')
                result.birthdate ? setBirthdate(result.birthdate): setBirthdate('')
                result.country ? setCountry(result.country): setCountry('')
                result.language ? setLanguage(result.language): setLanguage([])
                result.skill ? setSkill(result.skill): setSkill([])
                result.familiarity? setFamiliarity(result.familiarity): setFamiliarity('0')
                result.notifications? setNotifications(result.notifications): setNotifications([])
                result.skillSet? setSkillSet(result.skillSet): setSkillSet({})
                result.developerSkillSet? setDeveloperSkillSet(result.developerSkillSet): setDeveloperSkillSet({})
                result.personaSkills? setValue('personaSkills', result.personaSkills): setValue('personaSkills', {name: ''})
                result.personaSpecificSkills? setValue('personaSpecificSkills', result.personaSpecificSkills): setValue('personaSpecificSkills', {name: ''})
              }

              let accessVariables = await axios.get('https://vpbackend-apim.azure-api.net/airtable')    
              base = new Airtable({apiKey: accessVariables.data.airtableKey}).base(accessVariables.data.contributorBase)
              
              base(accessVariables.data.contributorTable).select({
                pageSize: 20, 
                view: "Grid view"
              }).eachPage(function page(records, fetchNextPage) {
                
                records.forEach(function(record) {
                  try{
                    if(record.get('NEAR Wallet Address') == state.accountId){
                      setAirtableData(true)
                    }
                  } catch (err) {
                    console.log('error checking account against airtable', err)
                  }
                })
              })
           }
        }
       
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
    },[])

    function handleFileHash(hash) {
      setAvatar(IPFS_PROVIDER + hash)
    }

    const handleClose = () => {
        handleEditPersonaClickState(false)
        setOpen(false)
    }

    const handleNameChange = (event) => {
        let value = event.target.value;
        setName(value)
    }
    const handleEmailChange = (event) => {
       let value = event.target.value;
       setEmail(value)
    }
    const handleDiscordChange = (event) => {
      let value = event.target.value;
      setDiscord(value) 
    }
    const handleRedditChange = (event) => {
      let value = event.target.value;
      setReddit(value);
    }
    const handleCountryChange = (event) => {
      let value = event.target.value;
      setCountry(value);
    }
    const handleTwitterChange = (event) =>{
      let value = event.target.value;
      setTwitter(value); 
    }
    const handleBirthdateChange = (event) => {
      let value = event.target.value.toString() 
      setBirthdate(value); 
    }
    const handleLanguageChange = (event) => {
      let value = event.target.value
      setLanguage(value)
    }
   
    const handleRatingChange = (event, newValue) => {
      if(newValue != null){
        setFamiliarity(newValue.toString())
      }
    }
    
    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }
    const handleSkillSetChange = (event) => {
      setSkillSet({ ...skillSet, [event.target.name]: event.target.checked })
    }
  
    const handleDeveloperSkillSetChange = (event) => {
      setDeveloperSkillSet({ ...developerSkillSet, [event.target.name]: event.target.checked })
    }

    const handleOtherSkillsChange = (event) => {
      setOtherSkills(event.target.value.split(","))
    }
    const handleAirtableClick = async function(){
      if(airtableClicked == false)
      {
        base(accessVariables.data.contributorTable).select({
            pageSize: 20, 
            view: "Grid view"
        }).eachPage(function page(records, fetchNextPage) {
            
            records.forEach(function(record) {
              try{
                
                if(record.get('NEAR Wallet Address') == state.accountId){
                  record.get("Name") ? setName(record.get("Name")) : null
                  record.get("Email") ? setEmail(record.get("Email")): null
                  record.get("Country") ? setCountry(record.get("Country")): null
                  record.get("Discord Handle")? setDiscord(record.get("Discord Handle")): null 
                  record.get("Languages")? setLanguage(record.get("Languages")): null
                  record.get("Skills") ? setSkill(record.get("Skills")): null
                  record.get("Familiarity with Crypto") ? setFamiliarity(record.get('Familiarity with Crypto')): null
                  
                
  
               
                  for(let index = 0; index < skill.length; index++){
                    switch(skill[index]){
                      case "Content Creation (Writing)": 
                       skillSet['writing'] = true; 
                        break; 
                      case "Content Creation (Memes)": 
                        skillSet['memeCreation'] = true; 
                        break;
                      case "Content Creation (Video)":
                        skillSet['videoCreation'] = true; 
                        break; 
                      case "Marketing & Social Media": 
                        skillSet['marketing'] = true; 
                        break; 
                      case "Design":  
                        skillSet['design'] = true;    
                        break; 
                      case "Event Organization":
                        skillSet['eventOrganization'] = true; 
                        break; 
                      case "Translation":   
                        skillSet['translation'] = true; 
                        break;
                      case "Development (Rust/Assembly Script)":
                        developerSkillSet['rust'] = true
                        developerSkillSet['assemblyScript'] = true
                        break; 
                      case "Development (Solidity)":
                        developerSkillSet['solidity'] = true
                        break; 
                      case "Development (Web)":
                        developerSkillSet[webDevelopment] = true
                        break;
                      default: 
                        break; 
                    }
                    
                  }
              
                }
              }
              catch(err){ console.log(err) 
                return;}
            })
           
            // If there are more records, `page` will get called again.
            // If there are no more records, `done` will get called.
            // fetchNextPage() handles this behaviour entirely
            try{  
              fetchNextPage() 
            } catch{ 
              return; 
            }
            
        }, function done(err) {
            if (err) { console.error(err); return; }
        });
      }
    }
    
    const error = [skillSet.memeCreation].filter((v) => v).length !== 2;

    const onSubmit = async (values) => {
        event.preventDefault();
        setFinished(false)
        let now = new Date().getTime()
       
        let formattedDate = formatDate(now)
        

        let record = {
            date: formattedDate,
            owner: state.accountId,
            name: name,
            avatar: avatar,
            shortBio: shortBio,
            email: email,
            discord: discord,
            twitter: twitter,
            reddit: reddit,
            birthdate: birthdate,
            country: country,
            language: language,
            familiarity: familiarity,
            skillSet: skillSet,
            developerSkillSet: developerSkillSet,
            personaSkills: personaSkills,
            personaSpecificSkills: personaSpecificSkills,
            notifications: notifications
        }
     
        let result = await curPersonaIdx.set('profile', record)
     
      setIsUpdated(true)
      setFinished(true)
      update('', { isUpdated })
      handleUpdate(true)
      setOpen(false)
      handleClose()
    }
    
        return (
           
            <div>
       
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<>
              <DialogTitle id="form-dialog-title">Profile Data</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Provide as much detail as you'd like.
                  </DialogContentText>
                  <div>
                    <Grid container spacing={1} style={{marginBottom: '5px'}}>
                      <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                          <Avatar src={avatar} className={classes.large} />
                      </Grid>
                      <Grid item xs={10} sm={10} md={10} lg={10} xl={10}>
                        <FileUpload handleFileHash={handleFileHash}/>
                      </Grid>
                    </Grid>
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                      >
                      <Typography variant="h6">General Information</Typography>
                      <Tooltip TransitionComponent={Zoom} title="Here you can add information to let people, and communities know some basic information about yourself.">
                             <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                      </Tooltip>
                      </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-name"
                                variant="outlined"
                                name="name"
                                label="Name"
                                placeholder="Billy Jo Someone"
                                value={name}
                                onChange={handleNameChange}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-birthdate"
                                type = "date"
                                name="birthdate"
                                label="Birthdate"
                                value={birthdate}
                                onChange={handleBirthdateChange}
                                InputLabelProps={{shrink: true,}}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid> 
                              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <FormControl className={classes.input}>
                                  <InputLabel id="country-label">Country</InputLabel>
                                  <Select
                                    className={classes.input}
                                    label = "Country"
                                    id = "profile-country"
                                    value = {country}
                                    onChange = {handleCountryChange}
                                    input={<Input />}
                                    >
                                    {countries.map((country) => (
                                      <MenuItem key={country} value={country}>
                                        {country}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <FormControl>
                                <InputLabel id="language-label">Languages</InputLabel>
                                <Select multiple
                                  className={classes.input}
                                  label = "Language"
                                  id = "profile-language"
                                  value = {language}
                                  onChange = {handleLanguageChange}
                                  input={<Input />}
                                  >
                                  {languages.map((language) => (
                                      <MenuItem key={language} value={language}>
                                        {language}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  <FormHelperText>Select the languages you are comfortable with.</FormHelperText>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion style={{marginBottom: '20px'}}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                  >
                  <Typography variant="h6">Skills and Competencies</Typography>
                  </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">General Skills</FormLabel>
                        <FormGroup>
                        {loaded && skillSet && (Object.keys(skillSet).length > 0 || skillSet.length > 0) ?
                            skillSet.map((key) => {
                              return (
                                <FormControlLabel
                                  control={<Checkbox checked={skillSet[key]} onChange={handleSkillSetChange} name={key} />}
                                  label={key}
                                />
                              )
                            })
                        : null }
                        </FormGroup>
                        
                        <FormHelperText>Check off the general skills you have.</FormHelperText>
                      </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <FormControl component="fieldset" className={classes.formControl}>
                          <FormLabel component="legend">Specific Skills</FormLabel>
                          <FormGroup>
                          {loaded && developerSkillSet && (Object.keys(developerSkillSet).length > 0 || developerSkillSet.length > 0) ?
                            developerSkillSet.map((key) => {
                              return (
                                <FormControlLabel
                                  control={<Checkbox checked={developerSkillSet[key]} onChange={handleDeveloperSkillSetChange} name={key} />}
                                  label={key}
                                />
                              )
                            })
                        : null }
                         
                          
                          </FormGroup>
                          <FormHelperText>Check off the specific skills you have.</FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                        <Typography variant="body1" style={{marginTop: '10px', marginBottom:'10px'}}>Additional General Skills</Typography>
                        {
                          personaSkillsFields.map((field, index) => {
                          return(
                            
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                            <TextField
                              
                              margin="dense"
                              id={`personaSkills[${index}].name`}
                              variant="outlined"
                              name={`personaSkills[${index}].name`}
                              defaultValue={field.name}
                              label="Skill Name:"
                              InputProps={{
                                endAdornment: <div>
                                <Tooltip TransitionComponent={Zoom} title="Short name of skill.">
                                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                </Tooltip>
                                </div>
                              }}
                              inputRef={register({
                                  required: true                              
                              })}
                            />
                            {errors[`personaSkills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                            
                            <Button type="button" onClick={() => personaSkillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                              <DeleteForeverIcon />
                            </Button>
                            </Grid>
                            
                          )
                        }) 
                        }
                        {!personaSkillsFields || personaSkillsFields.length == 0 ?
                          <Typography variant="body1" style={{marginLeft: '5px'}}>No additional general skills defined yet. Add them for better chance of being matched to opportunities.</Typography>
                        : null }
                          <Button
                            type="button"
                            onClick={() => personaSkillsAppend({name: ''})}
                            startIcon={<AddBoxIcon />}
                          >
                            Add Skill
                          </Button>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                        <Typography variant="body1" style={{marginTop: '10px', marginBottom:'10px'}}>Additional Specific Skills</Typography>
                        {
                          personaSpecificSkillsFields.map((field, index) => {
                          return(
                            
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                            <TextField
                              
                              margin="dense"
                              id={`personaSpecificSkills[${index}].name`}
                              variant="outlined"
                              name={`personaSpecificSkills[${index}].name`}
                              defaultValue={field.name}
                              label="Skill Name:"
                              InputProps={{
                                endAdornment: <div>
                                <Tooltip TransitionComponent={Zoom} title="Short name of skill.">
                                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                </Tooltip>
                                </div>
                              }}
                              inputRef={register({
                                  required: true                              
                              })}
                            />
                            {errors[`personaSpecificSkills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                            
                            <Button type="button" onClick={() => personaSpecificSkillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                              <DeleteForeverIcon />
                            </Button>
                            </Grid>
                            
                          )
                        }) 
                        }
                        {!personaSpecificSkillsFields || personaSpecificSkillsFields.length == 0 ?
                          <Typography variant="body1" style={{marginLeft: '5px'}}>No additional general skills defined yet. Add them for better chance of being matched to opportunities.</Typography>
                        : null }
                          <Button
                            type="button"
                            onClick={() => personaSpecificSkillsAppend({name: ''})}
                            startIcon={<AddBoxIcon />}
                          >
                            Add Skill
                          </Button>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Typography>Familiarity with Crypto/Blockchain</Typography>
                            <Rating name="Familiarity" onChange={handleRatingChange} value={parseInt(familiarity)} />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
              </Accordion>
                      <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                      >
                      <Typography variant="h6">Accounts and Notifications</Typography>
                      <Tooltip TransitionComponent={Zoom} title="Here you can add some of your social media handles if you would like fellow Catalyst users to be able to find or contact you elsewhere.">
                        <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                      </Tooltip>
                      </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="input-with-icon-grid"
                                id="profile-email"
                                variant="outlined"
                                name="email"
                                label="Email"
                                placeholder="someone@someplace"
                                value={email}
                                onChange={handleEmailChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <EmailIcon />
                                    </InputAdornment>
                                  ),
                                }}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-discord"
                                variant="outlined"
                                name="discord"
                                label="Discord"
                                placeholder="someone#1234"
                                value={discord}
                                onChange={handleDiscordChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <img src={discordIcon} style={{width: '24px', height: 'auto'}}/>
                                    </InputAdornment>
                                  ),
                                }}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-twitter"
                                variant="outlined"
                                name="twitter"
                                label="Twitter"
                                placeholder="some user"
                                value={twitter}
                                onChange={handleTwitterChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <TwitterIcon />
                                    </InputAdornment>
                                  ),
                                }}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-reddit"
                                variant="outlined"
                                name="reddit"
                                label="Reddit"
                                placeholder="some user"
                                value={reddit}
                                onChange={handleRedditChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <RedditIcon />
                                    </InputAdornment>
                                  ),
                                }}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                          </Grid>
                          
                         
                        </AccordionDetails>
                      </Accordion>
                  {airtableData ?
                  <Grid container spacing={1} justifyContent="space-between">  
                    <Grid item xs={7} sm={7} md={7} lg={7} xl={7}>
                      <Typography style={{marginTop: 5}}> 
                        From the Open Web Sandbox?
                      </Typography>
                    </Grid>
                    <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
                     <Button onClick={handleAirtableClick} color="primary">
                        Import Data from Airtable
                      </Button>
                    </Grid>
                  </Grid> : null }
                  </div>
              
                  
                
                 
                  <div>
               
                  </div>
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
                <Typography variant="h5" align="center">Loading Persona Data</Typography>
              </Grid>
              </Grid></div></> }
            </Dialog>
           
          </div>
        
        )
}