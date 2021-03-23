const summonEventsSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'SummonEventLog',
    type: 'object',
    properties: {
      events: {
        type: 'array',
        title: 'summon',
        items: {
          type: 'object',
          title: 'summon event',
          properties: {
            id: {
              $ref: '#/definitions/CeramicDocId',
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