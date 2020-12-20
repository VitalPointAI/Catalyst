import { connect, Contract, keyStores, WalletConnection, transactions, utils, WalletAccount, Account, providers } from 'near-api-js'
import getConfig from './config'
import { initiateDB, initiateAppDB } from './threadsDB'

const BN = require('bn.js')
const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))
  window.near = near
  window.provider = new providers.JsonRpcProvider(nearConfig.nodeUrl)

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near)

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  window.contract = new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: [
      'isOwner',
      'onlyShareholder',
      'onlyMember',
      'onlyDelegate',
      'getUserTokenBalance',
      'getMemberProposalVote',
      'getTokenCount',
      'getInit',
      'getCurrentPeriod',
      'getAllProposalEvents',
      'getSummoner',
      'getProposalFlags',
      'getGuildTokenBalances',
      'getEscrowTokenBalances',
      'getInitSettings',
      'getDepositToken',
      'getMemberStatus',
      'getProposalVotes',
      'getMemberInfo',
      'getUserTokenBalanceObject',
      'getProposalDeposit',
      'getTributeToken',
      'getTributeOffer',
      'getProcessingReward',
      'getPeriodDuration',
      'getMemberShares',
      'getMemberLoot',
      'getAppIdentity',
      'getIdentity',
      'getCommentLength',
      'getAllComments',
      'getProposalComments'
    ],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: [
      'init',
      'widthdrawBalance',
      'withdrawBalances',
      'collectTokens',
      'cancelProposal',
      'submitProposal',
      'submitWhitelistProposal',
      'submitGuildKickProposal',
      'submitMemberProposal',
      'sponsorProposal',
      'submitVote',
      'processProposal',
      'processWhitelistProposal',
      'processGuildKickProposal',
      'proposalPassed',
      'proposalFailed',
      'ragequit',
      'registerApp',
      'setAppIdentity',
      'setIdentity',
      'registerMember',
      'addComment'
    ],
  })
  
}

export function logout() {
  window.walletConnection.signOut()
  // reload page
 // window.location.replace(window.location.origin + window.location.pathname)
 window.location.replace(window.location.origin)
 
}

export async function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  await window.walletConnection.requestSignIn(nearConfig.contractName)  
}