import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'

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
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'

// Textile ThreadsDB components
import { initiateCollection, 
    createRecord,
    initiateAppCollection,
    createAppRecord,
    retrieveRecord,
    retrieveAppRecord,
    updateRecord,
    isAppCollection,
    isUserCollection,
    updateAppRecord } from '../../../../../utils/threadsDB'
import { commentSchema } from '../../../Schemas/Comment'

// ReactQuill Component
import ReactQuill from 'react-quill';

// CSS Styles
import '../../../../../../node_modules/react-quill/dist/quill.snow.css'

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

//const imageName = require('../../../../assets/no-avatar.jpg') // default no-image avatar

export default function CommentForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [commentSubject, setCommentSubject] = useState('')
    const [commentBody, setCommentBody] = useState('')
    const [commentPublished, setCommentPublished] = useState(false)
    const [commentParent, setCommentParent] = useState(props.proposalId.toString())
    const [commentAuthor, setCommentAuthor] = useState(props.accountId)
    const [commentId, setCommentId] = useState()   

    const { register, handleSubmit, watch, errors } = useForm()

    const {
        proposalId,
        accountId,
        contract
    } = props
    console.log('proposalid', proposalId)
    const classes = useStyles()

    useEffect(() => {
        async function fetchData() {
         
            
        }
       
        fetchData()
          .then((res) => {
            console.log('res', res)
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

    const handleCommentBodyChange = (content, delta, source, editor) => {
        console.log('content', content)
        console.log('delta', delta)
        console.log('source', source)
        console.log('editor', editor)
        setCommentBody(content)
    }

    async function getCommentId() {
      let _commentId = await contract.getCommentLength()
      _commentId++
      let stringCommentId = _commentId.toString()
      console.log('_commentId ', stringCommentId)
     
      return stringCommentId
    }

    const onSubmit = async (values) => {
        event.preventDefault();
        setFinished(false)
        console.log('values ', values)
        let _commentId = await getCommentId()
        console.log('comment id after set ', _commentId)
        let record = {
          _id: _commentId,
          parent: commentParent,
          subject: commentSubject,
          body: commentBody,
          author: commentAuthor,
          postDate: new Date().getTime(),
          published: commentPublished
      }

        let userCollectionExists = await isUserCollection('Comment')
        !userCollectionExists ? await initiateCollection('Comment', commentSchema) : null

        let result = await retrieveRecord(commentId, 'Comment')
        console.log('present user ', result)
        console.log('user record ', result)
        if(!result) {
            await createRecord('Comment', record)
            await contract.addComment({
              commentId: _commentId,
              commentParent: commentParent,
              published: commentPublished.toString()
          }, '150000000000000')
        } else {
            const updatedRecord = result
            updatedRecord.parent = commentParent
            updatedRecord.subject = commentSubject
            updatedRecord.body = commentBody
            updatedRecord.postDate = new Date().getTime()
            updatedRecord.published = commentPublished
            await updateRecord('Comment', [updatedRecord])
        }

        if(commentPublished) {
            let appCollectionExists = await isAppCollection('Comment')
            !appCollectionExists ? await initiateAppCollection('Comment', commentSchema) : null

            let result = await retrieveAppRecord(commentId, 'Comment')
            console.log('present user ', result)
            console.log('user record ', result)
            if(!result) {
                await createAppRecord('Comment', record)
                await contract.addComment({
                  commentId: _commentId,
                  commentParent: commentParent,
                  published: commentPublished.toString()
              }, '150000000000000')
            } else {
              const updatedRecord = result
              updatedRecord.parent = commentParent
              updatedRecord.subject = commentSubject
              updatedRecord.body = commentBody
              updatedRecord.postDate = new Date().getTime()
              updatedRecord.published = commentPublished
              await updateAppRecord('Comment', [updatedRecord])
            }
        }

        if(!commentPublished) {
          let appCollectionExists = await isAppCollection('Comment')
          !appCollectionExists ? await initiateAppCollection('Comment', commentSchema) : null

          let result = await retrieveAppRecord(_commentId, 'Comment')
          console.log('present user ', result)
          console.log('user record ', result)

          if(result) {
            await deleteAppRecord(_commentId, 'Comment') 
          }
        }

      setFinished(true)
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
                    <ReactQuill
                      theme="snow"
                      modules={modules}
                      formats={formats}
                      name="commentBody"
                      value={commentBody}
                      onChange={handleCommentBodyChange}
                      style={{height:'150px', marginBottom:'100px'}}
                      inputRef={register({
                          required: true
                      })}
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