var pg = require('pg');
var db_config = require('./secret_settings').db_config;
pg.defaults.ssl = require('./secret_settings').pg_ssl;
var db_pool = new pg.Pool(db_config);
console.log("connected to database");

module.exports = db_pool;
