const functions = require('firebase-functions');
const admin = require('firebase-admin');
// import xlsxFile from 'read-excel-file'

const db = admin.firestore();

exports.UpdateEntity =  (async(data,ref )  =>  {
   
    const entityRef = db.collection(ref).doc(data.uid);
    
    const res = await entityRef.update(data.orginization)
    
    console.log('Update: ', res);
    })

    exports.GetAllEntities = (async(ref)  =>  {
        
        const entityRef = db.collection(ref);
      
      const snapshot = await entityRef.get();
      
      snapshot.forEach(doc => {
      
        console.log(doc.id, '=>', doc.data());
      
      });
       
      })

exports.ExcelToJSON = functions.https.onCall((data, context) => {
    const xlsxFile = require('read-excel-file/node');
    
    xlsxFile('../Test.xlsx').then((rows) => {
        console.log(rows);
        console.table(rows);
    
    })
    
})


// HTTP Trigger
exports.GetUsersFromJson = functions.https.onRequest((req, res) => {
    var request = require('./usersTest.json'); 
   //  var paramValue = req.body.queryParam;
    console.log(request);
   
   // Option #1 - Using hosted URL
   const config = require('./usersTest.json');
   console.log(config);
   
   
    request({
           url:config,
           method: 'POST', 
           json:{ key: 'value' } },function(error, response, data) {
    });
     
   // Option #2 - Ended up here. Want to read from cloud storage bucket.
   console.log(file);
   
   });
   