// Textile ThreadsDB components
import {
    initiateAppCollection,
    createAppRecord,
    retrieveAppRecord,
    isAppCollection,
    deleteAppRecord,
    updateAppRecord } from './threadsDB'
import { submitProposalSchema } from '../components/dao/Schemas/ProposalEvents';

class ProposalEvent {

    constructor(){}

async recordEvent(proposalId, applicant, proposer, sponsor, sharesRequested, lootRequested, tributeOffered, tributeToken, paymentRequested,
    paymentToken, startingPeriod, yesVote, noVote, flags, maxTotalSharesAndLootAtYesVote, proposalSubmission, votingPeriod, gracePeriod, voteFinalized) {

        let record = {
            _id: proposalId.toString(),
            applicant: applicant,
            proposer: proposer,
            sponsor: sponsor,
            sharesRequested: sharesRequested,
            lootRequested: lootRequested,
            tributeOffered: tributeOffered,
            tributeToken: tributeToken,
            paymentRequested: paymentRequested,
            paymentToken: paymentToken,
            startingPeriod: startingPeriod,
            yesVote: yesVote,
            noVote: noVote,
            flags: flags,
            maxTotalSharesAndLootAtYesVote: maxTotalSharesAndLootAtYesVote,
            proposalSubmission: parseInt(proposalSubmission),
            votingPeriod: votingPeriod,
            gracePeriod: gracePeriod,
            voteFinalized: parseInt(voteFinalized)
        }

        let appCollectionExists = await isAppCollection('SubmitProposals')
        !appCollectionExists ? await initiateAppCollection('SubmitProposals', submitProposalSchema) : null

        let result = await retrieveAppRecord(proposalId.toString(), 'SubmitProposals')
        console.log('event record ', result)
        if(!result) {
            try{
            await createAppRecord('SubmitProposals', record)
            } catch (err) {
                console.log('problem recording proposal', err)
                return false
            }
        } else {
            const updatedRecord = result
            updatedRecord.applicant = applicant,
            updatedRecord.proposer = proposer,
            updatedRecord.sponsor = sponsor,
            updatedRecord.sharesRequested = sharesRequested,
            updatedRecord.lootRequested = lootRequested,
            updatedRecord.tributeOffered = tributeOffered,
            updatedRecord.tributeToken = tributeToken,
            updatedRecord.paymentRequested = paymentRequested,
            updatedRecord.paymentToken = paymentToken,
            updatedRecord.startingPeriod = startingPeriod,
            updatedRecord.yesVote = yesVote,
            updatedRecord.noVote = noVote,
            updatedRecord.flags = flags,
            updatedRecord.maxTotalSharesAndLootAtYesVote = maxTotalSharesAndLootAtYesVote,
            updatedRecord.proposalSubmission = parseInt(proposalSubmission),
            updatedRecord.votingPeriod = votingPeriod,
            updatedRecord.gracePeriod = gracePeriod,
            updatedRecord.voteFinalized = parseInt(voteFinalized)
            try{
            await updateAppRecord('SubmitProposals', [updatedRecord])
            } catch (err) {
                console.log('problem updating proposal', err)
                return false
            }
        }
    return true
}

    async retrieveAllEvents(proposalsLength) {
        let allEvents = []
        let appCollectionExists = false
            try{
                appCollectionExists = await isAppCollection('SubmitProposals')
            } catch (err) {
                console.log('proposal collection does not exist', err)
                return false
            }
        //    await this.deleteEvent(2)
        if(proposalsLength > 0 && appCollectionExists){
            for(let i=0; i < proposalsLength; i++) {
                try {
                    let result = await retrieveAppRecord(i.toString(), 'SubmitProposals')
                    allEvents.push(result)
                } catch (err) {
                    console.log('error retrieving proposal record', err)
                }
            }
        }
        return allEvents
    }

    async deleteEvent(proposalId) {
        let appCollectionExists = false
        try{
            appCollectionExists = await isAppCollection('SubmitProposals')
        } catch (err) {
            console.log('proposal collection does not exist', err)
            return false
        }
        try{
        appCollectionExists ? await deleteAppRecord(proposalId.toString(), 'SubmitProposals') : null
        } catch (err) {
            console.log('problem deleting proposal record', err)
            return false
        }
        return true
    }
}

export const proposalEvent = new ProposalEvent()