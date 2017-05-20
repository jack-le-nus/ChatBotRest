'use strict';

var apiai = require("apiai");
const uuidV1 = require('uuid/v1');
var util = require('util');
var stringify = require('node-stringify');
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCOz13wwpDgZZG1ePVqHwRCTvi7xK7wfik'
});

var stringify = require('node-stringify');

var app = apiai("f1dd2ce5218c479d8674a030a26e2865");
let session = uuidV1();

var options = {
    sessionId: session
};

module.exports = {
  webhook: webhook
};

function getGeoCode(address, callback) {
  googleMapsClient.geocode({
        address: '1600 Amphitheatre Parkway, Mountain View, CA'
      }, function(err, response) {

        if (!err) {
          console.log("asdfasdf1" + stringify(response.json));
          callback(response.json.results[0].geometry.location);
        }
        else {
          console.log("asdfasdf2" + err);
        }

      });
}

function webhook(req, res) {
  var name = req.swagger.params.question || 'stranger';
  var hello = util.format('Hello, %s!', name);

  getGeoCode('1600 Amphitheatre Parkway, Mountain View, CA', function(location) {
      googleMapsClient.directions({
        origin: location,
        destination: [37.4224764,  -122.0842499] 
      }, function(err, response) {
        if (!err) {
          
          res.json(response.json.results[0]);

          return
        }
        else {
          console.log("asdfasdf2" + err);
        }

      });
  });

  if(isEmptyObject(req.body)) {
    console.log("fail");
    res.status(500).send()
    return
  }

  // var speech = stringify(req.body)//.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again."
  // console.log("success");
  // res.json({
  //       "speech": speech,
  //       "displayText": speech,
  //       "source": "apiai-weather-webhook-sample"
  //   })
}

function isEmptyObject(obj) {
  console.log("Length " + Object.keys(obj))
  return Object.keys(obj).length === 0;
}



