var express = require('express');
var http = require('http');
var path = require('path');
/*var UglifyJS = require('uglify-js');*/
var fs = require('fs');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var usr = require('./app_api/controllers/user.js');

//Dat app
var app = express();

//Dat auth
var auth = require("./app_api/controllers/user.js");

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '/app_server/views'));
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
//app.use('/', expressJwt({ secret : 'secret' }));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
// app.use(express.session());

//Custom middleware!

//Error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));
app.use(function (req,res){
    res.sendfile(path.join(__dirname, 'app_client', 'index.html'))
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

require('./app_api/routes')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
