export const proposalSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Proposal",
  "required": [ "events" ],
  "properties": {
    "events": {
      "type": "array",
      "items": { "$ref": "#/definitions/Proposal" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "Proposal": {
      "type": "object",
      "required": ["proposalId"],
      "properties": {
        "proposalId": {
          "type": "string",
        },
        "applicant": {
          "type": "string",
        },
        "proposer": {
          "type": "string",
        },
        "sponsor": {
          "type": "string",
        },
        "sharesRequested": {
          "type": "string",
        },
        "lootRequested": {
          "type": "string",
        },
        "tributeOffered": {
          "type": "string",
        },
        "tributeToken": {
          "type": "string",
        },
        "paymentRequested": {
          "type": "string",
        },
        "paymentToken": {
          "type": "string",
        },
        "startingPeriod": {
          "type": "number",
        },
        "yesVote": {
          "type": "string",
        },
        "noVote": {
          "type": "string",
        },
        "flags": {
          "type": "array",
          "items": {
            "type": "boolean"
          }
        },
        "maxTotalSharesAndLootAtYesVote": {
          "type": "string",
        },
        "proposalSubmission": {
          "type": "number",
        },
        "votingPeriod": {
          "type": "number",
        },
        "gracePeriod": {
          "type": "number",
        },
        "voteFinalized": {
          "type": "number",
        },
        "roles": {
          "type": "array",
        },
        "submitTransactionHash": {
          "type": "string",
        },
        "processTransactionHash": {
          "type": "string",
        },
        "cancelTransactionHash": {
          "type": "string",
        },
        "sponsorTransactionHash": {
          "type": "string",
        },
        "configuration": {
          "type": "array",
        },
        "roleConfiguration": {
          "type": "object",
        },
        "reputationConfiguration": {
          "type": "object",
        },
        "memberRoleConfiguration": {
          "type": "object",
        },
        "referenceIds": {
          "type": "array",
        },
      }
    }
  }
}