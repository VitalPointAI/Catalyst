import {ApolloClient, InMemoryCache, gql} from '@apollo/client';
import { config } from '../state/config'

const {
  GRAPH_FACTORY_API_URL,
  GRAPH_REGISTRY_API_URL,
} = config

const COMMUNITY_CREATIONS = `
query {
    createDAOs(first: 1000)
    {
        event
        blockTime
        blockHeight
        contractId
        did
        summoner
        created
        status
        deposit
    }
}
`

const INACTIVATED_COMMUNITIES = `
query {
    inactivateDAOs(first: 1000)
    {
        event
        blockTime
        blockHeight
        contractId
        deactivated
        status
    }
}
`

const ALL_DONATIONS = `
query {
    makeDonations(first: 1000)
    {
        event
        blockTime
        blockHeight
        
    }
}`

const factoryClient = new ApolloClient({
    uri: GRAPH_FACTORY_API_URL,
    cache: new InMemoryCache(),
})

const registryClient = new ApolloClient({
    uri: GRAPH_REGISTRY_API_URL,
    cache: new InMemoryCache(),
})
    

export default class Queries {

    async getAllCommunities(){
        const allCommunities = await factoryClient.query({query: gql(COMMUNITY_CREATIONS)})
        return allCommunities
    }

    async getAllInactivatedCommunities(){
        const allInactivatedCommunities = await factoryClient.query({query: gql(INACTIVATED_COMMUNITIES)})
        return allInactivatedCommunities
    }

}

export const queries = new Queries();