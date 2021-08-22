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
                'getMemberProposalVote',
                'getInit',
                'getCurrentPeriod',
                'getSummoner',
                'getProposalFlags',
                'getGuildTokenBalances',
                'getEscrowTokenBalances',
                'getInitSettings',
                'getMemberStatus',
                'getProposalVotes',
                'getMemberInfo',
                'getProposalDeposit',
                'getDepositToken',
                'getTributeToken',
                'getTributeOffer',
                'getPeriodDuration',
                'getMemberShares',
                'getMemberLoot',
                'getAppIdentity',
                'getIdentity',
                'getTotalShares',
                'getProposalsLength',
                'getTotalMembers',
                'getProposal',
                'getProposalIndex',
                'getDonation',
                'getSummonTime',
                'getDonationsLength',
                'getCurrentShare',
                'getDelegationInfo',
                'getNeededVotes'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
                'init',
                'setInit',
                'withdrawBalance',
                'withdrawBalances',
                'submitWhitelistProposal',
                'submitGuildKickProposal',
                'submitMemberProposal',
                'submitCommitmentProposal',
                'submitOpportunityProposal',
                'submitTributeProposal',
                'submitConfigurationProposal',
                'submitCommunityRoleProposal',
                'submitAssignRoleProposal',
                'submitReputationFactorProposal',
                'submitPayoutProposal',
                'sponsorProposal',
                'submitVote',
                'processProposal',
                'processWhitelistProposal',
                'processGuildKickProposal',
                'ragequit',
                'cancelProposal',
                'makeDonation',
                'leave',
                'delegate',
                'undelegate'
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