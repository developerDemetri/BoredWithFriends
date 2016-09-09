'use strict';

let chai = require('chai');
let assert = chai.assert;
let request = require('supertest');
let express = require('express');
let app = require('../app');
let testing_config = require('../bin/secret_settings').testing_config;

let cookies;
let lat = 33.426734;
let long = -111.931189;

describe('Suggestions', function() {
  it('Should not get nearby shopping suggestions when not logged in', function(done) {
    let req = request(app).get('/suggestions/shopping/'+lat+'/'+long);
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'shopping request blocked');
        assert.equal(res.body.message, 'no bueno...', 'shopping request blocked');
        done();
      });
  });
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
  it('Should get nearby shopping suggestions when logged in', function(done) {
    let req = request(app).get('/suggestions/shopping/'+lat+'/'+long);
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'got a list of places');
        assert.isNotNull(res.body.places, 'got a list of places');
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
        done();
      });
  });
});
