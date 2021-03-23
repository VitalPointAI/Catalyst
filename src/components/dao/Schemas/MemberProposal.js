export const memberProposalSchema = {
    $id: 'https://example.com/post.schema.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'MemberProposal',
    type: 'object',
    required: ['proposalId'],
    properties: {
      proposalId: {
        type: 'string',
      },
      contractId: {
        type: 'string',
      },
      applicant: {
        type: 'string',
      },
      title: {
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
      },
      published: {
        type: 'boolean'
      },
    },
}