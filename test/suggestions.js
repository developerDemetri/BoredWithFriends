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
  it('Should not get nearby food suggestions when not logged in', function(done) {
    let req = request(app).get('/suggestions/food/find');
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'food request blocked');
        assert.equal(res.body.message, 'no bueno...', 'food request blocked');
        done();
      });
  });
  it('Should not get nearby shopping suggestions when not logged in', function(done) {
    let req = request(app).get('/suggestions/shopping');
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'shopping request blocked');
        assert.equal(res.body.message, 'no bueno...', 'shopping request blocked');
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
  it('Should get nearby shopping suggestions when logged in', function(done) {
    let req = request(app).get('/suggestions/shopping');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'got a list of shopping places');
        assert.isNotNull(res.body.places, 'got a list of shopping places');
        done();
      });
  });
  it('Should get nearby food suggestions when logged in', function(done) {
    let req = request(app).get('/suggestions/food/find');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'got a list of food places');
        assert.isNotNull(res.body.places, 'got a list of food places');
        done();
      });
  });
  it('Should get nearby delivery suggestions when logged in', function(done) {
    let req = request(app).get('/suggestions/food/order');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'got a list of delivery places');
        assert.isNotNull(res.body.places, 'got a list of delivery places');
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
