export const repFactorProposalDetailsSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "ProposalDetails",
  "required": [ "proposals" ],
  "properties": {
    "proposals": {
      "type": "array",
      "items": { "$ref": "#/definitions/Details" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "Details": {
      "type": "object",
      "required": ["proposalId"],
      "properties": {
        "proposalId": {
          type: 'string',
        },
        "title": {
          type: 'string',
        },
        "details": {
          type: 'string',
        },
        "proposer": {
          type: 'string',
        },
        "submitDate": {
          type: 'number',
          minimum: 0,
        },
        "published": {
          type: 'boolean'
        },
        "repFactorName": {
          type: 'string',
        },
        "repFactorPoints": {
          type: 'string',
        },
        "repFactorDescription": {
          type: 'string',
        },
        "repFactorFactors": {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        "repFactorActions": {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        "action": {
          type: 'string'
        },
        "repFactorStart": {
          type: 'number',
          minimum: 0,
        },
        "repFactorEnd": {
          type: 'number',
          minimum: 0,
        },
        "likes": {
          type: 'array'
        },
        "dislikes": {
          type: 'array'
        },
        "neutrals": {
          type: 'array'
        },
      },
    }
  }
}