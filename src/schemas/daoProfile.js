export const daoProfileSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Profile',
    type: 'object',
    properties: {
      "contractId": {
        "type": "string",
      },
      "summoner": {
        "type": "string",
      },
      "date": {
        "type": "string",
      },
      "category": {
        "type": "string",
      },
      "name": {
          "type": "string",
      },
      "logo": {
        "type": "string",
      },
      "purpose": {
        "type": "string",
        "title": "text",
        "maxLength": 4000,
      },
    },
  }