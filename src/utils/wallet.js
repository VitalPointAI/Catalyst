import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    networkId, nodeUrl, walletUrl
} = config

const KEY_UNIQUE_PREFIX = '_4:';
const KEY_WALLET_ACCOUNTS = KEY_UNIQUE_PREFIX + 'wallet:accounts_v2';
export const KEY_ACTIVE_ACCOUNT_ID = KEY_UNIQUE_PREFIX + 'wallet:active_account_id_v2';

class Wallet {

    constructor() {
        this.keyStore = new nearApiJs.keyStores.BrowserLocalStorageKeyStore(window.localStorage, 'nearlib:keystore:');
        this.inMemorySigner = new nearApiJs.InMemorySigner(this.keyStore);

        const inMemorySigner = this.inMemorySigner;
        const wallet = this;
        this.signer = {
            async getPublicKey(accountId, networkId) {
                return (await wallet.getLedgerKey(accountId)) || (await inMemorySigner.getPublicKey(accountId, networkId));
            },
            async signMessage(message, accountId, networkId) {
                // if (await wallet.getLedgerKey(accountId)) {
                //     wallet.dispatchShowLedgerModal(true);
                //     const path = await localStorage.getItem(`ledgerHdPath:${accountId}`);
                //     const { createLedgerU2FClient } = await import('./ledger.js');
                //     const client = await createLedgerU2FClient();
                //     const signature = await client.sign(message, path);
                //     await store.dispatch(setLedgerTxSigned(true, accountId));
                //     const publicKey = await this.getPublicKey(accountId, networkId);
                //     return {
                //         signature,
                //         publicKey
                //     };
                // }

                return inMemorySigner.signMessage(message, accountId, networkId);
            }
        };
        this.connection = nearApiJs.Connection.fromConfig({
            networkId: networkId,
            provider: { type: 'JsonRpcProvider', args: { url: nodeUrl + '/' } },
            signer: this.signer
        });
        this.getAccountsLocalStorage();
        this.accountId = localStorage.getItem(KEY_ACTIVE_ACCOUNT_ID) || '';
    }

    getAccountsLocalStorage() {
        this.accounts = JSON.parse(
            localStorage.getItem(KEY_WALLET_ACCOUNTS) || '{}'
        );
    }

    getAccountBasic(accountId) {
        return new nearApiJs.Account(this.connection, accountId);
    }

    async getAccount(accountId) {
        let account = new nearApiJs.Account(this.connection, accountId);
        return account;
    }

}

export const wallet = new Wallet()