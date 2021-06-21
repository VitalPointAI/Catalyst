import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    networkId
} = config

class DAO {

    constructor(){}

    async initDaoContract(account, contractId) {
        //initialize DAO Contract
        const daocontract = new nearApiJs.Contract(account, contractId, {
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
                'getPeriodDuration',
                'getMemberShares',
                'getMemberLoot',
                'getAppIdentity',
                'getIdentity',
                'getCommentLength',
                'getAllComments',
                'getProposalComments',
                'getAllMemberInfo',
                'getTotalShares',
                'getProposalsLength',
                'getInitEventsLength',
                'getTotalMembers',
                'getProposal',
                'getDonation',
                'getSummonTime',
                'proveOwner',
                'getDonationsLength',
                'getCurrentShare'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
                'init',
                'setInit',
                'withdrawBalance',
                'withdrawBalances',
                'collectTokens',
                'submitProposal',
                'submitWhitelistProposal',
                'submitGuildKickProposal',
                'submitMemberProposal',
                'submitCommitmentProposal',
                'submitOpportunityProposal',
                'submitTributeProposal',
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
                'addComment',
                'deleteDAO',
                'cancelProposal',
                'makeDonation',
                'leave'
            ]
            });

            return daocontract
    }

    // async loadDAO(contractId) {
       
    //     let loadAccount = await this.loadAccountObject()
       
    //     const account = await wallet.getAccount(loadAccount.accountId)
        
    //     let daoContract = await this.initDaoContract(account, contractId)
        
    //     return daoContract
    // }

    // async loadAccountObject() {
    //     const near = await nearApiJs.connect(Object.assign({ deps: { keyStore: wallet.keyStore } }, process.env.REACT_APP_ENV))
    //     let loadAccount = await wallet.loadAccount()
    //     return loadAccount
    // }
    
}

export const dao = new DAO()