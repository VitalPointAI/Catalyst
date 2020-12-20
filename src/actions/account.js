
import { parse, stringify } from 'query-string'
import { createActions, createAction } from 'redux-actions'
import { DISABLE_CREATE_ACCOUNT, wallet } from '../utils/wallet'
import { TwoFactor } from '../utils/twoFactor'
import { push } from 'connected-react-router'
import { loadState, saveState, clearState } from '../utils/sessionStorage'
import {
    WALLET_CREATE_NEW_ACCOUNT_URL, WALLET_CREATE_NEW_ACCOUNT_FLOW_URLS, WALLET_LOGIN_URL, WALLET_SIGN_URL,
    setKeyMeta, MULTISIG_MIN_PROMPT_AMOUNT
} from '../utils/wallet'
import { PublicKey, KeyType } from 'near-api-js/lib/utils/key_pair'
import { WalletError } from '../utils/walletError'
import { utils } from 'near-api-js'
import { BN } from 'bn.js'

export const loadRecoveryMethods = createAction('LOAD_RECOVERY_METHODS',
    wallet.getRecoveryMethods.bind(wallet),
    () => ({})
)

export const handleRedirectUrl = (previousLocation) => (dispatch, getState) => {
    const { pathname } = getState().router.location
    const isValidRedirectUrl = previousLocation.pathname.includes(WALLET_LOGIN_URL) || previousLocation.pathname.includes(WALLET_SIGN_URL)
    const page = pathname.split('/')[1]
    const guestLandingPage = !page && !wallet.accountId
    const createAccountPage = page === WALLET_CREATE_NEW_ACCOUNT_URL

    if ((guestLandingPage || createAccountPage) && isValidRedirectUrl) {
        let url = {
            ...getState().account.url,
            redirect_url: previousLocation.pathname
        }
        saveState(url)
        dispatch(refreshUrl(url))
    }
}


export const handleClearUrl = () => (dispatch, getState) => {
    const { pathname } = getState().router.location
    const page = pathname.split('/')[1]
    const guestLandingPage = !page && !wallet.accountId
    const saveUrlPages = [...WALLET_CREATE_NEW_ACCOUNT_FLOW_URLS, WALLET_LOGIN_URL, WALLET_SIGN_URL].includes(page)

    if (!guestLandingPage && !saveUrlPages) {
        clearState()
        dispatch(refreshUrl({}))
    }
}

export const parseTransactionsToSign = createAction('PARSE_TRANSACTIONS_TO_SIGN')

export const handleRefreshUrl = () => (dispatch, getState) => {
    const { pathname, search } = getState().router.location
    const currentPage = pathname.split('/')[pathname[1] === '/' ? 2 : 1]

    if ([...WALLET_CREATE_NEW_ACCOUNT_FLOW_URLS, WALLET_LOGIN_URL, WALLET_SIGN_URL].includes(currentPage)) {
        const parsedUrl = {
            referrer: document.referrer && new URL(document.referrer).hostname,
            ...parse(search)
        }

        if ([WALLET_LOGIN_URL, WALLET_SIGN_URL].includes(currentPage) && search !== '') {
            saveState(parsedUrl)
            dispatch(refreshUrl(parsedUrl))
            dispatch(checkContractId())
        } else {
            dispatch(refreshUrl(loadState()))
        }

        const { transactions, callbackUrl } = getState().account.url
        if (transactions) {
            dispatch(parseTransactionsToSign({ transactions, callbackUrl }))
        }
    }
}

const checkContractId = () => async (dispatch, getState) => {
    const { contract_id } = getState().account.url

    if (contract_id) {
        const redirectIncorrectContractId = () => {
            console.error('Invalid contractId:', contract_id)
            dispatch(push({ pathname: `/${WALLET_LOGIN_URL}/incorrect-contract-id` }))
        }

        if (!wallet.isLegitAccountId(contract_id)) {
            redirectIncorrectContractId()
            return
        }

        try {
            await (await wallet.getAccount(contract_id)).state()
        } catch(error) {
            if (error.message.indexOf('does not exist while viewing') !== -1) {
                redirectIncorrectContractId()
            }
        }
    }
}

export const redirectToProfile = () => (dispatch) => dispatch(push({ pathname: '/profile' }))

export const redirectTo = (location, state = {}) => (dispatch) => dispatch(push({ 
    pathname: location,
    state
}))

export const redirectToApp = (fallback) => (dispatch, getState) => {
    const { account: { url }} = getState()
    dispatch(push({
        pathname: (url && url.redirect_url !== '/' && url.redirect_url) || fallback || '/',
        search: (url && (url.success_url || url.public_key)) ? `?${stringify(url)}` : '',
        state: {
            globalAlertPreventClear: true
        }
    }))
}


export const allowLogin = () => async (dispatch, getState) => {
    const { account } = getState()
    const { url } = account
    console.log('url', url)
    await dispatch(addAccessKey(account.accountId, url.contract_id, url.public_key))

    const { success_url, public_key } = url
    if (success_url) {
        dispatch(clearAlert())
        const availableKeys = await wallet.getAvailableKeys();
        const allKeys = availableKeys.map(key => key.toString());
        const parsedUrl = new URL(success_url)
        parsedUrl.searchParams.set('account_id', account.accountId)
        parsedUrl.searchParams.set('public_key', public_key)
        parsedUrl.searchParams.set('all_keys', allKeys.join(','))
        window.location = parsedUrl.href
    } else {
        await dispatch(push({ pathname: '/authorized-apps' }))
    }
}

export const signInWithLedger = () => async (dispatch, getState) => {
    await dispatch(getLedgerAccountIds())

    const accountIds = Object.keys(getState().ledger.signInWithLedger)
    return await dispatch(signInWithLedgerAddAndSaveAccounts(accountIds))
}

export const signInWithLedgerAddAndSaveAccounts = (accountIds) => async (dispatch, getState) => {
    for (let accountId of accountIds) {
        try {
            await dispatch(addLedgerAccountId(accountId))
            await dispatch(setLedgerTxSigned(false, accountId))
        } catch (e) {
            console.warn('Error importing Ledger-based account', accountId, e)
            // NOTE: We still continue importing other accounts
        }
    }

    return dispatch(saveAndSelectLedgerAccounts(getState().ledger.signInWithLedger))
}

const defaultCodesFor = (prefix, data) => ({ successCode: `${prefix}.success`, errorCode: `${prefix}.error`, prefix, data})

const twoFactorMethod = async (method, wallet, args) => {
    const account = await wallet.getAccount(wallet.accountId)
    if (account[method]) {
        return await account[method](...args)
    }
    return false
}

export const {
    initializeRecoveryMethod,
    validateSecurityCode,
    initTwoFactor,
    reInitTwoFactor,
    resendTwoFactor,
    verifyTwoFactor,
    promptTwoFactor,
    deployMultisig,
    disableMultisig,
    checkCanEnableTwoFactor,
    get2faMethod,
    getLedgerKey,
    getLedgerPublicKey,
    setupRecoveryMessage,
    setupRecoveryMessageNewAccount,
    deleteRecoveryMethod,
    checkNearDropBalance,
    checkIsNew,
    checkNewAccount,
    createNewAccount,
    checkAccountAvailable,
    clear,
    clearCode
} = createActions({
    INITIALIZE_RECOVERY_METHOD: [
        wallet.initializeRecoveryMethod.bind(wallet),
        () => defaultCodesFor('account.initializeRecoveryMethod')
    ],
    VALIDATE_SECURITY_CODE: [
        wallet.validateSecurityCode.bind(wallet),
        () => defaultCodesFor('account.validateSecurityCode')
    ],
    INIT_TWO_FACTOR: [
        (...args) => new TwoFactor(wallet, wallet.accountId).initTwoFactor(...args),
        () => defaultCodesFor('account.initTwoFactor')
    ],
    REINIT_TWO_FACTOR: [
        (...args) => new TwoFactor(wallet, wallet.accountId).initTwoFactor(...args),
        () => defaultCodesFor('account.reInitTwoFactor')
    ],
    RESEND_TWO_FACTOR: [
        () => twoFactorMethod('sendCode', wallet, []),
        () => defaultCodesFor('account.resendTwoFactor')
    ],
    VERIFY_TWO_FACTOR: [
        (...args) => new TwoFactor(wallet, wallet.accountId).verifyCodeDefault(...args),
        () => defaultCodesFor('account.verifyTwoFactor')
    ],
    PROMPT_TWO_FACTOR: [
        (requestPending) => {
            let promise
            if (requestPending !== null) {
                promise = new Promise((resolve, reject) => {
                    requestPending = (verified, error) => {
                        if (verified) {
                            resolve(verified)
                        } else {
                            reject(error)
                        }
                    }
                })
            }
            return ({ requestPending, promise })
        },
        () => defaultCodesFor('account.promptTwoFactor')
    ],
    DEPLOY_MULTISIG: [
        () => new TwoFactor(wallet, wallet.accountId).deployMultisig(),
        () => defaultCodesFor('account.deployMultisig')
    ],
    DISABLE_MULTISIG: [
        (...args) => twoFactorMethod('disableMultisig', wallet, args),
        () => defaultCodesFor('account.disableMultisig')
    ],
    CHECK_CAN_ENABLE_TWO_FACTOR: [
        (...args) => TwoFactor.checkCanEnableTwoFactor(...args),
        () => defaultCodesFor('account.checkCanEnableTwoFactor')
    ],
    GET_2FA_METHOD: [
        (...args) => twoFactorMethod('get2faMethod', wallet, args),
        () => defaultCodesFor('account.get2faMethod')
    ],
    GET_LEDGER_KEY: [
        wallet.getLedgerKey.bind(wallet),
        () => defaultCodesFor('account.LedgerKey')
    ],
    GET_LEDGER_PUBLIC_KEY: [
        wallet.getLedgerPublicKey.bind(wallet),
        () => defaultCodesFor('account.LedgerPublicKey')
    ],
    SETUP_RECOVERY_MESSAGE: [
        wallet.setupRecoveryMessage.bind(wallet),
        () => defaultCodesFor('account.setupRecoveryMessage')
    ],
    SETUP_RECOVERY_MESSAGE_NEW_ACCOUNT: [
        wallet.setupRecoveryMessageNewAccount.bind(wallet),
        () => defaultCodesFor('account.setupRecoveryMessageNewAccount')
    ],
    DELETE_RECOVERY_METHOD: [
        wallet.deleteRecoveryMethod.bind(wallet),
        () => defaultCodesFor('account.deleteRecoveryMethod')
    ],
    CHECK_NEAR_DROP_BALANCE: [
        wallet.checkNearDropBalance.bind(wallet),
        () => defaultCodesFor('account.nearDropBalance')
    ],
    CHECK_IS_NEW: [
        wallet.checkIsNew.bind(wallet),
        () => defaultCodesFor('account.create')
    ],
    CHECK_NEW_ACCOUNT: [
        wallet.checkNewAccount.bind(wallet),
        () => defaultCodesFor('account.create')
    ],
    CREATE_NEW_ACCOUNT: [
        wallet.createNewAccount.bind(wallet),
        () => defaultCodesFor('account.create')
    ],
    CHECK_ACCOUNT_AVAILABLE: [
        wallet.checkAccountAvailable.bind(wallet),
        () => defaultCodesFor('account.available')
    ],
    CLEAR: null,
    CLEAR_CODE: null
})

export const { getAccessKeys, removeAccessKey, addLedgerAccessKey, disableLedger, removeNonLedgerAccessKeys, getLedgerAccountIds, addLedgerAccountId, saveAndSelectLedgerAccounts, setLedgerTxSigned, clearSignInWithLedgerModalState, showLedgerModal } = createActions({
    GET_ACCESS_KEYS: [wallet.getAccessKeys.bind(wallet), () => ({})],
    REMOVE_ACCESS_KEY: [
        wallet.removeAccessKey.bind(wallet),
        () => defaultCodesFor('authorizedApps.removeAccessKey', { onlyError: true })
    ],
    ADD_LEDGER_ACCESS_KEY: [wallet.addLedgerAccessKey.bind(wallet), () => defaultCodesFor('errors.ledger', { onlyError: true })],
    DISABLE_LEDGER: [wallet.disableLedger.bind(wallet), () => defaultCodesFor('errors.ledger')],
    REMOVE_NON_LEDGER_ACCESS_KEYS: [wallet.removeNonLedgerAccessKeys.bind(wallet), () => ({})],
    GET_LEDGER_ACCOUNT_IDS: [wallet.getLedgerAccountIds.bind(wallet), () => defaultCodesFor('signInLedger.getLedgerAccountIds')],
    ADD_LEDGER_ACCOUNT_ID: [
        wallet.addLedgerAccountId.bind(wallet),
        (accountId) => ({
            accountId,
            ...defaultCodesFor('signInLedger.addLedgerAccountId')
        })
    ],
    SAVE_AND_SELECT_LEDGER_ACCOUNTS: [wallet.saveAndSelectLedgerAccounts.bind(wallet), () => defaultCodesFor('signInLedger.saveAndSelectLedgerAccounts')],
    SET_LEDGER_TX_SIGNED: [
        (status) => ({ status }),
        (status, accountId) => ({
            accountId
        })
    ],
    CLEAR_SIGN_IN_WITH_LEDGER_MODAL_STATE: null,
    SHOW_LEDGER_MODAL: null
})

export const handleAddAccessKeySeedPhrase = (accountId, recoveryKeyPair) => async (dispatch) => {
    try {
        await dispatch(addAccessKeySeedPhrase(accountId, recoveryKeyPair))
    } catch (error) {
        // error is thrown in `addAccessKeySeedPhrase` action, despite the error, we still want to redirect to /profile
    }
    dispatch(redirectTo('/profile', { 
        globalAlertPreventClear: true
    }))
}

export const fundCreateAccount = (accountId, recoveryKeyPair, recoveryMethod) => async (dispatch) => {
    await wallet.keyStore.setKey(wallet.connection.networkId, accountId, recoveryKeyPair)
    const implicitAccountId = Buffer.from(recoveryKeyPair.publicKey.data).toString('hex')
    await wallet.keyStore.setKey(wallet.connection.networkId, implicitAccountId, recoveryKeyPair)
    dispatch(redirectTo(`/fund-create-account/${accountId}/${implicitAccountId}/${recoveryMethod}`))
}

export const fundCreateAccountLedger = (accountId, ledgerPublicKey) => async (dispatch) => {
    await setKeyMeta(ledgerPublicKey, { type: 'ledger' })
    const implicitAccountId = Buffer.from(ledgerPublicKey.data).toString('hex')
    const recoveryMethod = 'ledger'
    dispatch(redirectTo(`/fund-create-account/${accountId}/${implicitAccountId}/${recoveryMethod}`))
}

// TODO: Refactor common code with setupRecoveryMessageNewAccount
export const handleCreateAccountWithSeedPhrase = (accountId, recoveryKeyPair, fundingOptions) => async (dispatch) => {
    if (DISABLE_CREATE_ACCOUNT && !fundingOptions) {
        await dispatch(fundCreateAccount(accountId, recoveryKeyPair, 'seed'))
        return
    }

    try {
        await dispatch(createAccountWithSeedPhrase(accountId, recoveryKeyPair, fundingOptions))
    } catch (error) {
        dispatch(redirectTo('/recover-seed-phrase', { 
            globalAlertPreventClear: true,
            defaultAccountId: accountId
        }))
        return
    }
}

                
export const finishAccountSetup = () => async (dispatch) => {
    const account = await dispatch(refreshAccount())
    
    let promptTwoFactor = await TwoFactor.checkCanEnableTwoFactor(account)

    if (new BN(account.balance.available).lt(new BN(utils.format.parseNearAmount(MULTISIG_MIN_PROMPT_AMOUNT)))) {
        promptTwoFactor = false
    }

    if (promptTwoFactor) {
        dispatch(redirectTo('/enable-two-factor'))
    } else {
        dispatch(redirectToApp('/profile'))
    }
}

export const createAccountFromImplicit = createAction('CREATE_ACCOUNT_FROM_IMPLICIT', async (accountId, implicitAccountId, recoveryMethod) => {
    const recoveryKeyPair = await wallet.keyStore.getKey(wallet.connection.networkId, implicitAccountId)
    if (recoveryKeyPair) {
        await wallet.saveAccount(accountId, recoveryKeyPair)
    }
    const publicKey = new PublicKey({ keyType: KeyType.ED25519, data: Buffer.from(implicitAccountId, 'hex') })
    await wallet.createNewAccount(accountId, { fundingAccountId: implicitAccountId }, recoveryMethod, publicKey)
})

export const { addAccessKey, createAccountWithSeedPhrase, addAccessKeySeedPhrase, clearAlert } = createActions({
    ADD_ACCESS_KEY: [
        wallet.addAccessKey.bind(wallet),
        (title) => defaultCodesFor('account.login', {title})
    ],
    CREATE_ACCOUNT_WITH_SEED_PHRASE: [
        async (accountId, recoveryKeyPair, fundingOptions = {}) => {
            const recoveryMethod = 'seed'
            const previousAccountId = wallet.accountId
            await wallet.saveAccount(accountId, recoveryKeyPair);
            await wallet.createNewAccount(accountId, fundingOptions, recoveryMethod, recoveryKeyPair.publicKey, previousAccountId)
        },
        () => defaultCodesFor('account.createAccountSeedPhrase')
    ],
    ADD_ACCESS_KEY_SEED_PHRASE: [
        async (accountId, recoveryKeyPair) => {
            const publicKey = recoveryKeyPair.publicKey.toString()
            const contractName = null;
            const fullAccess = true;
            
            try {
                await wallet.postSignedJson('/account/seedPhraseAdded', { accountId, publicKey })
                await wallet.addAccessKey(accountId, contractName, publicKey, fullAccess)
            } catch (error) {
                throw new WalletError(error, 'account.addAccessKey.error')
            }
        },
        () => defaultCodesFor('account.setupSeedPhrase')
    ],
    CLEAR_ALERT: null,
})

export const { recoverAccountSeedPhrase } = createActions({
    RECOVER_ACCOUNT_SEED_PHRASE: [
        wallet.recoverAccountSeedPhrase.bind(wallet),
        () => defaultCodesFor('account.recoverAccount')
    ],
})

export const { signAndSendTransactions, setSignTransactionStatus, sendMoney } = createActions({
    SET_SIGN_TRANSACTION_STATUS: [
        (status) => ({ status }),
        () => defaultCodesFor('account.setSignTransactionStatus')
    ],
    SIGN_AND_SEND_TRANSACTIONS: [
        wallet.signAndSendTransactions.bind(wallet),
        () => defaultCodesFor('account.signAndSendTransactions', { onlyError: true })
    ],
    SEND_MONEY: [
        wallet.sendMoney.bind(wallet),
        () => defaultCodesFor('account.sendMoney', { onlyError: true })
    ]
})

export const { switchAccount, refreshAccount, refreshAccountExternal, refreshUrl } = createActions({
    SWITCH_ACCOUNT: wallet.selectAccount.bind(wallet),
    REFRESH_ACCOUNT: [
        wallet.refreshAccount.bind(wallet),
        () => ({ accountId: wallet.accountId })
    ],
    REFRESH_ACCOUNT_EXTERNAL: [
        async (accountId) => ({
            ...await (await wallet.getAccount(accountId)).state(),
            balance: await wallet.getBalance(accountId)
        }),
        accountId => ({ accountId })
    ],
    REFRESH_URL: null
})
