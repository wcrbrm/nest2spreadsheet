const axios = require("axios");
const createDebug = require('debug');

const done = () => (new Promise(resolve => (resolve())));
const doneWithError = (msg) => (new Promise((resolve, reject) => (reject(msg))));

let warnedOnce = false;
const sendWebhook = ({ target }) => {
  const dbg = createDebug('ifttt');
  const key = process.env.IFTTT_WEBHOOK_KEY;
  if (!key) {
    if (!warnedOnce) {
      dbg("Warning: IFTTT_WEBHOOK_KEY was not specified. No webhook called");
      warnedOnce = true;
    }
    return doneWithError("No IFTTT_WEBHOOK_KEY");
  }
  const eventId = `temperature_${target}c`;
  const url = `https://maker.ifttt.com/trigger/${eventId}/with/key/${key}`;
  dbg(`Posting to ${url}`);
  const options = { url, method: 'POST' };
  return axios(options)
    .then(response => (response.data))
    .then(data => { dbg(data); return data; })
}

module.exports = { sendWebhook };