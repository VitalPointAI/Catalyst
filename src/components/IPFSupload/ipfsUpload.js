import React, { useState } from 'react'
const { create } = require('ipfs-http-client')

// material UI
import { makeStyles } from '@material-ui/core/styles'
import { LinearProgress } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    root: {
      
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    square: {
     
    },
     logo: {
        maxWidth: '175px',
        border: '1px solid',
      width: theme.spacing(12),
    },
  }));

export default function FileUpload(props) {

    const[addedFileHash, setAddedFileHash] = useState('QmZsKcVEwj9mvGfA7w7wUS1f2fLqcfzqdCnEGtdq6MBR7P')
    
    
    const {
        handleFileHash,
        handleAvatarLoaded,
        register
    } = props

    const classes = useStyles();

    const ipfsApi = create('https://infura-ipfs.io:5001')
  
    const captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        handleAvatarLoaded(false)
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.onloadend = () => saveToIpfs(reader)
        reader.readAsArrayBuffer(file)
    }

    const saveToIpfs = (reader) => {
        let ipfsId
        const buffer = Buffer.from(reader.result)
      
        ipfsApi.add(buffer)
        .then((response) => {
        ipfsId = response.path
      
        setAddedFileHash(ipfsId)
        handleFileHash(ipfsId)
        }).catch((err) => {
        console.error(err)
        })
    }

  const arrayBufferToString = (arrayBuffer) => {
    return String.fromCharCode.apply(null, new Uint16Array(arrayBuffer))
  }

  const handleSubmit = (event) => {
    
    event.preventDefault()
  }


    return (
        <div>
        
        <form id="captureMedia" onSubmit={handleSubmit} style={{textAlign: 'center', marginTop: '10px'}}>
            <input type="file" name="file" onChange={captureFile} />
        </form>
        
      </div>
    )
  }

