export const memberSchema = {
    $id: 'https://example.com/post.schema.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Members',
    type: 'object',
    required: ['_id'],
    properties: {
      _id: {
        type: 'string',
      },
      fleetId: {
        type: 'string',
      },
      delegateKey: {
        type: 'string',
      },
      shares: {
        type: 'string',
      },
      loot: {
        type: 'string',
      },
      existing: {
        type: 'boolean',
      },
      highestIndexYesVote: {
        type: 'number',
        minimum: 0,
      },
      jailed: {
        type: 'number',
        minimum: 0,
      },
      joined: {
        type: 'number',
        minimum: 0,
      },
      updated: {
        type: 'number',
        minimum: 0,
      }
    },
}