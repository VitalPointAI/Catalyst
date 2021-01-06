export const commentSchema = {
    $id: 'https://example.com/post.schema.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Comment',
    type: 'object',
    required: ['_id'],
    properties: {
      _id: {
        type: 'string',
      },
      parent: {
        type: 'string',
      },
      subject: {
        type: 'string',
      },
      body: {
        type: 'string',
      },
      author: {
        type: 'string',
      },
      postDate: {
        type: 'number',
        minimum: 0,
      },
      published: {
        type: 'boolean'
      },
    },
}