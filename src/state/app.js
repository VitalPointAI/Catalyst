import anime from 'animejs/lib/anime.es.js'
import { generateSeedPhrase } from 'near-seed-phrase'
import { State } from '../utils/state'
import { initNear, hasKey } from './near'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../utils/ceramic'

import { config } from './config'

export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, FACTORY_DEPOSIT, DAO_FIRST_INIT, CURRENT_DAO, REDIRECT,
    NEW_PROPOSAL, NEW_SPONSOR, NEW_CANCEL, KEY_REDIRECT, NEW_PROCESS, NEW_VOTE, IPFS_PROVIDER,
    networkId, nodeUrl, walletUrl, nameSuffix, factorySuffix,
    contractName, didRegistryContractName, factoryContractName
} = config

const initialState = {
	app: {
        mounted: false,
        wasValidated: false,
        accountTaken: false,
        alert: null,
        initialized: false
    },
    links: []
};

export const { appStore, AppProvider } = State(initialState, 'app');

let alertAnimation
export const onAlert = (message) => async ({update}) => {
    await update('app.alert', message)
    if (alertAnimation) {
        alertAnimation.pause()
    }
    alertAnimation = anime({
        targets: '.alert',
        easing: 'easeOutElastic',
        keyframes: [
            {scaleX: 0, scaleY: 0, duration: 0},
            {scaleX: 1, scaleY: 1, duration: 500},
            {duration: 2000},
            {scaleX: 0, scaleY: 0, duration: 500, easing: 'easeInCubic'},
        ],
        complete: function () {
            update('app.alert', null)
        }
    });
}

export const onAppMount = () => async ({ update, getState, dispatch }) => {
    update('app', { mounted: true });

    const url = new URL(window.location.href)
    const key = url.searchParams.get('key')
    const from = url.searchParams.get('from')
    const message = decodeURIComponent(url.searchParams.get('message') || '')
    const link = url.searchParams.get('link') || ''
    const accountId = url.searchParams.get('accountId')
    const owner = url.searchParams.get('owner')

    if (key && accountId) {
        const { seedPhrase, publicKey } = generateSeedPhrase()
        const keyExists = await hasKey(key, accountId)
        update('accountData', { key, from, message, link, accountId, seedPhrase, publicKey, keyExists, owner })

        const near = await nearAPI.connect({
            networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
        })

        const wallet = new nearAPI.WalletAccount(near)

        wallet.signedIn = wallet.isSignedIn()
        if (wallet.signedIn) {

             // ********* Initiate Dids Registry Contract ************

            const account = wallet.account()
            const loggedInAccountId = account.accountId
            const didRegistryContract = await ceramic.initiateDidRegistryContract(account)
           
            //Initiate App Ceramic Components
    
            const appIdx = await ceramic.getAppIdx(didRegistryContract)

            // let curUserIdx = await ceramic.getCurrentUserIdx3ID(near, loggedInAccountId, appIdx)
            // console.log('curUserIdx app', curUserIdx)
            // update('accountData', { curUserIdx })
            

            let curUserIdx
            if(didRegistryContract) {
                let existingDid = await didRegistryContract.hasDID({accountId: loggedInAccountId})

                if(existingDid){
                    curUserIdx = await ceramic.getCurrentUserIdx(account, appIdx, didRegistryContract)
                    update('accountData', { curUserIdx })
                }
            
                if(!existingDid){
                    curUserIdx = await ceramic.getCurrentUserIdxNoDid(appIdx, didRegistryContract, account, null, null, loggedInAccountId)
                    update('accountData', { curUserIdx })
                }
            }
        }
    } else {
        dispatch(initNear());
    }
};
