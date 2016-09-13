'use strict';
let app = require('../app');
let express = require('express');
let pg_tool = require('../bin/pg_tool');
let bcrypt = require('bcrypt');
let aes_tool = require('../bin/aes_tool');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let api_settings = require('../bin/secret_settings').api_settings;
let request = require('request');
let validator = require('validator');
let yelp_tool = require('../bin/yelp_tool');
const uname_re = /^(\w{3,63})$/;

let router = express.Router();

router.get('/food/:plan', function(req, res) {
  if(req.session.uname && uname_re.test(req.session.uname) && req.params.plan && req.session.location && req.session.location.latitude && req.session.location.longitude && validator.isDecimal(req.session.location.latitude) && validator.isDecimal(req.session.location.longitude)) {
    let req_path = 'https://maps.googleapis.com';
    req_path += '/maps/api/place/nearbysearch/json?';
    req_path += 'key='+api_settings.google_key;
    req_path += '&location='+req.session.location.latitude+','+req.session.location.longitude;
    if (req.params.plan === 'find') {
      req_path += '&radius=5000';
      req_path += '&type=restaurant';
    }
    else if (req.params.plan === 'order') {
      req_path += '&radius=15000';
      req_path += '&type=meal_delivery';
    }
    else {
      let result = {
        "status": 400,
        "message": 'Um...awkward....'
      };
      res.send(result);
    }
    req_path += '&opennow';
    request(req_path, function (error, response, body) {
      if (!error) {
        let places = [];
        let data = JSON.parse(body);
        for (let i = 0; i < data.results.length; i++) {
          let place = {
            id: data.results[i].place_id,
            name: data.results[i].name,
            rating: data.results[i].rating
          };
          places.push(place);
        }
        let result = {
          "status": 200,
          "places": places
        }
        res.send(result);
      }
      else {
        let result = {
          "status": 500,
          "message": error
        }
        res.send(result);
      }
    });
  }
  else {
    let result = {
      "status": 401,
      "message": 'no bueno...'
    };
    res.send(result);
  }
});

router.get('/shopping', function(req, res) {
  if(req.session.uname && uname_re.test(req.session.uname) && req.session.location.latitude && req.session.location.longitude && validator.isDecimal(req.session.location.latitude) && validator.isDecimal(req.session.location.longitude)) {
    let req_path = 'https://maps.googleapis.com';
    req_path += '/maps/api/place/nearbysearch/json?';
    req_path += 'key='+api_settings.google_key;
    req_path += '&location='+req.session.location.latitude+','+req.session.location.longitude;
    req_path += '&radius=15000';
    req_path += '&type=clothing_store';
    req_path += '&opennow';
    request(req_path, function (error, response, body) {
      if (!error) {
        let places = [];
        let data = JSON.parse(body);
        for (let i = 0; i < data.results.length; i++) {
          let place = {
            id: data.results[i].place_id,
            name: data.results[i].name,
            rating: data.results[i].rating
          };
          places.push(place);
        }
        let result = {
          "status": 200,
          "places": places
        }
        res.send(result);
      }
      else {
        let result = {
          "status": 500,
          "message": error
        }
        res.send(result);
      }
    });
  }
  else {
    let result = {
      "status": 401,
      "message": 'no bueno...'
    };
    res.send(result);
  }
});

module.exports = router;

/*
Copyright 2016 DeveloperDemetri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
