const jwt = require('jsonwebtoken')

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const accountId = req.body.accountId
    context.log('accountId', accountId)
    if(!accountId) context.res.sendStatus(403)
    context.log('made it here')
    context.log('key', process.env["TESTNET_SECRET_KEY"])
    jwt.sign({ accountId: accountId }, process.env["TESTNET_SECRET_KEY"], (err, token) => {
      context.res.json({
        token
      })
    });
}