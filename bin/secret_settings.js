'use strict';

console.log('loading settings..');

const local_settings = require('./local_settings');

const pg_user = local_settings.pg_user;
const pg_db = local_settings.pg_db;
const pg_pass = local_settings.pg_pass;
const pg_host = local_settings.pg_host;
const pg_port = local_settings.pg_port;
const aes_alg = local_settings.aes_alg;
const aes_pass = local_settings.aes_pass;
const sesh_name = local_settings.sesh_name;
const sesh_secret = local_settings.sesh_secret;
const pg_ssl = local_settings.pg_ssl;
const google_key = local_settings.google_key;
const redis_port = local_settings.redis_port;
const redis_host = local_settings.redis_host;
const redis_password = local_settings.redis_password;
const redis_db = local_settings.redis_db;
const test_user = local_settings.test_user;
const test_pass = local_settings.test_pass;
const test_email = local_settings.test_email;
const yelp_token = local_settings.yelp_token;
const yelp_token_secret = local_settings.yelp_token_secret;
const yelp_consumer_key = local_settings.yelp_consumer_key;
const yelp_consumer_secret = local_settings.yelp_consumer_secret;
const captcha_key = local_settings.captcha_secret;
const port = local_settings.port;
const key_path = local_settings.key_path;
const certificate_path = local_settings.certificate_path;
const ca_path = local_settings.ca_path;

const db_config = {
  user: pg_user,
  database: pg_db,
  password: pg_pass,
  host: pg_host,
  port: pg_port,
  max: 12,
  idleTimeoutMillis: 30000,
};

const aes_config = {
  algorithm: aes_alg,
  password: aes_pass
};

const session_config = {
  sesh_name: sesh_name,
  sesh_secret: sesh_secret
};

const api_settings = {
  google_key: google_key,
  yelp_config: {
    token: yelp_token,
    token_secret: yelp_token_secret,
    consumer_key: yelp_consumer_key,
    consumer_secret: yelp_consumer_secret
  },
  captcha_key: captcha_key
};

const redis_config = {
  port: redis_port,
  host: redis_host,
  password: redis_password,
  db: redis_db
};

const testing_config = {
  user: test_user,
  pass: test_pass,
  email: test_email
};

const server_config = {
  PORT: port,
  KEY_PATH: key_path,
  CERTIFICATE_PATH: certificate_path,
  CA_PATH: ca_path
};

const secret_settings = {
  db_config: db_config,
  aes_config: aes_config,
  session_config: session_config,
  pg_ssl: pg_ssl,
  api_settings: api_settings,
  redis_config: redis_config,
  testing_config: testing_config,
  server_config: server_config
};

module.exports = secret_settings;

/*
Copyright 2016-2017 DeveloperDemetri

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
