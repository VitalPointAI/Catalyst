import {
    wallet
} from './wallet';
import { config } from '../state/config'

const {
   FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, REDIRECT, 
   KEY_REDIRECT, APP_OWNER_ACCOUNT, IPFS_PROVIDER, FACTORY_DEPOSIT, CERAMIC_API_URL, APPSEED_CALL, 
   ACCOUNT_HELPER_URL,
   networkId, nodeUrl, walletUrl, nameSuffix,
   contractName, didRegistryContractName,
   TOKEN_CALL, AUTH_TOKEN
} = config

const axios = require('axios').default

export const TOKENS_PER_PAGE = 4;

// Methods for interacting witn NEP171 tokens (https://nomicon.io/Standards/NonFungibleToken/README.html)
export default class NonFungibleTokens {
    // View functions are not signed, so do not require a real account!
    static viewFunctionAccount = wallet.getAccountBasic('dontcare')

    static getLikelyTokenContracts = async (accountId) => {
        return await axios.get(`${ACCOUNT_HELPER_URL}/account/${accountId}/likelyNFTs`);
    }

    static getMetadata = async (contractName) => {
        let account = wallet.getAccountBasic('groovy')
        return await account.viewFunction(contractName, 'nft_metadata');
    }

    static getTokens = async ({ contractName, accountId, base_uri, fromIndex = 0 }) => {
        let tokens;
        try {
            const tokenIds = await this.viewFunctionAccount.viewFunction(contractName, 'nft_tokens_for_owner_set', { account_id: accountId });
            let account = wallet.getAccountBasic('groovy')
            tokens = await Promise.all(tokenIds.slice(fromIndex, TOKENS_PER_PAGE + fromIndex).map(async token_id => {
                let metadata = await account.viewFunction(contractName, 'nft_token_metadata', { token_id: token_id.toString() });
                let { media, reference } = metadata;
                if (!media && reference) {
                    // TODO: Filter which URIs are allowed for privacy?
                    // TODO: Figure out ARWeave CORS issue
                    // NOTE: For some reason raw fetch() doesn't have same issue as sendJson
                    // tokenMetadata = sendJson('GET', `${base_uri}/${reference}`);
                    metadata = await axios.get(`${base_uri}/${reference}`);
                }
                return { token_id, metadata };
            }));
        } catch (e) {
            if (!e.toString().includes('FunctionCallError(MethodResolveError(MethodNotFound))')) {
                throw e;
            }

            tokens = await account.viewFunction(contractName, 'nft_tokens_for_owner', {
                account_id: accountId,
                from_index: fromIndex.toString(),
                limit: TOKENS_PER_PAGE
            });
        }
        // TODO: Separate Redux action for loading image
        tokens = await Promise.all(tokens.filter(({ metadata }) => !!metadata).map(async ({ metadata, ...token }) => {
            const { media } = metadata;
            let mediaUrl;
            if (!media.includes('://')) {
                if (base_uri) {
                    mediaUrl = `${base_uri}/${media}`;
                } else {
                    mediaUrl = `https://cloudflare-ipfs.com/ipfs/${media}`;
                }
            } else {
                mediaUrl = media;
            }

            return {
                ...token,
                metadata: {
                    ...metadata,
                    mediaUrl
                }
            };
        }));

        return tokens;
    }
}

export const fungibleTokensService = new NonFungibleTokens();