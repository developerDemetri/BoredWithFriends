'use strict';

let app = require('../app');
let express = require('express');
let pg_tool = require('../bin/pg_tool');
let bcrypt = require('bcrypt');
let aes_tool = require('../bin/aes_tool');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let checkInput = require('../bin/validator_tool.js').checkInput;
let captcha_key = require('../bin/secret_settings').api_settings.captcha_key;
let request = require('request');
const uname_re = /^(\w{3,63})$/;
const email_re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

let router = express.Router();

router.get('/', function(req, res) {
  if (checkInput(req.session.uname, 'string', uname_re)) {
    res.render('home');
  }
  else {
    res.render('register');
  }
});

router.post('/submit', function(req, res) {
  let pass_re = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9!@#$%^&*/._+-]{8,31})$/;
  if (checkInput(req.body.username, 'string', uname_re) && checkInput(req.body.email, 'string', email_re) && checkInput(req.body.password, 'string', pass_re)) {
    let captchaData = {
      secret: captcha_key,
      response: req.body["g-recaptcha-response"],
      remoteip: req.connection.remoteAddress
    };
    let captcha_url = 'https://www.google.com/recaptcha/api/siteverify';
    request.post({
      url: captcha_url,
      form: captchaData
    },
    function(err, httpResponse, captcha_body) {
      if (err) {
        console.log('captcha error', err);
        let result = {
          "status": 500,
          "message": 'Server Error'
        };
        res.send(result);
      }
      else {
        captcha_body = JSON.parse(captcha_body);
        if (captcha_body.success === true) {
          let username = req.body.username + '';
          username = username.toLowerCase();
          let email = req.body.email + '';
          email = aes_tool.encrypt(email.toLowerCase());
          let password = req.body.password + '';
          password = bcrypt.hashSync(password, 10);
          pg_tool.query('INSERT INTO public.bwf_user (username, email, password) VALUES ($1, $2, $3)', [username,email,password], function(error, rows) {
            if (error) {
              let result = {
                "status": 500,
                "error": 'Server Error'
              };
              res.send(result);
            }
            else {
              req.session.uname = username;
              let result = {
                "status": 201,
                "message": 'User Successfully Created'
              };
              res.send(result);
            }
          });
        }
        else {
          let result = {
            "status": 403,
            "message": 'Invalid Captcha'
          };
          res.send(result);
        }
      }
    });
  }
  else {
    let result = {
      "status": 400,
      "message": 'Invalid User Details'
    };
    res.send(result);
  }
});

router.post('/checkusername', function(req, res) {
  if (checkInput(req.body.username, 'string', uname_re)) {
    let user = req.body.username + '';
    user = user.toLowerCase();
    pg_tool.query('SELECT COUNT(username) as count FROM public.bwf_user WHERE username=$1', [user], function(error, rows) {
      if (error) {
        let result = {
          "status": 500,
          "error": 'Server Error'
        };
        res.send(result);
      }
      else {
        if (rows[0].count > 0) {
          let result = {
            "status": 200,
            "validity": false
          };
          res.send(result);
        }
        else {
          let result = {
            "status": 200,
            "validity": true
          };
          res.send(result);
        }
      }
    });
  }
  else {
    let result = {
      "status": 400,
      "validity": false
    };
    res.send(result);
  }
});

router.post('/checkemail', function(req, res) {
  if (checkInput(req.body.email, 'string', email_re)) {
    let email = req.body.email + '';
    email = aes_tool.encrypt(email.toLowerCase());
    pg_tool.query('SELECT COUNT(username) as count FROM public.bwf_user WHERE email=$1', [email], function(error, rows) {
      if (error) {
        let result = {
          "status": 500,
          "error": 'Server Error'
        };
        res.send(result);
      }
      else {
        if (rows[0].count > 0) {
          let result = {
            "status": 200,
            "validity": false
          };
          res.send(result);
        }
        else {
          let result = {
            "status": 200,
            "validity": true
          };
          res.send(result);
        }
      }
    });
  }
  else {
    let result = {
      "status": 400,
      "validity": false
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
