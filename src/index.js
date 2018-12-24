const { waitAsync, continueWith } = require('./util');
const { signIn, getData } = require('./nest');

require('dotenv').config();

const command = process.argv[2];
if (command === 'w' || command === 'watch') {
  signIn().then(waitAsync(1))
    .then(actionData => continueWith({ action: getData, actionData, seconds: 10 }))
    .catch(e => console.error('ERROR: ', e.toString()))
} else {
  // one time case: 
 signIn().then(waitAsync(1))
    .then(getData)
    .catch(e => console.error(e))
}


