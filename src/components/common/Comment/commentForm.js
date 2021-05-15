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
    }));

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

    const handleCommentBodyChange = (content, delta, source, editor) => {
        setCommentBody(content)
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
          body: commentBody,
          author: commentAuthor,
          postDate: new Date().getTime(),
          published: commentPublished
        }

        // Add comment
        allComments.comments.push(record)
        console.log('allComments.comments', allComments.comments)
        await curDaoIdx.set('comments', allComments)
        
      setFinished(true)
      handleUpdate(true)
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