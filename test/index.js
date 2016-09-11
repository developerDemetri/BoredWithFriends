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
        assert.equal(res.body.status, 400, 'bad login');
        assert.equal(res.body.message, 'bad login', 'bad login');
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
        assert.equal(res.body.status, 400, 'bad login');
        assert.equal(res.body.message, 'bad login', 'bad login');
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
        assert.equal(res.body.status, 400, 'bad login');
        assert.equal(res.body.message, 'bad login', 'bad login');
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
        assert.equal(res.body.status, 400, 'bad login');
        assert.equal(res.body.message, 'bad login', 'bad login');
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
        assert.equal(res.body.status, 200, 'invalid login');
        assert.equal(res.body.message, 'invalid login', 'invalid login');
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
        assert.equal(res.body.status, 200, 'valid login');
        assert.equal(res.body.message, 'successful login', 'successful login');
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
        assert.equal(res.body.status, 400, 'unsuccessful logout');
        assert.equal(res.body.message, 'no session to log out of...', 'no session to log out of...');
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
        assert.equal(res.body.status, 200, 'successful logout');
        assert.equal(res.body.message, 'successful logout', 'successful logout');
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
        assert.equal(res.body.status, 401, 'location not updated');
        assert.equal(res.body.message, 'no bueno...', 'location not updated');
        done();
      });
  });
  it('Should not get unauthenticated users location', function(done) {
    request(app)
      .get('/location')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'location denied');
        assert.equal(res.body.message, 'no bueno...', 'location denied');
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
        assert.equal(res.body.status, 401, 'custom location denied');
        assert.equal(res.body.message, 'no bueno...', 'location denied');
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
        assert.equal(res.body.status, 200, 'valid login');
        assert.equal(res.body.message, 'successful login', 'successful login');
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
        assert.equal(res.body.status, 400, 'invalid location');
        assert.equal(res.body.message, 'invalid coordinates', 'invalid location');
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
        assert.equal(res.body.status, 200, 'location updated');
        assert.equal(res.body.message, 'location updated', 'location updated');
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
        assert.equal(res.body.status, 200, 'location retreived');
        assert.isNotNull(res.body.location, 'location retreived')
        assert.equal(res.body.location.latitude, lat, 'latitude retreived');
        assert.equal(res.body.location.longitude, long, 'longitude retreived');
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
        assert.equal(res.body.status, 400, 'invalid custom location');
        assert.equal(res.body.message, 'invalid custom location', 'invalid custom location');
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
        assert.equal(res.body.status, 401, 'custom location denied');
        assert.equal(res.body.message, 'no bueno...', 'location denied');
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
        assert.equal(res.body.status, 202, 'valid custom location');
        assert.equal(res.body.message, 'custom location set', 'valid custom location');
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
        assert.equal(res.body.status, 200, 'successful logout');
        assert.equal(res.body.message, 'successful logout', 'successful logout');
        cookies = null;
        done();
      });
  });
});

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
