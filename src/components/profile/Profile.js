import React, { useEffect } from 'react'
import { Translate } from 'react-localize-redux'
import { useDispatch, useSelector } from 'react-redux'
import PageContainer from '../common/PageContainer';
import Avatar from '../common/Avatar/avatar'
import ProfileDetails from './ProfileDetails'
import ProfileSection from './ProfileSection'
import RecoveryContainer from './Recovery/RecoveryContainer'
import HardwareDevices from './hardware_devices/HardwareDevices'
import TwoFactorAuth from './two_factor/TwoFactorAuth'
import { LOADING, NOT_FOUND, useAccount } from '../../hooks/allAccounts'
import { getLedgerKey, checkCanEnableTwoFactor, getAccessKeys, redirectTo } from '../../actions/account';
import { initiateDB } from '../../utils/threadsDB'

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

    useEffect(() => {

        if (accountIdFromUrl && accountIdFromUrl !== accountIdFromUrl.toLowerCase()) {
            dispatch(redirectTo(`/profile/${accountIdFromUrl.toLowerCase()}`))
        }

        if (isOwner) {
            dispatch(getAccessKeys(accountId))
            dispatch(getLedgerKey())
            dispatch(checkCanEnableTwoFactor(account))
            initiateDB()
        }
    }, []);

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
        </PageContainer>
        </>
    )
}
