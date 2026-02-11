exports.handler = async function (event, context) {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from CJS",
            nodeVersion: process.version,
            hasFetch: typeof fetch !== 'undefined',
            envTest: process.env.NODE_VERSION
        })
    };
};
