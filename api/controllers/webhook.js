'use strict';

var apiai = require("apiai");
const uuidV1 = require('uuid/v1');
var util = require('util');
var stringify = require('node-stringify');
var async = require("async");
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCOz13wwpDgZZG1ePVqHwRCTvi7xK7wfik'
});

var map = require('google_directions');
 
var params = {
    // REQUIRED 
    origin: "1600 Amphitheatre Parkway, Mountain View, CA",
    destination: "1500 Charleston Rd, Mountain View, CA 94043, USA",
    key: "AIzaSyCOz13wwpDgZZG1ePVqHwRCTvi7xK7wfik",
 
    // OPTIONAL 
    mode: "",
    avoid: "",
    language: "",
    units: "",
    region: "",
};

var stringify = require('node-stringify');

var app = apiai("f1dd2ce5218c479d8674a030a26e2865");
let session = uuidV1();

var options = {
    sessionId: session
};

module.exports = {
  webhook: webhook
};

function webhook(req, res) {

  if(isEmptyObject(req.body)) {
    console.log("fail");
    res.status(500).send()
    return
  }

  var result = {};

  async.series([
        //Load user to get `userId` first
        function(callback) {
            map.getDirectionSteps(params, function (err, steps){
                if (err) {
                    console.log(err);
                    return 1;
                }
            
                // parse the JSON object of steps into a string output 
                var output="";
                var stepCounter = 1;
                steps.forEach(function(stepObj) {
                    var instruction = stepObj.html_instructions;
                    instruction = instruction.replace(/<[^>]*>/g, ""); // regex to remove html tags 
                    var distance = stepObj.distance.text;
                    var duration = stepObj.duration.text;
                    output += "Step " + stepCounter + ": " + instruction + " ("+ distance +"/"+ duration+")\n";
                    stepCounter++;
                });	
                result = output;

                callback();
            });
        }
    ], function(err) { 
        if (err) return next(err);
        //Here `locals` will be populated with `user`, `photos` and `photos`
        console.log("finish " + stringify(result))

        res.json({
              "speech": stringify(result),
              "displayText": stringify(result),
              "source": "apiai-weather-webhook-sample"
          })
    });
}

function isEmptyObject(obj) {
  console.log("Length " + Object.keys(obj))
  return Object.keys(obj).length === 0;
}



