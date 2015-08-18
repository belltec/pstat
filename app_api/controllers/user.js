var db = require('../../app_server/models/db.js');
var fs = require('fs');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var u = require('../../app_client/lib/underscore/underscore.js');
var User = require('../../app_server/models/user.js');

var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

//USER INCLUDE

//AUTHENTICATION==================================================================================================================================>
//In DB, user is ALWAYS stored lowercase
module.exports.addUser = function (req, res) {
  console.log(req.body);

  //Checking for user repetition, plane name repetition.
  User.find({user: req.body.user}, function (err, docs) {
    docs.forEach( function (k,v) {
      if (k) {
        sendJsonResponse(res, 400, "Username already taken, try again!");
        return;
      }
      console.log("This is k: " + k);
      console.log("This is v: " + v);
    });
  });

  var user = new User;
  user.user = req.body.user;
  user.password = req.body.password;
  user.token = jwt.sign({
    user : user.user, 
    password : user.password,
    exp : Date.now() + 2629000000
  }, 'mysecret');

  console.log(user);
  user.save( function (err, data) {
    if (err) {sendJsonResponse(res, 400, err); return;}
    if (!data) {sendJsonResponse(res, 403, "Unkown error, user not saved."); return;}
    sendJsonResponse(res, 201, data);
    return true;
  });
};

module.exports.getUsers = function (req, res) {
  User.find({}, function (err, data) {
    if (err) {sendJsonResponse(res, 400, err); return;}
    if (!data) {sendJsonResponse(res, 404, "User not found."); return;}
    sendJsonResponse(res, 201, data);
    return;
  });
};

module.exports.tryLogin = function (req, res) {
  //credentials in req.body
  var username,
      token = {},
      response = {
        message : '',
        user : '',
        token : {},
      };

  User.findOne({ user : req.body.user.toLowerCase()}, function (err, user) {
    if (err) { 
      console.log(err);
      sendJsonResponse(res, 400, err);
    }
    if ( !user ) {
      response.message = 'User or password invalid, try again!';
      sendJsonResponse(res, 404, response);
      return response;
    }
    if (user.password === req.body.password) {
      //Success! (we found a user and the passwords match.)
      response.token = jwt.sign({
        user : user.user, 
        password : user.password,
        exp : Date.now() + 2629000000
        }, 'mysecret');
      response.user = user.user;
      sendJsonResponse(res, 201, response);

      return response;
    }
    response.message = 'User or password invalid, try again!';
    sendJsonResponse(res, 401, response);
    return response;
  });
};

module.exports.verifyUser = function (req, res) {
  console.log(req.body);
  User.findOne({ user : req.body.user.toLowerCase()}, function (err, user) {
    var response = false;
    //Returns true or false
    if (err) { 
      console.log(err);
      return 1;
    }
    if (!user) {
      sendJsonResponse(res, 404, "User not found!");
    }
    console.log(req.body.token);
    //token is req.body.token, VERIFY
    try {
      jwt.verify(req.body.token, 'mysecret', function (err, decoded) {
        if (err) {
          console.log(err);
        }
        if (decoded.user === user.user && decoded.password === user.password ) {
          console.log('success!');
          sendJsonResponse(res, 200, true);
          return true;
        }
        sendJsonResponse(res , 401, false);
        return false;
      });
    } catch (err) { //if there was a type error token is empty, the only error remaining uncaught, verify fails
      return false;
    }
  });
};

