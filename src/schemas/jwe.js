export const jweSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'JWE',
  type: 'object',
  properties: {
    protected: { type: 'string' },
    iv: { type: 'string' },
    ciphertext: { type: 'string' },
    tag: { type: 'string' },
    aad: { type: 'string' },
    recipients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          header: {
            type: 'object',
            properties: {
              alg: { type: 'string' },
              iv: { type: 'string' },
              tag: { type: 'string' },
              epk: { type: 'object' },
              kid: { type: 'string' },
            },
            required: ['alg', 'iv', 'tag'],
          },
          encrypted_key: { type: 'string' },
        },
        required: ['header', 'encrypted_key'],
      },
    },
  },
  required: ['protected', 'iv', 'ciphertext', 'tag'],
}