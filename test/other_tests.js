'use strict';

/*
  For random code, like the tools in the bin folder
*/

let chai = require('chai');
let assert = chai.assert;
let expect = chai.expect;
let aes_tool = require('../bin/aes_tool');
let pg_tool = require('../bin/pg_tool');
let sinon = require('sinon');
let request = require('supertest');
let express = require('express');
let app = require('../app');
let ejs = require('ejs');
let testing_config = require('../bin/secret_settings').testing_config;

describe('AES Tool', function() {
  let test_text = 'woot woot';
  let test_number = 808;
  let encrypted_text;
  let decrypted_text;
  let encrypted_number;
  let decrypted_number;
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
    assert.strictEqual(decrypted_text, test_text, 'decrypted text');
    done();
  });
  it('Should encrypt numbers', function(done) {
    encrypted_number = aes_tool.encrypt(test_number);
    assert.isString(encrypted_number, 'encrypted number');
    assert.notEqual(test_number, encrypted_number, 'encrypted number');
    done();
  });
  it('Should correctly decrypt encrypted numbers', function(done) {
    decrypted_number = aes_tool.decrypt(encrypted_number);
    assert.isString(decrypted_number, 'decrypted number');
    assert.notEqual(decrypted_number, encrypted_number, 'decrypted number');
    decrypted_number = Number(decrypted_number);
    assert.isNumber(decrypted_number, 'decrypted number');
    assert.strictEqual(decrypted_number, test_number, 'decrypted number');
    done();
  });
  it('Should not encrypt null values', function(done) {
    let bad_result = aes_tool.encrypt(null);
    assert.isNull(bad_result, 'null encrytpion');
    done();
  });
  it('Should not decrypt null values', function(done) {
    let bad_result = aes_tool.decrypt(null);
    assert.isNull(bad_result, 'null decryption');
    done();
  });
  it('Should not encrypt objects', function(done) {
    let bad_result = aes_tool.encrypt({
      'test': 'hi',
      'derp': 'rawr'
    });
    assert.isNull(bad_result, 'object encrytpion');
    done();
  });
  it('Should not decrypt objects', function(done) {
    let bad_result = aes_tool.decrypt({
      'test': 'hi',
      'derp': 'rawr'
    });
    assert.isNull(bad_result, 'object decryption');
    done();
  });
});

describe('PG Tool', function() {
  it('Should require all parameters', function(done) {
    let query = '';
    let params = [];
    let callback = null;
    let response = pg_tool.query(query, params, callback);
    assert.isNotNull(response);
    assert.equal(response.error, 'Invalid usage of DB_Tool', 'valid usage of db tool');
    assert.isNull(response.rows);
    done();
  });
  it('Should require valid querystring', function(done) {
    let query = 5;
    let params = [];
    let callback = function(error, rows) {};
    let response = pg_tool.query(query, params, callback);
    assert.isNotNull(response);
    assert.equal(response.error, 'Invalid usage of DB_Tool', 'valid usage of db tool');
    assert.isNull(response.rows);
    done();
  });
  it('Should require valid params', function(done) {
    let query = 'SELECT COUNT(username) FROM public.bwf_user';
    let params = 'hi';
    let callback = function(error, rows) {};
    let response = pg_tool.query(query, params, callback);
    assert.isNotNull(response);
    assert.equal(response.error, 'Invalid usage of DB_Tool', 'valid usage of db tool');
    assert.isNull(response.rows);
    done();
  });
  it('Should require valid callback', function(done) {
    let query = 'SELECT COUNT(username) FROM public.bwf_user';
    let params = [];
    let callback = 'stuff';
    let response = pg_tool.query(query, params, callback);
    assert.isNotNull(response);
    assert.equal(response.error, 'Invalid usage of DB_Tool', 'valid usage of db tool');
    assert.isNull(response.rows);
    done();
  });
  it('Should not execute invalid query', function(done) {
    let query = 'SELECT derp FROM stuff';
    let params = [];
    pg_tool.query(query, params, function(error, rows) {
      assert.isNotNull(error);
      assert.isNull(rows);
      assert.equal(error, 'error querying database', 'bad query');
      done();
    });
  });
  it('Should execute valid query', function(done) {
    let query = 'SELECT COUNT(username) FROM public.bwf_user';
    let params = [];
    pg_tool.query(query, params, function(error, rows) {
      assert.isNotNull(rows);
      assert.isNull(error);
      done();
    });
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
