const { waitAsync, continueWith } = require('./util');
const { signIn, getData } = require('./nest');

require('dotenv').config();

const command = process.argv[2];
if (command === 'append') {
  // command to test appending to Excel spreadsheet
  const { appendToSpreadsheet } = require('./spreadsheet');
  appendToSpreadsheet({ time: new Date(), current_temp: 21, target_temp: 24, humidity: 0.5 })
    .catch(console.error)

} else if (command === 'w' || command === 'watch') {

  const seconds = process.env.INTERVAL || 60;
  signIn().then(waitAsync(1))
    .then(actionData => continueWith({ action: getData, actionData, seconds }))
    .catch(e => console.error('ERROR: ', e.toString()))

} else {
  // one time case: 
  signIn().then(waitAsync(1))
    .then(getData)
    .catch(console.error)
}


