// Textile ThreadsDB components
import {
    initiateAppCollection,
    createAppRecord,
    retrieveAppRecord,
    isAppCollection,
    deleteAppRecord,
    updateAppRecord } from './threadsDB'
import { summonSchema } from '../components/dao/Schemas/SummonEvents'

class SummonEvent {

    constructor(){}

    async recordSummonEvent(id, summoner, tokens, summoningTime, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, updateTime) {
        
        let record = {
            _id: id,
            summoner: summoner,
            tokens: tokens,
            summoningTime: parseInt(summoningTime),
            periodDuration: parseInt(periodDuration),
            votingPeriodLength: parseInt(votingPeriodLength),
            gracePeriodLength: parseInt(gracePeriodLength),
            proposalDeposit: proposalDeposit,
            dilutionBound: parseInt(dilutionBound),
            updateTime: parseInt(updateTime)
        }

        let appCollectionExists = await isAppCollection('SummonEvents')
        !appCollectionExists ? await initiateAppCollection('SummonEvents', summonSchema) : null

        let result = await retrieveAppRecord(id, 'SummonEvents')
        if(result){
            await deleteAppRecord(id, 'SummonEvents')
        }
        await createAppRecord('SummonEvents', record)
    }

    async updateDaoEvent(id, summoner, tokens, summoningTime, periodDuration, votingPeriodLength, gracePeriodLength, proposalDeposit, dilutionBound, updateTime) {

        let appCollectionExists = await isAppCollection('SummonEvents')
        !appCollectionExists ? await initiateAppCollection('SummonEvents', summonSchema) : null

        let result = await retrieveAppRecord(id.toString(), 'SummonEvents')

        let updatedRecord = result
        updatedRecord.summoner = summoner,
        updatedRecord.tokens = tokens,
        updatedRecord.summoningTime = parseInt(summoningTime),
        updatedRecord.periodDuration = parseInt(periodDuration),
        updatedRecord.votingPeriodLength = parseInt(votingPeriodLength),
        updatedRecord.gracePeriodLength = parseInt(gracePeriodLength),
        updatedRecord.proposalDeposit = proposalDeposit,
        updatedRecord.dilutionBound = parseInt(dilutionBound),
        updatedRecord.updateTime = parseInt(updateTime)
        await updateAppRecord('SummonEvents', [updatedRecord])
    }

    async retrieveAllSummonEvents(latestEvent) {
        let allSummonEvents = []
        let appCollectionExists = false
            try{
                appCollectionExists = await isAppCollection('SummonEvents')
            } catch (err) {
                console.log('summon collection does not exist', err)
                return false
            }
          //      await this.deleteSummonEvent('undefined')
        if(latestEvent > 0 && appCollectionExists){
            for(let i=0; i < latestEvent; i++) {
                try {
                let result = await retrieveAppRecord((i+1).toString(), 'SummonEvents')
                console.log('retrieve summon result', result)
                allSummonEvents.push(result)
                } catch (err) {
                    console.log('error retrieving summon record', err)
                }
            }
        }
        return allSummonEvents
    }

    async deleteSummonEvent(eventId) {
        let appCollectionExists = false
        try{
            appCollectionExists = await isAppCollection('SummonEvents')
        } catch (err) {
            console.log('summon collection does not exist', err)
            return false
        }
        try{
        appCollectionExists ? await deleteAppRecord(eventId, 'SummonEvents') : null
        } catch (err) {
            console.log('problem deleting summon record', err)
            return false
        }
        return true
    }
}

export const summonEvent = new SummonEvent()