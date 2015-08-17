var ctrl = require("../controllers/main.js");
var usr = require("../controllers/user.js");

module.exports = function (app) {
  app.get('/api/jsonData', ctrl.jsonData);
  app.get('/api/getMeta', ctrl.getMeta);

  app.post('/')
};