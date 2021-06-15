export const opportunitiesSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "OpportunityDetails",
  "required": [ "opportunities" ],
  "properties": {
    "opportunities": {
      "type": "array",
      "items": { "$ref": "#/definitions/Opportunities" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "Opportunities": {
      "type": "object",
      "required": ["opportunityId"],
      "properties": {
        "opportunityId": {
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
        "updatedDate": {
          type: 'number',
          minimum: 0,
        },
        "reward": {
          type: 'string',
        },
        "category": {
          type: 'string',
        },
        "projectName": {
          type: 'string',
        },
        "status": {
          type: 'boolean',
        },
        "permission": {
          type: 'string',
        },
        "acceptedCount": {
          type: 'number',
          minimum: 0
        },
        "completedCount": {
          type: 'number',
          minimum: 0
        }
      },
    }
  }
}