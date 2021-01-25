export const summonSchema = {
    $id: 'https://example.com/post.schema.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'SummonEvent',
    type: 'object',
    required: ['_id'],
    properties: {
      _id: {
        type: 'string',
      },
      summoner: {
        type: 'string',
      },
      tokens: {
        type: 'array',
      },
      summoningTime: {
        type: 'number',
      },
      periodDuration: {
        type: 'number',
      },
      votingPeriodLength: {
        type: 'number',
      },
      gracePeriodLength: {
        type: 'number',
      },
      proposalDeposit: {
        type: 'string',
      },
      dilutionBound: {
        type: 'number',
      },
      updateTime: {
        type: 'number',
      },
    },
}