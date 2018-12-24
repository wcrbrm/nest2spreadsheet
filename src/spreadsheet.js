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

let onceWarned = false;
const appendToSpreadsheet = (data) => {
  const dbg = createDebug("spreadsheet");
  const missing = [];

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

module.exports = { appendToSpreadsheet };