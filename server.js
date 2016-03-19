// Setup basic express server
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var PORT = process.env.PORT || 3000;

// convert numeric degress to radians
toRad = function (value) {
    return value * Math.PI / 180;
}

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


server.listen(PORT, function() {
  console.log('Server listening at PORT ' + PORT);
});

// Routing
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/location', function(req, res) {
  res.json(req.body);
  res.end();
});
