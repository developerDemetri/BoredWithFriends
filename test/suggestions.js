'use strict';

let chai = require('chai');
let assert = chai.assert;
let request = require('supertest');
let express = require('express');
let app = require('../app');
let testing_config = require('../bin/secret_settings').testing_config;

let lat = 33.426734;
let long = -111.931189;

describe('Suggestions', function() {
  it('Should not get nearby food suggestions when unauthenticated', function(done) {
    let req = request(app).get('/suggestions/food/find');
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'Food request blocked');
        assert.equal(res.body.message, 'Unauthorized Request', 'Food request blocked');
        done();
      });
  });
  it('Should not get nearby shopping suggestions when unauthenticated', function(done) {
    let req = request(app).get('/suggestions/shopping');
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'Shopping request blocked');
        assert.equal(res.body.message, 'Unauthorized Request', 'Shopping request blocked');
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
        assert.isNotNull(res.body.location, 'Location Updated', 'Location Updated');
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
        done();
      });
  });
  it('Should get nearby shopping suggestions when authenticated', function(done) {
    let req = request(app).get('/suggestions/shopping');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Got a list of shopping places');
        assert.isNotNull(res.body.places, 'Got a list of shopping places');
        done();
      });
  });
  it('Should get nearby food suggestions when authenticated', function(done) {
    let req = request(app).get('/suggestions/food/find');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Got a list of food places');
        assert.isNotNull(res.body.places, 'Got a list of food places');
        done();
      });
  });
  it('Should get nearby delivery suggestions when authenticated', function(done) {
    let req = request(app).get('/suggestions/food/order');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'Got a list of delivery places');
        assert.isNotNull(res.body.places, 'Got a list of delivery places');
        done();
      });
  });
  it('Should not get nearby uncategorized food suggestions when authenticated', function(done) {
    let req = request(app).get('/suggestions/food/derp');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'Did not get a list of food places');
        assert.equal(res.body.message, 'Invalid Plan', 'Did not get a list of food places');
        assert.isUndefined(res.body.places, 'Did not get a list of food places');
        done();
      });
  });
  it('Should not get nearby uncategorized food suggestions when authenticated', function(done) {
    let req = request(app).get('/suggestions/food/jljsdlkfjsdflkjsdflkjf');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'Did not get a list of food places');
        assert.equal(res.body.message, 'Invalid Location and/or Plan', 'Did not get a list of food places');
        assert.isUndefined(res.body.places, 'Did not get a list of food places');
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
