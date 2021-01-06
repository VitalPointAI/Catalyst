export const fundingProposalSchema = {
    $id: 'https://example.com/post.schema.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'FundingProposal',
    type: 'object',
    required: ['_id'],
    properties: {
      _id: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      details: {
        type: 'string',
      },
      proposer: {
        type: 'string',
      },
      submitDate: {
        type: 'number',
        minimum: 0,
      },
      published: {
        type: 'boolean'
      },
    },
}