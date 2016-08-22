var uuid = require('node-uuid');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var isLocal = true;

var pg_user;
var pg_db;
var pg_pass;
var pg_host;
var pg_port;
var pg_ssl;

var aes_alg;
var aes_pass;

var sesh_name;
var sesh_secret;


if (isLocal) {
  var local_settings = require('./local_settings');
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
}

var db_config = {
  user: pg_user,
  database: pg_db,
  password: pg_pass,
  host: pg_host,
  port: 5432,
  max: 12,
  idleTimeoutMillis: 30000,
};

var aes_config = {
  algorithm: aes_alg,
  password: aes_pass
};

var storeOptions = {
  encrypt: 'true',
  ttl: 900
};

var session_settings = {
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

var secret_settings = {
  db_config: db_config,
  aes_config: aes_config,
  session_settings: session_settings,
  pg_ssl: pg_ssl
};

module.exports = secret_settings;
