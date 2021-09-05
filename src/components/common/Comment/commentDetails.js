import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../../state/app'
import Persona from '@aluhning/get-personas-js'

import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'

import { GAS } from '../../../utils/ceramic'

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
    }));

    const imageName = require('../../../img/default-profile.png') // default no-image avatar

export default function CommentDetails(props) {

    const [running, setRunning] = useState(false)
    const [finished, setFinished] = useState(false)
    const [avatar, setAvatar] = useState()
    const [name, setName] = useState('')

    const { state, dispatch, update } = useContext(appStore)

    const {
      didRegistryContract,
      near,
      appIdx,
      accountId
    } = state

    const {
        commentId,
        commentPublished,
        commentBody,
        commentAuthor,
        commentPostDate,
        commentSubject,
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
            console.log('res', res)
            setFinished(true)
          })
        
    },[])


    const handleDelete = () => {
        let state = running
        setRunning(!state)
    }

    let formatCommentDate
    console.log('comment post date', commentPostDate)
    if(commentPostDate) {
        let intDate = parseInt(commentPostDate)
        formatCommentDate = new Date(intDate).toLocaleString()
        console.log("formatted comment date", formatCommentDate)
    } else {
        formatCommentDate = 'undefined'
    }

    // const commentMember = () => {
    //     comments.filter((comment) => ((comment[2] == commentAuthor) || comment.commentAuthor == commentAuthor))[0]
    // }

    const deleteComment = () => {
        handleDelete()
        if (commentAuthor === accountId) {
        deleteAppRecord(commentId, 'Comment') 
        contract.deleteCommentProfile({
            commentId: commentId
        }, GAS).then(response => {
            console.log("[comment].js] comments", response.len)
            console.log('response', response)
            let newComments = response.comments
           //handleChange({ name: "comments", value: newComments })
            handleDelete()
        }).catch(err => {
            console.log(err);
        })
        }
    }


    return (
        <div>
       
            {finished ? (<Card variant="outlined">
                <CardHeader title={commentSubject}></CardHeader>
                <Avatar src={avatar} className={classes.small}/>
                <Typography className={classes.title} color="textSecondary" gutterBottom>Posted by: {name} ({commentAuthor})</Typography>
               
                <Typography className={classes.title} color="textSecondary" gutterBottom>{formatCommentDate}</Typography>
                <CardContent>
                    
                    <div dangerouslySetInnerHTML={{ __html: commentBody}}></div>
                </CardContent>
                </Card>
                )
            : null
            }
        </div>
    )
}
