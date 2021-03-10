var express = require('express');
var router = express.Router();
const { videoToken } = require('./tokens');
const config = require('./config');

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

module.exports = router;