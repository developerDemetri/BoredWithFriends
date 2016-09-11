'use strict';

let pg = require('pg');
let db_config = require('./secret_settings').db_config;
pg.defaults.ssl = require('./secret_settings').pg_ssl;

let db_pool = new pg.Pool(db_config);
console.log("connected to database");

let pg_tool = {};

pg_tool.query = function(querystring, params, callback) {
  if (querystring && params && callback && (typeof querystring) === 'string' && Array.isArray(params) && (typeof callback) === 'function') {
    let error = null;
    let rows = null;
    db_pool.connect(function(err, client, done) {
      if (err) {
        console.log('error connecting to database: ', err)
        error = 'error connecting to database';
        callback(error, rows);
      }
      else {
        client.query(querystring, params, function(err, result) {
          done();
          if (err) {
            error = 'error querying database',
            callback(error, rows);
          }
          else {
            rows = result.rows;
            callback(error, rows);
          }
        });
      }
    });
  }
  else {
    console.log("invalid usage of db tool");
    let result = {
      error: 'Invalid usage of DB_Tool',
      rows: null
    }
    return result;
  }
};

module.exports = pg_tool;

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
