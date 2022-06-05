const appSeed = process.env.appSeed

module.exports = async function (context, req) {
    context.log('AppSeed trigger function processed a request.');

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {seed: appSeed}
    };
}