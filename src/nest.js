const axios = require("axios");
const createDebug = require('debug');
const { sendWebhook } = require('./ifttt');
const { appendToSpreadsheet } = require('./spreadsheet');

const signIn = () => {
  const email = process.env.NEST_EMAIL;
  const password = process.env.NEST_PASSWORD; 
  if (!email || !password) throw new Exception('NEST_EMAIL or NEST_PASSWORD expected in environment variables');

  const data = JSON.stringify({ "email" : email, "password" : password });
  const options = {
    url: 'https://home.nest.com/session',
    method: 'POST',
    data,
    headers: {
       'Content-Type': 'application/json',
       'Content-Length': data.length,
       'Connection': 'keep-alive',
       'Authorization': 'Basic',
       'Host': 'home.nest.com',
       'HostName': 'home.nest.com',
       'Origin': 'https://home.nest.com',
       'Referer': 'https://home.nest.com/',
       'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
       'X-Requested-With': 'XMLHttpRequest'
    }
  };

  return axios(options)
    .then(response => {
       const { urls, access_token, userid } = response.data;
       const dbg = createDebug('user');
       dbg('User ID', userid);
       dbg('Access Token', access_token);
       Object.keys(urls).forEach(key => dbg(key, '->', urls[key]));
       return { urls, access_token, userid };
    });
};

const getData = ({ access_token, userid, urls }) => {
  const url = urls.transport_url + '/v2/mobile/user.' + userid;
  const options = {
    url,
    headers: {
       "Authorization" : 'Basic '+ access_token,
       "X-nl-user-id" : userid,
       "X-nl-protocol-version" : '1',
       'Accept-Language': 'en-us',
       'Connection': 'keep-alive',
       'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
       'X-Requested-With': 'XMLHttpRequest'
    }
  };
  const dbg = createDebug('get-data');
  return axios(options)
    .then(response => (response.data))
    .then(({ user, structure, shared, device }) => {
      const time = new Date().toISOString();
      const structure_id = user[userid]['structures'][0].split('.')[1]
      const device_id = structure[structure_id]['devices'][0].split('.')[1]
      const current_temp = shared[device_id]["current_temperature"];
      const target_temp = parseInt(shared[device_id]["target_temperature"], 10);
      const target_temp_int = target_temp;
      const humidity = device[device_id]["current_humidity"]/100;
      const auto_away = shared[device_id]["auto_away"];
 
      const temp_diff = Math.abs(current_temp - target_temp);
      const need_change = (temp_diff >= 1) && 
                          (target_temp >= 16) && (target_temp <= 30)
      dbg("[" + time + "] " + 
        "Current Temp: ", current_temp, 
	"Target Temp: ",  target_temp, 
        "Diff: ",  temp_diff, 
        "Changing: ",  need_change, 
        "Humidity: ", humidity * 100 + "%" );

      if (need_change) {
        const rowData = { time, current_temp, target_temp, humidity, changing: "YES" };

        sendWebhook({ target: target_temp_int })
         .then(data => {
	    return appendToSpreadsheet({ ...rowData, result: JSON.stringify(data) });
         }).catch(e => {
	    return appendToSpreadsheet({ ...rowData, error: e.toString() });
         })

      } else {
        appendToSpreadsheet({ time, current_temp, target_temp, humidity, changing: "NO" });
      }
      return { time, current_temp, target_temp, humidity };
    });
};

module.exports = { getData, signIn };
