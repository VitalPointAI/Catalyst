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
    DASHBOARD_ARRIVAL: '__DASHBOARD_ARRIVAL',
    DASHBOARD_DEPARTURE: '__DASHBOARD_DEPARTURE',
    WARNING_FLAG: '__WARNING_FLAG',
    PERSONAS_ARRIVAL: '__PERSONAS_ARRIVAL',
    EDIT_ARRIVAL: '__EDIT_ARRIVAL',
    COMMUNITY_ARRIVAL: '__COMMUNITY_ARRIVAL',
    OPPORTUNITY_NOTIFICATION : '__OPPORTUNITY_NOTIFICATION',
    PROPOSAL_NOTIFICATION: '__PROPOSAL_NOTIFICATION', 
    NEW_NOTIFICATIONS: '__NEW_NOTIFICATIONS',
    NEW_DONATION: '__NEW_DONATION',
    KEY_REDIRECT: '__KEY_REDIRECT',
    OPPORTUNITY_REDIRECT: '__OPPORTUNITY_REDIRECT',
    NEW_EXIT: '__NEW_EXIT',
    NEW_RAGE: '__NEW_RAGE',
    NEW_DELEGATION: '__NEW_DELEGATION',
    NEW_REVOCATION: '__NEW_REVOCATION',
    COMMUNITY_DELETE: '__COMMUNITY_DELETE',
    NEW_DELETE: '__NEW_DELETE',
    AUTH_TOKEN: '__AUTH_TOKEN',
    GAS: '200000000000000',
    FACTORY_DEPOSIT: '2',
    APP_OWNER_ACCOUNT: 'vitalpointai.testnet',
   // CERAMIC_API_URL: 'https://ceramic-clay.3boxlabs.com',
  //  CERAMIC_API_URL: 'http://20.151.200.193:7007',
    CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com',
    IPFS_PROVIDER: 'https://ipfs.io/ipfs/',
  //  IPFS_PROVIDER: 'https://ceramic-node.vitalpointai.com:5011/ipfs/',
  //  APPSEED_CALL: 'https://vpbackend-apim.azure-api.net/appseed',
    TOKEN_CALL: 'https://catalystdao.com/token',
    APPSEED_CALL: 'https://catalystdao.com/appseed',
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
    nameSuffix: '.testnet',
    factorySuffix: '.factory1.vitalpointai.testnet',
    contractName: 'testnet',
    PLATFORM_SUPPORT_ACCOUNT: 'vitalpointai.testnet',
    didRegistryContractName: 'dids1.vitalpointai.testnet',
    factoryContractName: 'factory1.vitalpointai.testnet'
}

if(process.env.ENV === 'localhost') {
  config = {
    ...config,
    TOKEN_CALL: 'http://localhost:3000/token',
    APPSEED_CALL: 'http://localhost:3000/appseed',
  }
}

if (process.env.ENV === 'prod') {
    config = {
        ...config,
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        nameSuffix: '.near',
        factorySuffix: '.dao.cdao.near',
        contractName: 'near',
        didRegistryContractName: 'did.near',
        factoryContractName: 'dao.cdao.near',
        APP_OWNER_ACCOUNT: 'cdao.near',
        PLATFORM_SUPPORT_ACCOUNT: 'vitalpointai.near',
        CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com',
    }
}

export { config }
