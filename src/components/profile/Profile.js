import React, { useState, useEffect } from 'react'
import { Translate } from 'react-localize-redux'
import { useDispatch, useSelector } from 'react-redux'
import PageContainer from '../common/PageContainer';
import Personas from '../Personas/personas'
import ProfileDetails from './ProfileDetails'
import ProfileSection from './ProfileSection'
import RecoveryContainer from './Recovery/RecoveryContainer'
import HardwareDevices from './hardware_devices/HardwareDevices'
import TwoFactorAuth from './two_factor/TwoFactorAuth'
import { LOADING, NOT_FOUND, useAccount } from '../../hooks/allAccounts'
import { getLedgerKey, checkCanEnableTwoFactor, getAccessKeys, redirectTo } from '../../actions/account';
import { wallet } from '../../utils/wallet'
import { ceramic } from '../../utils/ceramic'
import { IDX } from '@ceramicstudio/idx'

import MasterPersonaForm from '../../components/Personas/EditPersona/editMasterPersona'

// Material UI Imports
import { makeStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'

const imageName = require('../../images/default-profile.png') // default no-image avatar

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
    heading: {
      fontSize: 24,
      marginLeft: '10px'
    },
    }));

export function Profile(props) {
    const { has2fa } = useSelector(({ account }) => account)
    const loginAccountId = useSelector(state => state.account.accountId)
    const recoveryMethods = useSelector(({ recoveryMethods }) => recoveryMethods);
    const accountIdFromUrl = props.match.params.accountId
    const accountId = accountIdFromUrl || loginAccountId
    const isOwner = accountId === loginAccountId
    const account = useAccount(accountId)
    const dispatch = useDispatch();
    const twoFactor = has2fa && recoveryMethods[account.accountId] && recoveryMethods[account.accountId].filter(m => m.kind.includes('2fa'))[0]
    
    const [contract, setContract] = useState()
    const [loaded, setLoaded] = useState(false)
    const [personas, setPersonas] = useState([])
    const [editProfileClicked, setEditProfileClicked] = useState()
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')

    const classes = useStyles()

    const {
        curUserIdx,
        refreshAccount,
        handleAvatarChange
    } = props

    useEffect(() => {

        async function fetchData() {
            if(curUserIdx){
             
              let result = await curUserIdx.get('profile', curUserIdx.id)
              let test = await curUserIdx.getIndex(curUserIdx.id)
              console.log('test', test)
              console.log('result ', result)
              if(result) {
                  result.date ? setDate(result.date) : setDate('')
                  result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                  result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                  result.name ? setName(result.name) : setName('')
                }
            }

           
          
        }
       
        fetchData()
          .then((res) => {
            console.log('res', res)
            setLoaded(true)
          })
    

        if (accountIdFromUrl && accountIdFromUrl !== accountIdFromUrl.toLowerCase()) {
            dispatch(redirectTo(`/profile/${accountIdFromUrl.toLowerCase()}`))
        }

        if (isOwner) {
            dispatch(getAccessKeys(accountId))
            dispatch(getLedgerKey())
            dispatch(checkCanEnableTwoFactor(account))
           
            }
    
            
    }, 
    [curUserIdx, loaded]
    );

    if (account.__status === LOADING) {
        return <PageContainer title={<Translate id='profile.pageTitle.loading' />} />
    }

    if (account.__status === NOT_FOUND) {
        return <PageContainer title={<Translate id='profile.pageTitle.personaNotFound' data={{ accountId }} />} />
    }

    const handleEditProfileClick = () => {
        setEditProfileClicked(true)
      }
    
    const handleLoaded = (property) => {
      setLoaded(property)
    }

    return (
        <>
        
        <Grid container justify="space-evenly" alignItems="center" style={{marginTop: '30px', marginBottom: '0px'}}>
            <Grid item xs={12} sm={12} md={1} lg={1} xl={1} >
            </Grid>
            <Grid item xs={12} sm={12} md={1} lg={1} xl={1} >
                <Avatar src={avatar} className={classes.large} />
            </Grid>
            <Grid item xs={12} sm={12} md={8} lg={8} xl={8} >
                <Typography variant="h1" align="center"><Translate id='profile.pageTitle.personaDefault' data={{ accountId }} /></Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={2} lg={2} xl={2} >
                <Button
                    aria-controls="fade-menu"
                    aria-haspopup="true"
                    variant="contained"
                    color="primary"
                    onClick={handleEditProfileClick}
                >
                    Edit Profile
                </Button>
            </Grid>
        </Grid>

        {editProfileClicked ? <MasterPersonaForm
            accountId={loginAccountId}
            curUserIdx={curUserIdx}
            account={account}
            handleLoaded={handleLoaded}
            handleAvatarChange={handleAvatarChange}
            refreshAccount={refreshAccount}
            /> : null }

        <PageContainer>
            <ProfileSection>
                <ProfileDetails account={account} isOwner={isOwner} curUserIdx={curUserIdx} />
                {isOwner && (
                    <>
                        <RecoveryContainer/>
                        {!account.ledgerKey && <TwoFactorAuth twoFactor={twoFactor}/>}
                        {!twoFactor && <HardwareDevices/>}
                    </>
                )}
            </ProfileSection>
          {loaded ? <Personas contract={contract} personas={personas}/> : <div>loading...</div>}
        </PageContainer>
        </>
    )
}
