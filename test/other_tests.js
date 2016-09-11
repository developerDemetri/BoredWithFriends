'use strict';

/*
  For random code, like the tools in the bin folder
*/

let chai = require('chai');
let assert = chai.assert;
let expect = chai.expect;
let aes_tool = require('../bin/aes_tool');
let sinon = require('sinon');
let request = require('supertest');
let express = require('express');
let app = require('../app');
let ejs = require('ejs');
let testing_config = require('../bin/secret_settings').testing_config;

describe('AES Tool', function() {
  let test_text = 'woot woot';
  let encrypted_text;
  let decrypted_text;
  it('Should encrypt text', function(done) {
    encrypted_text = aes_tool.encrypt(test_text);
    assert.isString(encrypted_text, 'encrypted text');
    assert.notEqual(test_text, encrypted_text, 'encrypted text');
    done();
  });
  it('Should correctly decrypt encrypted text', function(done) {
    decrypted_text = aes_tool.decrypt(encrypted_text);
    assert.isString(decrypted_text, 'decrypted text');
    assert.notEqual(decrypted_text, encrypted_text, 'decrypted text');
    assert.equal(decrypted_text, test_text, 'decrypted text');
    done();
  });
});

describe('Views', function() {
  let spy = sinon.spy(ejs, '__express');
  it('Should return lost page when incorrect route is called', function(done) {
    request(app)
    .get('/derp')
    .end(function(err, res) {
      if (err) done(err);
      assert.isNotNull(res.body, 'got lost page');
      expect(spy.calledWithMatch(/\/views\/lost\.ejs$/)).to.be.true;
      done();
    });
  });
  it('Should return login page as home page when user is unauthenticated', function(done) {
    request(app)
    .get('/')
    .end(function(err, res) {
      if (err) done(err);
      assert.isNotNull(res.body, 'got login page');
      expect(spy.calledWithMatch(/\/views\/home\.ejs$/)).to.be.false;
      expect(spy.calledWithMatch(/\/views\/login\.ejs$/)).to.be.true;
      done();
    });
  });
  it('Should return register page as register page when user is unauthenticated', function(done) {
    request(app)
    .get('/register')
    .end(function(err, res) {
      if (err) done(err);
      assert.isNotNull(res.body, 'got register page');
      expect(spy.calledWithMatch(/\/views\/home\.ejs$/)).to.be.false;
      expect(spy.calledWithMatch(/\/views\/register\.ejs$/)).to.be.true;
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
  it('Should return home page as home page when user is authenticated', function(done) {
    let req = request(app).get('/');
    req.cookies = cookies;
    req.end(function(err, res) {
      if (err) done(err);
      assert.isNotNull(res.body, 'got home page instead of login page');
      expect(spy.calledWithMatch(/\/views\/home\.ejs$/)).to.be.true;
      done();
    });
  });
  it('Should return home page as register page when user is authenticated', function(done) {
    let req = request(app).get('/register');
    req.cookies = cookies;
    req.end(function(err, res) {
      if (err) done(err);
      assert.isNotNull(res.body, 'got home page instead of register page');
      expect(spy.calledWithMatch(/\/views\/home\.ejs$/)).to.be.true;
      spy.restore();
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
