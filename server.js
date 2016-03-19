// Setup basic express server
var util = require('util');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
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
// request({'url': trailsDataUrl, 'X-App-Token': xAppToken}, function(err, res, body){
//   trailsData = JSON.parse(body);
//   MongoClient.connect(mongoUrl, function(err, db) {
//     if (err) throw err;
//     db.collection('seattle-trails-data').drop();
//     db.collection('seattle-trails-data').insertOne({trailsData}, function(err, result) {
//       if (err) throw err;
//       console.log("Inserted a document into the seattle-trails collection.");
//     });
//   });
// })

request({'url': trailsDataUrl, 'X-App-Token': xAppToken}, function(err, res, body){
  trailsData = JSON.parse(body);
  console.log('Got trails data from our mondgodb');
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
app.use(cors);
app.use(bodyParser.json());

app.get('/trailsData', function(req, res) {
  res.json(trailsData);
  res.end();
});

  // Pick a random trail
  function pickRandomTrail() {
    return trailsData[Math.floor(Math.random()*trailsData.length)]
  }
  // Pick a random park
  function pickRandomPark() {
    var randomTrail = pickRandomTrail();
    return randomPark = trailsData.filter((trail) => trail.pmaid == randomTrail.pmaid)
  }

app.get('/randomTrail', function(req, res) {
  var randomTrail = pickRandomTrail();
  // Everytime the server is restarted, the our database is refreshed
  request({'url': trailsDataUrl, 'X-App-Token': xAppToken}, function(err, res, body){
    trailsData = JSON.parse(body);
    MongoClient.connect(mongoUrl, function(err, db) {
      if (err) throw err;
      db.collection('random-trail').drop();
      var bulk = db.collection('random-trail').initializeUnorderedBulkOp();
      randomTrail.the_geom.coordinates.forEach(function(coordinate) {
        var uniqueCoord = {
          "location" : {
            "type" : "Point",
            "coordinates" : coordinate
          },
          "user" : "null"
        };
        bulk.insert(uniqueCoord);
      });
      bulk.execute(console.log("Inserted a bulk of coords into the seattle-trails collection."));
      // db.collection('random-trail').ensureIndex({location: "2dsphere"});
    });
  })
  res.json(randomTrail);
  res.end();
})

app.get('/randomPark', function(req, res) {
  randomPark = pickRandomPark();
  var long = randomPark.the_geom


  res.json(randomPark);
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

// app.get

app.post('/location', function(req, res) {
  // var location = util.inspect(req.body.GPS);
  // console.log(req.body);
  MongoClient.connect(mongoUrl, function(err, db) {
    // var matchedPoints = db.collection('random-trail').find({"location":{$near:{$geometry:{"type":"Point","coordinates":[-122.30,47.66]}, $maxDistance: 1000}}})
    // res.json(matchedPoints);
    var matchedPoints = db.collection('random-trail').find({});
    res.json(matchedPoints);
    res.end();
  })
});


// Cycle through random park and save it to the database


