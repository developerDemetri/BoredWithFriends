'use strict';
let app = require('../app');
let express = require('express');
let pg_tool = require('../bin/pg_tool');
let aes_tool = require('../bin/aes_tool');
let bcrypt = require('bcrypt');
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
