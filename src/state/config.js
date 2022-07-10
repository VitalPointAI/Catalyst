// testnet / default
let config = {
    SEED_PHRASE_LOCAL_COPY: '__SEED_PHRASE_LOCAL_COPY',
    SEEDS: '__SEEDS',
    ALIASES: '__ALIASES',
    FIRST_TIME: '__FIRST_TIME',
    FUNDING_DATA: '__FUNDING_DATA',
    ACCOUNT_LINKS: '__ACCOUNT_LINKS',
    DAO_LINKS: '__DAO_LINKS',
    DAO_FIRST_INIT: '__DAO_FIRST_INIT',
    FT_FIRST_INIT: '__FT_FIRST_INIT',
    CURRENT_DAO: '__CURRENT_DAO',
    REDIRECT: '__REDIRECT',
    NEW_PROPOSAL: '__NEW_PROPOSAL',
    NEW_PROPOSAL_TRIGGER: '__NEW_PROPOSAL_TRIGGER',
    NEW_SPONSOR: '__NEW_SPONSOR',
    NEW_PROCESS: '__NEW_PROCESS',
    NEW_CANCEL: '__NEW_CANCEL',
    NEW_VOTE: '__NEW_VOTE',
    NEW_MEMBER_PROPOSAL: '__NEW_MEMBER_PROPOSAL',
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
    NEW_CHANGE_PROPOSAL: '__NEW_CHANGE_PROPOSAL',
    INACTIVATE_COMMUNITY: '__INACTIVATE_COMMUNITY',
    NEW_INACTIVATION: '__NEW_INACTIVATION',
    AUTH_TOKEN: '__AUTH_TOKEN',
    GAS: '200000000000000',
    PLATFORM_PERCENT: '0.5',
    STORAGE: '0.0025',
    FACTORY_DEPOSIT: '2',
    TOKEN_FACTORY_DEPOSIT: '1',
    APP_OWNER_ACCOUNT: 'vitalpointai.testnet',
    CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com',
    IPFS_PROVIDER: 'https://cloudflare-ipfs.com/ipfs/',
    TOKEN_CALL: 'https://vp-functions.azurewebsites.net/api/token-testnet',
    APPSEED_CALL: 'https://vp-functions.azurewebsites.net/api/appSeed-testnet',
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
    nameSuffix: '.testnet',
    factorySuffix: '.factory3.vitalpointai.testnet',
    tokenFactorySuffix: '.ft.vitalpointai.testnet',
    nftFactorySuffix: '.nft.vitalpointai.testnet',
    contractName: 'testnet',
    PLATFORM_SUPPORT_ACCOUNT: 'vitalpointai.testnet',
    didRegistryContractName: 'dids2.vitalpointai.testnet',
    factoryContractName: 'factory3.vitalpointai.testnet',
    tokenFactoryContractName: 'ft.vitalpointai.testnet',
    nftFactoryContractName: 'nft.vitalpointai.testnet',
    daoRootName: 'https://testnet.cdao.app',
    guildsRootName: 'https://testnet.nearguilds.live',
    personasRootName: 'https://testnet.nearpersonas.live',
    ACCOUNT_HELPER_URL: 'https://near-contract-helper.onrender.com',
    GRAPH_FACTORY_API_URL: 'https://api.thegraph.com/subgraphs/name/vitalpointai/catalyst-factory-tnet',
    GRAPH_REGISTRY_API_URL: 'https://api.thegraph.com/subgraphs/name/vitalpointai/registry-near-tnet'
}

if(process.env.ENV === 'localhost') {
  config = {
    ...config,
    daoRootName: 'http:/localhost:3003',
    TOKEN_CALL: 'http://localhost:3003/token',
    APPSEED_CALL: 'http://localhost:3003/appseed',
  }
}

if(process.env.ENV === 'test') {
  config = {
    ...config
  }
}

if (process.env.ENV === 'prod') {
    config = {
        ...config,
        TOKEN_CALL: 'https://vp-functions.azurewebsites.net/api/token-mainnet',
        APPSEED_CALL: 'https://vp-functions.azurewebsites.net/api/appSeed-mainnet',
        networkId: 'mainnet',
        //nodeUrl: 'https://rpc.mainnet.near.org',
        nodeUrl: 'https://mainnet-rpc.openshards.io',
        walletUrl: 'https://wallet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        nameSuffix: '.near',
        factorySuffix: '.cdao.near',
        tokenFactorySuffix: '.isft.near',
        nftFactorySuffix: '.isnft.near',
        contractName: 'near',
        didRegistryContractName: 'did.near',
        factoryContractName: 'cdao.near',
        tokenFactoryContractName: 'isft.near',
        nftFactoryContractName: 'isnft.near',
        APP_OWNER_ACCOUNT: 'aaron.near',
        PLATFORM_SUPPORT_ACCOUNT: 'catalystsp.near',
        daoRootName: 'https://mainnet.cdao.app',
        CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com',
        GRAPH_FACTORY_API_URL: 'https://api.thegraph.com/subgraphs/name/vitalpointai/catalyst-factory-mnet',
        GRAPH_REGISTRY_API_URL: 'https://api.thegraph.com/subgraphs/name/vitalpointai/registry-near-mnet'
      }
}

export { config }
