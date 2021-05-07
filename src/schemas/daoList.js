export const daoListSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Daos",
  "required": [ "daoList" ],
  "properties": {
    "daoList": {
      "type": "array",
      "items": { "$ref": "#/definitions/DaoProfile" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "DaoProfile": {
      "type": "object",
      "required": [ "contractId" ],
      "properties": {
        "contractId": {
          "type": "string",
        },
        "summoner": {
          "type": "string",
        },
        "date": {
          "type": "number",
        },
        "category": {
          "type": "string",
        },
        "name": {
            "type": "string",
        },
        "logo": {
          "type": "string",
        },
        "purpose": {
          "type": "string",
          "title": "text",
          "maxLength": 4000,
        },
      },
    }
  }
}