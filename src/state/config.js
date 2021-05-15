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
    GAS: '200000000000000',
    FACTORY_DEPOSIT: '2',
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    nameSuffix: '.testnet',
    factorySuffix: '.factory.vitalpointai.testnet',
    contractName: 'testnet',
    didRegistryContractName: 'dids.vitalpointai.testnet',
    factoryContractName: 'factory.vitalpointai.testnet'
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
