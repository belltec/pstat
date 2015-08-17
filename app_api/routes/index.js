var ctrl = require("../controllers/main.js");

module.exports = function (app) {
  app.get('/api/jsonData', ctrl.jsonData);
  app.get('/api/getMeta', ctrl.getMeta);
};