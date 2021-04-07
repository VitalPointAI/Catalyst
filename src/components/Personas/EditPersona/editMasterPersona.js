import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import ImageUploader from 'react-images-upload';
import FileUpload from '../../common/IPFSupload/ipfsUpload'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider'


import { profileSchema } from '../../../schemas/profileold';

// ReactQuill Component
import ReactQuill from 'react-quill';

// CSS Styles
import '../../../../node_modules/react-quill/dist/quill.snow.css'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      margin: 'auto',
      maxWidth: 325,
      minWidth: 325,
    },
    card: {
      margin: 'auto',
    },
    progress: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
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
        textAlign: 'center'
    },
    heading: {
      fontSize: 24,
      marginLeft: '10px'
    },
    }));

const imageName = require('../../../images/default-profile.png') // default no-image avatar

export default function MasterPersonaForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [fileHash, setFileHash] = useState('')

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        accountId,
        curUserIdx,
        handleLoaded,
        handleAvatarChange,
        refreshAccount
    } = props
    
    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
            
            let result = await curUserIdx.get('profile', curUserIdx.id)
            console.log('result ', result)
             if(result) {
                 result.date ? setDate(result.date) : setDate('')
                 result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                 result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                 result.name ? setName(result.name) : setName('')
              }

          
        }
       
        fetchData()
          .then((res) => {
            console.log('res', res)
          })
    },[])

    const onDropAvatar = async (pictureFiles, pictureDataURLs) => {
        if(pictureDataURLs[0]!==null){
          console.log('picture files', pictureFiles)
       setAvatar(pictureDataURLs[0])
        } else {
           setAvatar(avatar)
        }
    }

    function handleFileHash(hash) {
      setAvatar(process.env.IPFS_PROVIDER + hash)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleNameChange = (event) => {
        let value = event.target.value;
        setName(value)
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
            name: name,
            avatar: avatar,
            shortBio: shortBio
        }
      
        let result = await curUserIdx.set('profile', record)
       

      setFinished(true)
      handleLoaded(false)
      handleAvatarChange(avatar)
      refreshAccount()
      setOpen(false)
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
            <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
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
              
           
            </Dialog>
          </div>
          </div>
        )
}