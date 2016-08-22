var aes_config = require('./secret_settings').aes_config;

var crypto = require('crypto'),
    algorithm = aes_config.algorithm,
    password = aes_config.password;

var aes_tool = {};

aes_tool.encrypt = function(text) {
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

aes_tool.decrypt = function(text) {
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = aes_tool;
