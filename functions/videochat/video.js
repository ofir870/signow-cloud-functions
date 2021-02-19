var express = require('express');
var router = express.Router();
const { videoToken } = require('./tokens');
const config = require('./config');
const functions = require('firebase-functions');
const client = require('twilio')(functions.config().twilio.accountsid, functions.config().twilio.authtoken);

const sendTokenResponse = (token, res) => {
    res.set('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        token: token.toJwt()
      })
    );
  };
  
  router.get('/token', (req, res) => {
    const identity = req.query.identity;
    const room = req.query.room;
    const token = videoToken(identity, room, config);
    sendTokenResponse(token, res);
  
  });
  router.post('/token', (req, res) => {
    const identity = req.body.identity;
    const room = req.body.room;
    const token = videoToken(identity, room, config);
    sendTokenResponse(token, res);
  });

  router.post('/disconnect', (req, res) => {
    console.log("disconnect request");
    client.video.rooms(req.body.room).update({status: 'completed'}).then(room => console.log(room.uniqueName));
    res.status(200).end()
  });

module.exports = router;