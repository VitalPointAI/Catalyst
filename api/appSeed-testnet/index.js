module.exports = async function (context, req) {
    context.log('AppSeed trigger function processed a request.');
    const appSeed = process.env["TESTNET_APPSEED"];
    const seed = appSeed.slice(0, 32);
    const responseMessage = {
        "seed": seed
    }
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}