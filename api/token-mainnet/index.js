const jwt = require('jsonwebtoken')

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const accountId = req.body.accountId
    if(!accountId) context.res.sendStatus(403)
    jwt.sign({ accountId: accountId }, process.env["MAINNET_SECRET_KEY"], (err, token) => {
      context.res.json({
        token
      })
    });
}