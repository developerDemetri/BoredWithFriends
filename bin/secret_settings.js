'use strict';
let uuid = require('node-uuid');
let session = require('express-session');
let FileStore = require('session-file-store')(session);

let isLocal = false;

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


if (isLocal) {
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
}
else {
  pg_user = process.env.pg_user;
  pg_db = process.env.pg_db;
  pg_pass = process.env.pg_pass;
  pg_host = process.env.pg_host;
  pg_port = process.env.pg_port;
  aes_alg = process.env.aes_alg;
  aes_pass = process.env.aes_pass;
  sesh_name = process.env.sesh_name;
  sesh_secret = process.env.sesh_secret;
  pg_ssl = true;
  google_key = process.env.google_key;
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

let storeOptions = {
  encrypt: 'true',
  ttl: 900
};

let session_settings = {
  name: sesh_name,
  store: new FileStore(storeOptions),
  genid: function(req) {
    return uuid.v4();
  },
  secret: sesh_secret,
  saveUninitialized: true,
  unset: 'destroy',
  resave: 'true'
};

let api_settings = {
  google_key: google_key
}

let secret_settings = {
  db_config: db_config,
  aes_config: aes_config,
  session_settings: session_settings,
  pg_ssl: pg_ssl,
  api_settings: api_settings
};

module.exports = secret_settings;
