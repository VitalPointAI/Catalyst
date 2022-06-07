const jwt = require('jsonwebtoken')

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const accountId = req.body.accountId
    console.log('accountid', accountId)
    console.log('req', req)
    if(!accountId) context.res.sendStatus(403)
    jwt.sign({ accountId: accountId }, process.env["TESTNET_SECRET_KEY"], (err, token) => {
      context.res.json({
        token
      })
    });
    // const name = (req.query.name || (req.body && req.body.name));
    // const responseMessage = name
    //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: responseMessage
    // };
}