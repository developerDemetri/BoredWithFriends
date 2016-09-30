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
let yelp_tool = require('../bin/yelp_tool');
let checkInput = require('../bin/validator_tool.js').checkInput;
let checkCoordinates = require('../bin/validator_tool.js').checkCoordinates;
const uname_re = /^(\w{3,63})$/;

let router = express.Router();

function metersToMiles(meters) {
  let miles = 0;
  if (meters) {
    miles = (meters*0.000621371).toFixed(2);
  }
  return miles;
}

function mapSearch(location) {
  let url = 'https://www.google.com/maps/search/';
  if (location) {
    url += encodeURIComponent(location);
  }
  return url;
}

router.get('/food/:plan', function(req, res) {
  let plan_re = /^(\w{3,6})$/;
  if (checkInput(req.session.uname, 'string', uname_re)) {
    if (checkInput(req.params.plan, 'string', plan_re) && checkCoordinates(req.session.location)) {
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
          "message": 'Invalid Plan'
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
              num_rating: data.businesses[i].review_count,
              phone: data.businesses[i].display_phone,
              address: data.businesses[i].location.display_address,
              distance: metersToMiles(data.businesses[i].distance),
              link: data.businesses[i].url,
              maps_search: mapSearch(data.businesses[i].location.display_address)
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
          "error": 'Server Error'
        };
        res.send(result);
      });
    }
    else {
      let result = {
        "status": 400,
        "message": 'Invalid Location and/or Plan'
      };
      res.send(result);
    }
  }
  else {
    let result = {
      "status": 401,
      "message": 'Unauthorized Request'
    };
    res.send(result);
  }
});

router.get('/shopping', function(req, res) {
  if (checkInput(req.session.uname, 'string', uname_re)) {
    if (checkCoordinates(req.session.location)) {
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
              num_rating: data.businesses[i].review_count,
              phone: data.businesses[i].display_phone,
              address: data.businesses[i].location.display_address,
              distance: metersToMiles(data.businesses[i].distance),
              link: data.businesses[i].url
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
        "status": 400,
        "message": 'Invalid Location'
      };
      res.send(result);
    }
  }
  else {
    let result = {
      "status": 401,
      "message": 'Unauthorized Request'
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
