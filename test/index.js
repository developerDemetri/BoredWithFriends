'use strict';

let chai = require('chai');
let assert = chai.assert;
let request = require('supertest');
let express = require('express');
let app = require('../app');

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
});
