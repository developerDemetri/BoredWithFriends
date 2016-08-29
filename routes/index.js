'use strict';
let app = require('../app');
let express = require('express');
let db_pool = require('../bin/db_pool');
let aes_tool = require('../bin/aes_tool');
let bcrypt = require('bcrypt');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');

let router = express.Router();

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
        let result = {
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
            let result = {
              "status": 500,
              "error": 'error querying database'
            };
            res.send(result);
          }
          else {
            if(result.rows[0] && bcrypt.compareSync(req.body.password, result.rows[0].password)) {
              req.session.uname = req.body.username;
              let result = {
                "status": 200,
                "message": 'successful login'
              };
              res.send(result);
            }
            else {
              let result = {
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
    let result = {
      "status": 400,
      "message": 'bad login'
    };
    res.send(result);
  }
});

router.get('/location', function(req, res) {
  if(req.session.uname) {
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
  if(req.session.uname) {
    let r_key = req.session.uname + '-location';
    let new_location = {
      latitude: req.body.lat,
      longitude: req.body.long
    };
    redis_tool.set(r_key, JSON.stringify(new_location));
    let result = {
      "status": 200,
      "message": 'location updated'
    };
    res.send(result);
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
  if(req.session.uname) {
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

module.exports = router;
