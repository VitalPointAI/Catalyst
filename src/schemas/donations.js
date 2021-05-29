export const donationsSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Donations",
  "required": [ "donations" ],
  "properties": {
    "donations": {
      "type": "array",
      "items": { "$ref": "#/definitions/Donation" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "Donation": {
      "type": "object",
      "required": [ "contractId" ],
      "properties": {
        "donationId": {
          "type": "string",
        },
        "contractId": {
          "type": "string",
        },
        "contributor": {
          "type": "string",
        },
        "contributed": {
          "type": "number",
        },
        "donation": {
          "type": "number",
        },
      },
    }
  }
}