'use strict';

let chai = require('chai');
let assert = chai.assert;
let request = require('supertest');
let express = require('express');
let app = require('../app');
let testing_config = require('../bin/secret_settings').testing_config;

let cookies;

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
  it('Should not log out when not logged in', function(done) {
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
  it('Should log out when already logged in', function(done) {
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
