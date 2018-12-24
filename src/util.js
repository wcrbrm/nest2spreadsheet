
const waitAsync = seconds => (new Promise(resolve => { 
   setTimeout(() => { resolve(); }, seconds * 1000); 
}));

const continueWith = ({ action, actionData, seconds }) => {
   return new Promise((resolve, reject) => {
     setInterval(() => {
       action(actionData).catch(e => reject(e));
     }, seconds * 1000 );
     // do it the first time - without waiting
     action(actionData).catch(e => reject(e));
   });
}

module.exports = { waitAsync, continueWith };