"use strict";
var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

//app.use(express.static(__dirname + '/../client'));  
//app.get('/', function(req, res,next) {  
  //  res.sendFile(__dirname + '/client/index.html');
//});

//server.listen(80); 


//let express = require("express");
//let app = express();

let mongoUtil = require('./mongoUtil');
mongoUtil.connect();

app.use( express.static(__dirname + "/../client") );

let bodyParser = require("body-parser");
let jsonParser = bodyParser.json();

app.get("/observations", (request, response) => {
  let observations = mongoUtil.observations();
  observations.find().toArray((err,docs) => {
    if(err) {
      response.sendStatus(400);
    }
    console.log(JSON.stringify(docs));
    let observationNames = docs.map((observation) => observation.name);
    response.json( observationNames );
  });
});

app.get("/observations/:name", (request, response) => {
  let observationName = request.params.name;

  let observations = mongoUtil.observations();
  observations.find({name: observationName}).limit(1).next((err,doc) => {
    if(err) {
      response.sendStatus(400);
    }
    console.log( "Observation doc: ", doc );
    response.json(doc);
  });

});


app.post("/observations/:name/measurements", jsonParser, (request, response) => {
  let observationName = request.params.name;
  let newMeasurement = request.body.measurement || {};

  if(!newMeasurement.longitude || !newMeasurement.time || !newMeasurement.latitude){
    response.sendStatus(400);
  }

  let observations = mongoUtil.observations();
  let query = {name: observationName};
  let update = {$push: {driftMeasurements: newMeasurement}};

  observations.findOneAndUpdate(query, update, (err, res) => {
    if(err){
      response.sendStatus(400);
    }
    response.sendStatus(201);
  });
});


//app.listen(8181, () => console.log( "Listening on 8181" ));
server.listen(80, () => console.log("Listening on 80"));
