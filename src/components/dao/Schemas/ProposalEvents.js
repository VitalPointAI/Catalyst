export const submitProposalSchema = {
    $id: 'https://example.com/post.schema.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'SubmitProposals',
    type: 'object',
    required: ['_id'],
    properties: {
      _id: {
        type: 'string',
      },
      fleetId: {
        type: 'string',
      },
      applicant: {
        type: 'string',
      },
      proposer: {
        type: 'string',
      },
      sponsor: {
        type: 'string',
      },
      sharesRequested: {
        type: 'string',
      },
      lootRequested: {
        type: 'string',
      },
      tributeOffered: {
        type: 'string',
      },
      tributeToken: {
        type: 'string',
      },
      paymentRequested: {
        type: 'string',
      },
      paymentToken: {
        type: 'string',
      },
      startingPeriod: {
        type: 'number',
        minimum: 0,
      },
      yesVotes: {
        type: 'string',
      },
      noVotes: {
        type: 'string',
      },
      flags: {
        type: 'array',
      },
      maxTotalSharesAndLootAtYesVote: {
        type: 'string',
      },
      proposalSubmission: {
        type: 'number',
        minimum: 0,
      },
      votingPeriod: {
        type: 'number',
        minimum: 0,
      },
      gracePeriod: {
        type: 'number',
        minimum: 0,
      },
      voteFinalized: {
        type: 'number',
        minimum: 0,
      }
    },
}