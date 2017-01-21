'use strict';

let yelp = require('yelp');

const yelp_cofig = require('./secret_settings').api_settings.yelp_config;

let yelp_tool = new yelp(yelp_cofig);

module.exports = yelp_tool;
