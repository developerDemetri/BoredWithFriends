'use strict';
let app = require('../app');
let express = require('express');
let router = express.Router();
let db_pool = require('../bin/db_pool');
let bcrypt = require('bcrypt');
let aes_tool = require('../bin/aes_tool');
let session_tool = require('../bin/session_tool');

router.get('/', function(req, res) {
  if(req.session.uname) {
    res.render('home');
  }
  else {
    res.render('register');
  }
});

router.post('/submit', function(req, res) {
  if (req.body.username && req.body.email && req.body.password) {
    let username = req.body.username;
    let email = aes_tool.encrypt(req.body.email);
    let password = bcrypt.hashSync(req.body.password, 10);
    db_pool.connect(function(err, client, done) {
      if(err) {
        let result = {
          "status": 500,
          "error": 'error connecting to database'
        };
        console.log('error fetching client from pool: ', err);
        res.send(result);
      }
      else {
        client.query('INSERT INTO public.bwf_user (username, email, password) VALUES ($1, $2, $3)', [username,email,password], function(err, result) {
          done();
          if(err) {
            console.log("Query Error", err);
            let result = {
              "status": 500,
              "error": 'error creating user in database'
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
  if (req.body.username) {
    db_pool.connect(function(err, client, done) {
      if(err) {
        let result = {
          "status": 500,
          "error": 'error connecting to database'
        };
        console.log('error fetching client from pool: ', err);
        res.send(result);
      }
      else {
        client.query('SELECT COUNT(username) as count FROM public.bwf_user WHERE username=$1', [req.body.username], function(err, result) {
          done();
          if(err) {
            console.log("Query Error", err);
            let result = {
              "status": 500,
              "error": 'error creating user in database'
            };
            res.send(result);
          }
          else {
            if (result.rows[0].count > 0) {
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
  if (req.body.email) {
    let email = aes_tool.encrypt(req.body.email);
    db_pool.connect(function(err, client, done) {
      if(err) {
        let result = {
          "status": 500,
          "error": 'error connecting to database'
        };
        console.log('error fetching client from pool: ', err);
        res.send(result);
      }
      else {
        client.query('SELECT COUNT(username) as count FROM public.bwf_user WHERE email=$1', [email], function(err, result) {
          done();
          if(err) {
            console.log("Query Error", err);
            let result = {
              "status": 500,
              "error": 'error creating user in database'
            };
            res.send(result);
          }
          else {
            if (result.rows[0].count > 0) {
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
