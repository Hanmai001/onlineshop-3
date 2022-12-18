const Ajv = require("ajv")
const ajv = new Ajv()

module.exports = {
    type: "object",
    properties: {
        'username': { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 6 },
    },
    required: ['username', 'password'],
    additionalProperties: false
}
// const user = { username: 'harikohan', password: '1' };
// const valid = ajv.validate(schema, user)
// if (!valid) console.log(ajv.errors)
