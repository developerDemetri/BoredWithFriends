'use strict';

function getServer() {
  return location.protocol + '//' + location.hostname + ':' + location.port;
}

let chai = require('chai');
let assert = chai.assert;
let request = require('request');

describe('Log In', function() {
  it('Should require a username and a password', function() {
    request.post({
      url: getServer()+'/auth',
      form: {
        username:'value',
        password: 'value'
      }
    },
    function(err,httpResponse,body) {
     if(!err) {
       console.log(body);
     }
     else {
       console.log(err);
     }
   });
  });
});
