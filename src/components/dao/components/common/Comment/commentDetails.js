import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Typography from '@material-ui/core/Typography';

import { retrieveAppRecord, deleteAppRecord, retrieveRecord, deleteRecord } from '../../../../../utils/threadsDB'
//import Avatar from '../../../components/common/Avatar/avatar'

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: 14,
        marginLeft: '10px'
    },
    
    }));

export default function CommentDetails(props) {

    const [running, setRunning] = useState(false)
    const [commentDate, setCommentDate] = useState()
    const [finished, setFinished] = useState(false)
    const [commentSubject, setCommentSubject] = useState()
    const [commentBody, setCommentBody] = useState()
    const [commentAuthor, setCommentAuthor] = useState(props.commentAuthor)

    console.log('commentdetails props', props)
    const {
        commentId,
        commentPublished
    } = props
    console.log('comment props', props)
    const classes = useStyles();
    
    
    useEffect(() => {
        async function fetchData() {
            setFinished(false)
            let record
            if(!commentPublished) {
                record = await retrieveRecord(commentId, 'Comment')
            } else {
                record = await retrieveAppRecord(commentId, 'Comment')
            }
            console.log('comment record', record)
            if(record) {
                setCommentDate(record.postDate)
                setCommentSubject(record.subject)
                setCommentBody(record.body)
            } else {
            console.log('no record')
            }
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
    console.log('comment post date', commentDate)
    if(commentDate) {
        let intDate = parseInt(commentDate)
        formatCommentDate = new Date(intDate).toLocaleString()
        console.log("formatted comment date", formatCommentDate)
    } else {
        formatCommentDate = 'undefined'
    }

    const commentMember = () => {
        comments.filter((comment) => ((comment[2] == commentAuthor) || comment.commentAuthor == commentAuthor))[0]
    }

    const deleteComment = () => {
        handleDelete()
        if (commentAuthor === accountId) {
        deleteAppRecord(commentId, 'Comment') 
        contract.deleteCommentProfile({
            commentId: commentId
        }, process.env.DEFAULT_GAS_VALUE).then(response => {
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
                <Typography className={classes.title} color="textSecondary" gutterBottom>Posted by: {commentAuthor}</Typography>
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
