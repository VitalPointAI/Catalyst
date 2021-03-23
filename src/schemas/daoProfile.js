export const daoProfileSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "DaoProfiles",
  "required": [ "profiles" ],
  "properties": {
    "profiles": {
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
        "date": {
          "type": "string",
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
        }
      }
    }
  }
}