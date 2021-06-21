export const memberSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Members",
  "required": [ "events" ],
  "properties": {
    "events": {
      "type": "array",
      "items": { "$ref": "#/definitions/Member" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "Member": {
      "type": "object",
      "required": [ "memberId" ],
      "properties": {
        "memberId": {
          "type": "string",
        },
        "contractId": {
          "type": "string",
        },
        "delegateKey": {
          "type": "string",
        },
        "shares": {
          "type": "string",
        },
        "loot": {
          "type": "string",
        },
        "existing": {
          "type": "boolean",
        },
        "highestIndexYesVote": {
          "type": "number",
          "minimum": 0,
        },
        "jailed": {
          "type": "number",
          "minimum": 0,
        },
        "joined": {
          "type": "number",
          "minimum": 0,
        },
        "updated": {
          "type": "number",
          "minimum": 0,
        },
        "active": {
          "type": "boolean",
        },
      }
    }
  }
}