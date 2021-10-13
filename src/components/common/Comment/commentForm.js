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
import { getStatus, generateId } from '../../../state/near'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import AddCommentIcon from '@material-ui/icons/AddComment'
import { IconButton } from '@material-ui/core'


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
      

        let nextCommentId = generateId()

        // Load existing array of details
      
        if(!allComments){
          allComments = { comments: [] }
        }
       
        let body = draftToHtml(convertToRaw(commentBody.getCurrentContent()))

        let record = {
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

        // Add comment
        allComments.comments.push(record)
      
        try{
          await curDaoIdx.set('comments', allComments)
          if(reply){  
            let preview
            if(body.length > 27)
              { 
                preview = body.substring(3,25) + "..."
              }
            else{
                preview = body.substring(3, body.length - 5) + "..."
            }

            //get notification array from ceramic
            //then convert the object 
            console.log("APP", appIdx)
            let notificationRecipient
            let resultArray = await ceramic.downloadKeysSecret(appIdx, 'notifications')
            if(resultArray){
              notificationRecipient = new Map(Object.entries(resultArray[0]))
            }
            else{
              notificationRecipient = new Map()
            }
            
            
            //create new map to hold the values in above map + new notification
            let notificationMap = new Map() 
            
            //get array of notifications associated with original comment author
            let notifs
            if(notificationRecipient){
              notifs  = notificationRecipient.get(originalAuthor)
            }
            else{
              notifs = []
            }
          
            //boots oldest notification if there are more than 75
            if(notifs){
              if(notifs.length > 75){
                notifs.shift()
              }
            }
            else{
              notifs = []
            }
           
            //want to then push to that array the new notification
            notifs.push(
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

            //rewrite value at accountId to include new array with added notif
            notificationMap.set(originalAuthor, notifs)
            console.log("NOTIFICATIONMAP", notificationMap)
            
            //now we need to wrap this in an array to send it to ceramic, which
            //won't accept the map
            let notificationArray = []
            notificationArray.push(notificationMap) 
            try{
               let result2 = await ceramic.storeKeysSecret(appIdx, notificationArray, 'notifications', appIdx.id)
            } catch (err) {
              console.log('error setting notifications', err)
            }
          }
  
          let notificationFlag = get(NEW_NOTIFICATIONS, [])
          if(notificationFlag >= 1){
            let count = notificationFlag.newNotifications + 1
            set(NEW_NOTIFICATIONS, {newNotifications: count})
          }
          else{
            set(NEW_NOTIFICATIONS, {newNotifications: 1})
          }
        } catch (err) {
          console.log('error adding comment', err)
        }
        
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
                                required: false                              
                            })}
                        />: null}
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
                  
                  <IconButton onClick={handleSubmit(onSubmit)} color="primary" type="submit"><AddCommentIcon/>
                            Submit Comment
                  </IconButton>  
                  </>
                  : null }     
                </div>        
              </form>
              )}
        </div>
        )
}