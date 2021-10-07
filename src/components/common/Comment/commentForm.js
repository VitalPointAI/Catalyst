import React, { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { appStore } from '../../../state/app'
import {get,set,del} from '../../../utils/storage'
import { makeStyles } from '@material-ui/core/styles'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../../utils/ceramic'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"
import { NEW_NOTIFICATIONS } from '../../../state/near' 
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from 'draftjs-to-html'
import { getStatus } from '../../../state/near'


// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import LinearProgress from '@material-ui/core/LinearProgress'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'


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
    }));

export default function CommentForm(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [commentSubject, setCommentSubject] = useState('')
    const [commentBody, setCommentBody] = useState(EditorState.createEmpty())
    const [commentParent, setCommentParent] = useState(props.proposalId.toString())
    const [commentAuthor, setCommentAuthor] = useState(props.accountId)
    const [commentId, setCommentId] = useState()   
    const [submitted, setSubmitted] = useState(false)
    const [memberStatus, setMemberStatus] = useState(getStatus(props.accountId))
    const { register, handleSubmit, watch, errors } = useForm()
   
    const {
      appIdx,
      didRegistryContract,
      near
    } = state

    const {
        reply,
        originalAuthor, 
        originalContent, 
        proposalId,
        accountId,
        curDaoIdx,
        handleUpdate,
        avatar,
        name
    } = props


    const location = useLocation().pathname

    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
         
            
        }
       
        fetchData()
          .then((res) => {
        
          })
    },[])

    const handleCommentSubjectChange = (event) => {
        let value = event.target.value;
        setCommentSubject(value)
    }

     const handleCommentBodyChange = (editorState) => {
      setCommentBody(editorState)
     }

    const handleReset = () => {
      setCommentSubject('')
      setCommentBody(EditorState.createEmpty())
    }

    const onSubmit = async (values) => {
        event.preventDefault();
        setFinished(false)
        
        let allComments = await curDaoIdx.get('comments', curDaoIdx.id)
        console.log('all comments', allComments)
        let nextCommentId
        if(allComments){
          nextCommentId = allComments.comments.length
        } else {
          nextCommentId = 0
        }

        // Load existing array of details
      
        if(!allComments){
          allComments = { comments: [] }
        }
        let record 
        let body = draftToHtml(convertToRaw(commentBody.getCurrentContent()))
        record = {
          commentId: nextCommentId.toString(),
          parent: proposalId.toString(),
          subject: commentSubject,
          body: body,
          author: commentAuthor,
          postDate: new Date().getTime(),
          published: true,
          originalAuthor: originalAuthor,
          originalContent: originalContent
        }
        
        if(reply){
          console.log('original author', originalAuthor)
          let personaAccount = new nearAPI.Account(near.connection, originalAuthor)
          
          let thisCurPersonaIdx
          try{
           thisCurPersonaIdx = await ceramic.getCurrentUserIdx(personaAccount, appIdx, didRegistryContract)
          } catch (err) {
            console.log('error retrieving idx', err)
          }
          let notificationRecipient = await thisCurPersonaIdx.get('profile', thisCurPersonaIdx.id)
          console.log('notificationrecipient', notificationRecipient)
          let preview
          if(body.length > 27)
            { 
              preview = body.substring(3,25) + "..."
            }
          else{
              preview = body.substring(3, body.length - 5) + "..."
          }
          if(notificationRecipient.notifications.length > 75){
            notificationRecipient.notifications.shift()
          }
          notificationRecipient.notifications.push(
            {
            avatar: avatar,
            commentAuthor: accountId,
            commentPreview: preview,
            type: "comment",
            link: location,
            type: location.split('/').slice(1, 2), 
            proposalId: proposalId, 
            read: false
          })
          await thisCurPersonaIdx.set('profile', notificationRecipient)
        }

        let notificationFlag = get(NEW_NOTIFICATIONS, [])
        if(notificationFlag >= 1){
          let count = notificationFlag.newNotifications + 1
          set(NEW_NOTIFICATIONS, {newNotifications: count})
        }
        else{
          set(NEW_NOTIFICATIONS, {newNotifications: 1})
        }
        // Add comment
        allComments.comments.push(record)
        console.log('allComments.comments', allComments.comments)
        await curDaoIdx.set('comments', allComments)
        
      handleReset()
      setFinished(true)
      setSubmitted(true)
      handleUpdate(true)
    }
    
        return (
          <div>
              {!finished ? <LinearProgress className={classes.progress} /> : (
                <form>
                  <div>
                    { !submitted ?
                    <>
                    {reply ?
                    <div>
                      <Typography variant="h6">Reply to {originalAuthor}'s comment</Typography>
                    </div>
                    : null }
          
                      <div>
                        { !reply ?
                        <TextField
                            autoFocus
                            margin="dense"
                            id="comment-subject"
                            variant="outlined"
                            name="commentSubject"
                            label="Subject"
                            placeholder=""
                            value={commentSubject}
                            onChange={handleCommentSubjectChange}
                            inputRef={register({
                                required: true                              
                            })}
                        />: null}
                      {errors.commentSubject && <p style={{color: 'red'}}>You must provide a subject/title.</p>}
                      </div>
                      <div>
                      <Paper style={{padding: '5px'}}>
                      <Editor
                        editorState={commentBody}
                        toolbarClassName="toolbarClassName"
                        wrapperClassName="wrapperClassName"
                        editorClassName="editorClassName"
                        onEditorStateChange={handleCommentBodyChange}
                        editorStyle={{minHeight:'200px'}}
                      />
                      </Paper>
                      
                      </div>
                  
                    
                  <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
                    Submit Comment
                  </Button> 
                  </>
                  : null }     
                </div>        
              </form>
              )}
        </div>
        )
}