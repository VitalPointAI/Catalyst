import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    networkId
} = config

class FT {

    constructor(){}

    async initFTContract(account, contractId) {
        //initialize DAO Contract
        const ftContract = new nearApiJs.Contract(account, contractId, {
            viewMethods: [
                'ft_total_supply',
                'ft_balance_of',
                'storage_balance_of',
                'storage_withdraw',
                'ft_metadata',
                'storage_balance_bounds',
                'get_account_storage_cost',
                'getTokenList',
                'getTokenListLength',
                'getTokensByAccount',
                'getTokenIndex'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
                'ft_transfer',
                'ft_transfer_call',
                'ft_on_transfer',
                'ft_resolve_transfer',
                'storage_deposit',
                'storage_unregister',
                'init_token'
            ]
            });

            return ftContract
    }
}

export const ft = new FT()