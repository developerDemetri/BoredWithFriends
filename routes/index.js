'use strict';

let app = require('../app');
let express = require('express');
let pg_tool = require('../bin/pg_tool');
let aes_tool = require('../bin/aes_tool');
let bcrypt = require('bcrypt');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let request = require('request');
let api_settings = require('../bin/secret_settings').api_settings;
let checkInput = require('../bin/validator_tool.js').checkInput;
let checkCoordinates = require('../bin/validator_tool.js').checkCoordinates;
const uname_re = /^(\w{3,63})$/;

let router = express.Router();

router.get('/', function(req, res) {
  if (checkInput(req.session.uname, 'string', uname_re)) {
    res.render('home');
  }
  else {
    res.render('login');
  }
});

router.post('/auth', function(req, res) {
  let pass_re = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9!@#$%^&*/._+-]{8,31})$/;
  if (checkInput(req.body.username, 'string', uname_re) && checkInput(req.body.password, 'string', pass_re)) {
    let user = req.body.username + '';
    user = user.toLowerCase();
    pg_tool.query('SELECT password FROM public.bwf_user WHERE username=$1', [user], function(error, rows) {
      if (error) {
        let result = {
          "status": 500,
          "error": 'Server Error'
        };
        res.send(result);
      }
      else {
        if (rows[0] && bcrypt.compareSync(req.body.password, rows[0].password)) {
          req.session.uname = user;
          let result = {
            "status": 200,
            "message": 'Successful Login'
          };
          res.send(result);
        }
        else {
          let result = {
            "status": 200,
            "message": 'Invalid Username/Password'
          };
          res.send(result);
        }
      }
    });
  }
  else {
    let result = {
      "status": 400,
      "message": 'Invalid Username/Password'
    };
    res.send(result);
  }
});

router.get('/location', function(req, res) {
  if (checkInput(req.session.uname, 'string', uname_re)) {
    let r_key = req.session.uname + '-location';
    redis_tool.get(r_key, function (err, data) {
      let result;
      if (err) {
        result = {
          "status": 500,
          "error": 'Server Error'
        };
        res.send(result);
      }
      else {
        result = {
          "status": 200,
          "location": JSON.parse(data)
        };
        req.session.location = result.location;
      }
      res.send(result);
    });
  }
  else {
    let result = {
      "status": 401,
      "message": 'Unauthorized Request'
    };
    res.send(result);
  }
});

router.post('/location', function(req, res) {
  if (checkInput(req.session.uname, 'string', uname_re)) {
    if (checkInput(req.body.lat, 'number', null) && checkInput(req.body.long, 'number', null)) {
      let lat = Number(req.body.lat) + '';
      let long = Number(req.body.long) + '';
      let req_path = 'https://maps.googleapis.com';
      req_path += '/maps/api/geocode/json?';
      req_path += 'key='+api_settings.google_key;
      req_path += '&latlng='+lat+','+long;
      request(req_path, function (error, response, body) {
        if (!error) {
          let data = JSON.parse(body);
          if (data.results && data.results[0] && data.results[0].formatted_address) {
            let location = data.results[0].formatted_address + '';
            let r_key = req.session.uname + '-location';
            let new_location = {
              latitude: Number(lat),
              longitude: Number(long),
              location: location
            };
            redis_tool.set(r_key, JSON.stringify(new_location), 'EX', 180);
            req.session.location = new_location;
            let result = {
              "status": 200,
              "message": 'Location Updated',
              "location": req.session.location
            };
            res.send(result);
          }
          else {
            let result = {
              "status": 500,
              "message": 'Server Error'
            }
            res.send(result);
          }
        }
        else {
          let result = {
            "status": 500,
            "message": 'Server Error'
          }
          res.send(result);
        }
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

router.post('/location/custom', function(req, res) {
  let location_re = /^[^<>={}]{2,255}$/;
  if (checkInput(req.session.uname, 'string', uname_re)) {
    if (checkInput(req.body.address, 'string', location_re)) {
      let custom_location = req.body.address + '';
      let req_path = 'https://maps.googleapis.com';
      req_path += '/maps/api/geocode/json?';
      req_path += 'key='+api_settings.google_key;
      req_path += '&address='+custom_location;
      req_path = encodeURI(req_path);
      request(req_path, function (error, response, body) {
        if (!error) {
          let data = JSON.parse(body);
          if (data.results && data.results[0] && data.results[0].geometry && checkCoordinates(data.results[0].geometry.location) && data.results[0].formatted_address) {
            let lat = data.results[0].geometry.location.lat + '';
            let long = data.results[0].geometry.location.lng + '';
            let location = data.results[0].formatted_address + '';
            let r_key = req.session.uname + '-location';
            let new_location = {
              latitude: Number(lat),
              longitude: Number(long),
              location: location
            };
            redis_tool.set(r_key, JSON.stringify(new_location), 'EX', 300);
            req.session.location = new_location;
            let result = {
              "status": 200,
              "message": 'Custom Location Set',
              "location": req.session.location
            };
            res.send(result);
          }
          else {
            let result = {
              "status": 400,
              "message": 'Invalid Custom Location'
            };
            res.send(result);
          }
        }
        else {
          let result = {
            "status": 500,
            "message": 'Server Error'
          }
          res.send(result);
        }
      });
    }
    else {
      let result = {
        "status": 400,
        "message": 'Invalid Custom Location'
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

router.post('/logout', function(req, res) {
  if (checkInput(req.session.uname, 'string', uname_re)) {
    req.session.destroy();
    let result = {
      "status": 200,
      "message": 'Successful Logout'
    };
    res.send(result);
  }
  else {
    let result = {
      "status": 401,
      "message": 'Unauthorized Request'
    };
    res.send(result);
  }
});

router.delete('/account', function(req, res) {
  if (checkInput(req.session.uname, 'string', uname_re)) {
    let uname = req.session.uname + '';
    pg_tool.query('DELETE FROM public.bwf_user WHERE username=$1', [uname], function(error, rows) {
      if (error) {
        let result = {
          "status": 500,
          "error": 'Server Error'
        };
        res.send(result);
      }
      else {
        req.session.destroy();
        let result = {
          "status": 200,
          "message": 'User Successfully Deleted'
        };
        res.send(result);
      }
    });
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
Copyright 2016-2017 DeveloperDemetri

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
