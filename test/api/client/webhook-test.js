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

var long_schema = {
        "type": "object",
        "required": [
          "messages"
        ],
        "properties": {
          "messages": {
            "type": "array",
            "items" : 
            {
              "type" : "object",
              "properties" : {
                "postback" : {
                  "type" : "string"
                },
                "text" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      };
var short_schema = {
        "type": "object",
        "required": [
          "messages"
        ],
        "properties": {
          "messages": {
            "type": "array",
            "items" : 
            {
              "type" : "object",
              "properties" : {
                "speech" : {
                  "type" : "string"
                },
                "type" : {
                  "type" : "number"
                }
              }
            }
          }
        }
      };
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

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "result": {
               "action": "navigation.directions",
              "parameters": {
                "from": "1600 Amphitheatre Parkway, Mountain View, CA",
                "to": "1500 Charleston Rd, Mountain View, CA 94043, USA"
              }
          }})
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, short_schema)).to.be.true;
        done();
      });

      setTimeout(done, 1000);
    });

  it('should return directions with nearest gas petrol', function(done) {

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "result": {
               "action": "navigation.directions",
              "resolvedQuery": "how to get to the nearest gas station",
              "parameters": {
                "from": "52 Golf Club Rd, Pleasant Hill, CA",
                "to": "gas petrol"
              }
          }}).expect({

          })
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, long_schema)).to.be.true;
        done();
      });

      setTimeout(done, 2000);
    });

  it('should return directions with nearest atm', function(done) {

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "result": {
               "action": "navigation.directions",
              "resolvedQuery": "how to get to the nearest gas station",
              "parameters": {
                "from": "52 Golf Club Rd, Pleasant Hill, CA",
                "to": "atm"
              }
          }})
          .expect({

          })
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, long_schema)).to.be.true;
        done();
      });

      setTimeout(done, 5000);
    });

    it('should return nothing when tell current location', function(done) {

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "result": {
               "action": "navigation.alocation",
              "resolvedQuery": "My location is 1111 Gough St, San Francisco, CA",
              "parameters": {
                "current_location": "52 Golf Club Rd, Pleasant Hill, CA"
              },
              "contexts": [
              {
                "parameters": {
                  "to": "restaurant"
                }
              }]
          }})
          .expect({

          })
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, short_schema)).to.be.true;
        done();
      });

      setTimeout(done, 5000);
    });

    it('should return ask location when from value is empty', function(done) {

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "result": {
               "action": "navigation.directions",
              "resolvedQuery": "My location is 1111 Gough St, San Francisco, CA",
              "parameters": {
                "to": ""
              }
          }})
          .expect({
            
          })
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, short_schema)).to.be.true;
        done();
      });

      setTimeout(done, 5000);
    });

     it('should return total distance between the origin and destination', function(done) {

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "result": {
               "action": "navigation.distance",
              "resolvedQuery": "My location is 1111 Gough St, San Francisco, CA",
              "parameters": {
                "from": "1600 Amphitheatre Parkway, Mountain View, CA",
                "to": "1500 Charleston Rd, Mountain View, CA 94043, USA"
              }
          }})
          .expect({
            
          })
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, short_schema)).to.be.true;
        done();
      });

      setTimeout(done, 5000);
    });

    it('should return the time taken between the origin and destination', function(done) {

      /*eslint-enable*/
      api.post('/webhook')
      .set('Content-Type', 'application/json')
      .send({
            "result": {
               "action": "navigation.time",
              "resolvedQuery": "My location is 1111 Gough St, San Francisco, CA",
              "parameters": {
                "from": "1600 Amphitheatre Parkway, Mountain View, CA",
                "to": "there"
              }
          }})
          .expect({
            
          })
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, short_schema)).to.be.true;
        done();
      });

      setTimeout(done, 5000);
    });
})});