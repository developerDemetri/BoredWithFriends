'use strict';

let chai = require('chai');
let assert = chai.assert;
let request = require('supertest');
let express = require('express');
let app = require('../app');
let testing_config = require('../bin/secret_settings').testing_config;

let lat = 33.426734;
let long = -111.931189;

describe('Log In', function() {
  it('Should require a password', function(done) {
    request(app)
      .post('/auth')
      .send({
        "username":'hello',
        "password": null
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'Invalid Username/Password');
        assert.equal(res.body.message, 'Invalid Username/Password', 'Invalid Username/Password');
        done();
      });
  });
  it('Should require a username', function(done) {
    request(app)
      .post('/auth')
      .send({
        "username": null,
        "password": 'hell0test'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'Invalid Username/Password');
        assert.equal(res.body.message, 'Invalid Username/Password', 'Invalid Username/Password');
        done();
      });
  });
  it('Should require a valid username', function(done) {
    request(app)
      .post('/auth')
      .send({
        "username": 'what up f@m',
        "password": 'hell0test'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'Invalid Username/Password');
        assert.equal(res.body.message, 'Invalid Username/Password', 'Invalid Username/Password');
        done();
      });
  });
  it('Should require a valid password', function(done) {
    request(app)
      .post('/auth')
      .send({
        "username": 'hello',
        "password": 'testing stuff)()()'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'Invalid Username/Password');
        assert.equal(res.body.message, 'Invalid Username/Password', 'Invalid Username/Password');
        done();
      });
  });
  it('Should require a valid log in combination', function(done) {
    request(app)
      .post('/auth')
      .send({
        "username": 'hello',
        "password": 'hell0test'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Invalid Username/Password');
        assert.equal(res.body.message, 'Invalid Username/Password', 'Invalid Username/Password');
        done();
      });
  });
  let cookies;
  it('Should authenticate valid log in combination', function(done) {
    request(app)
      .post('/auth')
      .send({
        "username": testing_config.user,
        "password": testing_config.pass
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Valid Login');
        assert.equal(res.body.message, 'Successful Login', 'Successful Login');
        cookies = res.headers['set-cookie'].pop().split(';')[0];
        done();
      });
  });
  it('Should not log out when unauthenticated', function(done) {
    request(app)
      .post('/logout')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'Unsuccessful Logout');
        assert.equal(res.body.message, 'Unauthorized Request', 'Unauthorized Request');
        done();
      });
  });
  it('Should log out when authenticated', function(done) {
    let req = request(app).post('/logout');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Successful Logout');
        assert.equal(res.body.message, 'Successful Logout', 'Successful Logout');
        cookies = null;
        done();
      });
  });
});

describe('Location', function() {
  it('Should not set unauthenticated users location', function(done) {
    request(app)
      .post('/location')
      .send({
        "lat": lat,
        "long": long
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'Location Not Updated');
        assert.equal(res.body.message, 'Unauthorized Request', 'Location Not Updated');
        done();
      });
  });
  it('Should not get unauthenticated users location', function(done) {
    request(app)
      .get('/location')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'Location Denied');
        assert.equal(res.body.message, 'Unauthorized Request', 'Location Denied');
        done();
      });
  });
  it('Should not set unauthenticated users custom location', function(done) {
    request(app)
      .post('/location/custom')
      .send({
        "address": 'Amsterdam'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'Custom Location Denied');
        assert.equal(res.body.message, 'Unauthorized Request', 'Location Denied');
        done();
      });
  });
  let cookies;
  it('Setting up authentication', function(done) {
    request(app)
      .post('/auth')
      .send({
        "username": testing_config.user,
        "password": testing_config.pass
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Valid Login');
        assert.equal(res.body.message, 'Successful Login', 'Successful Login');
        cookies = res.headers['set-cookie'].pop().split(';')[0];
        done();
      });
  });
  it('Should not set authenticated users invalid location', function(done) {
    let req = request(app).post('/location');
    req.cookies = cookies;
    req
      .send({
        "lat": lat,
        "long": 'derp'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'Invalid Location');
        assert.equal(res.body.message, 'Invalid Location', 'Invalid location');
        done();
      });
  });
  it('Should set authenticated users valid location', function(done) {
    let req = request(app).post('/location');
    req.cookies = cookies;
    req
      .send({
        "lat": lat,
        "long": long
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Location Updated');
        assert.equal(res.body.message, 'Location Updated', 'Location Updated');
        assert.isNotNull(res.body.location, 'Location Updated')
        done();
      });
  });
  it('Should get authenticated users location', function(done) {
    let req = request(app).get('/location');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Location Retreived');
        assert.isNotNull(res.body.location, 'Location Retreived')
        assert.equal(res.body.location.latitude, lat, 'Latitude Retreived');
        assert.equal(res.body.location.longitude, long, 'Longitude Retreived');
        assert.isNotNull(res.body.location.location, 'Location Retreived')
        done();
      });
  });
  it('Should not set users unsafe custom location', function(done) {
    let req = request(app).post('/location/custom');
    req.cookies = cookies;
    req
      .send({
        "address": 'dsflksdjflkdsjfsdlkfjsdlkfjds'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'Invalid Custom Location');
        assert.equal(res.body.message, 'Invalid Custom Location', 'Invalid Custom Location');
        done();
      });
  });
  it('Should not set users invalid custom location', function(done) {
    let req = request(app).post('/location/custom');
    req.cookies = cookies;
    req
      .send({
        "address": 'holland<script>killEverything()</script>'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'Custom Location Denied');
        assert.equal(res.body.message, 'Invalid Custom Location', 'Location denied');
        done();
      });
  });
  it('Should set users valid custom location', function(done) {
    let req = request(app).post('/location/custom');
    req.cookies = cookies;
    req
      .send({
        "address": 'Amsterdam'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Valid Custom Location');
        assert.equal(res.body.message, 'Custom Location Set', 'Valid Custom Location');
        assert.isNotNull(res.body.location, 'Custom Location Returned', 'Valid Custom Location')
        done();
      });
  });
  it('Logging out of authentication', function(done) {
    let req = request(app).post('/logout');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Successful Logout');
        assert.equal(res.body.message, 'Successful Logout', 'Successful Logout');
        cookies = null;
        done();
      });
  });
});

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
