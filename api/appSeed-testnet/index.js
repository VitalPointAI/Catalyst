module.exports = async function (context, req) {
    context.log('AppSeed trigger function processed a request.');
    const appSeed = process.env["TESTNET_APPSEED"];
    const responseMessage = {
        "seed": appSeed
    }
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}