export const memberProposalSchema = {
    $id: 'https://example.com/post.schema.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'MemberProposal',
    type: 'object',
    required: ['_id'],
    properties: {
      _id: {
        type: 'string',
      },
      applicant: {
        type: 'string',
      },
      intro: {
        type: 'string',
      },
      proposer: {
        type: 'string',
      },
      submitDate: {
        type: 'number',
        minimum: 0,
      },
      avatar: {
        type: 'string',
        contentEncoding: 'base64',
      },
      published: {
        type: 'boolean'
      },
    },
}