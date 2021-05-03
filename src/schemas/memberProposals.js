export const memberProposalSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "MemberProposal",
  "required": [ "events" ],
  "properties": {
    "events": {
      "type": "array",
      "items": { "$ref": "#/definitions/MemberProposal" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "MemberProposal": {
      "type": "object",
      "required": ["memberProposalId"],
      "properties": {
        "memberProposalId": {
          "type": "string",
        },
        "contractId": {
          "type": "string",
        },
        "applicant": {
          "type": "string",
        },
        "title": {
          "type": "string",
        },
        "intro": {
          "type": "string",
        },
        "proposer": {
          "type": "string",
        },
        "submitDate": {
          "type": "number",
          "minimum": 0,
        },
        "avatar": {
          "type": "string",
        },
        "published": {
          "type": "boolean"
        },
      }
    }
  }
}