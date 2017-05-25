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
"accounting",
"airport",
"amusement_park",
"aquarium",
"art_gallery",
"atm",
"bakery",
"bank",
"bar",
"beauty_salon",
"bicycle_store",
"book_store",
"bowling_alley",
"bus_station",
"cafe",
"campground",
"car_dealer",
"car_rental",
"car_repair",
"car_wash",
"casino",
"cemetery",
"church",
"city_hall",
"clothing_store",
"convenience_store",
"courthouse",
"dentist",
"department_store",
"doctor",
"electrician",
"electronics_store",
"embassy",
"establishment (deprecated)",
"finance (deprecated)",
"fire_station",
"florist",
"food (deprecated)",
"funeral_home",
"furniture_store",
"gas_station",
"general_contractor (deprecated)",
"grocery_or_supermarket (deprecated)",
"gym",
"hair_care",
"hardware_store",
"health (deprecated)",
"hindu_temple",
"home_goods_store",
"hospital",
"insurance_agency",
"jewelry_store",
"laundry",
"lawyer",
"library",
"liquor_store",
"local_government_office",
"locksmith",
"lodging",
"meal_delivery",
"meal_takeaway",
"mosque",
"movie_rental",
"movie_theater",
"moving_company",
"museum",
"night_club",
"painter",
"park",
"parking",
"pet_store",
"pharmacy",
"physiotherapist",
"place_of_worship (deprecated)",
"plumber",
"police",
"post_office",
"real_estate_agency",
"restaurant",
"roofing_contractor",
"rv_park",
"school",
"shoe_store",
"shopping_mall",
"spa",
"stadium",
"storage",
"store",
"subway_station",
"synagogue",
"taxi_stand",
"train_station",
"transit_station",
"travel_agency",
"university",
"veterinary_care",
"zoo"
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
  if(typeof location === 'string' || location instanceof String) {
    return location
  }

  return String.format('{0} {1} {2} {3} {4} {5}', 
        location['business-name'],
        location['street-address'],
        location['city'],
        location['zip-code'],
        location['country']);
}

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
            
            if(req['body']['result']['action'] == 'navigation.directions') {
                var paramInfo = req['body']['result']['parameters'];
                params.origin = getLocationString(paramInfo['from']);
                params.destination = getLocationString(paramInfo['to']);

                console.log("from " + params.origin + " to " + place_types.indexOf("atm"))
                if(place_types.indexOf(params.destination.replace(/\s/g,'').toLowerCase()) >= 0 ||  
                    place_types.indexOf(params.destination.replace(" ", "_").toLowerCase()) >=0) {

                        console.log("search nearby")
                        locations.search({
                                location: [1.290842, 103.776356],
                                radius: 500,
                                language: 'en',
                                rankby: 'prominence',
                                types: ["atm"]
                            }, function(err, response) {
                            console.log("search: ", response.results);
                            
                            array_results = response.results
                            // locations.details({placeid: response.results[0]["place_id"]}, function(err, response) {
                            //     result = response.result.name//response.results[0]["name"];
                                callback();
                            // });
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
                            output += "Step " + stepCounter + ": " + instruction + " ("+ distance +"/"+ duration+")\n";
                            stepCounter++;
                        });	
                        result = output;

                        callback();
                    });
                }
            }
        }
    ], function(err) { 
        if (err) return next(err);
        console.log("finish " + stringify(result))

        if(array_results.length > 0) {
            var response = {
                "displayText": "Step 1: Head northeast on Madison Ave toward E 43rd St (0.3 mi/2 mins)\nStep 2: Turn right onto E 48th St (0.2 mi/2 mins)\nStep 3: Turn right at the 2nd cross street onto Lexington Ave (266 ft/1 min)\nStep 4: Turn right at the 1st cross street onto E 47th StDestination will be on the left (177 ft/1 min)\n",
                "source": "apiai-weather-webhook-sample",
                "speech": "Step 1: Head northeast on Madison Ave toward E 43rd St (0.3 mi/2 mins)\nStep 2: Turn right onto E 48th St (0.2 mi/2 mins)\nStep 3: Turn right at the 2nd cross street onto Lexington Ave (266 ft/1 min)\nStep 4: Turn right at the 1st cross street onto E 47th StDestination will be on the left (177 ft/1 min)\n",
                "messages": [
                        {
                        "type": 1,
                        "platform": "skype",
                        "title": "which place do you want to go ?",
                        "buttons" : [
                            // {
                            //     "text": "400 Carbon Dr Pittsburgh, PA 15205",
                            //     "postback": "get nearest directions from Pittsburgh to 400 Carbon Dr Pittsburgh, PA 15205"
                            // },
                            // {
                            //     "text": "replies",
                            //     "postback": "get nearest directions from Pittsburgh to ATM"
                            // }
                        ]
                    }
                ]
            }
            for(var i = 0; i < array_results.length; i++) {
                if(!array_results[i]["vicinity"].toLowerCase().includes(params.origin.toLowerCase())) {
                        response["messages"][0]["buttons"].push(
                            {
                                "text": array_results[i]["name"],
                                "postback": "get nearest directions from " + params.origin + " to " + array_results[i]["vicinity"]
                            }
                        )
                }
                
            }
            
            res.json(response)
        }
        else {
            res.json({
              "speech": result,
              "displayText": result,
              "source": "apiai-weather-webhook-sample"
          })
        }
    });
}

function isEmptyObject(obj) {
  console.log("Length " + Object.keys(obj))
  return Object.keys(obj).length === 0;
}



