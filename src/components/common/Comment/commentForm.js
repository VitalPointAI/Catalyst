import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import LinearProgress from '@material-ui/core/LinearProgress'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'

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
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [commentSubject, setCommentSubject] = useState('')
    const [commentBody, setCommentBody] = useState(EditorState.createEmpty())
    const [commentPublished, setCommentPublished] = useState(false)
    const [commentParent, setCommentParent] = useState(props.proposalId.toString())
    const [commentAuthor, setCommentAuthor] = useState(props.accountId)
    const [commentId, setCommentId] = useState()   

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        proposalId,
        accountId,
        curDaoIdx,
        handleUpdate
    } = props
   
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

    const handlePublishToggle = () => {
        const published = !commentPublished
        setCommentPublished(published)
    }

     const handleCommentBodyChange = (editorState) => {
      setCommentBody(editorState)
     }

    const handleReset = () => {
      setCommentSubject('')
      setCommentPublished(false)
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

        let record = {
          commentId: nextCommentId.toString(),
          parent: proposalId.toString(),
          subject: commentSubject,
          body: draftToHtml(convertToRaw(commentBody.getCurrentContent())),
          author: commentAuthor,
          postDate: new Date().getTime(),
          published: commentPublished
        }

        // Add comment
        allComments.comments.push(record)
        console.log('allComments.comments', allComments.comments)
        await curDaoIdx.set('comments', allComments)
        
      handleReset()
      setFinished(true)
      handleUpdate(true)
    }
    
        return (
          <div>
              {!finished ? <LinearProgress className={classes.progress} /> : (
                <form>
                    <div>
                      <FormControlLabel
                        control={<Switch checked={commentPublished} onChange={handlePublishToggle} color="primary" />}
                        label="Published"
                      />
                    </div>    
                    <div>
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
                      />
                    {errors.commentSubject && <p style={{color: 'red'}}>You must provide a subject/title.</p>}
                    </div>
                    <div>
                    <Editor
                      editorState={commentBody}
                      toolbarClassName="toolbarClassName"
                      wrapperClassName="wrapperClassName"
                      editorClassName="editorClassName"
                      onEditorStateChange={handleCommentBodyChange}
                    />
                    </div>
                 
                  
                <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
                  Submit Comment
                </Button>

              </form>
              )}
        </div>
        )
}