export const apiKeysSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "ApiKeys",
    "properties": {
      "keys": {
        "type": "array",
        "items": { "$ref": "#/definitions/ApiKeys" }
      }
    },
    "additionalProperties": false,
    "required": [ "keys" ],
    "definitions": {
      "ApiKeys": {
        "type": "object",
        "properties": {
          "protected": { "type": "string" },
          "iv": { "type": "string" },
          "ciphertext": { "type": "string" },
          "tag": { "type": "string" },
          "aad": { "type": "string" },
          "recipients": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "header": { "type": "object" },
                "encrypted_key": { "type": "string" }
              },
              "required": [ "header", "encrypted_key" ]
            }
          }
        },
        "required": [ "protected", "iv", "ciphertext", "tag" ]
      }
    }
  }