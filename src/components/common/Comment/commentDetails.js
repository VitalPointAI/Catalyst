import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../../state/app'
import Persona from '@aluhning/get-personas-js'
import { GAS } from '../../../utils/ceramic'
import { useForm, Controller } from 'react-hook-form'
import { Editor } from "react-draft-wysiwyg"
import CommentForm from './commentForm'

//material ui imports
import LinearProgress from '@material-ui/core/LinearProgress'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton'
import ReplyIcon from '@material-ui/icons/Reply';
import Grid from '@material-ui/core/Grid'
import { CardActionArea, CardActions, Divider } from '@material-ui/core'
import { FormControlLabel } from '@material-ui/core'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: 14,
        marginLeft: '10px'
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        float: 'left',
        marginRight: '5px',
    },
    progress: {
        width: '100%',
        '& > * + *': {
          marginTop: theme.spacing(2),
        },
      },
    }));

    const imageName = require('../../../img/default-profile.png') // default no-image avatar

export default function CommentDetails(props) {

    const [running, setRunning] = useState(false)
    const [finished, setFinished] = useState(false)
    const [avatar, setAvatar] = useState()
    const [name, setName] = useState('')
    const [replyEnabled, setReplyEnabled] = useState(false)
    const { state, dispatch, update } = useContext(appStore)
    
    const { register, handleSubmit, watch, errors } = useForm()

    const {
      didRegistryContract,
      near,
      appIdx,
      accountId
    } = state

    const {
        curDaoIdx,
        proposalApplicant,
        proposalId,
        handleUpdate,
        commentId,
        commentPublished,
        commentBody,
        commentAuthor,
        commentPostDate,
        commentSubject,
        memberStatus
    } = props
    
    const classes = useStyles();
    
    
    useEffect(() => {
        async function fetchData() {
         
            if(commentAuthor){
                const thisPersona = new Persona()
                let result = await thisPersona.getPersona(commentAuthor)
                    if(result){
                      result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                      result.name ? setName(result.name) : setName('')
                    }
           
            }
            setFinished(false)
           
        }
       
        fetchData()
          .then((res) => {
            
            setFinished(true)
          })
        
    },[])


    const handleDelete = () => {
        let state = running
        setRunning(!state)
    }

    let formatCommentDate

    if(commentPostDate) {
        let intDate = parseInt(commentPostDate)
        formatCommentDate = new Date(intDate).toLocaleString()
     
    } else {
        formatCommentDate = 'undefined'
    }

    function handleReplyClick(){
        setReplyEnabled(true)
    }
    return (
        <div>
       
            {finished ? (
                <>
                <Card variant="outlined" style={{padding:'5px'}}>
                <CardHeader title={commentSubject}></CardHeader>
                <Avatar src={avatar} className={classes.small}/>
                <Typography className={classes.title} color="textSecondary" gutterBottom>Posted by: {name} ({commentAuthor})</Typography>       
                <Typography className={classes.title} color="textSecondary" gutterBottom>{formatCommentDate}</Typography>
                    <CardContent>
                        <Grid container alignItems="flex-start" justifyContent="space-between" style={{marginBottom: '30px'}}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <div dangerouslySetInnerHTML={{ __html: commentBody}}></div>
                            </Grid>
                        </Grid>
                    </CardContent>
                    {memberStatus ?
                    <CardActions>
                        <IconButton onClick={()=>handleReplyClick()}><ReplyIcon/>Reply</IconButton>
                    </CardActions>
                        : null }
                </Card>
                <Divider variant="middle" style={{marginTop:'10px', marginBottom:'10px'}}/>
                </>
                )
            : null
            }
            <div>
            { replyEnabled ? 
                <CommentForm
                    reply={true}
                    proposalApplicant={proposalApplicant}
                    avatar={avatar}
                    originalAuthor={commentAuthor}
                    originalContent={commentBody}
                    handleUpdate={handleUpdate}
                    accountId={accountId}
                    curDaoIdx={curDaoIdx}
                    proposalId={proposalId}
                    >
                </CommentForm>
                : null 
            }
            </div>
        </div>
    )
}
