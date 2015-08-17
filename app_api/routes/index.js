var ctrl = require("../controllers/main.js");
var usr = require("../controllers/user.js");

module.exports = function (app) {
  //That fabled application program interface.
  //This is where the magic happens, folks.
  app.get('/api/jsonData', ctrl.jsonData);
  app.get('/api/getMeta', ctrl.getMeta);

  app.post('/api/verifyUser', usr.verifyUser);
  app.post('/api/addUser', usr.addUser);

};