'use strict';

let Redis = require('ioredis');
let redis_config = require('./secret_settings').redis_config;

let redis_tool = new Redis({
  port: redis_config.port,
  host: redis_config.host,
  password: redis_config.password
});

redis_tool.set('connection test', 'connected to redis');
redis_tool.get('connection test', function (err, result) {
  if (err) {
    console.log(err);
  }
  else {
    console.log(result);
  }
});


module.exports = redis_tool;
