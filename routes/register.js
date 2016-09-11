'use strict';
let app = require('../app');
let express = require('express');
let pg_tool = require('../bin/pg_tool');
let bcrypt = require('bcrypt');
let aes_tool = require('../bin/aes_tool');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let validator = require('validator');
let uname_re = /^(\w{3,63})$/;

let router = express.Router();

router.get('/', function(req, res) {
  if(req.session.uname && (typeof req.session.uname) === 'string' && uname_re.test(req.session.uname)) {
    res.render('home');
  }
  else {
    res.render('register');
  }
});

router.post('/submit', function(req, res) {
  if (req.body.username && req.body.email && req.body.password && (typeof req.body.username) === 'string' && (typeof req.body.email) === 'string' &&  (typeof req.body.password) === 'string') {
    let pass_re = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9!@#$%^&*/._+-]{8,31})$/;
    if (validator.isEmail(req.body.email) && uname_re.test(req.body.username) && pass_re.test(req.body.password)) {
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
            "error": error
          };
          res.send(result);
        }
        else {
          req.session.uname = username;
          let result = {
            "status": 201,
            "message": 'user successfully created'
          };
          res.send(result);
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
  if (req.body.username && (typeof req.body.username) === 'string' && uname_re.test(req.body.username)) {
    let user = req.body.username + '';
    user = user.toLowerCase();
    pg_tool.query('SELECT COUNT(username) as count FROM public.bwf_user WHERE username=$1', [user], function(error, rows) {
      if (error) {
        let result = {
          "status": 500,
          "error": error
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
  if (req.body.email && (typeof req.body.email) === 'string' && validator.isEmail(req.body.email)) {
    let email = req.body.email + '';
    email = aes_tool.encrypt(email.toLowerCase());
    pg_tool.query('SELECT COUNT(username) as count FROM public.bwf_user WHERE email=$1', [email], function(error, rows) {
      if (error) {
        let result = {
          "status": 500,
          "error": error
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
