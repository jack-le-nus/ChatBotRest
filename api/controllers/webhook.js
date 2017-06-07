'use strict';

var StringBuilder = require('stringbuilder')
StringBuilder.extend('string');
var apiai = require("apiai");
const uuidV1 = require('uuid/v1');
var util = require('util');
var stringify = require('node-stringify');
var async = require("async");
var GoogleLocations = require('google-locations');
var locations = new GoogleLocations('AIzaSyCOz13wwpDgZZG1ePVqHwRCTvi7xK7wfik');
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCOz13wwpDgZZG1ePVqHwRCTvi7xK7wfik'
});

var map = require('google_directions');
var place_types = [
    "atm",
    "park",
    "restaurant",
    "airport"
];
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

function getLocationString(location) {
    console.log("location " + location)
  if(typeof location === 'string' || location instanceof String) {
       var placeType = location.replace(" ", "_")
       if(place_types.indexOf(placeType.toLowerCase()) >= 0) {
            return placeType
        }
        return location
  }

  return String.format('{0} {1} {2} {3} {4}',
        location['street-address'],
        location['city'],
        location['admin-area'],
        location['zip-code']).trim();
}

//TODO: Add contexts + test all cases on skype
function webhook(req, res) {

  if(isEmptyObject(req.body)) {
    console.log("fail");
    res.status(500).send()
    return
  }

  var result = {};
  var array_results = []

  async.series([
        //Load user to get `userId` first
        function(callback) {
            // if(req['body']['result']['action'] == 'navigation.location') {
            //     var paramInfo = req['body']['result']['parameters'];
            //     var context = req['body']['result']['contexts'][0]['parameters'];
            //     params.origin = getLocationString(paramInfo['from']);
            //     params.destination = getLocationString(context['to']);
            // }

            if(req['body']['result']['action'] == 'navigation.directions') {
                var paramInfo = req['body']['result']['parameters'];
                params.origin = getLocationString(paramInfo['from']);
                params.destination = getLocationString(paramInfo['to']);
            }

            if(params.destination.includes("_")) {
                    var place_type = params.destination.toLowerCase()
                    
                    googleMapsClient.geocode({
                        address: params.origin
                    }, function(err, response) {
                        if (!err) {
                            var location = response.json.results[0].geometry.location;
                            locations.search({
                                    location: [location["lat"], location["lng"]],
                                    radius: 1000,
                                    language: 'en',
                                    rankby: 'prominence',
                                    types: [place_type]
                                }, function(err, response1) {
                                    array_results = response1.results
                                    console.log("search1111111: ", response1.results + " " + err);
                                    if(array_results.length == 0 || array_results.length == 1 && array_results[0].name.toLowerCase() == params.destination.toLowerCase()) {
                                        array_results = []
                                        result = "There is no " + params.destination
                                    } else {
                                        array_results = response1.results
                                    }
                                    
                                    callback();
                            });
                        } else {
                            result = err
                            callback();
                        }
                    });
                    
            } else {
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

                        output = String.format('{0}Step {1}: {2} ({3}/{4})\n\n',
                            output,
                            stepCounter,
                            instruction,
                            distance,
                            duration);
                            
                        stepCounter++;
                    });	
                    result = output;

                    callback();
                });
            }
            
        }
    ], function(err) { 
        if (err) return next(err);
        // console.log("finish " + stringify(result))

        
        if(array_results.length > 0) {
            var response = {
                "messages": [
                    {
                        "type": 1,
                        "platform": "skype",
                        "title": "Where do you want to go ?",
                        "buttons" : [
                            
                        ]
                    }
                ]
            }

            var max_length = array_results.length > 5 ? 5 : array_results.length;
            for(var i = 0; i < max_length; i++) {
                if(!array_results[i]["vicinity"].toLowerCase().includes(params.origin.toLowerCase())) {
                        response["messages"][0]["buttons"].push(
                            {
                                "text": array_results[i]["name"],
                                "postback": "how about " + array_results[i]["vicinity"]
                            }
                        )
                }
                
            }
            
            res.json(response)
        }
        else {
            console.log("search nearby")
            res.json({
              "messages": [        
                    {
                        "type": 0,
                        "speech": result
                    }
                ]
          })
        }
    });
}

function isEmptyObject(obj) {
//   console.log("Length " + Object.keys(obj))
  return Object.keys(obj).length === 0;
}



