export const memberDataSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "MemberData",
    "required": [ "data" ],
    "properties": {
      "data": {
        "type": "array",
        "items": { "$ref": "#/definitions/Data" }
      }
    },
    "additionalProperties": false,
    "definitions": {
      "Data": {
        "type": "object",
        "required": ["dataType"],
        properties: {
          dataType: {
            type: 'string',
          },
          contractId: {
            type: 'string',
          },
          data: {
            type: 'object',
          },
        }
      }
    }
  }