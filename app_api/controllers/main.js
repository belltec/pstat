(function() {
  //main controller (this project probably only needs one)
  //require dependencies
  var db = require('../../app_server/models/db.js');
  var fs = require('fs');
  var expressJwt = require('express-jwt');
  var jwt = require('jsonwebtoken');
  var voter = require('../../app_server/models/voter.js');
  var history = require('../../app_server/models/history.js');
  var u = require('../../app_client/lib/underscore/underscore.js');
  var usr = require('../../app_api/controllers/user.js');
  /*DONT FORGET UNDERSCORE IS u not _*/

  //On server restart, attempt to clone collection.
  //This should be fine, so long as it doesn't fail catastrophically if the cloneTo location is already populated

  //FORCED DATA PROCESSING CALL, PLEASE COMMENT OR DELETE AFTER DISTRICTS ARE GENERATED

  //Function for trimming whitespace. I should have incorporated this into the initial parse, but w/e.
  var procData = function () {
    console.log("Processing data"); //Makes it to here.

    voter.find({}, function (err, data) {

      if (err) {
        console.log(err);
        return;
      }
      if (!data) {
        console.log("No data returned on full search. Indicates error with mongoLab");
      }

      console.log(data.length);
      u.each( data, function (v, k) {
        console.log(v);
      });

    })
  };

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

    //Elimiate single forwardslash
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
  //WARNING: Algorithm scales as O(n^2). DO NOT use on original data, only meta data
  function arrayUnique(array) {
    
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

  function procVoters (res) { //container function for various voter processing

    var count = 0;
    var reg = 0;
    var arr = new Array();

    voter.find({"District": "D"})
    .stream() 
    .on('data', function (doc) { //On data we set up a voter history stream to generate an individual's history array
      console.log(doc._doc.Registration_Number);

      /*history.find({"Registration_Number" : doc._doc.Registration_Number})
        .stream()
        .on('data', function (dc) {
          console.log(dc);
        })
        .on('error', function (er) {
          console.log(err);
          sendJsonResponse(res, err)
        })
        .on('end', function () {
          console.log("Ending history stream.")
        })*/

    })
    .on('error', function (err) {
      console.log(err);
      sendJsonResponse(res, err)
    })
    .on('end', function () {
      console.log("Ending voter stream.");
    });
  };

  var genDistrict = function(voter) {
       // $log.debug(voter.Jurisdiction_Ward);
       // $log.debug(voter.Jurisdiction_Precinct);
        var pt = 'w' + voter.Jurisdiction_Ward.trim() + 'p' + voter.Jurisdiction_Precinct.trim();
       // $log.debug(pt);
       // $log.debug(vm.districts[pt]);
        return districts[pt];
  };

  //START ROUTED PUBLIC FUCNTIONS (routes caught in app_api/routes/index.js) ==================================================================================================================>
  //Get voter data
  module.exports.jsonData = function (req, res) {

    //REMOVE PLZ, IM HIJACKING THIS ENDPOINT LIKE A JSON PIRATE
    procVoters(res);
    
    var q = JSON.parse(req.query.data); //Stringified on the frontend, then parsed on the back
                                        //Because JS is childish and doesn't like $ in prop names
    var response = new Object();
                                        
    delete q[undefined]; //Because javascript
    delete q["limit"];

    //Cast all variables to uppercase
    u.each( q, function (v, k) {
      u.each( v, function (value, op) {
        q[k][op] = q[k][op].toUpperCase();
      });
    });

    //Converting $regex property to literals from a regex string
    var findRegex = Object.keys(q); //Keys through which to search for $regex prop
    for (i in Object.keys(q)) {
      if( q[findRegex[i]].hasOwnProperty("$regex")) {
        q[findRegex[i]]["$regex"] = RegExp (q[findRegex[i]]["$regex"], "i"); //Case insensitive 'contains' regex
      }
    }

    //Actual query object. FORM: Query = { Prop: {$operator: Value} }
    console.log(q);

    var response = new Object();

    //THE REAL DATABASE READ, UNCOMMENT AFTER DISTRICTS IMPORTED
    voter.count( q, function (err, count) {
      if (err) {response.err = err; return;}
      if (!count) {response.err = "Unable to count voters"; return;}
      response.total = count;

      console.log("Finishing up the count callback..." + count);
      //you MUST nest these callbacks
      //Otherwise, sometimes find() finishes before count() (Because its limited to 1500 results) 
      //This causes horrible empty response errors. Fiddler will complain.

      voter.find(q) //The callbacks got thier variables mixed up, so I made the count/find calls independant.
      .limit(JSON.parse(req.query.limit)) 
      .exec( function (err, data) {
        console.log("looking for voters."); //Possibly a lie, lol

        if (err) {sendJsonResponse(res, 400, err); return;}
        if (!data) {sendJsonResponse(res, 404, "Voter data not found."); return;}
        if (!response) {sendJsonResponse(res, 500, "API call failed for unknown reason."); return;} //Only if .count callback never fires I.E. total and err are both undefined

        //If everything works out, we read voters and successfully count them, build the success response object
        response.data = data;
        sendJsonResponse(res, 200, response);
        console.log("Finishing up the data callback...");
      });
    });

    
  };

  //Get voter meta data
  module.exports.getMeta = function (req, res) {
    console.log("Getting meta data...");
    fs.readFile('data/metaComb.json', 'utf-8', function (err, data) {
      if (err) {console.log(err); return;}
      sendJsonResponse(res, 200, JSON.parse(data));
    })
  };

  var districts = {
          w03p14: 'A',
          w03p18: 'A',
          w03p19: 'A',
          w03p20: 'A',

          w04p07: 'A',
          w04p08: 'A',
          w04p09: 'A',
          w04p11: 'A',
          w04p14: 'A',
          w04p15: 'A',
          w04p17: 'A',
          w04p17A: 'A',
          w04p18: 'A',
          w04p20: 'A',
          w04p21: 'A',

          w05p08: 'A',
          w05p09: 'A',
          w05p10: 'A',
          w05p11: 'A',
          w05p12: 'A',
          w05p13: 'A',
          w05p15: 'A',
          w05p16: 'A',

          w06p08: 'A',
          w06p09: 'A',

          w07p12: 'A',
          w07p17: 'A',
          w07p18: 'A',

          w14p01: 'A',
          w14p02: 'A',
          w14p03: 'A',
          w14p04: 'A',
          w14p05: 'A',
          w14p06: 'A',
          w14p07: 'A',
          w14p08: 'A',
          w14p09: 'A',
          w14p10: 'A',
          w14p11: 'A',
          w14p12: 'A',
          w14p13A: 'A',
          w14p14: 'A',
          w14p15: 'A',
          w14p16: 'A',
          w14p17: 'A',
          w14p18A: 'A',
          w14p19: 'A',
          w14p20: 'A',
          w14p21: 'A',

          w16p01: 'A',
          w16p01A: 'A',
          w16p02: 'A',
          w16p03: 'A',
          w16p04: 'A',
          w16p05: 'A',
          w16p06: 'A',
          w16p07: 'A',
          w16p08: 'A',

          w17p01: 'A',
          w17p02: 'A',
          w17p03: 'A',
          w17p04: 'A',
          w17p05: 'A',
          w17p06: 'A',
          w17p07: 'A',
          w17p08: 'A',
          w17p09: 'A',
          w17p10: 'A',
          w17p11: 'A',
          w17p12: 'A',
          w17p13: 'A',
          w17p13A: 'A',
          w17p14: 'A',
          w17p15: 'A',
          w17p16: 'A',
          w17p17: 'A',
          w17p18: 'A',
          w17p18A: 'A',
          w17p19: 'A',
          w17p20: 'A',

          w01p01: 'B',
          w01p02: 'B',
          w01p05: 'B',
          w01p06: 'B',

          w02p01: 'B',
          w02p02: 'B',
          w02p03: 'B',
          w02p04: 'B',
          w02p06: 'B',
          w02p06A: 'B',
          w02p07: 'B',

          w03p01: 'B',
          w03p03: 'B',
          w03p05: 'B',
          w03p08: 'B',
          w03p09: 'B',
          w03p12: 'B',
          w03p15: 'B',

          w04p03: 'B',
          w04p04: 'B',
          w04p05: 'B',
          w04p06: 'B',

          w10p03: 'B',
          w10p06: 'B',
          w10p07: 'B',
          w10p08: 'B',
          w10p09: 'B',
          w10p11: 'B',
          w10p12: 'B',
          w10p13: 'B',
          w10p14: 'B',

          w11p02: 'B',
          w11p03: 'B',
          w11p04: 'B',
          w11p05: 'B',
          w11p08: 'B',
          w11p09: 'B',
          w11p10: 'B',
          w11p11: 'B',
          w11p12: 'B',
          w11p13: 'B',
          w11p14: 'B',
          w11p17: 'B',

          w12p01: 'B',
          w12p02: 'B',
          w12p03: 'B',
          w12p03: 'B',
          w12p04: 'B',
          w12p05: 'B',
          w12p06: 'B',
          w12p07: 'B',
          w12p08: 'B',
          w12p09: 'B',
          w12p10: 'B',
          w12p11: 'B',
          w12p12: 'B',
          w12p13: 'B',
          w12p14: 'B',
          w12p16: 'B',
          w12p17: 'B',
          w12p19: 'B',

          w13p01: 'B',
          w13p02: 'B',
          w13p03: 'B',
          w13p04: 'B',
          w13p05: 'B',
          w13p06: 'B',
          w13p07: 'B',
          w13p08: 'B',
          w13p09: 'B',
          w13p10: 'B',
          w13p11: 'B',
          w13p12: 'B',
          w13p13: 'B',
          w13p14: 'B',
          w13p15: 'B',
          w13p16: 'B',

          w14p23: 'B',
          w14p24A: 'B',
          w14p25: 'B',
          w14p26: 'B',

          w16p09: 'B',

          w04p02: 'C',

          w05p01: 'C',
          w05p02: 'C',
          w05p03: 'C',
          w05p04: 'C',

          w06p01: 'C',
          w06p02: 'C',
          w06p04: 'C',

          w07p01: 'C',
          w07p02: 'C',
          w07p04: 'C',
          w07p05: 'C',
          w07p06: 'C',

          w08p01: 'C',
          w08p02: 'C',
          w08p04: 'C',
          w08p06: 'C',

           w09p09: 'C',
           w09p11: 'C',
           w09p12: 'C',
           w09p13: 'C',
           w09p14: 'C',
           w09p15: 'C',
           w09p16: 'C',
           w09p19: 'C',

           w04p22: 'D',
           w04p23: 'D',

           w05p05: 'D',
           w05p07: 'D',
           w05p08: 'D',
           w05p17: 'D',
           w05p18: 'D',

           w06p06: 'D',
           w06p07: 'D',

           w07p05: 'D',
           w07p06: 'D',
           w07p07: 'D',
          w07p08: 'D',
          w07p09A: 'D',
          w07p10: 'D',
          w07p11: 'D',
          w07p12: 'D',
          w07p13: 'D',
          w07p14: 'D',
          w07p15: 'D',
          w07p16: 'D',
          w07p19: 'D',
          w07p20: 'D',
          w07p21: 'D',
          w07p23: 'D',
          w07p24: 'D',
          w07p25: 'D',
          w07p25A: 'D',
          w07p26: 'D',
          w07p27: 'D',
          w07p27B: 'D',
          w07p28: 'D',
          w07p28A: 'D',
          w07p29: 'D',
          w07p30: 'D',
          w07p32: 'D',
          w07p33: 'D',
          w07p34: 'D',
          w07p35: 'D',
          w07p37: 'D',
          w07p37A: 'D',
          w07p40: 'D',
          w07p41: 'D',
          w07p42: 'D',

          w08p07: 'D',
          w08p08: 'D',
          w08p09: 'D',
          w08p12: 'D',
          w08p13: 'D',
          w08p14: 'D',
          w08p15: 'D',
          w08p19: 'D',
          w08p20: 'D',
          w08p21: 'D',
          w08p22: 'D',
          w08p23: 'D',
          w08p24: 'D',
          w08p25: 'D',
          w08p26: 'D',
          w08p27: 'D',
          w08p28: 'D',
          w08p30: 'D',

          w09p10: 'D',
          w09p17: 'D',
          w09p21: 'D',
          w09p23: 'D',
          w09p25: 'D',
          w09p26: 'D',
          w09p28: 'D',
          w09p28C: 'D',
          w09p28E: 'D',
          w09p29: 'D',
          w09p30: 'D',
          w09p30A: 'D',
          w09p31: 'D',
          w09p31A: 'D',
          w09p31B: 'D',
          w09p31D: 'D',
          w09p33: 'D',
          w09p42: 'D',

          w09p01: 'E',
          w09p03: 'E',
          w09p3A: 'E',
          w09p04: 'E',
          w09p05: 'E',
          w09p05A: 'E',
          w09p06B: 'E',
          w09p06C: 'E',
          w09p06D: 'E',
          w09p06E: 'E',
          w09p06F: 'E',
          w09p07: 'E',
          w09p08: 'E',
          w09p08A: 'E',
          w09p32: 'E',
          w09p34A: 'E',
          w09p35: 'E',
          w09p35A: 'E',
          w09p36: 'E',
          w09p36B: 'E',
          w09p37: 'E',
          w09p38: 'E',
          w09p38A: 'E',
          w09p39: 'E',
          w09p39B: 'E',
          w09p40: 'E',
          w09p40A: 'E',
          w09p40C: 'E',
          w09p41: 'E',
          w09p41A: 'E',
          w09p41B: 'E',
          w09p41C: 'E',
          w09p41D: 'E',
          w09p42C: 'E',
          w09p43A: 'E',
          w09p43B: 'E',
          w09p43C: 'E',
          w09p43E: 'E',
          w09p43F: 'E',
          w09p43G: 'E',
          w09p43H: 'E',
          w09p43I: 'E',
          w09p43J: 'E',
          w09p43K: 'E',
          w09p43L: 'E',
          w09p43M: 'E',
          w09p43N: 'E',
          w09p44: 'E',
          w09p44A: 'E',
          w09p44B: 'E',
          w09p44D: 'E',
          w09p44E: 'E',
          w09p44F: 'E',
          w09p44G: 'E',
          w09p44I: 'E',
          w09p44J: 'E',
          w09p44L: 'E',
          w09p44M: 'E',
          w09p44N: 'E',
          w09p44O: 'E',
          w09p44P: 'E',
          w09p44Q: 'E',
          w09p45: 'E',
          w09p45A: 'E'
        };
})()
