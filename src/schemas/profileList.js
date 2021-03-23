export const profileListSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'ProfilesList',
    type: 'object',
    properties: {
      profiles: {
        type: 'array',
        title: 'profiles',
        items: {
          type: 'object',
          title: 'Profile',
          properties: {
            id: {
              $ref: '#/definitions/CeramicDocId',
            },
            name: {
              type: 'string',
              name: 'name',
              maxLength: 100,
            },
          },
        },
      },
    },
    definitions: {
      CeramicDocId: {
        type: 'string',
        pattern: '^ceramic://.+(\\\\?version=.+)?',
        maxLength: 150,
      },
    },
  }