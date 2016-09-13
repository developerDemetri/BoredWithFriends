'use strict';
let app = require('../app');
let express = require('express');
let pg_tool = require('../bin/pg_tool');
let aes_tool = require('../bin/aes_tool');
let bcrypt = require('bcrypt');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let validator = require('validator');
let request = require('request');
let api_settings = require('../bin/secret_settings').api_settings;
const uname_re = /^(\w{3,63})$/;

let router = express.Router();

router.get('/', function(req, res) {
  if(req.session.uname && (typeof req.session.uname) === 'string' && uname_re.test(req.session.uname)) {
    res.render('home');
  }
  else {
    res.render('login');
  }
});

router.post('/auth', function(req, res) {
  let pass_re = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9!@#$%^&*/._+-]{8,31})$/;
  if (req.body.username && req.body.password && (typeof req.body.username) === 'string' && (typeof req.body.password) === 'string' && uname_re.test(req.body.username) && pass_re.test(req.body.password)) {
    let user = req.body.username + '';
    user = user.toLowerCase();
    pg_tool.query('SELECT password FROM public.bwf_user WHERE username=$1', [user], function(error, rows) {
      if (error) {
        let result = {
          "status": 500,
          "error": error
        };
        res.send(result);
      }
      else {
        if(rows[0] && bcrypt.compareSync(req.body.password, rows[0].password)) {
          req.session.uname = user;
          let result = {
            "status": 200,
            "message": 'successful login'
          };
          res.send(result);
        }
        else {
          let result = {
            "status": 200,
            "message": 'invalid login'
          };
          res.send(result);
        }
      }
    });
  }
  else {
    let result = {
      "status": 400,
      "message": 'bad login'
    };
    res.send(result);
  }
});

router.get('/location', function(req, res) {
  if(req.session.uname && (typeof req.session.uname) === 'string' && uname_re.test(req.session.uname)) {
    let r_key = req.session.uname + '-location';
    redis_tool.get(r_key, function (err, data) {
      let result;
      if (err) {
        result = {
          "status": 500,
          "error": 'Error retreiving location ):'
        };
        console.log(err);
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
      "message": 'no bueno...'
    };
    res.send(result);
  }
});

router.post('/location', function(req, res) {
  if(req.session.uname && (typeof req.session.uname) === 'string' && uname_re.test(req.session.uname) && req.body.lat && req.body.long) {
    let lat = req.body.lat + '';
    let long = req.body.long + '';
    if (validator.isDecimal(lat) && validator.isDecimal(long)) {
      let r_key = req.session.uname + '-location';
      let new_location = {
        latitude: lat,
        longitude: long
      };
      redis_tool.set(r_key, JSON.stringify(new_location), 'EX', 180);
      req.session.location = new_location;
      let result = {
        "status": 200,
        "message": 'location updated'
      };
      res.send(result);
    }
    else {
      let result = {
        "status": 400,
        "message": 'invalid coordinates'
      };
      res.send(result);
    }
  }
  else {
    let result = {
      "status": 401,
      "message": 'no bueno...'
    };
    res.send(result);
  }
});

router.post('/location/custom', function(req, res) {
  let location_re = /^[^<>={}]{2,255}$/;
  if(req.session.uname && (typeof req.session.uname) === 'string' && uname_re.test(req.session.uname) && req.body.address && (typeof req.body.address) === 'string' && location_re.test(req.body.address)) {
    let location = req.body.address + '';
    let req_path = 'https://maps.googleapis.com';
    req_path += '/maps/api/geocode/json?';
    req_path += 'key='+api_settings.google_key;
    req_path += '&address='+location;
    req_path = encodeURI(req_path);
    request(req_path, function (error, response, body) {
      if (!error) {
        let data = JSON.parse(body);
        if (data.results && data.results[0] && data.results[0].geometry && data.results[0].geometry.location && data.results[0].geometry.location.lat && data.results[0].geometry.location.lng) {
          let lat = data.results[0].geometry.location.lat + '';
          let long = data.results[0].geometry.location.lng + '';
          if (validator.isDecimal(lat) && validator.isDecimal(long)) {
            let r_key = req.session.uname + '-location';
            let new_location = {
              latitude: lat,
              longitude: long
            };
            redis_tool.set(r_key, JSON.stringify(new_location), 'EX', 300);
            req.session.location = new_location;
            let result = {
              "status": 202,
              "message": 'custom location set'
            };
            res.send(result);
          }
          else {
            let result = {
              "status": 400,
              "message": 'invalid custom location'
            };
            res.send(result);
          }
        }
        else {
          let result = {
            "status": 400,
            "message": 'invalid custom location'
          };
          res.send(result);
        }
      }
      else {
        let result = {
          "status": 500,
          "message": 'error setting custom location'
        }
        console.log(error);
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

router.post('/logout', function(req, res) {
  if(req.session.uname && (typeof req.session.uname) === 'string' && uname_re.test(req.session.uname)) {
    req.session.destroy();
    let result = {
      "status": 200,
      "message": 'successful logout'
    };
    res.send(result);
  }
  else {
    let result = {
      "status": 400,
      "message": 'no session to log out of...'
    };
    res.send(result);
  }
});

router.delete('/account', function(req, res) {
  if(req.session.uname && (typeof req.session.uname) === 'string' && uname_re.test(req.session.uname)) {
    let uname = req.session.uname + '';
    pg_tool.query('DELETE FROM public.bwf_user WHERE username=$1', [uname], function(error, rows) {
      if (error) {
        let result = {
          "status": 500,
          "error": error
        };
        res.send(result);
      }
      else {
        req.session.destroy();
        let result = {
          "status": 202,
          "message": 'user successfully deleted'
        };
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
