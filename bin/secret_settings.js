'use strict';

let pg_user;
let pg_db;
let pg_pass;
let pg_host;
let pg_port;
let pg_ssl;

let aes_alg;
let aes_pass;

let sesh_name;
let sesh_secret;

let google_key;

let redis_port;
let redis_host;
let redis_password;

let test_user;
let test_pass;
let test_email;

let yelp_token;
let yelp_token_secret;
let yelp_consumer_key;
let yelp_consumer_secret;

let captcha_key;


if (process.env.im_live) {
  console.log('loading prod settings..');
  let pg_url = process.env.DATABASE_URL.split(':');
  pg_user = pg_url[1].substring(2);
  pg_db = pg_url[3].split('/')[1];
  pg_pass = pg_url[2].split('@')[0];
  pg_host = pg_url[2].split('@')[1];
  pg_port = pg_url[3].split('/')[0];
  aes_alg = process.env.aes_alg;
  aes_pass = process.env.aes_pass;
  sesh_name = process.env.sesh_name;
  sesh_secret = process.env.sesh_secret;
  pg_ssl = true;
  google_key = process.env.google_key;
  let redis_url = process.env.REDIS_URL.split(':');
  redis_port = redis_url[3];
  redis_host = redis_url[2].split('@')[1];
  redis_password = redis_url[2].split('@')[0];
  test_user = process.env.test_user;
  test_pass = process.env.test_pass;
  test_email = process.env.test_email;
  yelp_token = process.env.yelp_token;
  yelp_token_secret = process.env.yelp_token_secret;
  yelp_consumer_key = process.env.yelp_consumer_key;
  yelp_consumer_secret = process.env.yelp_consumer_secret;
  captcha_key = process.env.captcha_secret;
}
else {
  console.log('loading local settings..');
  let local_settings = require('./local_settings');
  pg_user = local_settings.pg_user;
  pg_db = local_settings.pg_db;
  pg_pass = local_settings.pg_pass;
  pg_host = local_settings.pg_host;
  pg_port = local_settings.pg_port;
  aes_alg = local_settings.aes_alg;
  aes_pass = local_settings.aes_pass;
  sesh_name = local_settings.sesh_name;
  sesh_secret = local_settings.sesh_secret;
  pg_ssl = false;
  google_key = local_settings.google_key;
  redis_port = local_settings.redis_port;
  redis_host = local_settings.redis_host;
  redis_password = local_settings.redis_password;
  test_user = local_settings.test_user;
  test_pass = local_settings.test_pass;
  test_email = local_settings.test_email;
  yelp_token = local_settings.yelp_token;
  yelp_token_secret = local_settings.yelp_token_secret;
  yelp_consumer_key = local_settings.yelp_consumer_key;
  yelp_consumer_secret = local_settings.yelp_consumer_secret;
  captcha_key = local_settings.captcha_secret;
}

let db_config = {
  user: pg_user,
  database: pg_db,
  password: pg_pass,
  host: pg_host,
  port: pg_port,
  max: 12,
  idleTimeoutMillis: 30000,
};

let aes_config = {
  algorithm: aes_alg,
  password: aes_pass
};

let session_config = {
  sesh_name: sesh_name,
  sesh_secret: sesh_secret
};

let api_settings = {
  google_key: google_key,
  yelp_config: {
    token: yelp_token,
    token_secret: yelp_token_secret,
    consumer_key: yelp_consumer_key,
    consumer_secret: yelp_consumer_secret
  },
  captcha_key: captcha_key
};

let redis_config = {
  port: redis_port,
  host: redis_host,
  password: redis_password
};

let testing_config = {
  user: test_user,
  pass: test_pass,
  email: test_email
};

let secret_settings = {
  db_config: db_config,
  aes_config: aes_config,
  session_config: session_config,
  pg_ssl: pg_ssl,
  api_settings: api_settings,
  redis_config: redis_config,
  testing_config: testing_config
};

module.exports = secret_settings;

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
