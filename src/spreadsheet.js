const createDebug = require('debug');
const GoogleSpreadsheet = require('google-spreadsheet');

const handleError = (err) => {
  if (typeof err  === 'string') {
    if (err.indexOf("HTTP error 403") > -1) throw new Error("Spreadsheet Access Forbidden");
  }
  throw new Error(err);
}

const setAuth = ({ doc, client_email, private_key }) => {
   const dbg = createDebug("spreadsheet-auth");
   return new Promise((resolve, reject) => {
     try {
       const creds_json = { client_email, private_key: private_key.replace(/\\n/g, "\n") };
       doc.useServiceAccountAuth(creds_json, (err) => { 
         if (err) reject(err); else { 
	   resolve({ doc }); 
         }
       });
     } catch( e ) { reject(e); }
   });
};

const getInfo = ({ doc }) => {
   const dbg = createDebug("spreadsheet-info");
   return new Promise((resolve, reject) => {
     try {
       doc.getInfo((err, info) => {
         if (err) handleError(err); else {
           // dbg("Title: ", info.title);
           resolve({ doc, info })
         }
       });
     } catch( e ) { reject(e); }
   });
};

const appendData = ({ doc, data }) => {
   const dbg = createDebug("spreadsheet-data");
   return new Promise((resolve, reject) => {
     try {
        // dbg("adding", JSON.stringify(data));
        doc.worksheets[0].addRow(data, (err, row) => {
           if (err) {
             handleError(err)
           } else {
             const { id, save } = row;
             dbg("added", id );
             save();
             resolve({ doc, data });
           }  
        });

     } catch( e ) { reject(e); }
   });
};

let latestData = {};
let onceWarned = false;
const appendToSpreadsheet = (data) => {
  const dbg = createDebug("spreadsheet");
  const missing = [];

  latestData = data;
  const spreadsheetKey = process.env.GOOGLE_SPREADSHEET_KEY;
  if (!spreadsheetKey) missing.push("GOOGLE_SPREADSHEET_KEY");
  const client_email   = process.env.GOOGLE_SERVICE_CLIENT_EMAIL;
  if (!client_email) missing.push("GOOGLE_SERVICE_CLIENT_EMAIL");
  const private_key    = process.env.GOOGLE_SERVICE_PRIVATE_KEY;
  if (!private_key) missing.push("GOOGLE_SERVICE_PRIVATE_KEY");

  if (missing.length > 0) {
     if (!onceWarned) {
       dbg("no " + missing.join(", ") + "provided, skipping spreasheet update");
       onceWarned = true;
     }
     return new Promise(resolve => resolve("nothing"));
  } else {
     const doc = new GoogleSpreadsheet(spreadsheetKey);
     dbg(`Updating spreadsheet ${spreadsheetKey}`)

     return setAuth({ doc, client_email, private_key })
       .then(getInfo)
       .then(d => appendData({ ...d, data }))
  }
};

const http = require('http');
const hostname = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;
const dbgMetrics = createDebug('metrics');
const promclient = require('prom-client');
const Registry = promclient.Registry;
const register = new Registry();

metricsServer = {
  start: () => {
    const server = http.createServer((req, res) => {
       res.statusCode = 200;
       dbgMetrics("LastData", JSON.stringify(latestData));
       res.setHeader('Content-Type', register.contentType);

       register.clear();
       if (Object.keys(latestData).length) {
          
          const gaugeTemperature = new promclient.Gauge({
            name: 'nest_temperature',
            help: 'Temperatures from NEST Interface',
            labelNames: ['interval'],
            registers: [ register ]
          });

          const gaugeHumidity = new promclient.Gauge({
            name: 'nest_humidity',
            help: 'Humidity from NEST Interface',
            registers: [ register ]
          });

          const gaugeAction = new promclient.Gauge({
            name: 'ifttt_last_action',
            help: 'Was IFTTT action triggered',
            labelNames: ['changing', 'result', 'error'],
            registers: [ register ]
          });

          const gaugeTimestamp = new promclient.Gauge({
            name: 'ifttt_request_time',
            help: 'Time of IFTTT action',
            registers: [ register ]
          });
          // promclient.collectDefaultMetrics({ register });

          gaugeTemperature.set({ interval: 'current' }, latestData.current_temp );
          gaugeTemperature.set({ interval: 'target' }, latestData.target_temp );
          gaugeHumidity.set(latestData.humidity);
          gaugeTimestamp.set(Date.now());

          const { changing, result, error } = latestData;
          gaugeAction.set({ 
            changing, 
            result: (result || '').replace(/\"/g, ''), 
            error: (error || '').replace(/\"/g, '')
          }, latestData.changing === 'YES' ? 1 : 0 );
       }
	     res.end(register.metrics());
    });
    server.listen(port, hostname, () => {
       dbgMetrics(`Server running at http://${hostname}:${port}/`);
    });
  }
};

module.exports = { appendToSpreadsheet, metricsServer };