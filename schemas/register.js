const Ajv = require("ajv")
const ajv = new Ajv()

module.exports = {
    type: "object",
    properties: {
        'username': { type: 'string' },
        email: { type: 'string'},
        password: { type: 'string' },
        confirmPassword: { type: 'string' }
    },
    required: ['username', 'email', 'password', 'confirmPassword'],
    additionalProperties: false,
};