//main controller (this project probably only needs one)
//require dependencies
var db = require('../../app_server/models/db.js');
var fs = require('fs');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var voter = require('../../app_server/models/voter.js');
var u = require('../../app_client/lib/underscore/underscore.js');
var ex = require('extend');
/*DONT FORGET UNDERSCORE IS u*/

//Non API internal functions (private)
//Json, duh!
var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

//TSV -> Json conversion function
function tsvJson (tsv){

  var linesWithoutReturn = tsv.replace("\r", "");
  
  //Eliminate double forward slash
  var noFSreg = new RegExp(/\/\/+/g);
  var noFS = linesWithoutReturn.replace(noFSreg, "");

  //Elimiate single backslash
  var noBSreg = new RegExp(/\\+/g);
  var noBS = noFS.replace(noBSreg, "");
  var lines=noBS.split("\n");

  var result = [];
 
  var headers=lines[0].split("\t");
  console.log(headers);
 
  for(var i=1;i<lines.length;i++){
 
    var obj = {};
    var currentline=lines[i].split("\t"); //Array of row values
 
    for(var j=0;j<headers.length;j++){
      obj[headers[j]] = currentline[j];
    }
 
    result.push(obj);
  }
  return JSON.stringify(result, headers); 
}

//Custom non-invasive duplicate removal
//WARNING: scales as O(n^2). DO NOT use on original data, only meta data
function arrayUnique(array) {
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1); //lol, silly functional programmers, javascript is for nerds.
      }
  }
  return a;
};

//WRITE NEW METADATA ===============================================================================================>
function generateMetaData (inF, outF) { //takes inF (in file), outF is a list of all possible values for all properties in inF.
  fs.readFile(inF, 'utf-8', function (err, data) {

    //We should only need source file to gen metadata
    if (err) {console.log(err); return;}
    var jsData = JSON.parse(data);
    var keys = Object.keys(jsData[1]);
    var meta = {};

    for ( i=0 ; i<keys.length ; i++  ) { //Loop through keys
      meta[keys[i]] = []; //Init to hold all possible values
      console.log(keys[i]);

      for ( j=0 ; j<jsData.length; j++) {
        if ( !u.contains(meta[keys[i]], jsData[j][keys[i]]) ) { //list, value
          meta[keys[i]].push(jsData[j][keys[i]]);
        }
      }
      //For each key, loop through object, read each value, check if exists in key's possible values array, then push if it doesn't.
    }
    console.log(meta);
    fs.writeFile(outF, JSON.stringify(meta), function (err) {
      if (err) {console.log("We have experienced a fatal error gents: " + err); return;}
      console.log("Succesfully saved meta data: " + outF);
    })
  });
};

//WRITE JSON FROM TSV ===============================================================================================>
function convertToJson (inPath, outPath) { //Takes two paths, in:TSV, out:JSON
  console.log("Writing data tsv -> json...");
  var tsvItems = fs.readFileSync(inPath, 'utf8');
  var jsonItems = tsvJson(tsvItems);
  fs.writeFileSync(outPath , jsonItems);
  console.log("Done!");
  console.log("JSON data written to: " + outPath);
};
//TO HERE ==========================================================================================================================>

//Combine meta objects
function combineData(path1, path2, outPath) { //For combining objects with identical properties
  fs.readFile(path1, 'utf-8', function (err, data) {
    fs.readFile(path2, 'utf-8', function (err2, data2) {
      var combined = {};
      var datap1 = JSON.parse(data);
      var datap2 = JSON.parse(data2);
      var keys = Object.keys(datap1);
      console.log(keys);
      //Extend will not work in this case
      //Must FOR concatenate

      for (i = 0; i < keys.length; i++ ) {
        combined[keys[i]] = datap1[keys[i]].concat(datap2[keys[i]]);
        combined[keys[i]] = arrayUnique(combined[keys[i]]);
      }

      fs.writeFile(outPath, JSON.stringify(combined), function (err) {
        if (err) {console.log(err); return;}
        console.log("Combined meta data file written to: " + outPath);
      });
    });
  });
};

//START ROUTED PUBLIC FUCNTIONS ==================================================================================================================>
//Get voter data
module.exports.jsonData = function (req, res) {

  var q = JSON.parse(req.query.data); //Stringified on the frontend, then parsed on the back
                                      //Because JS is childish and doesn't like $ in prop names
                                      
  delete q[undefined]; //Because javascript is weird sometimes.
  console.log(q); //Actual query object. FORM: { Prop: {$operator: Value} }

  voter.find(q) 
  .limit(100)
  .exec(function (err, data) {
    console.log("we found voters!"); //Possibly a lie
    if (err) {sendJsonResponse(res, 400, err); return;}
    if (!data) {sendJsonResponse(res, 404, "Voter data not found."); return;}
    sendJsonResponse(res, 200, data);
  });
};

//Get voter meta data
module.exports.getMeta = function (req, res) {
  console.log("Getting meta data...");
  fs.readFile('/Users/awimley/pstat/data/metaComb.json', 'utf-8', function (err, data) {
    if (err) {console.log(err); return;}
    sendJsonResponse(res, 200, JSON.parse(data));
  })
};

//AUTHENTICATION==================================================================================================================================>
//In DB, user is ALWAYS stored lowercase
module.exports.addUser = function (req, res) {
  console.log(req.body);

  //Checking for user repetition, plane name repetition.
  User.find({}, function (err, docs) {

  });

  var user = new User;
  user.token = jwt.sign({
    user : user.user, 
    password : user.password,
    exp : Date.now() + 2629000000
  }, 'mysecret');

  user.user = req.body.user;
  user.planes = req.body.planes;
  user.password = req.body.password;

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
        planes: []
      };

  User.findOne({ user : req.body.user.toLowerCase()}, function (err, user) {
    if (err) { 
      console.log(err);
      sendJsonResponse(res, 400, err);
    }
    if ( !user ) {
      response.message = 'User not found!';
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
      response.planes = user.planes;
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
    console.log(req.body.token);
    //token is req.body.token, VERIFY
    try {
      jwt.verify(req.body.token, 'mysecret', function(err, decoded) {
        if (err) {
          console.log(err);
        }
        if (decoded.user === user.user && decoded.password === user.password ) {
          console.log('success!');
          sendJsonResponse(res, 200, true);
          return true;
        }
        return false;
      });
    } catch (err) { //if there was a type error token is empty, verify fails
      return false;
    }
  });
};

