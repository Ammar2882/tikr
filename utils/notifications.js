// const admin = require('firebase-admin');
// const serviceAccount = require('../betting-firebase-creds.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// // Send a notification to a specific device
// const message = {
//     notification: {
//       title: 'New message',
//       body: 'You have a new message!'
//     },
//     token: 'DEVICE_TOKEN'
//   };
  
//   admin.messaging().send(message)
//     .then((response) => {
//       console.log('Successfully sent message:', response);
//     })
//     .catch((error) => {
//       console.log('Error sending message:', error);
//     });
  
//   // Send a notification to a topic
//   const message = {
//     notification: {
//       title: 'New blog post',
//       body: 'Check out our latest blog post!'
//     },
//     topic: 'BLOG_POSTS'
//   };
  
//   admin.messaging().send(message)
//     .then((response) => {
//       console.log('Successfully sent message:', response);
//     })
//     .catch((error) => {
//       console.log('Error sending message:', error);
//     });