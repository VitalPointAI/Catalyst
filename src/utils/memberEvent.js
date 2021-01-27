// Textile ThreadsDB components
import {
    initiateAppCollection,
    createAppRecord,
    retrieveAppRecord,
    retrieveAppMemberRecord,
    isAppCollection,
    deleteAppRecord,
    updateAppRecord } from './threadsDB'
import { memberSchema } from '../components/dao/Schemas/Members'

class MemberEvent {

    constructor(){}

    async recordMemberEvent(id, accountId, shares, loot, existing, highestIndexYesVote, jailed, joined, updated) {

        let record = {
            _id: id.toString(),
            delegateKey: accountId,
            shares: shares,
            loot: loot,
            existing: existing,
            highestIndexYesVote: highestIndexYesVote,
            jailed: jailed,
            joined: parseInt(joined),
            updated: parseInt(joined)
        }

        let appCollectionExists = await isAppCollection('Members')
        !appCollectionExists ? await initiateAppCollection('Members', memberSchema) : null

        let result = await retrieveAppRecord(id.toString(), 'Members')
        if(result){
            await deleteAppRecord(id.toString(), 'Members')
        }
        await createAppRecord('Members', record)
        return true
    }
    
    async updateMemberEvent(accountId, shares, loot, existing, highestIndexYesVote, jailed, joined, updated) {

        let appCollectionExists = await isAppCollection('Members')
        !appCollectionExists ? await initiateAppCollection('Members', memberSchema) : null

        let result = await retrieveAppMemberRecord(accountId, 'Members')
        console.log('update member result', result)
        let updatedRecord = result
        updatedRecord.shares = shares,
        updatedRecord.loot = loot,
        updatedRecord.existing = existing,
        updatedRecord.highestIndexYesVote = highestIndexYesVote,
        updatedRecord.jailed = jailed,
        updatedRecord.joined = parseInt(joined),
        updatedRecord.updated = parseInt(updated)
        await updateAppRecord('Members', [updatedRecord])

        return true
    }

    async retrieveAllMemberEvents(latestMemberEvent) {
        console.log('latestmemberevent', latestMemberEvent)
     
        let allMemberEvents = []
        let appCollectionExists = false
            try{
                appCollectionExists = await isAppCollection('Members')
            } catch (err) {
                console.log('members collection does not exist', err)
                return false
            }
        if(latestMemberEvent > 0 && appCollectionExists){
            for(let i=0; i < latestMemberEvent; i++) {
                try {
                let result = await retrieveAppRecord((i+1).toString(), 'Members')
                allMemberEvents.push(result)
                } catch (err) {
                    console.log('error retrieving member record', err)
                }
            }
        }
        return allMemberEvents
    }

    async deleteMemberEvent(memberId) {
        let appCollectionExists = false
        try{
            appCollectionExists = await isAppCollection('Members')
        } catch (err) {
            console.log('member collection does not exist', err)
            return false
        }
        try{
        appCollectionExists ? await deleteAppRecord(memberId.toString(), 'Members') : null
        } catch (err) {
            console.log('problem deleting member record', err)
            return false
        }
        return true
    }
}

export const memberEvent = new MemberEvent()