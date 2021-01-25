import { wallet } from './wallet'
import * as nearApiJs from 'near-api-js'
import getConfig from './config'

class DAO {

    constructor(){}

    async initDAOContract(account) {
        //initialize DAO Contract
        const daocontract = new nearApiJs.Contract(account, process.env.DAO_CONTRACT, {
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
                'getSummonTime'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
                'init',
                'setInit',
                'widthdrawBalance',
                'withdrawBalances',
                'collectTokens',
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
            sender: account.accountId
            });

            return daocontract
    }

    async loadDAO() {
       
        let loadAccount = await this.loadAccountObject()
        const account = await wallet.getAccount(loadAccount.accountId)
        let daoContract = await this.initDAOContract(account)
        
        return daoContract
    }

    async loadAccountObject() {
        const nearConfig = getConfig(process.env.NODE_ENV || 'development')
        const near = await nearApiJs.connect(Object.assign({ deps: { keyStore: wallet.keyStore } }, nearConfig))
        let loadAccount = await wallet.loadAccount()
        return loadAccount
    }
    
}

export const dao = new DAO()