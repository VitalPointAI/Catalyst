export const communityRoleProposalDetailsSchema = {
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
        "roleName": {
          type: 'string',
        },
        "roleReward": {
          type: 'string',
        },
        "roleDescription": {
          type: 'string',
        },
        "rolePermissions": {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        "action": {
          type: 'string'
        },
        "roleDuration": {
          type: 'number',
          minimum: 0,
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
      },
    }
  }
}