import { BN } from 'bn.js'

// testnet / default
let config = {
    SEED_PHRASE_LOCAL_COPY: '__SEED_PHRASE_LOCAL_COPY',
    FUNDING_DATA: '__FUNDING_DATA',
    ACCOUNT_LINKS: '__ACCOUNT_LINKS',
    DAO_LINKS: '__DAO_LINKS',
    DAO_FIRST_INIT: '__DAO_FIRST_INIT',
    CURRENT_DAO: '__CURRENT_DAO',
    REDIRECT: '__REDIRECT',
    NEW_PROPOSAL: '__NEW_PROPOSAL',
    NEW_SPONSOR: '__NEW_SPONSOR',
    NEW_PROCESS: '__NEW_PROCESS',
    NEW_CANCEL: '__NEW_CANCEL',
    NEW_VOTE: '__NEW_VOTE',
    NEW_DONATION: '__NEW_DONATION',
    KEY_REDIRECT: '__KEY_REDIRECT',
    NEW_EXIT: '__NEW_EXIT',
    NEW_RAGE: '__NEW_RAGE',
    NEW_DELEGATION: '__NEW_DELEGATION',
    NEW_REVOCATION: '__NEW_REVOCATION',
    GAS: '200000000000000',
    FACTORY_DEPOSIT: '2',
    APP_OWNER_ACCOUNT: 'vitalpointai.testnet',
    CERAMIC_API_URL: 'https://ceramic-clay.3boxlabs.com',
  //  CERAMIC_API_URL: 'http://20.151.200.193:7007',
  //  CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com:7007',
    IPFS_PROVIDER: 'https://ipfs.io/ipfs/',
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
    nameSuffix: '.testnet',
    factorySuffix: '.factory1.vitalpointai.testnet',
    contractName: 'testnet',
    didRegistryContractName: 'dids1.vitalpointai.testnet',
    factoryContractName: 'factory1.vitalpointai.testnet'
}

if (process.env.REACT_APP_ENV === 'prod') {
    config = {
        ...config,
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        nameSuffix: '.near',
        contractName: 'near',
        didRegistryContractName: 'did.near',
    }
}

export { config }
