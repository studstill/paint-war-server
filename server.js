// Setup basic express server
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var PORT = process.env.PORT || 3000;

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
