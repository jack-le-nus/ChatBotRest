'use strict';
var chai = require('chai');
var ZSchema = require('z-schema');
var customFormats = module.exports = function(zSchema) {
  // Placeholder file for all custom-formats in known to swagger.json
  // as found on
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

  var decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

  /** Validates floating point as decimal / money (i.e: 12345678.123400..) */
  zSchema.registerFormat('double', function(val) {
    return !decimalPattern.test(val.toString());
  });

  /** Validates value is a 32bit integer */
  zSchema.registerFormat('int32', function(val) {
    // the 32bit shift (>>) truncates any bits beyond max of 32
    return Number.isInteger(val) && ((val >> 0) === val);
  });

  zSchema.registerFormat('int64', function(val) {
    return Number.isInteger(val);
  });

  zSchema.registerFormat('float', function(val) {
    // better parsing for custom "float" format
    if (Number.parseFloat(val)) {
      return true;
    } else {
      return false;
    }
  });

  zSchema.registerFormat('date', function(val) {
    // should parse a a date
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('dateTime', function(val) {
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('password', function(val) {
    // should parse as a string
    return typeof val === 'string';
  });
};

customFormats(ZSchema);

var validator = new ZSchema({});
var supertest = require('supertest');
var api = supertest('http://localhost:10010'); // supertest init;
var expect = chai.expect;

describe('/webhook', function() {
  describe('post', function() {

    it('should respond with default Error', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
        
      })
      .expect({
        "message": "Response validation failed: invalid content type (text/plain).  These are valid: application/json",
        "failedValidation": true
      })
      .end(function(err, res) {
        if (err) return done(err);

        expect(validator.validate(res.body, schema)).to.be.true;
        done();
      });
    });

    it('should return directions with string from and to points', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "speech",
          "displayText",
          "source"
        ],
        "properties": {
          "speech": {
            "type": "string"
          },
          "displayText": {
            "type": "string"
          },
          "source": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
          "id": "222a8b96-374d-4ecd-b8a3-3b754b691d8b",
          "timestamp": "2017-05-20T13:35:06.006Z",
          "lang": "en",
          "result": {
              "source": "agent",
              "resolvedQuery": "Show me weather in Chennai",
              "speech": "",
              "action": "navigation.directions",
              "actionIncomplete": false,
              "parameters": {
                "from": "1600 Amphitheatre Parkway, Mountain View, CA",
                "to": "1500 Charleston Rd, Mountain View, CA 94043, USA"
              },
              "contexts": [],
              "metadata": {
                "intentId": "f59f4d20-6d45-4123-830f-72e801a85468",
                "webhookUsed": "true",
                "webhookForSlotFillingUsed": "false",
                "intentName": "Weather Intent"
              },
              "fulfillment": {
                "speech": "",
                "messages": [
                    {
                      "type": 0,
                      "speech": ""
                    }
                ]
              },
              "score": 1
          },
          "status": {
              "code": 200,
              "errorType": "success"
          },
          "sessionId": "688d71f5-f512-404e-a7f9-1e05d44a97a1"
        })
      .expect({
        "displayText": "Step 1: Head east on Amphitheatre Pkwy toward Bill Graham Pkwy (0.4 mi/1 min)%0D%0AStep 2: Turn right onto N Shoreline Blvd (0.2 mi/1 min)%0D%0AStep 3: Turn right at the 1st cross street onto Charleston RdDestination will be on the right (0.2 mi/1 min)%0D%0A",
        "source": "apiai-weather-webhook-sample",
        "speech": "Step 1: Head east on Amphitheatre Pkwy toward Bill Graham Pkwy (0.4 mi/1 min)%0D%0AStep 2: Turn right onto N Shoreline Blvd (0.2 mi/1 min)%0D%0AStep 3: Turn right at the 1st cross street onto Charleston RdDestination will be on the right (0.2 mi/1 min)%0D%0A"
      })
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, schema)).to.be.true;
        done();
      });

      setTimeout(done, 1000);
    });


    it('should return directions with object from and to points', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "speech",
          "displayText",
          "source"
        ],
        "properties": {
          "speech": {
            "type": "string"
          },
          "displayText": {
            "type": "string"
          },
          "source": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "id": "222a8b96-374d-4ecd-b8a3-3b754b691d8b",
          "timestamp": "2017-05-20T13:35:06.006Z",
          "lang": "en",
          "result": {
              "source": "agent",
              "resolvedQuery": "Show me weather in Chennai",
              "speech": "",
              "action": "navigation.directions",
              "actionIncomplete": false,
              "parameters": {
                "from": {"country":"United States of America",
                  "admin-area":"New York",
                  "business-name":"Baxter Building",
                  "city":"New York",
                  "street-address":"42nd St",
                  "zip-code":"10036"
                },
                "to": "245 Park Ave, New York, NY 10167, USA"
              },
              "contexts": [],
              "metadata": {
                "intentId": "f59f4d20-6d45-4123-830f-72e801a85468",
                "webhookUsed": "true",
                "webhookForSlotFillingUsed": "false",
                "intentName": "Weather Intent"
              },
              "fulfillment": {
                "speech": "",
                "messages": [
                    {
                      "type": 0,
                      "speech": ""
                    }
                ]
              },
              "score": 1
          },
          "status": {
              "code": 200,
              "errorType": "success"
          },
          "sessionId": "688d71f5-f512-404e-a7f9-1e05d44a97a1"
          })
      .expect({
        "displayText": "Step 1: Head northeast on Madison Ave toward E 43rd St (0.3 mi/2 mins)%0D%0AStep 2: Turn right onto E 48th St (0.2 mi/2 mins)%0D%0AStep 3: Turn right at the 2nd cross street onto Lexington Ave (266 ft/1 min)%0D%0AStep 4: Turn right at the 1st cross street onto E 47th StDestination will be on the left (177 ft/1 min)%0D%0A",
        "source": "apiai-weather-webhook-sample",
        "speech": "Step 1: Head northeast on Madison Ave toward E 43rd St (0.3 mi/2 mins)%0D%0AStep 2: Turn right onto E 48th St (0.2 mi/2 mins)%0D%0AStep 3: Turn right at the 2nd cross street onto Lexington Ave (266 ft/1 min)%0D%0AStep 4: Turn right at the 1st cross street onto E 47th StDestination will be on the left (177 ft/1 min)%0D%0A"
      })
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, schema)).to.be.true;
        done();
      });

      setTimeout(done, 2000);
    });


    it('should return directions with nearest ATM', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "speech",
          "displayText",
          "source"
        ],
        "properties": {
          "speech": {
            "type": "string"
          },
          "displayText": {
            "type": "string"
          },
          "source": {
            "type": "string"
          },
          "messages": {
            "type": "array"
          }
        }
      };

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "id": "63faf915-5aef-46fa-940f-23225a3615c4",
            "timestamp": "2017-05-24T13:20:18.511Z",
            "lang": "en",
            "result": {
              "source": "agent",
              "resolvedQuery": "get directions to the nearest ATM",
              "action": "navigation.directions",
              "actionIncomplete": true,
              "parameters": {
                "exclude-point": "",
                "from": "Heng mui keng terrace",
                "include-point": "",
                "road-type": "",
                "route-type": "",
                "sort": [
                  "nearest"
                ],
                "to": {
                  "business-name": "ATM"
                }
              },
              "contexts": [
                {
                  "name": "navigation_directions_dialog_params_from",
                  "parameters": {
                    "exclude-point": "",
                    "route-type.original": "",
                    "from.original": "",
                    "road-type.original": "",
                    "road-type": "",
                    "sort": [
                      "nearest"
                    ],
                    "include-point": "",
                    "to.original": "ATM",
                    "exclude-point.original": "",
                    "route-type": "",
                    "include-point.original": "",
                    "from": "",
                    "to": {
                      "business-name": "ATM",
                      "business-name.original": "ATM"
                    },
                    "sort.original": "nearest"
                  },
                  "lifespan": 1
                },
                {
                  "name": "navigation_directions_dialog_context",
                  "parameters": {
                    "exclude-point": "",
                    "route-type.original": "",
                    "from.original": "",
                    "road-type.original": "",
                    "road-type": "",
                    "sort": [
                      "nearest"
                    ],
                    "include-point": "",
                    "to.original": "ATM",
                    "exclude-point.original": "",
                    "route-type": "",
                    "include-point.original": "",
                    "from": "",
                    "to": {
                      "business-name": "ATM",
                      "business-name.original": "ATM"
                    },
                    "sort.original": "nearest"
                  },
                  "lifespan": 2
                },
                {
                  "name": "bb2bb19c-a285-46b9-82c4-da0a89c6c373_id_dialog_context",
                  "parameters": {
                    "exclude-point": "",
                    "route-type.original": "",
                    "from.original": "",
                    "road-type.original": "",
                    "road-type": "",
                    "sort": [
                      "nearest"
                    ],
                    "include-point": "",
                    "to.original": "ATM",
                    "exclude-point.original": "",
                    "route-type": "",
                    "include-point.original": "",
                    "from": "",
                    "to": {
                      "business-name": "ATM",
                      "business-name.original": "ATM"
                    },
                    "sort.original": "nearest"
                  },
                  "lifespan": 2
                }
              ],
              "metadata": {
                "intentId": "bb2bb19c-a285-46b9-82c4-da0a89c6c373",
                "webhookUsed": "true",
                "webhookForSlotFillingUsed": "false",
                "intentName": "navigation.directions"
              },
              "fulfillment": {
                "speech": "Enter start point",
                "messages": [
                  {
                    "type": 0,
                    "speech": "Enter start point"
                  }
                ]
              },
              "score": 1
            },
            "status": {
              "code": 200,
              "errorType": "success"
            },
            "sessionId": "688d71f5-f512-404e-a7f9-1e05d44a97a1"
          })
      .expect({
        "displayText": "",
        "source": "",
        "speech": "",        
        "messages": [
                {
                  "type": 1,
                  "platform": "skype",
                  "title": "Where do you want to go ?",
                  "buttons" : [
                    {
                      "postback": "get nearest directions from Heng mui keng terrace to 10 Kent Ridge Crescent",
                      "text": "UOB ATM"
                    },
                    {
                      "postback": "get nearest directions from Heng mui keng terrace to 10 Science Park Road",
                      "text": "Posb Bank"
                    },
                    {
                      "postback": "get nearest directions from Heng mui keng terrace to 27 Prince George's Park",
                      "text": "AXS"
                    },
                    {
                      "postback": "get nearest directions from Heng mui keng terrace to 396 Pasir Panjang Road",
                      "text": "HSBC Singapore"
                    }
                  ]
                }
        ]
      })
      .end(function(err, res) {
        if (err) return done(err);
        // expect(validator.validate(res.body, schema)).to.be.true;
        done();
      });

      setTimeout(done, 3000);
    });

     it('should return directions with nearest gas petrol', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "speech",
          "displayText",
          "source"
        ],
        "properties": {
          "speech": {
            "type": "string"
          },
          "displayText": {
            "type": "string"
          },
          "source": {
            "type": "string"
          },
          "messages": {
            "type": "array"
          }
        }
      };

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "id": "63faf915-5aef-46fa-940f-23225a3615c4",
            "timestamp": "2017-05-24T13:20:18.511Z",
            "lang": "en",
            "result": {
              "source": "agent",
              "resolvedQuery": "how to get to the nearest gas station",
              "action": "navigation.directions",
              "actionIncomplete": true,
              "parameters": {
                "exclude-point": "",
                "from": "Heng mui keng terrace",
                "include-point": "",
                "road-type": "",
                "route-type": "",
                "sort": [
                  "nearest"
                ],
                "to": {
                  "business-name": "gas station"
                }
              },
              "contexts": [
                {
                  "name": "navigation_directions_dialog_params_from",
                  "parameters": {
                    "exclude-point": "",
                    "route-type.original": "",
                    "from.original": "",
                    "road-type.original": "",
                    "road-type": "",
                    "sort": [
                      "nearest"
                    ],
                    "include-point": "",
                    "to.original": "ATM",
                    "exclude-point.original": "",
                    "route-type": "",
                    "include-point.original": "",
                    "from": "",
                    "to": {
                      "business-name": "gas station",
                      "business-name.original": "ATM"
                    },
                    "sort.original": "nearest"
                  },
                  "lifespan": 1
                },
                {
                  "name": "navigation_directions_dialog_context",
                  "parameters": {
                    "exclude-point": "",
                    "route-type.original": "",
                    "from.original": "",
                    "road-type.original": "",
                    "road-type": "",
                    "sort": [
                      "nearest"
                    ],
                    "include-point": "",
                    "to.original": "ATM",
                    "exclude-point.original": "",
                    "route-type": "",
                    "include-point.original": "",
                    "from": "",
                    "to": {
                      "business-name": "gas station",
                      "business-name.original": "ATM"
                    },
                    "sort.original": "nearest"
                  },
                  "lifespan": 2
                },
                {
                  "name": "bb2bb19c-a285-46b9-82c4-da0a89c6c373_id_dialog_context",
                  "parameters": {
                    "exclude-point": "",
                    "route-type.original": "",
                    "from.original": "",
                    "road-type.original": "",
                    "road-type": "",
                    "sort": [
                      "nearest"
                    ],
                    "include-point": "",
                    "to.original": "ATM",
                    "exclude-point.original": "",
                    "route-type": "",
                    "include-point.original": "",
                    "from": "",
                    "to": {
                      "business-name": "ATM",
                      "business-name.original": "ATM"
                    },
                    "sort.original": "nearest"
                  },
                  "lifespan": 2
                }
              ],
              "metadata": {
                "intentId": "bb2bb19c-a285-46b9-82c4-da0a89c6c373",
                "webhookUsed": "true",
                "webhookForSlotFillingUsed": "false",
                "intentName": "navigation.directions"
              },
              "fulfillment": {
                "speech": "Enter start point",
                "messages": [
                  {
                    "type": 0,
                    "speech": "Enter start point"
                  }
                ]
              },
              "score": 1
            },
            "status": {
              "code": 200,
              "errorType": "success"
            },
            "sessionId": "688d71f5-f512-404e-a7f9-1e05d44a97a1"
          })
      .expect({
          "displayText": "",
          "source": "",
          "speech": "", 
          "messages": [
                {
                  "type": 1,
                  "platform": "skype",
                  "title": "Where do you want to go ?",
                  "buttons" : [
                    {
                      "text": "Shell Station",
                      "postback": "get nearest directions from Heng mui keng terrace to 328 Pasir Panjang Road"
                    },
                    {
                      "postback": "get nearest directions from Heng mui keng terrace to 41 Science Park Road, Singapore",
                      "text": "Silesia Flavours South East Asia Pte Ltd"
                    },
                    {
                      "postback": "get nearest directions from Heng mui keng terrace to 20 Science Park Road, Singapore",
                      "text": "Samco Shipholding Pte. Ltd."
                    },
                    {
                      "postback": "get nearest directions from Heng mui keng terrace to 20 Harbour Drive",
                      "text": "RH Petrogas Limited"
                    }
                  ]
                }
        ]
      })
      .end(function(err, res) {
        if (err) return done(err);
        // expect(validator.validate(res.body, schema)).to.be.true;
        done();
      });

      setTimeout(done, 4000);
    });
  });

});

