const jwt = require('jsonwebtoken')

module.exports = async function (context, req) {
    context.log('AppSeed trigger function processed a request.');
    console.log('req', req.token)
    jwt.verify(req.token, process.env["TESTNET_SECRET_KEY"], async (err, authData) => {
        if(err) {
          context.res.sendStatus(403);
        } else {
          const appSeed = process.env["TESTNET_APPSEED"];
          const seed = appSeed.slice(0, 32)
          context.res.json({
            seed: seed,
            authData
          });
        }
      })

    // const seed = appSeed.slice(0, 32);
    // const responseMessage = {
    //     "seed": seed
    // }
    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: responseMessage
    // };
}