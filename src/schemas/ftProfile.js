export const ftProfileSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'FTProfile',
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
      "email":{
        type: 'string'
      },
      "discord":{
        type: 'string'
      },
      "telegram":{
        type: 'string'
      },
      "reddit": {
        type: 'string'
      },
      "website": {
        type: 'string'
      },
      "twitter": {
        type: "string"
      },
      "extraInfo1": {
        type: "array"
      },
      "extraInfo2": {
        type: "array"
      },
   },
  }