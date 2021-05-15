export const proposalDetailsSchema = {
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
          "type": "string",
        },
        "intro": {
          "type": "string",
          "title": "text",
          "maxLength": 4000,
        },
        "applicant": {
          "type": "string",
        },
        "updated": {
          "type": "string",
        },
      }
    }
  }
}