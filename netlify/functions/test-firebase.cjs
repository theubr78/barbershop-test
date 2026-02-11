const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

exports.handler = async function (event, context) {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Firebase loaded",
            apps: admin.apps ? admin.apps.length : 0,
            hasFirestore: typeof getFirestore === 'function'
        })
    };
};
