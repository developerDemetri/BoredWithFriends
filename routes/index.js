var app = require('../app');
var express = require('express');
var db_pool = require('../bin/db_pool');
var aes_tool = require('../bin/aes_tool');
var bcrypt = require('bcrypt');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var router = express.Router();

router.get('/', function(req, res) {
  if(req.session.uname) {
    res.render('home');
  }
  else {
    res.render('login');
  }
});

router.post('/auth', function(req, res) {
  if (req.body.username && req.body.password) {
    db_pool.connect(function(err, client, done) {
      if(err) {
        var result = {
          "status": 500,
          "error": 'error connecting to database'
        };
        console.log('error fetching client from pool: ', err);
        res.send(result);
      }
      else {
        client.query('SELECT password FROM public.bwf_user WHERE username=$1', [req.body.username], function(err, result) {
          done();
          if(err) {
            console.log("Query Error", err);
            var result = {
              "status": 500,
              "error": 'error querying database'
            };
            res.send(result);
          }
          else {
            if(result.rows[0] && bcrypt.compareSync(req.body.password, result.rows[0].password)) {
              req.session.uname = req.body.username;
              var result = {
                "status": 200,
                "message": 'successful login'
              };
              res.send(result);
            }
            else {
              var result = {
                "status": 400,
                "message": 'bad login'
              };
              res.send(result);
            }
          }
        });
      }
    });
  }
  else {
    var result = {
      "status": 400,
      "message": 'bad login'
    };
    res.send(result);
  }
});

router.post('/logout', function(req, res) {
  if(req.session.uname) {
    req.session.destroy();
    var result = {
      "status": 200,
      "message": 'successful logout'
    };
    res.send(result);
  }
  else {
    var result = {
      "status": 400,
      "message": 'no session to log out of...'
    };
    res.send(result);
  }
});

module.exports = router;
