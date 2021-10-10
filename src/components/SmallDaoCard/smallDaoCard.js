import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { dao } from '../../utils/dao'
import EditDaoForm from '../EditDao/editDao'
import DaoProfileDisplay from '../DAOProfileDisplay/daoProfileDisplay'
import Persona from '@aluhning/get-personas-js'
import Purpose from '../Purpose/purpose'


// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'
import { CardHeader, LinearProgress } from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import Chip from '@material-ui/core/Chip'
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'

import { config } from '../../state/config'

export const {
    DAO_LINKS
} = config

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      //cursor: 'pointer',
      verticalAlign: 'middle',
      margin: '10px 10px 10px 10px',
      padding: '2px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    square: {
      float: 'left',
      marginRight: '10px',
      marginTop: '5px',
    }
  }));

const imageName = require('../../img/default_logo.png') // default no-image avatar

export default function SmallDaoCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [sdate, setsDate] = useState()
    const [sname, setsName] = useState('')
    const [slogo, setsLogo] = useState(imageName)
    const [spurpose, setsPurpose] = useState('')
    const [scategory, setsCategory] = useState('')
    const [owner, setOwner] = useState('')
    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [purposeClicked, setPurposeClicked] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [display, setDisplay] = useState(true)
    const [isUpdated, setIsUpdated] = useState()
    const [anchorEl, setAnchorEl] = useState(null)
    const [anchorE2, setAcnhorE2] = useState(null)
    const [did, setDid] = useState()
    const [finished, setFinished] = useState(false)
    const [created, setCreated] = useState()
    const [detailsClicked, setDetailsClicked] = useState(false) 
    const [amemberStatus, setaMemberStatus] = useState()
    const [totalMembers, setTotalMembers] = useState()
    const [memberIcon, setMemberIcon] = useState(<NotInterestedIcon />)

    const classes = useStyles();

    const { 
      summoner,
      contractId,
      link,
      contract,
      makeSearchDaos,
      memberStatus,
      status
   } = props
 
   const {
     near,
     didRegistryContract,
     appIdx, 
     accountId
   } = state

   const Dao = new Persona()

    useEffect(
      () => {

      async function fetchData() {
        
         if(contractId){
           console.log('contractid', contractId)
           let result = await Dao.getDao(contractId)
           console.log('result dao', result)
           let memberStatus
           try{
            let contract = await dao.initDaoContract(state.wallet.account(), contractId)
            memberStatus = await contract.getMemberStatus({member: accountId})
            setaMemberStatus(memberStatus)
            memberStatus ? setMemberIcon(<CheckCircleIcon />) : setMemberIcon(<NotInterestedIcon />)
            let allMembers = await contract.getTotalMembers()
            setTotalMembers(allMembers)
           } catch (err) {
             console.log('error retrieving member status', err)
           }
           if(result){
                  result.name != '' ? setsName(result.name) : setsName('')
                  result.date ? setsDate(result.date) : setsDate('')
                  result.logo !='' ? setsLogo(result.logo) : setsLogo(imageName)
                  result.purpose != '' ? setsPurpose(result.purpose) : setsPurpose('')
                  result.category != '' ? setsCategory(result.category) : setsCategory('')
                  result.owner != '' ? setOwner(result.owner) : setOwner('')
                  result.status = memberStatus
                 
           }
           
         }
        setFinished(false)
        }
        
        
      let mounted = true
      if(mounted){
        fetchData()
            .then((res) => {
              setFinished(true)
            })
      return () => mounted = false
      }
      
  }, [isUpdated]
  )

  function handleUpdate(property){
    setIsUpdated(property)
  }

  const handleEditDaoClick = () => {
    handleExpanded()
    handleEditDaoClickState(true)
  }
  const handleDetailsClick= () => {
    handleExpandedDetails()
    handleDetailsClickedState(true)
  }

  function handleDetailsClickedState(property){
    setDetailsClicked(property)
  }

  function handleEditDaoClickState(property){
    setEditDaoClicked(property)
  }

  const handlePurposeClick = () => {
    handleExpanded()
    handlePurposeClickState(true)
  }

  function handlePurposeClickState(property){
    setPurposeClicked(property)
  }

  function handleExpanded() {
    setAnchorEl(null)
  }

  function handleExpandedDetails(){
    setAcnhorE2(null)
  }

  // function formatDate(timestamp) {
  //   let intDate = parseInt(timestamp)
  //   let options = {year: 'numeric', month: 'long', day: 'numeric'}
  //   return new Date(intDate).toLocaleString('en-US', options)
  // }
  
  function formatDate(timestamp) {
    let stringDate = timestamp.toString()
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
  }

    return(
        <>
        {!display ? <LinearProgress /> : 
                     
          finished ? 
          (
            <Card className={classes.card}>
              <CardContent align="center">
              <Link to={`/dao/${contractId}`}>
                <div style={{width: '100%', 
                height: '50px',
                backgroundImage: `url(${slogo})`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            </Link>
               
                <Typography  variant="h6" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {sname != '' ? sname : contractId.split('.')[0]}
                </Typography><br></br>
                <Chip variant="outlined" label={status} icon={status=='active'? <PlayCircleFilledIcon style={{ color: 'green[500]'}} /> : <PauseCircleFilledIcon style={{color: 'red[500]'}}/>} style={{marginTop: '10px'}}/><br></br>

                <Typography  variant="overline" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {totalMembers} {totalMembers == 1 ? 'Member' : 'Members'}
                </Typography>
              </CardContent>
              <CardActions>
                <Link to={`/dao/${contractId}`}>
                  <Button color="primary" style={{float: 'left'}}>
                    Visit
                  </Button>
                </Link>
                {state.accountId == summoner ? (
                <Button color="primary" onClick={handleEditDaoClick} style={{float: 'right'}}>
                  Edit Details
                </Button>
                ) : 
                <Button color="primary" onClick={handleDetailsClick} style={{marginLeft:45, float: 'right'}}>
                  Details
                </Button>
                }

              </CardActions>
            </Card>
          ) 
          : null
        }
       
          {editDaoClicked ? <EditDaoForm
            state={state}
            handleEditDaoClickState={handleEditDaoClickState}
            curDaoIdx={curDaoIdx}
            handleUpdate={handleUpdate}
            contractId={contractId}
            /> : null }
          
           {detailsClicked ? <DaoProfileDisplay
            state={state}
            handleDetailsClickedState={handleDetailsClickedState}
            curDaoIdx={curDaoIdx}
            handleUpdate={handleUpdate}
            contractId={contractId}
            /> : null }

          {purposeClicked ? <Purpose
            handlePurposeClickState={handlePurposeClickState}
            contractId={contractId}
            /> : null }
        </>
       
    )
}