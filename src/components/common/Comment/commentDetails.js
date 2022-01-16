import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../../state/app'
import { ceramic } from '../../../utils/ceramic'
import { useForm, Controller } from 'react-hook-form'
import CommentForm from './commentForm'

//material ui imports
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton'
import ReplyIcon from '@material-ui/icons/Reply'
import Grid from '@material-ui/core/Grid'
import { CardActionArea, CardActions, Divider } from '@material-ui/core'

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

    const { state, dispatch, update } = useContext(appStore)

    const {
        near,
        appIdx,
        accountId,
        isUpdated,
        daoFactory,
        didRegistryContract,
        curDaoIdx,
        memberStatus
      } = state
  
      const {
          proposalApplicant,
          proposalId,
          commentId,
          commentPublished,
          commentBody,
          commentAuthor,
          commentPostDate,
          commentSubject,
      } = props

    const [running, setRunning] = useState(false)
    const [finished, setFinished] = useState(false)
    const [avatar, setAvatar] = useState()
    const [name, setName] = useState('')
    const [replyEnabled, setReplyEnabled] = useState(false)

    const { register, handleSubmit, watch, errors } = useForm()

    const classes = useStyles();
    
    
    useEffect(() => {
        async function fetchData() {
         if(isUpdated){}
            if(commentAuthor){
                let did = await ceramic.getDid(commentAuthor, daoFactory, didRegistryContract)
                let result = await appIdx.get('profile', did)
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
        
    },[isUpdated])


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
                    proposalId={proposalId}
                    >
                </CommentForm>
                : null 
            }
            </div>
        </div>
    )
}
