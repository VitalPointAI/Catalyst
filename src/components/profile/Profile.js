import React, { useState, useEffect } from 'react'
import { Translate } from 'react-localize-redux'
import { useDispatch, useSelector } from 'react-redux'
import PageContainer from '../common/PageContainer';
import Avatar from '../common/Avatar/avatar'
import Personas from '../Personas/personas'
import ProfileDetails from './ProfileDetails'
import ProfileSection from './ProfileSection'
import RecoveryContainer from './Recovery/RecoveryContainer'
import HardwareDevices from './hardware_devices/HardwareDevices'
import TwoFactorAuth from './two_factor/TwoFactorAuth'
import { LOADING, NOT_FOUND, useAccount } from '../../hooks/allAccounts'
import { getLedgerKey, checkCanEnableTwoFactor, getAccessKeys, redirectTo } from '../../actions/account';
import { initiateDB, initContract } from '../../utils/threadsDB'
import { did } from '../../utils/did'

export function Profile({ match }) {
    const { has2fa } = useSelector(({ account }) => account)
    const loginAccountId = useSelector(state => state.account.accountId)
    const recoveryMethods = useSelector(({ recoveryMethods }) => recoveryMethods);
    const accountIdFromUrl = match.params.accountId
    const accountId = accountIdFromUrl || loginAccountId
    const isOwner = accountId === loginAccountId
    const account = useAccount(accountId)
    const dispatch = useDispatch();
    const twoFactor = has2fa && recoveryMethods[account.accountId] && recoveryMethods[account.accountId].filter(m => m.kind.includes('2fa'))[0]
    
    const [contract, setContract] = useState()
    const [loaded, setLoaded] = useState(false)
    const [personas, setPersonas] = useState([])

    useEffect(() => {

        async function fetchData() {
            try{
                
                let didContract = await did.loadDID()
                console.log('didContract', didContract)
                setContract(didContract)
                
                let didObject = await did.initializeDID(didContract, account.accountId)

                let personas = await contract.getAllPersonas()
                setPersonas(personas)
            } catch (err) {
                console.log('error retrieving contract')
                return false
            }
        }

         
        fetchData()
            .then((res) => {
                console.log('res', res)
                setLoaded(true)
                console.log('loaded', loaded)
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
    []
    );

    if (account.__status === LOADING) {
        return <PageContainer title={<Translate id='profile.pageTitle.loading' />} />
    }

    if (account.__status === NOT_FOUND) {
        return <PageContainer title={<Translate id='profile.pageTitle.personaNotFound' data={{ accountId }} />} />
    }

    return (
        <>
        <Avatar personaId={1} accountId={loginAccountId}/>
        <PageContainer title={<Translate id='profile.pageTitle.personaDefault' data={{ accountId }} />}>
        
            <ProfileSection>
                <ProfileDetails account={account} isOwner={isOwner} />
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
