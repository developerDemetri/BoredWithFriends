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
  if (req.session.uname && uname_re.test(req.session.uname) && req.params.plan && req.session.location && req.session.location.latitude && req.session.location.longitude && validator.isDecimal(req.session.location.latitude) && validator.isDecimal(req.session.location.longitude) && req.session.location.location) {
    let category;
    let radius;
    if (req.params.plan === 'find') {
      category = 'restaurants';
      radius = 8000;
    }
    else if (req.params.plan === 'order') {
      category = 'fooddeliveryservices';
      radius = 15000;
    }
    else {
      let result = {
        "status": 400,
        "message": 'Um...awkward....'
      };
      res.send(result);
    }
    yelp_tool.search({
       location: req.session.location.location,
       cll: req.session.location.latitude+','+req.session.location.longitude,
       radius_filter: radius,
       sort: 2,
       category_filter: category
     })
    .then(function (data) {
      let places = [];
      for (let i = 0; places.length < 20 && i < data.businesses.length; i++) {
        if (!data.businesses[i].is_closed) {
          let place = {
            name: data.businesses[i].name,
            rating: data.businesses[i].rating,
            phone: data.businesses[i].display_phone,
            address: data.businesses[i].location.display_address,
            distance: data.businesses[i].distance
          };
          places.push(place);
        }
      }
      let result = {
        "status": 200,
        "places": places
      };
      res.send(result);
    })
    .catch(function (err) {
      let result = {
        "status": 500,
        "error": 'error retreiving yelp results'
      };
      res.send(result);
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
  if (req.session.uname && uname_re.test(req.session.uname) && req.session.location.latitude && req.session.location.longitude && validator.isDecimal(req.session.location.latitude) && validator.isDecimal(req.session.location.longitude) && req.session.location.location) {
    yelp_tool.search({
       location: req.session.location.location,
       cll: req.session.location.latitude+','+req.session.location.longitude,
       radius_filter: 15000,
       sort: 2,
       category_filter: 'fashion'
     })
    .then(function (data) {
      let places = [];
      for (let i = 0; places.length < 20 && i < data.businesses.length; i++) {
        if (!data.businesses[i].is_closed) {
          let place = {
            name: data.businesses[i].name,
            rating: data.businesses[i].rating,
            phone: data.businesses[i].display_phone,
            address: data.businesses[i].location.display_address,
            distance: data.businesses[i].distance
          };
          places.push(place);
        }
      }
      let result = {
        "status": 200,
        "places": places
      };
      res.send(result);
    })
    .catch(function (err) {
      let result = {
        "status": 500,
        "error": 'error retreiving yelp results'
      };
      res.send(result);
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
