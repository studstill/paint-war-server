// Setup basic express server
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var PORT = process.env.PORT || 3000;
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var dbuser = process.env.mongo_user;
var dbpass = process.env.mongo_pass;
var xAppToken = process.env.x_app_token;
var mongoUrl = 'mongodb://'+dbuser+':'+dbpass+'@ds019829.mlab.com:19829/seattle-trails-data';
var trailsDataUrl = 'https://data.seattle.gov/resource/vwtx-gvpm.json'
var trailsData = {}

// Everytime the server is restarted, the our database is refreshed
request({'url': trailsDataUrl, 'X-App-Token': xAppToken}, function(err, res, body){
  trailsData = JSON.parse(body);
  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    db.collection('seattle-trails-data').drop();
    db.collection('seattle-trails-data').insertOne({trailsData}, function(err, result) {
      if (err) throw err;
      console.log("Inserted a document into the seattle-trails collection.");
    });
  });
})

// convert numeric degress to radians
toRad = function (value) {
    return value * Math.PI / 180;
};

// simple distance calculation
// works fine for small distances
// http://en.wikipedia.org/wiki/Equirectangular_projection
Equirectangular = function(point1, point2) {
    var R = 6371; // earth radius in km
    var x = (toRad(point2.lon)-toRad(point1.lon)) *
            Math.cos((toRad(point1.lat)+toRad(point2.lat))/2);
    var y = (toRad(point2.lat)-toRad(point1.lat));
    return Math.sqrt(x*x + y*y) * R;
};

app.listen(PORT, function() {
  console.log('Server listening at PORT ' + PORT);
});

// Routing
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/trailsData', function(req, res) {
  res.json(trailsData);
  res.end();
});

  // Pick a random trail
  function pickRandomTrail() {
    return trailsData[Math.floor(Math.random()*trailsData.length)]
  }
  function pickRandomPark() {
    var randomTrail = pickRandomTrail();
    return randomPark = trailsData.filter((trail) => trail.pmaid == randomTrail.pmaid)
  }

app.get('/randomTrail', function(req, res) {
  res.json(pickRandomTrail());
  res.end();
})

app.get('/randomPark', function(req, res) {
  res.json(pickRandomPark());
  res.end();
})
  // Then select only the official trail
  // function getOfficialTrail() {
  //   var randomPark = pickRandomPark();
  //   var officalTrails = randomPark.filter((trail) => trail.trail_clas == "1");
  //   while (officalTrails.length < 1) getOfficialTrail()
  //   return officalTrails;
  // }
  // res.json(trailsData);

app.post('/location', function(req, res) {
  res.json(req.body);
  res.end();
});



