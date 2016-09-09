let superagent = require('superagent');
let agent = superagent.agent();
let test_account = {
  "username": "test",
  "password": "testing1"
};

let login_tool = function (request, done) {
  request
    .post('/auth')
    .send(test_account)
    .end(function (err, res) {
      if (err) {
        throw err;
      }
      agent.saveCookies(res);
      done(agent);
    });
};

module.exports = login_tool;
