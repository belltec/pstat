var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/pstat';

//CLASSIC MONGO STUFF------------------------------------------------------------------------------------------------
mongoose.connect(dbURI);
mongoose.connection.on('connected', function(){
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function(err){
    console.log('Mongoose connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected.');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});
/*
        ???
    ???     ???
  ???          ???
  ???           ???
                  ???
                   ???
                   ???
                  ???
                ???
             ???
          ???
       ???
       ???
       ???
       ???
    
       ???
       ???

       */
