'use strict';

let chai = require('chai');
let assert = chai.assert;
let request = require('supertest');
let express = require('express');
let app = require('../app');
let testing_config = require('../bin/secret_settings').testing_config;

describe('Register', function() {
  it('Should not pass an invalid username', function(done) {
    request(app)
      .post('/register/checkusername')
      .send({
        "username":'lol bruh'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'invalid username');
        assert.equal(res.body.validity, false, 'invalid username');
        done();
      });
  });
  it('Should not pass an already used username', function(done) {
    request(app)
      .post('/register/checkusername')
      .send({
        "username": testing_config.user
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'username already used');
        assert.equal(res.body.validity, false, 'username already used');
        done();
      });
  });
  it('Should pass a valid unused username', function(done) {
    request(app)
      .post('/register/checkusername')
      .send({
        "username": 'gibberishnameandstuff'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'username available');
        assert.equal(res.body.validity, true, 'username available');
        done();
      });
  });
  it('Should not pass an invalid email', function(done) {
    request(app)
      .post('/register/checkemail')
      .send({
        "email":'lol bruh'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'invalid email');
        assert.equal(res.body.validity, false, 'invalid email');
        done();
      });
  });
  it('Should not pass an already used email', function(done) {
    request(app)
      .post('/register/checkemail')
      .send({
        "email": testing_config.email
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'email already used');
        assert.equal(res.body.validity, false, 'email already used');
        done();
      });
  });
  it('Should pass a valid unused email', function(done) {
    request(app)
      .post('/register/checkemail')
      .send({
        "email": 'gibberishnameandstuff@stuffs.com'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 200, 'email available');
        assert.equal(res.body.validity, true, 'email available');
        done();
      });
  });
  //need to add regiser and delete account stuff later//
});
