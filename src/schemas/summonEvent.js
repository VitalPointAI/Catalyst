export const summonSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "SummonEvent",
  "required": [ "events" ],
  "properties": {
    "events": {
      "type": "array",
      "items": { "$ref": "#/definitions/SummonEvent" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "SummonEvent": {
      "type": "object",
      "required": [ "eventId" ],
      "properties": {
        "eventId": {
          "type": "string",
        },
        "contractId": {
          "type": "string",
        },
        "summoner": {
          "type": "string",
        },
        "tokens": {
          "type": "array",
        },
        "summoningTime": {
          "type": "number",
        },
        "periodDuration": {
          "type": "number",
        },
        "votingPeriodLength": {
          "type": "number",
        },
        "gracePeriodLength": {
          "type": "number",
        },
        "proposalDeposit": {
          "type": "string",
        },
        "dilutionBound": {
          "type": "number",
        },
        "updateTime": {
          "type": "number",
        },
      }
    }
  }
}
