import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import FileUpload from '../IPFSupload/ipfsUpload'
import { flexClass } from '../../App'
import { IPFS_PROVIDER } from '../../utils/ceramic' 

// Material UI components
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
// ReactQuill Component
import ReactQuill from 'react-quill'

// CSS Styles
import '../../../node_modules/react-quill/dist/quill.snow.css'
import { CircularProgress } from '@material-ui/core'

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

const imageName = require('../../img/default-profile.png') // default no-image avatar

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
    const { register, handleSubmit, watch, errors } = useForm()

    const { state, dispatch, update } = useContext(appStore)
    const countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
    const languages = ['Abkhazian','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese','Armenian','Assamese','Avaric','Avestan','Aymara','Azerbaijani','Bambara','Bashkir','Basque','Belarusian','Bengali','Bihari languages','Bislama','Bosnian','Breton','Bulgarian','Burmese','Catalan, Valencian','Central Khmer','Chamorro','Chechen','Chichewa, Chewa, Nyanja','Chinese','Church Slavonic, Old Bulgarian, Old Church Slavonic','Chuvash','Cornish','Corsican','Cree','Croatian','Czech','Danish','Divehi, Dhivehi, Maldivian','Dutch, Flemish','Dzongkha','English','Esperanto','Estonian','Ewe','Faroese','Fijian','Finnish','French','Fulah','Gaelic, Scottish Gaelic','Galician','Ganda', 'Georgian','German','Gikuyu, Kikuyu','Greek (Modern)','Greenlandic, Kalaallisut','Guarani','Gujarati','Haitian, Haitian Creole','Hausa','Hebrew','Herero','Hindi','Hiri Motu','Hungarian','Icelandic','Ido','Igbo','Indonesian','Interlingua (International Auxiliary Language Association)','Interlingue','Inuktitut','Inupiaq','Irish','Italian','Japanese','Javanese','Kannada','Kanuri','Kashmiri','Kazakh','Kinyarwanda','Komi','Kongo','Korean','Kwanyama, Kuanyama','Kurdish','Kyrgyz','Lao','Latin','Latvian','Letzeburgesch, Luxembourgish','Limburgish, Limburgan, Limburger','Lingala','Lithuanian','Luba-Katanga','Macedonian','Malagasy','Malay','Malayalam','Maltese','Manx','Maori','Marathi','Marshallese','Moldovan, Moldavian, Romanian','Mongolian','Nauru','Navajo, Navaho','Northern Ndebele','Ndonga','Nepali','Northern Sami','Norwegian','Norwegian Bokmål','Norwegian Nynorsk','Nuosu, Sichuan Yi','Occitan (post 1500)','Ojibwa','Oriya','Oromo','Ossetian, Ossetic','Pali','Panjabi, Punjabi','Pashto, Pushto','Persian','Polish','Portuguese','Quechua','Romansh','Rundi','Russian','Samoan','Sango','Sanskrit','Sardinian','Serbian','Shona','Sindhi','Sinhala, Sinhalese','Slovak','Slovenian','Somali','Sotho, Southern','South Ndebele','Spanish, Castilian','Sundanese','Swahili','Swati','Swedish','Tagalog','Tahitian','Tajik','Tamil','Tatar','Telugu','Thai','Tibetan','Tigrinya','Tonga (Tonga Islands)','Tsonga','Tswana','Turkish','Turkmen','Twi','Uighur, Uyghur','Ukrainian','Urdu','Uzbek','Venda','Vietnamese','Volap_k','Walloon','Welsh','Western Frisian','Wolof','Xhosa','Yiddish','Yoruba','Zhuang, Chuang','Zulu' ]
    const skills = ['Content Creation (memes)', "Content Creation (video)","Content Creation (writing)","Content Creation (other)", "Design", "Development (Rust / Asssembly Script)", "Development (Solidity)", "Development (Web)", "Event Organization", "Marketing or Social Media", "Translation", "Other"] 

    const {
        handleUpdate,
        handleEditPersonaClickState,
        accountId,
        curPersonaIdx
    } = props
    
    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)
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
              }
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
    const handleSkillChange = (event) => {
      let value = event.target.value
      setSkill(value)
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

    const handleShortBioChange = (content, delta, source, editor) => {
        
        setShortBio(content)
    }

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
            skill: skill,
            familiarity: familiarity
        }
     
        let result = await curPersonaIdx.set('profile', record)
     
      setIsUpdated(true)
      setFinished(true)
      update('', { isUpdated })
      handleUpdate(true)
      setOpen(false)
      handleClose()
    }

    const modules = {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline','strike', 'blockquote', 'code', 'code-block'],
          [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}, {'align': []}],
          ['link', 'image', 'video'],
          ['clean']
        ],
    };
    
    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code', 'code-block',
        'list', 'bullet', 'indent','align',
        'link', 'image', 'video'
    ];
    
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
                    {errors.name && <p style={{color: 'red'}}>You must provide a name.</p>}
                  </div>
                  <div>
                    <Accordion>
                      <AccordionSummary>Personal Information</AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
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
                              <Grid item xs={12}>
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
                              <Grid item xs={12}>
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
                                </FormControl>
                              </Grid>
                              <Grid item xs={12}>
                                <FormControl>
                                <InputLabel id="skill-label">Skills</InputLabel>
                                 <Select multiple
                                  className={classes.input}
                                  label = "Skill"
                                  id = "profile-skill"
                                  value = {skill}
                                  onChange = {handleSkillChange}
                                  input={<Input />}
                                  >
                                  {skills.map((skill) => (
                                      <MenuItem key={skill} value={skill}>
                                        {skill}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12}>
                                    <Typography>Familiarity with Crypto/Blockchain</Typography>
                                    <Rating name="Familiarity" onChange={handleRatingChange} value={parseInt(familiarity)} />
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                      </Accordion>
                      <Accordion>
                      <AccordionSummary>Accounts</AccordionSummary>
                        <AccordionDetails>
                          <TextField
                              autoFocus
                              margin="dense"
                              id="profile-email"
                              variant="outlined"
                              name="email"
                              label="Email"
                              placeholder="someone@someplace"
                              value={email}
                              onChange={handleEmailChange}
                              inputRef={register({
                                  required: false                              
                              })}
                          />
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
                              inputRef={register({
                                  required: false                              
                              })}
                          />
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
                              inputRef={register({
                                  required: false                              
                              })}
                          />
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
                              inputRef={register({
                                  required: false                              
                              })}
                          />
                        </AccordionDetails>
                      </Accordion>
                  </div>
                  <div>
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    name="shortBio"
                    value={shortBio}
                    onChange={handleShortBioChange}
                    style={{height:'200px', marginBottom:'100px'}}
                    inputRef={register({
                        required: false
                    })}
                  />
                  </div>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                        <Avatar src={avatar} className={classes.large} />
                    </Grid>
                    <Grid item xs={10} sm={10} md={10} lg={10} xl={10}>
                      <Typography align="center" variant="h5">Upload an Avatar</Typography>
                      <FileUpload handleFileHash={handleFileHash}/>
                    </Grid>
                  </Grid>
                 
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
              
              </>) : <><div className={classes.waiting}><div class={flexClass}><CircularProgress/></div><Grid container spacing={1} alignItems="center" justify="center" >
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h5" align="center">Loading Persona Data</Typography>
              </Grid>
              </Grid></div></> }
            </Dialog>
           
          </div>
        
        )
}