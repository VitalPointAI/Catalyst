import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ceramic } from '../../utils/ceramic'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      marginTop: '10px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    header: {
      display: 'inherit'
    }
  }));

export default function MemberCard(props) {

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState()
    const [shortBio, setShortBio] = useState('')
    const [did, setDID] = useState()

    const classes = useStyles();

    const { 
      accountName, 
      shares, 
      joined, 
      memberCount, 
      summoner,
      curUserIdx,
      appIdx,
      appClient,
      contractIdx,
      didsContract } = props

      const {
        contractId
      } = useParams()

    useEffect(
        () => {
          console.log('curUserIdx', curUserIdx)
          async function fetchData() {
            let contractDid
            try {
              did = await didsContract.getDID({accountId: contractId})
            } catch (err) {
              console.log('error retrieving contract DID', err)
            }
            let memberDid
            try {
              console.log('account name', accountName)
              memberDid = await didsContract.getDID({accountId: accountName})
              console.log('memberdid', memberDid)
            } catch (err) {
              console.log('error retrieving member DID', err)
            }
            console.log('contractIdx', contractIdx)
           
              let members = await contractIdx.get('member')
              console.log('dao members', members)
              console.log('curUserIdxy', curUserIdx)
              let result = await curUserIdx.get('profile', memberDid)
              console.log('result ', result)
              if(result) {
                  result.date ? setDate(result.date) : setDate('')
                  result.avatar ? setAvatar(result.avatar) : setAvatar('')
                  result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                  result.name ? setName(result.name) : setName('')
                }
            
        }
       
        fetchData()
          .then((res) => {
            console.log('res', res)
          })

    }, [contractIdx]
    )


    return(
        <>
        <Card raised={true} className={classes.card} >
          <div style={{float:'left', padding:'3px', width:'18%'}}>
          <Avatar variant="circular" src={avatar}  />
          </div>
          <div style={{float:'left', marginLeft:'10px', width:'70%'}}>
          <CardHeader
            title={name}
          />
          </div>
          <CardHeader
          subheader={<Typography variant="overline" align="center">Joined: {date}</Typography>}
          className={classes.header}
          />
 
          <CardContent>
            <Grid container alignItems="center" style={{marginTop: '-20px', marginBottom:'20px', display:'inherit'}}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Typography variant="overline" align="center">{shares > 1 ? shares + ' shares' : shares + ' share' }</Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Typography variant="overline">{`Voting Power: ${shares && memberCount ? (shares / memberCount)*100 : '100'}%`}</Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Chip size="small" color="primary" label={summoner} /> 
            </Grid>
            </Grid>
          </CardContent>
        </Card>
        </>
    )
}