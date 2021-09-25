export const payoutProposalDetailsSchema = {
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
        "milestone": {
          type: 'array'
        },
        "referenceIds": {
          type: 'array'
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