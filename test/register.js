'use strict';

let chai = require('chai');
let assert = chai.assert;
let request = require('supertest');
let express = require('express');
let app = require('../app');
let testing_config = require('../bin/secret_settings').testing_config;

describe('Pre-Register', function() {
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
});

describe('Register and Delete', function() {
  it('Should not allow null fields', function(done) {
    request(app)
      .post('/register/submit')
      .send({
        "username":'lol bruh',
        "email": null,
        "password": 'derp'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'missing field');
        assert.equal(res.body.message, 'Invalid User Details', 'missing field');
        done();
      });
  });
  it('Should require a valid username', function(done) {
    request(app)
      .post('/register/submit')
      .send({
        "username":'lol bruh',
        "email": 'hey@test.com',
        "password": 'derp12345'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'invalid username');
        assert.equal(res.body.message, 'Invalid User Details', 'invalid username');
        done();
      });
  });
  it('Should require a valid email', function(done) {
    request(app)
      .post('/register/submit')
      .send({
        "username":'supercooltester',
        "email": 'rawr (:',
        "password": 'derp12345'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'invalid email');
        assert.equal(res.body.message, 'Invalid User Details', 'invalid email');
        done();
      });
  });
  it('Should require a valid password', function(done) {
    request(app)
      .post('/register/submit')
      .send({
        "username":'supercooltester',
        "email": 'heythere@test.com',
        "password": 'derp1'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 400, 'invalid email');
        assert.equal(res.body.message, 'Invalid User Details', 'invalid email');
        done();
      });
  });
  let cookies;
  it('Should register valid user details', function(done) {
    request(app)
      .post('/register/submit')
      .send({
        "username":'supercooltester',
        "email": 'heythere@test.com',
        "password": 'derp12345'
      })
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 201, 'valid user');
        assert.equal(res.body.message, 'user successfully created', 'valid user');
        cookies = res.headers['set-cookie'].pop().split(';')[0];
        done();
      });
  });
  it('Should delete user account', function(done) {
    let req = request(app).delete('/account');
    req.cookies = cookies;
    req
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 202, 'user deleted');
        assert.equal(res.body.message, 'user successfully deleted', 'user deleted');
        cookies = null;
        done();
      });
  });
  it('Should not delete unauthenticated user account', function(done) {
    request(app)
      .delete('/account')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) done(err);
        assert.equal(res.body.status, 401, 'user not deleted');
        assert.equal(res.body.message, 'no bueno...', 'user not deleted');
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
