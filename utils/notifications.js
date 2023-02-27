const admin = require('firebase-admin');
const serviceAccount = require('../betting-firebase-creds.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


exports.subscribeToATopic = async (token, topicName) => {
    const registrationToken = token;
    const topic = topicName;

    admin.messaging().subscribeToTopic(registrationToken, topic)
        .then((response) => {
            console.log(`Successfully subscribed to topic ${topic}`);
        })
        .catch((error) => {
            console.error(`Error subscribing to topic ${topic}: ${error}`);
        });
}

exports.unsubscribeFromATopic = async (token, topicName) => {
    const registrationToken = token;
    const topic = topicName;

    admin.messaging().unsubscribeFromTopic(registrationToken, topic)
        .then((response) => {
            console.log(`Successfully unsubscribed from topic ${topic}`);
        })
        .catch((error) => {
            console.error(`Error unsubscribing from topic ${topic}: ${error}`);
        });
}



// Send a notification to a specific device
exports.sendNotificationSingleDevice = async (regToken) => {
    const message = {
        data: {
            score: '850',
            time: '2:45'
        },
        token: `${regToken}`
    };
    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}

exports.sendNotificationsToTopic = async (notification, topic) => {
    const message = {
        notification,
        topic: `${topic}`
    };

    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}