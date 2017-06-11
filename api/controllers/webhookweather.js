'use strict';

var StringBuilder = require('stringbuilder')
StringBuilder.extend('string');
var weather = require('weather-js');
var apiai = require("apiai");
const uuidV1 = require('uuid/v1');
var util = require('util');
var stringify = require('node-stringify');
var async = require("async");


var stringify = require('node-stringify');

var app = apiai("f1dd2ce5218c479d8674a030a26e2865");
let session = uuidV1();

var options = {
    sessionId: session
};

var params = {
    // REQUIRED
    address: "San Francisco, CA",
    dateTime: "",
    unit: "F"
};


module.exports = {
    webhookweather: webhookweather
};

function getLocationString(location) {
    if(typeof location === 'string' || location instanceof String) {
        return location
    }

    return String.format('{0} {1} {2} {3} {4}',
        location['street-address'],
        location['city'],
        location['admin-area'],
        location['zip-code']).trim();

}

function webhookweather(req, res) {

    if(isEmptyObject(req.body)) {
        console.log("fail");
        res.status(500).send()
        return
    }

    var result = {};

    async.series([
        //Load user to get `userId` first
        function(callback) {
            console.log(req['body']['result']['action'])
            if(req['body']['result']['action'] == 'weather.temperature') {
                var paramInfo = req['body']['result']['parameters'];
                params.address = getLocationString(paramInfo['address']);
                params.dateTime = paramInfo['date-time'];
                //var paramDate = req['body']['result']['parameters']['address'];
                console.log("***Test Get Address Request***");
                console.log(params.address);

                weather.find({search: params.address, degreeType: 'F'}, function(err, output) {
                    if(err) console.log(err);
                    console.log(JSON.stringify(output));
                    
                    var location = output[0].location.name;
                    var temperature = output[0].current.temperature;
                    var winddisplay = output[0].current.winddisplay;
                    var skyText = output[0].current.skytext;
                    var forecastSkyText = output[0].forecast[2].skytextday;
                    var forecastLow = output[0].forecast[2].low;
                    var forecastHigh = output[0].forecast[2].high;
                    var unit = output[0].location.degreetype;

                    if(params.dateTime == "today") {
                        console.log(output[0].current.temperature +output[0].location.degreetype );
                        console.log(output[0].current.skytext);
                        result = String.format('{0}{1} {2} \n\n{3}',
                        temperature,
                        unit,
                        skyText,
                        winddisplay).trim();
                    }
                    else {
                        result = ""
                        for(var i = 0; i < output[0].forecast.length; i++) {
                            var dayForecast = output[0].forecast[i];
                            result += String.format('{0} \n\n{1}{2} - {3}{4}  {5}\n\n',
                                dayForecast.day,
                                dayForecast.low,
                                unit,
                                dayForecast.high,
                                unit,
                                dayForecast.skytextday);
                        }
                    }

                    callback();
                });
            }
        }
    ], function(err) {
        if (err) return next(err);
        console.log("finish " + stringify(result))

        res.json({
              "messages": [        
                    {
                        "type": 0,
                        "speech": result
                    }
                ]
          })
    });
}

function isEmptyObject(obj) {
    console.log("Length " + Object.keys(obj))
    return Object.keys(obj).length === 0;
}