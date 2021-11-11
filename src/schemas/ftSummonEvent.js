export const ftSummonSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "FTSummonEvent",
  "required": [ "events" ],
  "properties": {
    "events": {
      "type": "array",
      "items": { "$ref": "#/definitions/FTSummonEvent" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "FTSummonEvent": {
      "type": "object",
      "required": [ "eventId" ],
      "properties": {
        "eventId": {
          "type": "string",
        },
        "contractId": {
          "type": "string",
        },
        "creator": {
          "type": "string",
        },
        "spec": {
          "type": "string",
        },
        "symbol": {
          "type": "string",
        },
        "name": {
          "type": "string",
        },
        "reference": {
          "type": "string"
        },
        "referenceHash": {
          "type": "string"
        },
        "creationTime": {
          "type": "number",
        },
        "decimals": {
          "type": "number",
        },
        "maxSupply": {
          "type": "number",
        },
        "icon": {
          "type": "string",
        },
        "transactionHash": {
          "type": "string",
        },
      }
    }
  }
}
